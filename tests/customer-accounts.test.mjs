import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';
const auth = loadTypeScript(new URL('../api/customer-auth.ts', import.meta.url)).default;
const history = loadTypeScript(new URL('../api/customer-orders.ts', import.meta.url)).default;
const payment = loadTypeScript(new URL('../api/payment/create-order.ts', import.meta.url)).default;
const { sessionHash } = loadTypeScript(new URL('../server/customer-auth.ts', import.meta.url));
const response = () => ({ statusCode: 200, body: null, headers: {}, setHeader(name, value) { this.headers[name.toLowerCase()] = value; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });

test('customer credentials, private sessions and own order history', async t => {
  const originalFetch = globalThis.fetch, env = { ...process.env };
  Object.assign(process.env, { KV_REST_API_URL: 'https://storage.invalid', KV_REST_API_TOKEN: 'test', NODE_ENV: 'production' });
  const hashes = new Map(), values = new Map(), lists = new Map(), attempts = new Map();
  const hash = name => { if (!hashes.has(name)) hashes.set(name, new Map()); return hashes.get(name); };
  let calls = 0;
  globalThis.fetch = async (url, opts) => {
    assert.equal(String(url), 'https://storage.invalid', 'tests must never contact a real payment or data service'); calls++;
    const cmd = JSON.parse(opts.body); let result = null;
    if (cmd[0] === 'HGET') result = hash(cmd[1]).get(cmd[2]) || null;
    else if (cmd[0] === 'HSET') { hash(cmd[1]).set(cmd[2], cmd[3]); result = 1; }
    else if (cmd[0] === 'GET') result = values.get(cmd[1]) || null;
    else if (cmd[0] === 'SET') { values.set(cmd[1], cmd[2]); result = 'OK'; }
    else if (cmd[0] === 'DEL') result = Number(values.delete(cmd[1]));
    else if (cmd[0] === 'EVAL' && cmd[2] === 3) {
      const [, , , accounts, emails, phones, id, email, phone, row] = cmd;
      if (hash(emails).has(email) || hash(phones).has(phone)) result = 0;
      else { hash(accounts).set(id, row); hash(emails).set(email, id); hash(phones).set(phone, id); result = 1; }
    } else if (cmd[0] === 'EVAL' && cmd[2] === 1) { result = (attempts.get(cmd[3]) || 0) + 1; attempts.set(cmd[3], result); }
    else if (cmd[0] === 'ZREVRANGE') result = (lists.get(cmd[1]) || []).slice(cmd[2], cmd[3] + 1);
    else if (cmd[0] === 'HMGET') result = cmd.slice(2).map(id => hash(cmd[1]).get(id) || null);
    else throw Error(`Unexpected command ${cmd[0]}`);
    return { ok: true, json: async () => ({ result }) };
  };
  const call = async (method, body, cookie, handler = auth, extra = {}) => {
    const res = response();
    await handler({ method, body, headers: { host: 'farminix.in', origin: 'https://farminix.in', ...(cookie ? { cookie } : {}) }, ...extra }, res);
    return res;
  };
  const fields = { action: 'register', name: 'Test Family', email: 'family@test.invalid', phone: '9999999991', password: 'FamilyChoice@123' };
  let cookie, id;
  try {
    await t.test('guest reads, checkout and payments reject forged local profiles', async () => {
      assert.equal((await call('GET')).body.user, null);
      assert.equal((await call('GET', undefined, undefined, history)).statusCode, 401);
      const before = calls;
      assert.equal((await call('POST', { customerId: 'forged', user: fields, amount: 100 }, undefined, payment)).statusCode, 401);
      assert.equal(calls, before, 'payment provider must not be contacted before login');
    });
    await t.test('registration validates credentials and stores salted password hashes', async () => {
      assert.equal((await call('POST', { ...fields, password: 'short' })).statusCode, 400);
      assert.equal((await call('POST', { ...fields, phone: 'invalid' })).statusCode, 400);
      const result = await call('POST', fields);
      assert.equal(result.statusCode, 201); assert.equal(result.body.user.email, fields.email); id = result.body.user.id;
      assert.equal(result.body.user.passwordHash, undefined);
      const stored = JSON.parse(hash('farminix:customers:v1').get(id));
      assert.match(stored.passwordHash, /^scrypt:/); assert.ok(!stored.passwordHash.includes(fields.password));
      cookie = result.headers['set-cookie'].split(';')[0];
      assert.match(result.headers['set-cookie'], /HttpOnly/); assert.match(result.headers['set-cookie'], /Secure/); assert.match(result.headers['set-cookie'], /SameSite=Lax/);
      assert.ok(!cookie.includes(id)); assert.equal(values.size, 1); assert.ok(![...values.keys()][0].includes(cookie.split('=')[1]));
    });
    await t.test('duplicate email or phone cannot take over an existing account', async () => {
      for (const body of [{ ...fields, phone: '9999999992' }, { ...fields, email: 'another@test.invalid' }]) assert.equal((await call('POST', body)).statusCode, 409);
      assert.equal(hash('farminix:customers:v1').size, 1);
    });
    await t.test('missing accounts receive a create-account message; wrong passwords fail', async () => {
      const missing = await call('POST', { action: 'login', email: 'missing@test.invalid', password: fields.password });
      assert.equal(missing.statusCode, 404); assert.equal(missing.body.code, 'ACCOUNT_NOT_FOUND'); assert.match(missing.body.error, /create.*account/i);
      const wrong = await call('POST', { action: 'login', email: fields.email, password: 'incorrect' });
      assert.equal(wrong.statusCode, 401); assert.equal(wrong.headers['set-cookie'], undefined);
    });
    await t.test('sessions restore the correct account and addresses persist on the server', async () => {
      assert.equal((await call('GET', undefined, cookie)).body.user.id, id);
      const addresses = [{ id: 'home', name: 'Home', street: 'Test Road', city: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', phone: fields.phone, isDefault: true, deliveryLocation: { lat: 16.3, lng: 80.44 } }];
      const saved = await call('PUT', { addresses, customerId: 'another-account' }, cookie);
      assert.equal(saved.statusCode, 200); assert.deepEqual(saved.body.user.addresses, addresses);
      assert.deepEqual((await call('GET', undefined, cookie)).body.user.addresses, addresses);
      assert.equal((await call('PUT', { addresses })).statusCode, 401);
    });
    await t.test('history is private, paginated, and excludes records owned by other accounts', async () => {
      const rows = hash('farminix:orders:records:v1');
      const ids = Array.from({ length: 23 }, (_, index) => `order-${index}`);
      for (const [index, key] of ids.entries()) rows.set(key, JSON.stringify({ id: key, customerId: index === 3 ? 'other-account' : id, status: 'Delivered', items: [] }));
      lists.set(`farminix:customer-orders:v1:${id}`, ids);
      const first = await call('GET', undefined, cookie, history, { query: { customerId: 'other-account' } });
      assert.equal(first.body.orders.length, 19); assert.ok(first.body.orders.every(order => order.customerId === id)); assert.equal(first.body.nextCursor, 20);
      const second = await call('GET', undefined, cookie, history, { query: { cursor: '20' } });
      assert.equal(second.body.orders.length, 3); assert.equal(second.body.nextCursor, null);
      assert.equal((await call('GET', undefined, cookie, history, { query: { cursor: '-1' } })).statusCode, 400);
      assert.match(first.headers['cache-control'], /no-store/);
    });
    await t.test('cross-origin account reads and changes are rejected', async () => {
      for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
        const result = await call(method, fields, cookie, auth, { headers: { host: 'farminix.in', origin: 'https://untrusted.invalid', cookie } });
        assert.equal(result.statusCode, 403);
      }
    });
    await t.test('logout revokes the opaque session and credential login creates a new session', async () => {
      const logout = await call('DELETE', undefined, cookie); assert.equal(logout.statusCode, 200); assert.match(logout.headers['set-cookie'], /Max-Age=0/);
      assert.equal((await call('GET', undefined, cookie)).body.user, null); assert.equal((await call('GET', undefined, cookie, history)).statusCode, 401);
      const login = await call('POST', { action: 'login', email: fields.email.toUpperCase(), password: fields.password });
      assert.equal(login.statusCode, 200); assert.equal(login.body.user.id, id); cookie = login.headers['set-cookie'].split(';')[0];
      const key = `farminix:customer-session:v1:${sessionHash(cookie.split('=')[1])}`;
      values.set(key, JSON.stringify({ customerId: id, expiresAt: Date.now() - 1 }));
      assert.equal((await call('GET', undefined, cookie)).body.user, null); assert.equal((await call('GET', undefined, cookie, history)).statusCode, 401);
    });
    await t.test('repeated credential failures are limited', async () => {
      let result;
      for (let index = 0; index < 21; index++) result = await call('POST', { action: 'login', email: 'attempts@test.invalid', password: 'wrong-password' });
      assert.equal(result.statusCode, 429);
    });
    await t.test('storage failure fails closed instead of issuing a fake login', async () => {
      globalThis.fetch = async () => { throw Error('offline'); };
      const result = await call('POST', { action: 'login', email: fields.email, password: fields.password });
      assert.equal(result.statusCode, 503); assert.equal(result.headers['set-cookie'], undefined);
    });
  } finally { globalThis.fetch = originalFetch; for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key]; Object.assign(process.env, env); }
});
