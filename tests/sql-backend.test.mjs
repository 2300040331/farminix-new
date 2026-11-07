import test from 'node:test';
import assert from 'node:assert/strict';
import { injectApp } from './helpers/inject-app.mjs';
import { createHmac, randomUUID } from 'node:crypto';
import { initDatabase } from '../server/dist/db.js';
import app from '../server/dist/server.js';

test.before(async () => { await initDatabase(); });
const api = (path, options) => injectApp(app, path, options);

test('Farminix KVM2 SQL Backend & CRUD Operations Suite', async (t) => {
  const secret = process.env.ADMIN_SESSION_SECRET || 'farminix-admin-session-secret-salt-key-2026';
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  const sig = createHmac('sha256', secret).update(expires).digest('hex');
  const adminCookie = `farminix_admin=${expires}.${sig}`;

  await t.test('1. Database health and configuration check', async () => {
    const res = await api('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(res.body.database);
  });

  await t.test('2. Site Config CRUD & Admin Authentication', async () => {
    // 2.1 Get site-config without auth
    const getRes = await api('/api/site-config');
    assert.equal(getRes.status, 200);
    assert.ok(getRes.body.config);
    assert.ok(Array.isArray(getRes.body.config.products));

    // 2.2 Check session without cookie
    const noSessRes = await api('/api/site-config?session=1');
    assert.equal(noSessRes.status, 200);
    assert.equal(noSessRes.body.authenticated, false);

    // 2.3 Check session with admin cookie
    const sessRes = await api('/api/site-config?session=1', { cookie: adminCookie });
    assert.equal(sessRes.status, 200);
    assert.equal(sessRes.body.authenticated, true);

    // 2.4 Login with invalid password
    const failLogin = await api('/api/site-config', {
      method: 'POST',
      body: { email: 'admin', password: 'wrong' },
    });
    assert.equal(failLogin.status, 401);

    // 2.5 Login with valid password
    const validLogin = await api('/api/site-config', {
      method: 'POST',
      body: { email: 'admin@farminix.com', password: process.env.ADMIN_PASSWORD || 'Farminix@2026' },
    });
    assert.equal(validLogin.status, 200);
    assert.equal(validLogin.body.authenticated, true);
    assert.ok(validLogin.cookie && validLogin.cookie.includes('farminix_admin='));

    // 2.6 PUT /api/site-config (Admin publishing)
    const updatedConfig = {
      ...getRes.body.config,
      theme: { ...getRes.body.config.theme, colorPrimary: '#7C3AED' },
    };
    const putRes = await api('/api/site-config', {
      method: 'PUT',
      body: { config: updatedConfig },
      cookie: adminCookie,
    });
    assert.equal(putRes.status, 200);
    assert.ok(putRes.body.config);
    assert.ok(putRes.body.config.inventoryRevision >= 1);
  });

  await t.test('3. Customer Enquiries CRUD (/api/site-config/queries)', async () => {
    const requestId = randomUUID();
    const enquiryPayload = {
      name: 'Ramesh Verma',
      mobile: '9876543210',
      email: 'ramesh@example.com',
      message: 'Interested in bulk orders of Farminix Family Choice Rice.',
      kind: 'query',
      requestId,
    };

    // 3.1 Submit enquiry (public)
    const postRes = await api('/api/site-config/queries', { method: 'POST', body: enquiryPayload });
    assert.equal(postRes.status, 201);
    assert.equal(postRes.body.id, requestId);

    // 3.2 Spam check (honeypot field)
    const spamRes = await api('/api/site-config/queries', {
      method: 'POST',
      body: { ...enquiryPayload, website: 'http://spam.org' },
    });
    assert.equal(spamRes.status, 400);

    // 3.3 Admin list enquiries (requires admin cookie)
    const unauthGet = await api('/api/site-config/queries?page=0');
    assert.equal(unauthGet.status, 401);

    const listRes = await api('/api/site-config/queries?page=0', { cookie: adminCookie });
    assert.equal(listRes.status, 200);
    assert.ok(Array.isArray(listRes.body.enquiries));
    const found = listRes.body.enquiries.find((e) => e.id === requestId);
    assert.ok(found);
    assert.equal(found.name, 'Ramesh Verma');

    // 3.4 Admin update enquiry status & notes
    const patchRes = await api('/api/site-config/queries', {
      method: 'PATCH',
      body: { id: requestId, status: 'in-progress', adminNotes: 'Contacted Ramesh via phone.' },
      cookie: adminCookie,
    });
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.body.enquiry.status, 'in-progress');

    // 3.5 Admin soft-delete enquiry
    const delRes = await api('/api/site-config/queries', {
      method: 'DELETE',
      body: { id: requestId },
      cookie: adminCookie,
    });
    assert.equal(delRes.status, 200);
    assert.equal(delRes.body.deleted, true);

    // 3.6 Admin restore enquiry
    const restoreRes = await api('/api/site-config/queries', {
      method: 'DELETE',
      body: { id: requestId, action: 'restore' },
      cookie: adminCookie,
    });
    assert.equal(restoreRes.status, 200);
    assert.equal(restoreRes.body.deleted, false);
  });

  await t.test('4. Online Customer Checkout & Atomic Inventory Deduction', async () => {
    const fields = { action: 'register', name: 'Checkout Customer', email: `checkout_${Date.now()}@test.invalid`, phone: '9999999991', password: 'FamilyChoice@123' };
    const registered = await api('/api/customer-auth', { method: 'POST', body: fields });
    assert.equal(registered.status, 201);
    const customerCookie = String(registered.cookie).split(';')[0];
    const second = await api('/api/customer-auth', { method: 'POST', body: { ...fields, email: 'other-account@test.invalid', phone: '9999999992' } });
    assert.equal(second.status, 201);
    const secondCookie = String(second.cookie).split(';')[0];
    assert.equal((await api('/api/customer-auth', { cookie: customerCookie })).body.user.id, registered.body.user.id);
    const missing = await api('/api/customer-auth', { method: 'POST', body: { action: 'login', email: 'missing@test.invalid', password: fields.password } });
    assert.equal(missing.body.code, 'ACCOUNT_NOT_FOUND');
    assert.equal((await api('/api/customer-auth', { method: 'POST', body: { ...fields, action: 'login', password: 'incorrect' } })).status, 401);
    const addresses = [{ id: 'home', name: 'Home', street: 'Test Road', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', phone: fields.phone, isDefault: true }];
    assert.equal((await api('/api/customer-auth', { method: 'PUT', cookie: customerCookie, body: { addresses } })).status, 200);
    assert.deepEqual((await api('/api/customer-auth', { cookie: customerCookie })).body.user.addresses, addresses);
    // 4.1 Check initial stock of product 'r1'
    const configBefore = await api('/api/site-config');
    const initialRice = configBefore.body.config.products.find((p) => p.id === 'r1');
    const stockBefore = initialRice ? initialRice.stockCount : 150;

    const orderRequestId = randomUUID();
    const orderPayload = {
      requestId: orderRequestId,
      items: [{ productId: 'r1', quantity: 2, selectedWeight: '26 Kg' }],
      address: {
        name: 'Hitaishi Devarapalli',
        street: 'Plot No. 42, Brodipet 4th Line',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        pincode: '522034',
        phone: '9876543210',
        deliveryLocation: { lat: 16.30, lng: 80.44 },
      },
      payment: { method: 'COD' },
      expectedAmount: 4203, // 2100 * 2 = 4200 + 3 handling fee (delivery free > 500)
    };

    // Guest requests and forged browser profiles must fail before any stock change.
    assert.equal((await api('/api/site-config/orders', { method: 'POST', body: { ...orderPayload, customerId: registered.body.user.id } })).status, 401);
    assert.equal((await api('/api/payment/create-order', { method: 'POST', body: { amount: 4203 } })).status, 401);
    assert.equal((await api('/api/customer-orders')).status, 401);
    // 4.2 Place Order (COD)
    const orderRes = await api('/api/site-config/orders', { method: 'POST', body: orderPayload, cookie: customerCookie });
    assert.equal(orderRes.status, 201);
    assert.ok(orderRes.body.order);
    assert.ok(orderRes.body.order.id);
    assert.equal(orderRes.body.order.status, 'Order Received');
    assert.equal(orderRes.body.order.totalAmount, 4200);

    // 4.3 Idempotency test: Same requestId must return the existing order without duplicate stock reduction
    const retryRes = await api('/api/site-config/orders', { method: 'POST', body: orderPayload, cookie: customerCookie });
    assert.equal(retryRes.status, 200);
    assert.equal(retryRes.body.order.id, orderRes.body.order.id);

    // 4.4 Verify stock was decremented by 2
    const configAfter = await api('/api/site-config');
    const riceAfter = configAfter.body.config.products.find((p) => p.id === 'r1');
    assert.equal(riceAfter.stockCount, stockBefore - 2);

    // 4.5 Admin list orders
    const ordersListRes = await api('/api/site-config/orders', { cookie: adminCookie });
    assert.equal(ordersListRes.status, 200);
    assert.ok(Array.isArray(ordersListRes.body.orders));
    const placedOrder = ordersListRes.body.orders.find((o) => o.id === orderRes.body.order.id);
    assert.ok(placedOrder);

    // 4.6 Admin update order status to 'Packed'
    const statusUpdateRes = await api('/api/site-config/orders', {
      method: 'PATCH',
      body: { id: orderRes.body.order.id, status: 'Packed' },
      cookie: adminCookie,
    });
    assert.equal(statusUpdateRes.status, 200);
    assert.equal(statusUpdateRes.body.order.status, 'Packed');
    const own = await api('/api/customer-orders', { cookie: customerCookie });
    assert.equal(own.status, 200); assert.equal(own.body.orders.length, 1); assert.equal(own.body.orders[0].status, 'Packed');
    assert.equal(own.body.orders[0].customerId, registered.body.user.id); assert.equal(own.body.orders[0].deliveryAddress.street, orderPayload.address.street);
    assert.equal((await api(`/api/customer-orders?customerId=${registered.body.user.id}`, { cookie: secondCookie })).body.orders.length, 0);
    const stolen = await api('/api/site-config/orders', { method: 'POST', body: orderPayload, cookie: secondCookie });
    assert.equal(stolen.status, 409); assert.equal(stolen.body.order, undefined);
    // The private Users directory includes registered non-buyers and full order details.
    assert.equal((await api('/api/site-config/users')).status, 401);
    assert.equal((await api('/api/site-config/users', { cookie: customerCookie })).status, 401);
    const directory = await api('/api/site-config/users', { cookie: adminCookie });
    assert.equal(directory.status, 200); assert.equal(directory.body.totalUsers, 2); assert.equal(directory.body.usersWithOrders, 1); assert.equal(directory.body.totalOrders, 1);
    const nonBuyer = directory.body.users.find(user => user.id === second.body.user.id);
    assert.equal(nonBuyer.orderCount, 0); assert.equal(nonBuyer.orderValue, 0);
    const profile = await api(`/api/site-config/users?customerId=${registered.body.user.id}`, { cookie: adminCookie });
    assert.equal(profile.status, 200); assert.equal(profile.body.user.addresses[0].street, 'Test Road');
    assert.equal(profile.body.orders[0].id, orderRes.body.order.id); assert.equal(profile.body.orders[0].status, 'Packed');
    assert.equal(profile.body.user.orderCount, 1); assert.equal(profile.body.user.orderValue, 4203);
    assert.equal(profile.body.user.passwordHash, undefined); assert.equal(profile.body.user.password_hash, undefined); assert.equal(profile.body.orders[0].payment_details, undefined);
    const searched = await api(`/api/site-config/users?search=${encodeURIComponent(fields.email.toUpperCase())}`, { cookie: adminCookie });
    assert.equal(searched.body.matchedUsers, 1); assert.equal(searched.body.totalUsers, 2);
    const noPurchases = await api(`/api/site-config/users?customerId=${second.body.user.id}`, { cookie: adminCookie });
    assert.deepEqual(noPurchases.body.orders, []);
    assert.equal((await api('/api/site-config/users?customerId=missing', { cookie: adminCookie })).status, 404);
    assert.equal((await api('/api/customer-auth', { method: 'DELETE', cookie: customerCookie })).status, 200);
    assert.equal((await api('/api/customer-orders', { cookie: customerCookie })).status, 401);
    const login = await api('/api/customer-auth', { method: 'POST', body: { action: 'login', email: fields.email, password: fields.password } });
    assert.equal(login.status, 200); assert.equal((await api('/api/customer-orders', { cookie: String(login.cookie).split(';')[0] })).body.orders[0].id, orderRes.body.order.id);
  });

  await t.test('5. Payment & Security Endpoints', async () => {
    // 5.1 Public Razorpay key endpoint
    const keyRes = await api('/api/payment/razorpay-key');
    assert.equal(keyRes.status, 200);
    assert.equal(keyRes.body.success, true);
    assert.ok(keyRes.body.keyId !== undefined);

    // 5.2 Razorpay webhook endpoint
    const webhookRes = await api('/api/payment/webhook', {
      method: 'POST',
      body: { event: 'payment.captured' },
    });
    assert.equal(webhookRes.status, 200);
    assert.equal(webhookRes.body.status, 'ok');
  });

  await t.test('6. User Authentication & Profile Module', async () => {
    const testEmail = `user_${Date.now()}@test.com`;
    const regRes = await api('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'KVM Test Customer',
        email: testEmail,
        phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Password@123',
      },
    });
    assert.equal(regRes.status, 201);
    assert.ok(regRes.body.token);

    // Login with registered user
    const loginRes = await api('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail, password: 'Password@123' },
    });
    assert.equal(loginRes.status, 200);
    assert.ok(loginRes.body.token);
    const customerLogin = await api('/api/customer-auth', {
      method: 'POST', body: { action: 'login', email: testEmail, password: 'Password@123' },
    });
    assert.equal(customerLogin.status, 200, 'existing bcrypt credentials work with customer sessions');
    assert.equal(customerLogin.body.user.id, regRes.body.user.id);
  });
  await t.test('7. Local and outstation delivery, fixed charges and editable kilometre pricing', async () => {
    const registered = await api('/api/customer-auth', { method: 'POST', body: { action: 'register', name: 'Delivery Test', email: 'delivery@test.invalid', phone: '9999999993', password: 'FamilyChoice@123' } });
    assert.equal(registered.status, 201); const cookie = String(registered.cookie).split(';')[0];
    const publishRate = async (rate, extras = {}) => {
      const current = (await api('/api/site-config')).body.config;
      return api('/api/site-config', { method: 'PUT', cookie: adminCookie, body: { config: { ...current, cart: { ...current.cart, deliveryFee: 0, freeDeliveryThreshold: 0 }, checkoutPayment: { ...current.checkoutPayment, deliveryArea: { hubName: 'Gorantla Warehouse', hubLatitude: 16.346142, hubLongitude: 80.438065, perKmRate: rate, ...extras } } } } });
    };
    assert.equal((await publishRate(-1)).status, 400); assert.equal((await publishRate(10)).status, 200);
    const address = { name: 'Delivery Test', street: 'Test Road', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', phone: '9999999993' };
    const payload = (location, amount) => ({ requestId: randomUUID(), items: [{ productId: 'r1', quantity: 1, selectedWeight: '26 Kg' }], address: { ...address, deliveryLocation: location }, payment: { method: 'COD' }, expectedAmount: amount });
    for (const location of [undefined, { lat: 16.5062, lng: 80.648 }]) {
      assert.equal((await api('/api/site-config/orders', { method: 'POST', cookie, body: payload(location, 2103) })).status, location ? 409 : 422);
      assert.equal((await api('/api/payment/create-order', { method: 'POST', cookie, body: { amount: 2103, cart: [{ productId: 'r1', quantity: 1 }], address: { ...address, deliveryLocation: location } } })).status, location ? 409 : 422);
    }
    const near = await api('/api/site-config/orders', { method: 'POST', cookie, body: payload({ lat: 16.30, lng: 80.44 }, 2103) });
    assert.equal(near.status, 201); assert.equal(near.body.order.deliveryFee, 0);
    const far = { lat: 16.25, lng: 80.36 };
    assert.equal((await api('/api/site-config/orders', { method: 'POST', cookie, body: { ...payload(far, 2103), deliveryFee: 0, distanceKm: 0 } })).status, 409);
    const paidDistance = await api('/api/site-config/orders', { method: 'POST', cookie, body: payload(far, 2138.54) });
    assert.equal(paidDistance.status, 201); assert.equal(paidDistance.body.order.deliveryFee, 35.54);
    assert.equal((await publishRate(20)).status, 200);
    assert.equal((await api('/api/site-config/orders', { method: 'POST', cookie, body: payload(far, 2138.54) })).status, 409);
    const revised = await api('/api/site-config/orders', { method: 'POST', cookie, body: payload(far, 2174.08) }); assert.equal(revised.status, 201); assert.equal(revised.body.order.deliveryFee, 71.08);
    const outstation = { lat: 16.5062, lng: 80.648 };
    const outstationBody = amount => { const body = payload(outstation, amount); body.address.city = 'Vijayawada'; body.address.pincode = '520010'; return body; };
    assert.equal((await publishRate(10)).status, 200);
    const outstationKm = await api('/api/site-config/orders', { method: 'POST', cookie, body: outstationBody(2389.03) });
    assert.equal(outstationKm.status, 201); assert.equal(outstationKm.body.order.deliveryFee, 286.03);
    assert.equal((await publishRate(10, { pricingMode: 'fixed', fixedAmount: 150 })).status, 200);
    assert.equal((await api('/api/site-config/orders', { method: 'POST', cookie, body: outstationBody(2389.03) })).status, 409);
    const outstationFixed = await api('/api/site-config/orders', { method: 'POST', cookie, body: outstationBody(2253) });
    assert.equal(outstationFixed.status, 201); assert.equal(outstationFixed.body.order.deliveryFee, 150);
    assert.equal((await publishRate(10, { pricingMode: 'fixed', fixedAmount: 200 })).status, 200);
    assert.equal((await api('/api/site-config/orders', { method: 'POST', cookie, body: outstationBody(2253) })).status, 409);
    assert.equal((await api('/api/site-config/orders', { method: 'POST', cookie, body: outstationBody(2303) })).status, 201);
    assert.equal((await publishRate(null)).status, 200);
    assert.equal((await api('/api/site-config/orders', { method: 'POST', cookie, body: payload(far, 2103) })).status, 503);
    const history = await api('/api/customer-orders', { cookie }); assert.ok(history.body.orders.some(order => order.deliveryFee === 35.54 && order.deliveryAddress.deliveryLocation.lat === far.lat));
  });

  await t.test('8. Real support issues, staff responses, private notes and account-owned history', async () => {
    const createCustomer = async (email, phone) => {
      const result = await api('/api/customer-auth', { method: 'POST', body: { action: 'register', name: 'Support Test', email, phone, password: 'FamilyChoice@123' } });
      assert.equal(result.status, 201); return { cookie: String(result.cookie).split(';')[0], id: result.body.user.id };
    };
    const a = await createCustomer('support-a@test.invalid', '9999999994'), b = await createCustomer('support-b@test.invalid', '9999999995');
    const order = await api('/api/site-config/orders', { method: 'POST', cookie: a.cookie, body: { requestId: randomUUID(), items: [{ productId: 'r1', quantity: 1, selectedWeight: '26 Kg' }], address: { name: 'Support Test', street: 'Test Road', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', phone: '9999999994', deliveryLocation: { lat: 16.3, lng: 80.44 } }, payment: { method: 'COD' }, expectedAmount: 2103 } });
    assert.equal(order.status, 201);
    const payload = { requestId: randomUUID(), source: 'support', name: 'Support Test', mobile: '9999999994', email: '', kind: 'complaint', message: 'Please investigate this test delivery issue.', orderId: order.body.order.id, customerId: b.id };
    const initial = await api('/api/site-config/queries', { method: 'POST', cookie: a.cookie, body: payload });
    assert.equal(initial.status, 201);
    assert.equal((await api('/api/site-config/queries', { method: 'POST', cookie: a.cookie, body: payload })).body.id, initial.body.id);
    assert.equal((await api('/api/site-config/queries', { method: 'POST', cookie: a.cookie, body: { ...payload, message: 'A different message cannot overwrite the first request.' } })).status, 409);
    assert.equal((await api('/api/site-config/queries', { method: 'POST', cookie: b.cookie, body: { ...payload, requestId: randomUUID() } })).status, 400);
    assert.equal((await api('/api/site-config/queries?mine=1')).status, 401);
    const own = await api('/api/site-config/queries?mine=1', { cookie: a.cookie }); assert.equal(own.body.total, 1); assert.equal(own.body.enquiries[0].orderId, order.body.order.id);
    assert.equal((await api(`/api/site-config/queries?mine=1&customerId=${a.id}`, { cookie: b.cookie })).body.total, 0);
    const updated = await api('/api/site-config/queries', { method: 'PATCH', cookie: adminCookie, body: { id: initial.body.id, status: 'in-progress', adminNotes: 'PRIVATE: supplier contacted', publicReply: 'Our dispatch team is checking the delivery.' } });
    assert.equal(updated.status, 200); assert.ok(updated.body.enquiry.repliedAt);
    const visible = await api('/api/site-config/queries?mine=1', { cookie: a.cookie });
    assert.equal(visible.body.enquiries[0].publicReply, 'Our dispatch team is checking the delivery.'); assert.equal(visible.body.enquiries[0].status, 'in-progress');
    assert.equal(visible.body.enquiries[0].adminNotes, undefined); assert.ok(!JSON.stringify(visible.body).includes('PRIVATE'));
    assert.equal((await api('/api/site-config/queries', { method: 'PATCH', cookie: a.cookie, body: { id: initial.body.id, status: 'resolved', adminNotes: '', publicReply: 'Forged answer' } })).status, 401);
    for (let index = 0; index < 25; index++) assert.equal((await api('/api/site-config/queries', { method: 'POST', cookie: a.cookie, body: { ...payload, requestId: randomUUID(), message: `Another isolated support fixture ${index}.` } })).status, 201);
    const first = await api('/api/site-config/queries?mine=1&page=0', { cookie: a.cookie }), second = await api('/api/site-config/queries?mine=1&page=1', { cookie: a.cookie });
    assert.equal(first.body.enquiries.length, 25); assert.equal(second.body.enquiries.length, 1); assert.equal(first.body.total, 26);
    assert.equal(new Set([...first.body.enquiries, ...second.body.enquiries].map(row => row.id)).size, 26);
    assert.equal((await api('/api/site-config/queries', { method: 'DELETE', cookie: adminCookie, body: { id: initial.body.id } })).status, 200);
    assert.equal((await api('/api/site-config/queries?mine=1', { cookie: a.cookie })).body.total, 25);
    assert.equal((await api('/api/site-config/queries', { method: 'PATCH', cookie: adminCookie, body: { id: initial.body.id, action: 'restore' } })).status, 200);
    assert.equal((await api('/api/site-config/queries?mine=1', { cookie: a.cookie })).body.total, 26);
    assert.equal((await api('/api/support/chat', { method: 'POST', body: { message: 'This should not simulate an agent.' } })).status, 410);
  });

});
