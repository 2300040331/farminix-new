import test from 'node:test';
import assert from 'node:assert/strict';
import { createTypeScriptLoader } from './helpers/load-typescript.mjs';
const providerCalls = [];
class PaymentProviderFixture { constructor() { this.orders = { create: async options => { providerCalls.push(options); return { id: 'order_delivery', ...options }; } }; } }
const load = createTypeScriptLoader({ razorpay: PaymentProviderFixture });
const handler = load(new URL('../api/payment/create-order.ts', import.meta.url)).default;
const { defaultDeliveryArea } = load(new URL('../server/delivery-policy.ts', import.meta.url));
const response = () => ({ statusCode: 200, body: null, setHeader() {}, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
test('online payment initiation enforces delivery area and exact distance charges', async t => {
  const original = globalThis.fetch, env = { ...process.env };
  Object.assign(process.env, { KV_REST_API_URL: 'https://storage.invalid', KV_REST_API_TOKEN: 'test', RAZORPAY_KEY_ID: 'test-id', RAZORPAY_KEY_SECRET: 'test-secret' });
  const config = { products: [{ id: 'rice', price: 100, stockCount: 10, inStock: true }], cart: { handlingFee: 3, deliveryFee: 0, freeDeliveryThreshold: 0 }, checkoutPayment: { deliveryArea: { ...defaultDeliveryArea, perKmRate: 10 } } };
  const ownership = new Map();
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), 'https://storage.invalid'); const command = JSON.parse(options.body); let result;
    if (command[0] === 'GET') result = command[1] === 'farminix:site-config:v1' ? JSON.stringify(config) : JSON.stringify({ customerId: 'customer-a', expiresAt: Date.now() + 60000 });
    else if (command[0] === 'HGET') result = JSON.stringify({ id: 'customer-a', name: 'Test', email: 'test@test.invalid', phone: '9999999999', addresses: [] });
    else if (command[0] === 'HSET') { ownership.set(command[2], command[3]); result = 1; }
    else throw Error(`Unexpected command ${command[0]}`);
    return { ok: true, json: async () => ({ result }) };
  };
  const address = point => ({ city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', deliveryLocation: point });
  const call = async (address, amount) => { const res = response(); await handler({ method: 'POST', cookies: { farminix_customer: 'a'.repeat(43) }, body: { amount, cart: [{ productId: 'rice', quantity: 1 }], address, deliveryFee: 0, distanceKm: 0, notes: { customer_id: 'forged-account' } } }, res); return res; };
  try {
    await t.test('missing delivery map pins cannot start payment', async () => {
      for (const point of [undefined]) assert.equal((await call(address(point), 103)).statusCode, 422);
      assert.equal(providerCalls.length, 0);
    });
    await t.test('a free-delivery threshold cannot override a paid-distance charge', async () => {
      const result = await call(address({ lat: 16.25, lng: 80.36 }), 103); assert.equal(result.statusCode, 409); assert.equal(providerCalls.length, 0);
      const accepted = await call(address({ lat: 16.25, lng: 80.36 }), 138.54); assert.equal(accepted.statusCode, 200);
      assert.equal(providerCalls[0].amount, 13854); assert.equal(providerCalls[0].notes.customer_id, 'customer-a'); assert.equal(ownership.get('order_delivery'), 'customer-a');
    });
    await t.test('within 10 km stays free, even when legacy delivery fees are nonzero', async () => {
      config.cart.deliveryFee = 999; config.cart.freeDeliveryThreshold = 100000;
      assert.equal((await call(address({ lat: 16.3, lng: 80.44 }), 103)).statusCode, 200); assert.equal(providerCalls.at(-1).amount, 10300);
    });
    await t.test('outstation orders can pay the full-distance kilometre charge', async () => {
      const outside = { ...address({ lat: 16.5062, lng: 80.648 }), city: 'Vijayawada', pincode: '520010' };
      assert.equal((await call(outside, 103)).statusCode, 409);
      assert.equal((await call(outside, 389.03)).statusCode, 200); assert.equal(providerCalls.at(-1).amount, 38903);
    });
    await t.test('fixed pricing initiates local and outstation payments for the configured amount', async () => {
      config.checkoutPayment.deliveryArea.pricingMode = 'fixed'; config.checkoutPayment.deliveryArea.fixedAmount = 150;
      const outside = { ...address({ lat: 16.5062, lng: 80.648 }), city: 'Vijayawada', pincode: '520010' };
      for (const target of [outside, address({ lat: 16.25, lng: 80.36 })]) {
        assert.equal((await call(target, 253)).statusCode, 200); assert.equal(providerCalls.at(-1).amount, 25300);
      }
      config.checkoutPayment.deliveryArea.fixedAmount = 200;
      assert.equal((await call(outside, 253)).statusCode, 409); assert.equal((await call(outside, 303)).statusCode, 200);
      assert.equal((await call(address({ lat: 16.3, lng: 80.44 }), 103)).statusCode, 200);
      config.checkoutPayment.deliveryArea.fixedAmount = null;
      assert.equal((await call(outside, 103)).statusCode, 503);
      config.checkoutPayment.deliveryArea.pricingMode = 'per-km';
    });
    await t.test('admin rate changes are rechecked before payment starts', async () => {
      config.checkoutPayment.deliveryArea.perKmRate = 20;
      assert.equal((await call(address({ lat: 16.25, lng: 80.36 }), 138.54)).statusCode, 409);
      assert.equal((await call(address({ lat: 16.25, lng: 80.36 }), 174.08)).statusCode, 200); assert.equal(providerCalls.at(-1).amount, 17408);
      config.checkoutPayment.deliveryArea.perKmRate = null;
      assert.equal((await call(address({ lat: 16.25, lng: 80.36 }), 103)).statusCode, 503);
    });
  } finally { globalThis.fetch = original; for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key]; Object.assign(process.env, env); }
});
