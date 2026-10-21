import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createHmac, randomUUID } from 'node:crypto';
import { initDatabase } from '../server/dist/db.js';
import app from '../server/dist/server.js';

let server;
let baseUrl;

test.before(async () => {
  await initDatabase();
  await new Promise((resolve) => {
    server = http.createServer(app).listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function api(path, { method = 'GET', body, headers = {}, cookie } = {}) {
  const reqHeaders = {
    'content-type': 'application/json',
    ...(cookie ? { cookie } : {}),
    ...headers,
  };

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  const setCookie = res.headers.get('set-cookie');
  return { status: res.status, body: json, headers: res.headers, cookie: setCookie };
}

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
      },
      payment: { method: 'COD' },
      expectedAmount: 4203, // 2100 * 2 = 4200 + 3 handling fee (delivery free > 500)
    };

    // 4.2 Place Order (COD)
    const orderRes = await api('/api/site-config/orders', { method: 'POST', body: orderPayload });
    assert.equal(orderRes.status, 201);
    assert.ok(orderRes.body.order);
    assert.ok(orderRes.body.order.id);
    assert.equal(orderRes.body.order.status, 'Order Received');
    assert.equal(orderRes.body.order.totalAmount, 4200);

    // 4.3 Idempotency test: Same requestId must return the existing order without duplicate stock reduction
    const retryRes = await api('/api/site-config/orders', { method: 'POST', body: orderPayload });
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
  });
});
