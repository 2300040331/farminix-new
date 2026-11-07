import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { loadTypeScript } from './helpers/load-typescript.mjs';
import { enquiryRedisFixture } from './helpers/enquiry-redis.mjs';
const handler = loadTypeScript(new URL('../api/site-config/queries.ts', import.meta.url)).default;
const response = () => ({ statusCode: 200, body: null, headers: {}, setHeader(name, value) { this.headers[name] = value; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('real support requests, staff replies and customer-only ticket history', async t => {
  const original = globalThis.fetch, env = { ...process.env };
  Object.assign(process.env, { ADMIN_SESSION_SECRET: 'support-unit-test', KV_REST_API_URL: 'https://storage.invalid', KV_REST_API_TOKEN: 'test' });
  const storage = enquiryRedisFixture(); globalThis.fetch = storage.fetch;
  const cookieFor = (id, token) => {
    storage.customers.set(id, JSON.stringify({ id, name: 'Test Customer', email: `${id}@test.invalid`, phone: '9999999999', addresses: [] }));
    storage.sessions.set(`farminix:customer-session:v1:${createHash('sha256').update(token).digest('hex')}`, JSON.stringify({ customerId: id, expiresAt: Date.now() + 60000 }));
    return { farminix_customer: token };
  };
  const customer = cookieFor('customer-a', 'a'.repeat(43)), other = cookieFor('customer-b', 'b'.repeat(43));
  const expiry = String(Date.now() + 60000), admin = { farminix_admin: `${expiry}.${createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(expiry).digest('hex')}` };
  storage.orders.set('order-a', JSON.stringify({ id: 'order-a', customerId: 'customer-a' })); storage.orders.set('order-b', JSON.stringify({ id: 'order-b', customerId: 'customer-b' }));
  const payload = () => ({ requestId: randomUUID(), source: 'support', name: 'Test Customer', mobile: '9999999999', email: '', kind: 'complaint', message: 'My order has not arrived. Please investigate.', website: '' });
  const call = async (method, body, cookies = {}, query = {}) => { const res = response(); await handler({ method, body, cookies, query }, res); return res; };
  let request;
  try {
    await t.test('guests can report issues, but cannot view or update private requests', async () => {
      const guest = await call('POST', { ...payload(), customerId: 'customer-a', publicReply: 'fake response', adminNotes: 'fake note', status: 'resolved' });
      assert.equal(guest.statusCode, 201); const saved = JSON.parse(storage.records.get(guest.body.id));
      assert.equal(saved.customerId, undefined); assert.equal(saved.publicReply, ''); assert.equal(saved.adminNotes, ''); assert.equal(saved.status, 'new');
      assert.equal((await call('GET', undefined, {}, { mine: '1' })).statusCode, 401);
      assert.equal((await call('PATCH', { id: guest.body.id, status: 'resolved', adminNotes: '' }, customer)).statusCode, 401);
    });
    await t.test('authenticated submission persists once and links only the server-side account and owned order', async () => {
      request = { ...payload(), orderId: 'order-a', customerId: 'customer-b' };
      for (let index = 0; index < 2; index++) { const saved = await call('POST', request, customer); assert.equal(saved.statusCode, 201); assert.equal(saved.body.id, request.requestId); }
      const row = JSON.parse(storage.records.get(request.requestId)); assert.equal(row.customerId, 'customer-a'); assert.equal(row.orderId, 'order-a'); assert.equal(row.source, 'support');
      assert.equal((await call('POST', { ...payload(), orderId: 'order-b' }, customer)).statusCode, 400);
      assert.equal((await call('POST', { ...payload(), orderId: 'order-a' })).statusCode, 400);
      assert.equal((await call('POST', { ...request, message: 'A changed request must not overwrite the saved issue.' }, customer)).statusCode, 409);
      assert.equal((await call('POST', { ...request, orderId: undefined }, other)).statusCode, 409);
    });
    await t.test('staff can see issues and send a real customer-visible response', async () => {
      const inbox = await call('GET', undefined, admin); assert.equal(inbox.body.total, 2); assert.ok(inbox.body.enquiries.some(row => row.id === request.requestId));
      const saved = await call('PATCH', { id: request.requestId, status: 'in-progress', adminNotes: 'PRIVATE: supplier investigation', publicReply: 'We are checking your delivery with the dispatch team.' }, admin);
      assert.equal(saved.statusCode, 200); assert.equal(saved.body.enquiry.status, 'in-progress'); assert.ok(saved.body.enquiry.repliedAt);
      const own = await call('GET', undefined, customer, { mine: '1', customerId: 'customer-b' });
      assert.equal(own.body.total, 1); assert.equal(own.body.enquiries[0].publicReply, 'We are checking your delivery with the dispatch team.'); assert.equal(own.body.enquiries[0].status, 'in-progress');
      assert.ok(!JSON.stringify(own.body).includes('PRIVATE')); assert.equal(own.body.enquiries[0].adminNotes, undefined);
      const others = await call('GET', undefined, other, { mine: '1', customerId: 'customer-a' }); assert.equal(others.body.total, 0); assert.deepEqual(others.body.enquiries, []);
      assert.match(own.headers['Cache-Control'], /private.*no-store/);
    });
    await t.test('customer history is paginated and follows actual saved replies and status', async () => {
      for (let index = 0; index < 25; index++) assert.equal((await call('POST', { ...payload(), message: `Test-only support request number ${index}.` }, customer)).statusCode, 201);
      const first = await call('GET', undefined, customer, { mine: '1', page: '0' }), second = await call('GET', undefined, customer, { mine: '1', page: '1' });
      assert.equal(first.body.enquiries.length, 25); assert.equal(second.body.enquiries.length, 1); assert.equal(first.body.total, 26);
      assert.equal((await call('GET', undefined, customer, { mine: '1', page: '-1' })).statusCode, 400);
      await call('PATCH', { id: request.requestId, status: 'resolved', adminNotes: 'PRIVATE', publicReply: 'The delivery issue is resolved.' }, admin);
      const row = JSON.parse(storage.records.get(request.requestId)); assert.equal(row.publicReply, 'The delivery issue is resolved.'); assert.equal(row.status, 'resolved');
    });
    await t.test('trash and restore update the customer history index correctly', async () => {
      assert.equal((await call('DELETE', { id: request.requestId }, admin)).statusCode, 200);
      assert.equal((await call('GET', undefined, customer, { mine: '1' })).body.total, 25);
      assert.equal((await call('PATCH', { id: request.requestId, action: 'restore' }, admin)).statusCode, 200);
      assert.equal((await call('GET', undefined, customer, { mine: '1' })).body.total, 26);
    });
    await t.test('expired logins, disabled requests and storage failures never claim a successful issue submission', async () => {
      const hash = createHash('sha256').update('a'.repeat(43)).digest('hex'); storage.sessions.delete(`farminix:customer-session:v1:${hash}`);
      assert.equal((await call('POST', payload(), customer)).statusCode, 401);
      globalThis.fetch = enquiryRedisFixture({ queriesPage: { enabled: false } }).fetch;
      assert.equal((await call('POST', payload())).statusCode, 403);
      globalThis.fetch = async () => { throw Error('offline'); };
      const failure = await call('POST', payload()); assert.equal(failure.statusCode, 503); assert.equal(failure.body.id, undefined);
    });
  } finally { globalThis.fetch = original; for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key]; Object.assign(process.env, env); }
});
