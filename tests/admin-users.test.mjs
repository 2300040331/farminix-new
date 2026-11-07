import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { loadTypeScript } from './helpers/load-typescript.mjs';
const handler = loadTypeScript(new URL('../api/site-config/users.ts', import.meta.url)).default;
const response = () => ({ statusCode: 200, body: null, headers: {}, setHeader(name, value) { this.headers[name.toLowerCase()] = value; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('admin Users directory includes all registered accounts and their real order history', async t => {
  const env = { ...process.env }, originalFetch = globalThis.fetch;
  Object.assign(process.env, { ADMIN_SESSION_SECRET: 'isolated-admin-users-test', KV_REST_API_URL: 'https://storage.invalid', KV_REST_API_TOKEN: 'test' });
  const adminCookie = expires => ({ farminix_admin: `${expires}.${createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(String(expires)).digest('hex')}` });
  const admin = adminCookie(Date.now() + 60000);
  const accounts = new Map(Array.from({ length: 27 }, (_, index) => {
    const id = `user-${index}`;
    return [id, { id, name: `Family ${index}`, email: `family${index}@test.invalid`, phone: `999999${String(index).padStart(4, '0')}`, addresses: [], passwordHash: 'PRIVATE-PASSWORD-HASH', rewardPoints: 0, walletBalance: 0, createdAt: new Date(Date.UTC(2026, 10, 1, 0, index)).toISOString() }];
  }));
  accounts.get('user-0').addresses.push({ id: 'home', name: 'Home', street: 'Test Road', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', phone: '9999990000', isDefault: true });
  const orders = new Map(Array.from({ length: 530 }, (_, index) => [`order-${index}`, {
    id: `order-${index}`, customerId: 'user-0', date: new Date(Date.UTC(2026, 10, 1, 0, index)).toISOString(), status: index === 0 ? 'Packed' : 'Delivered',
    totalAmount: 100, discount: 0, finalAmount: 103, handlingFee: 3, deliveryFee: 0, paymentMethod: 'Cash on Delivery (COD)',
    deliveryAddress: accounts.get('user-0').addresses[0], items: [{ product: { id: 'rice', name: 'Test Rice', price: 100 }, quantity: 1, selectedWeight: '1 kg' }],
  }]));
  orders.set('other-order', { ...orders.get('order-0'), id: 'other-order', customerId: 'user-1', finalAmount: 203 });
  orders.set('guest-order', { ...orders.get('order-0'), id: 'guest-order', customerId: undefined });
  const history = new Map([['user-0', [...orders.keys()].filter(id => id.startsWith('order-')).reverse()], ['user-1', ['other-order']]]);
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), 'https://storage.invalid'); calls++;
    const command = JSON.parse(options.body); let result;
    if (command[0] === 'HVALS') result = [...(command[1] === 'farminix:customers:v1' ? accounts : orders).values()].map(row => JSON.stringify(row));
    else if (command[0] === 'HGET') result = accounts.has(command[2]) ? JSON.stringify(accounts.get(command[2])) : null;
    else if (command[0] === 'ZREVRANGE') result = (history.get(command[1].split(':').at(-1)) || []).slice(command[2], command[3] + 1);
    else if (command[0] === 'HMGET') result = command.slice(2).map(id => orders.has(id) ? JSON.stringify(orders.get(id)) : null);
    else throw Error(`Unexpected command: ${command[0]}`);
    return { ok: true, json: async () => ({ result }) };
  };
  const call = async (query = {}, cookies = admin, extra = {}) => {
    const res = response(); await handler({ method: 'GET', cookies, query, ...extra }, res); return res;
  };
  try {
    await t.test('guests, shoppers, expired and altered admin cookies are denied before storage reads', async () => {
      for (const cookies of [{}, { farminix_customer: 'a'.repeat(43) }, adminCookie(Date.now() - 1), { farminix_admin: `${Date.now() + 60000}.invalid` }]) {
        const result = await call({}, cookies); assert.equal(result.statusCode, 401); assert.match(result.headers['cache-control'], /private.*no-store/);
      }
      assert.equal(calls, 0);
    });
    await t.test('counts include users without orders and are independent of search/page limits', async () => {
      const first = await call();
      assert.equal(first.statusCode, 200); assert.equal(first.body.totalUsers, 27); assert.equal(first.body.usersWithOrders, 2); assert.equal(first.body.totalOrders, 531);
      assert.equal(first.body.users.length, 25); assert.equal(first.body.hasMore, true);
      const second = await call({ page: '1' }); assert.equal(second.body.users.length, 2); assert.equal(second.body.hasMore, false);
      const noOrders = await call({ search: 'FAMILY26@TEST.INVALID' });
      assert.equal(noOrders.body.matchedUsers, 1); assert.equal(noOrders.body.totalUsers, 27); assert.equal(noOrders.body.users[0].orderCount, 0);
      assert.equal((await call({ search: '9999990000' })).body.users[0].id, 'user-0');
      assert.ok(!JSON.stringify(first.body).includes('PRIVATE-PASSWORD-HASH')); assert.ok(!JSON.stringify(first.body).includes('passwordHash'));
    });
    await t.test('details expose profile, saved addresses and complete paginated account-owned history', async () => {
      const result = await call({ customerId: 'user-0' });
      assert.equal(result.body.user.orderCount, 530); assert.equal(result.body.user.orderValue, 530 * 103); assert.equal(result.body.user.addresses[0].street, 'Test Road');
      assert.equal(result.body.orders.length, 20); assert.equal(result.body.nextCursor, 20); assert.equal(result.body.orders[0].id, 'order-529');
      assert.ok(result.body.orders.every(order => order.customerId === 'user-0'));
      const older = await call({ customerId: 'user-0', cursor: '520' });
      assert.equal(older.body.orders.length, 10); assert.equal(older.body.nextCursor, null); assert.equal(older.body.orders.at(-1).status, 'Packed');
      assert.ok(!JSON.stringify(result.body).includes('PRIVATE-PASSWORD-HASH'));
      const empty = await call({ customerId: 'user-26' }); assert.equal(empty.body.user.orderCount, 0); assert.deepEqual(empty.body.orders, []);
      assert.equal((await call({ customerId: 'not-registered' })).statusCode, 404);
    });
    await t.test('latest order statuses are read from saved order records', async () => {
      orders.get('order-529').status = 'Cancelled';
      assert.equal((await call({ customerId: 'user-0' })).body.orders[0].status, 'Cancelled');
    });
    await t.test('invalid pagination, unapproved origins and writes are rejected', async () => {
      for (const query of [{ page: '-1' }, { cursor: 'wrong' }, { search: 'x'.repeat(201) }, { customerId: ['user-0', 'user-1'] }]) assert.equal((await call(query)).statusCode, 400);
      assert.equal((await call({}, admin, { method: 'POST' })).statusCode, 405);
      assert.equal((await call({}, admin, { headers: { host: 'farminix.in', origin: 'https://untrusted.invalid' } })).statusCode, 403);
    });
    await t.test('storage failures show an error instead of an empty directory', async () => {
      globalThis.fetch = async () => { throw Error('offline'); };
      const failed = await call(); assert.equal(failed.statusCode, 503); assert.equal(failed.body.totalUsers, undefined);
    });
  } finally { globalThis.fetch = originalFetch; for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key]; Object.assign(process.env, env); }
});
