import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { createHmac, randomUUID } from 'node:crypto';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const output = ts.transpileModule(fs.readFileSync(new URL('../api/site-config/orders.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
new Function('require', 'exports', output)(require, exports);
const handler = exports.default;
const response = () => ({ statusCode: 200, body: null, setHeader() {}, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('online checkout persists private orders and decrements shared inventory safely', async t => {
  const env = { ...process.env }, originalFetch = globalThis.fetch;
  Object.assign(process.env, { ADMIN_SESSION_SECRET: 'isolated-test-session', KV_REST_API_URL: 'https://storage.invalid', KV_REST_API_TOKEN: 'test', RAZORPAY_KEY_ID: 'test-key', RAZORPAY_KEY_SECRET: 'test-secret' });
  const expires = String(Date.now() + 60000);
  const cookies = { farminix_admin: `${expires}.${createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(expires).digest('hex')}` };
  const records = new Map(), requests = new Map();
  const initialConfig = () => ({ products: [{ id: 'rice', name: 'Test rice', price: 100, weight: '1 kg', stockCount: 5, inStock: true }], cart: { handlingFee: 3, deliveryFee: 20, freeDeliveryThreshold: 500, couponsEnabled: true, coupons: [{ code: 'TEST10', enabled: true, discountPercentage: 10, minimumSpend: 100 }] }, checkoutPayment: { paymentMethods: [{ id: 'cod', enabled: true }] } });
  let raw = JSON.stringify(initialConfig()), calls = 0, conflictOnce = false, paymentAmount = 203;
  globalThis.fetch = async (url, opts) => {
    if (String(url).startsWith('https://api.razorpay.com/')) return { ok: true, json: async () => ({ order_id: 'order_test', status: 'captured', amount: paymentAmount * 100, currency: 'INR' }) };
    calls++;
    const cmd = JSON.parse(opts.body);
    let result = null;
    if (cmd[0] === 'GET') result = raw;
    else if (cmd[0] === 'HGET') result = requests.get(cmd[2]) || null;
    else if (cmd[0] === 'HVALS') result = [...records.values()];
    else if (cmd[0] === 'EVAL' && cmd[2] === 3) {
      const [, , , , , , identity, previous, next, id, order] = cmd;
      if (requests.has(identity)) result = requests.get(identity);
      else if (conflictOnce) { conflictOnce = false; result = 'RETRY'; }
      else if (raw !== previous) result = 'RETRY';
      else { raw = next; records.set(id, order); requests.set(identity, order); result = order; }
    } else if (cmd[0] === 'EVAL' && cmd[2] === 1) {
      const row = records.get(cmd[4]);
      if (row) { result = JSON.stringify({ ...JSON.parse(row), status: cmd[5] }); records.set(cmd[4], result); }
    } else throw Error(`Unexpected command ${cmd[0]}`);
    return { ok: true, json: async () => ({ result }) };
  };
  const fixture = () => ({ requestId: randomUUID(), items: [{ productId: 'rice', quantity: 2, selectedWeight: '1 kg' }], address: { name: 'Test customer', street: 'Test address', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', phone: '9999999999' }, payment: { method: 'COD' }, expectedAmount: 223 });
  const post = async body => { const res = response(); await handler({ method: 'POST', body }, res); return res; };
  try {
    await t.test('private order reads and status changes require an admin session', async () => {
      for (const method of ['GET', 'PATCH']) { const res = response(); await handler({ method, cookies: {}, body: {} }, res); assert.equal(res.statusCode, 401); }
      assert.equal(calls, 0);
    });
    await t.test('rejects invalid quantities, missing payment proof and altered totals', async () => {
      for (const body of [{ ...fixture(), items: [{ productId: 'rice', quantity: -1 }] }, { ...fixture(), payment: { method: 'RAZORPAY' } }, { ...fixture(), expectedAmount: 1 }]) assert.ok((await post(body)).statusCode >= 400);
      assert.equal(records.size, 0); assert.equal(JSON.parse(raw).products[0].stockCount, 5);
    });
    const orderRequest = fixture();
    await t.test('COD confirmation stores an order and deducts stock only once on retry', async () => {
      const first = await post(orderRequest), retry = await post(orderRequest);
      assert.equal(first.statusCode, 201); assert.equal(retry.statusCode, 200); assert.equal(first.body.order.id, retry.body.order.id);
      assert.equal(first.body.order.totalAmount, 200); assert.equal(first.body.order.deliveryFee, 20); assert.equal(first.body.order.finalAmount, 223);
      assert.equal(records.size, 1); assert.equal(JSON.parse(raw).products[0].stockCount, 3); assert.equal(JSON.parse(raw).inventoryRevision, 1);
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
    });
    await t.test('coupon totals and concurrent catalog changes are revalidated before saving', async () => {
      conflictOnce = true;
      const res = await post({ ...fixture(), couponCode: 'TEST10', expectedAmount: 203 });
      assert.equal(res.statusCode, 201); assert.equal(res.body.order.discount, 20); assert.equal(JSON.parse(raw).products[0].stockCount, 1);
    });
    await t.test('online payments verify amount; payment retries cannot create duplicate orders', async () => {
      raw = JSON.stringify(initialConfig());
      const signature = createHmac('sha256', 'test-secret').update('order_test|pay_test').digest('hex');
      const paid = { ...fixture(), expectedAmount: 203, couponCode: 'TEST10', payment: { method: 'RAZORPAY', razorpay_order_id: 'order_test', razorpay_payment_id: 'pay_test', razorpay_signature: signature } };
      paymentAmount = 1; assert.equal((await post(paid)).statusCode, 409);
      paymentAmount = 203;
      const first = await post(paid), retry = await post({ ...paid, requestId: randomUUID() });
      assert.equal(first.statusCode, 201); assert.equal(retry.body.order.id, first.body.order.id); assert.equal(JSON.parse(raw).products[0].stockCount, 3);
      assert.match(first.body.order.paymentMethod, /Paid/);
    });
    await t.test('storage failure cannot report successful confirmation', async () => {
      globalThis.fetch = async () => { throw Error('offline'); };
      const res = await post(fixture()); assert.equal(res.statusCode, 503); assert.equal(res.body.order, undefined);
    });
  } finally { globalThis.fetch = originalFetch; for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key]; Object.assign(process.env, env); }
});
