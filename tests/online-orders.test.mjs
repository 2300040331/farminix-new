import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { loadTypeScript } from './helpers/load-typescript.mjs';
const handler = loadTypeScript(new URL('../api/site-config/orders.ts', import.meta.url)).default;
const historyHandler = loadTypeScript(new URL('../api/customer-orders.ts', import.meta.url)).default;
const { sessionHash } = loadTypeScript(new URL('../server/customer-auth.ts', import.meta.url));
const response = () => ({ statusCode: 200, body: null, setHeader() {}, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('online checkout persists private orders and decrements shared inventory safely', async t => {
  const env = { ...process.env }, originalFetch = globalThis.fetch;
  Object.assign(process.env, { ADMIN_SESSION_SECRET: 'isolated-test-session', KV_REST_API_URL: 'https://storage.invalid', KV_REST_API_TOKEN: 'test', RAZORPAY_KEY_ID: 'test-key', RAZORPAY_KEY_SECRET: 'test-secret' });
  const expires = String(Date.now() + 60000);
  const cookies = { farminix_admin: `${expires}.${createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(expires).digest('hex')}` };
  const records = new Map(), requests = new Map(), history = new Map();
  const customer = { id: 'customer-a', name: 'Test Customer', email: 'customer@test.invalid', phone: '9999999999', addresses: [], passwordHash: 'private' };
  const customerCookie = { farminix_customer: 'a'.repeat(43) }, otherCookie = { farminix_customer: 'b'.repeat(43) };
  const tokens = new Map([[sessionHash(customerCookie.farminix_customer), 'customer-a'], [sessionHash(otherCookie.farminix_customer), 'customer-b']]);
  const initialConfig = () => ({ products: [{ id: 'rice', name: 'Test rice', price: 100, weight: '1 kg', stockCount: 5, inStock: true }], cart: { handlingFee: 3, deliveryFee: 20, freeDeliveryThreshold: 500, couponsEnabled: true, coupons: [{ code: 'TEST10', enabled: true, discountPercentage: 10, minimumSpend: 100 }] }, checkoutPayment: { paymentMethods: [{ id: 'cod', enabled: true }] } });
  let raw = JSON.stringify(initialConfig()), calls = 0, conflictOnce = false, paymentAmount = 183;
  globalThis.fetch = async (url, opts) => {
    if (String(url).startsWith('https://api.razorpay.com/')) return { ok: true, json: async () => ({ order_id: 'order_test', status: 'captured', amount: paymentAmount * 100, currency: 'INR' }) };
    calls++;
    const cmd = JSON.parse(opts.body);
    let result = null;
    if (cmd[0] === 'GET') {
      if (cmd[1] === 'farminix:site-config:v1') result = raw;
      else { const id = tokens.get(cmd[1].split(':').at(-1)); result = id ? JSON.stringify({ customerId: id, expiresAt: Date.now() + 60000 }) : null; }
    } else if (cmd[0] === 'HGET') {
      if (cmd[1] === 'farminix:customers:v1') result = JSON.stringify({ ...customer, id: cmd[2] });
      else if (cmd[1] === 'farminix:customer-payment-orders:v1') result = 'customer-a';
      else result = requests.get(cmd[2]) || null;
    } else if (cmd[0] === 'ZREVRANGE') result = (history.get(cmd[1]) || []).slice(cmd[2], cmd[3] + 1);
    else if (cmd[0] === 'HMGET') result = cmd.slice(2).map(id => records.get(id) || null);
    else if (cmd[0] === 'HVALS') result = [...records.values()];
    else if (cmd[0] === 'EVAL' && cmd[2] === 4) {
      const [, , , , , , ownerKey, identity, previous, next, id, order] = cmd;
      if (requests.has(identity)) result = requests.get(identity);
      else if (conflictOnce) { conflictOnce = false; result = 'RETRY'; }
      else if (raw !== previous) result = 'RETRY';
      else { raw = next; records.set(id, order); requests.set(identity, order); history.set(ownerKey, [id, ...(history.get(ownerKey) || [])]); result = order; }
    } else if (cmd[0] === 'EVAL' && cmd[2] === 1) {
      const row = records.get(cmd[4]);
      if (row) { result = JSON.stringify({ ...JSON.parse(row), status: cmd[5] }); records.set(cmd[4], result); }
    } else throw Error(`Unexpected command ${cmd[0]}`);
    return { ok: true, json: async () => ({ result }) };
  };
  const fixture = () => ({ requestId: randomUUID(), items: [{ productId: 'rice', quantity: 2, selectedWeight: '1 kg' }], address: { name: 'Test customer', street: 'Test address', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', phone: '9999999999', deliveryLocation: { lat: 16.30, lng: 80.44 } }, payment: { method: 'COD' }, expectedAmount: 203 });
  const post = async (body, session = customerCookie) => { const res = response(); await handler({ method: 'POST', cookies: session, body }, res); return res; };
  try {
    await t.test('private order reads and status changes require an admin session', async () => {
      for (const method of ['GET', 'PATCH']) { const res = response(); await handler({ method, cookies: {}, body: {} }, res); assert.equal(res.statusCode, 401); }
      assert.equal(calls, 0);
    });
    await t.test('guests and forged profiles cannot place orders', async () => {
      const before = calls;
      const res = await post({ ...fixture(), customerId: customer.id, user: customer }, {});
      assert.equal(res.statusCode, 401); assert.equal(calls, before); assert.equal(records.size, 0);
    });
    await t.test('rejects invalid quantities, missing payment proof and altered totals', async () => {
      for (const body of [{ ...fixture(), items: [{ productId: 'rice', quantity: -1 }] }, { ...fixture(), payment: { method: 'RAZORPAY' } }, { ...fixture(), expectedAmount: 1 }]) assert.ok((await post(body)).statusCode >= 400);
      assert.equal(records.size, 0); assert.equal(JSON.parse(raw).products[0].stockCount, 5);
    });
    await t.test('missing pins and unconfigured delivery charges cannot consume inventory', async () => {
      const before = JSON.parse(raw).products[0].stockCount;
      for (const deliveryLocation of [undefined, { lat: 16.5062, lng: 80.648 }]) {
        const base = fixture(), rejected = await post({ ...base, address: { ...base.address, deliveryLocation }, deliveryFee: 0, distanceKm: 0 });
        assert.equal(rejected.statusCode, deliveryLocation ? 503 : 422); assert.equal(rejected.body.order, undefined);
      }
      assert.equal(JSON.parse(raw).products[0].stockCount, before); assert.equal(records.size, 0);
    });
    const orderRequest = fixture();
    await t.test('COD confirmation stores an order and deducts stock only once on retry', async () => {
      const first = await post(orderRequest), retry = await post(orderRequest);
      assert.equal(first.statusCode, 201); assert.equal(retry.statusCode, 200); assert.equal(first.body.order.id, retry.body.order.id);
      assert.equal(first.body.order.customerId, customer.id); assert.equal(first.body.order.totalAmount, 200); assert.equal(first.body.order.deliveryFee, 0); assert.equal(first.body.order.finalAmount, 203);
      assert.equal(records.size, 1); assert.equal(JSON.parse(raw).products[0].stockCount, 3); assert.equal(JSON.parse(raw).inventoryRevision, 1);
    });
    await t.test('retries and order history are isolated by authenticated customer', async () => {
      const wrongOwner = await post(orderRequest, otherCookie);
      assert.equal(wrongOwner.statusCode, 409); assert.equal(wrongOwner.body.order, undefined);
      for (const [session, count] of [[customerCookie, 1], [otherCookie, 0]]) {
        const res = response(); await historyHandler({ method: 'GET', cookies: session, query: { customerId: customer.id } }, res);
        assert.equal(res.statusCode, 200); assert.equal(res.body.orders.length, count);
      }
      const guest = response(); await historyHandler({ method: 'GET' }, guest); assert.equal(guest.statusCode, 401);
    });
    await t.test('multiple cart weights aggregate quantity for stock checks', async () => {
      const res = await post({ ...fixture(), items: [{ productId: 'rice', quantity: 2, selectedWeight: '1 kg' }, { productId: 'rice', quantity: 2, selectedWeight: '1 kg' }], expectedAmount: 423 });
      assert.equal(res.statusCode, 409); assert.equal(records.size, 1);
    });
    await t.test('admin can read confirmed orders and save fulfillment status', async () => {
      const read = response(); await handler({ method: 'GET', cookies }, read); assert.equal(read.body.orders.length, 1); assert.equal(read.body.products[0].stockCount, 3);
      const id = read.body.orders[0].id, updated = response(); await handler({ method: 'PATCH', cookies, body: { id, status: 'Packed' } }, updated);
      assert.equal(updated.body.order.status, 'Packed');
      const reread = response(); await handler({ method: 'GET', cookies }, reread); assert.equal(reread.body.orders[0].status, 'Packed');
      const own = response(); await historyHandler({ method: 'GET', cookies: customerCookie }, own); assert.equal(own.body.orders[0].status, 'Packed');
    });
    await t.test('coupon totals and concurrent catalog changes are revalidated before saving', async () => {
      conflictOnce = true;
      const res = await post({ ...fixture(), couponCode: 'TEST10', expectedAmount: 183 });
      assert.equal(res.statusCode, 201); assert.equal(res.body.order.discount, 20); assert.equal(JSON.parse(raw).products[0].stockCount, 1);
    });
    await t.test('online payments verify amount; payment retries cannot create duplicate orders', async () => {
      raw = JSON.stringify(initialConfig());
      const signature = createHmac('sha256', 'test-secret').update('order_test|pay_test').digest('hex');
      const paid = { ...fixture(), expectedAmount: 183, couponCode: 'TEST10', payment: { method: 'RAZORPAY', razorpay_order_id: 'order_test', razorpay_payment_id: 'pay_test', razorpay_signature: signature } };
      assert.equal((await post(paid, otherCookie)).statusCode, 403);
      paymentAmount = 1; assert.equal((await post(paid)).statusCode, 409);
      paymentAmount = 183;
      const first = await post(paid), retry = await post({ ...paid, requestId: randomUUID() });
      assert.equal(first.statusCode, 201); assert.equal(retry.body.order.id, first.body.order.id); assert.equal(JSON.parse(raw).products[0].stockCount, 3);
      assert.match(first.body.order.paymentMethod, /Paid/);
    });
    await t.test('distance charges are recalculated from admin settings, regardless of cart thresholds', async () => {
      const config = initialConfig(); config.checkoutPayment.deliveryArea = { hubName: 'Test warehouse', hubLatitude: 16.346142, hubLongitude: 80.438065, perKmRate: 10 }; config.cart.freeDeliveryThreshold = 0;
      raw = JSON.stringify(config);
      const body = fixture(); body.address.deliveryLocation = { lat: 16.25, lng: 80.36 }; body.expectedAmount = 203;
      assert.equal((await post({ ...body, deliveryFee: 0, distanceKm: 0 })).statusCode, 409);
      body.expectedAmount = 238.54;
      const confirmed = await post(body); assert.equal(confirmed.statusCode, 201); assert.equal(confirmed.body.order.deliveryFee, 35.54); assert.deepEqual(confirmed.body.order.deliveryAddress.deliveryLocation, body.address.deliveryLocation);
      const revised = initialConfig(); revised.checkoutPayment.deliveryArea = { ...config.checkoutPayment.deliveryArea, perKmRate: 20 }; raw = JSON.stringify(revised);
      assert.equal((await post({ ...body, requestId: randomUUID() })).statusCode, 409);
      body.expectedAmount = 274.08; assert.equal((await post({ ...body, requestId: randomUUID() })).statusCode, 201);
    });
    await t.test('outstation COD orders work with fixed and full-distance kilometre charges', async () => {
      const config = initialConfig(); config.checkoutPayment.deliveryArea = { hubName: 'Test warehouse', hubLatitude: 16.346142, hubLongitude: 80.438065, pricingMode: 'fixed', fixedAmount: 150, perKmRate: 10 }; raw = JSON.stringify(config);
      const outside = fixture(); outside.address = { ...outside.address, city: 'Vijayawada', pincode: '520010', deliveryLocation: { lat: 16.5062, lng: 80.648 } }; outside.expectedAmount = 353;
      assert.equal((await post({ ...outside, expectedAmount: 203, deliveryFee: 0 })).statusCode, 409);
      const first = await post(outside); assert.equal(first.statusCode, 201); assert.equal(first.body.order.deliveryFee, 150);
      config.checkoutPayment.deliveryArea.pricingMode = 'per-km'; raw = JSON.stringify(config);
      assert.equal((await post({ ...outside, requestId: randomUUID() })).statusCode, 409);
      const second = await post({ ...outside, requestId: randomUUID(), expectedAmount: 489.03 }); assert.equal(second.statusCode, 201); assert.equal(second.body.order.deliveryFee, 286.03);
    });
    await t.test('storage failure cannot report successful confirmation', async () => {
      globalThis.fetch = async () => { throw Error('offline'); };
      const res = await post(fixture()); assert.equal(res.statusCode, 503); assert.equal(res.body.order, undefined);
    });
  } finally { globalThis.fetch = originalFetch; for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key]; Object.assign(process.env, env); }
});
