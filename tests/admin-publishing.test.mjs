import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const source = ts.transpileModule(fs.readFileSync(new URL('../api/site-config.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
new Function('require', 'exports', source)(require, exports);
const handler = exports.default;
const saved = { ...process.env };
const fetchOriginal = globalThis.fetch;
function response() {
  return { statusCode: 200, headers: {}, body: null, setHeader(k,v) { this.headers[k] = v; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
process.env.ADMIN_SESSION_SECRET = 'test-session-secret-for-isolated-unit-checks';
process.env.ADMIN_PASSWORD = 'test-password';
process.env.KV_REST_API_URL = 'https://storage.invalid';
process.env.KV_REST_API_TOKEN = 'test-storage-token';
let cookie;
test('admin publishing requires a server session and stores only confirmed changes', async t => {
  try {
    await t.test('rejects browser-only authentication', async () => {
      const res = response(); await handler({ method:'PUT', cookies:{}, body:{config:{products:[],theme:{}}} }, res);
      assert.equal(res.statusCode,401);
    });
    await t.test('sign-in creates a server session; session survives a page reload', async () => {
      const res = response(); await handler({method:'POST',body:{email:'admin',password:'test-password'}},res);
      assert.equal(res.statusCode,200); cookie = res.headers['Set-Cookie'].split(';')[0].split('=').slice(1).join('=');
      const session = response(); await handler({method:'GET',query:{session:'1'},cookies:{farminix_admin:cookie}},session);
      assert.equal(session.body.authenticated,true);
    });
    await t.test('rejects tampered and expired sessions', async () => {
      for (const token of ['0.invalid',cookie+'invalid']) {
        const res=response(); await handler({method:'GET',query:{session:'1'},cookies:{farminix_admin:token}},res);
        assert.equal(res.body.authenticated,false);
      }
    });
    await t.test('publishes to shared storage and strips private data',async () => {
      let stored;
      globalThis.fetch = async (_url,opts) => { const command=JSON.parse(opts.body); assert.equal(command[0],'EVAL'); stored=JSON.parse(command[4]);return {ok:true,json:async()=>({result:'OK'})}; };
      const config={products:[],theme:{},orders:[{id:'private'}],users:[{id:'private'}],checkoutPayment:{razorpayKeySecret:'private',razorpayKeyId:'public'}};
      const res=response(); await handler({method:'PUT',cookies:{farminix_admin:cookie},body:{config}},res);
      assert.equal(res.statusCode,200);assert.deepEqual(stored.orders,[]);assert.deepEqual(stored.users,[]);assert.equal(stored.checkoutPayment.razorpayKeySecret,undefined);
      assert.deepEqual(res.body.config,stored);
    });
    await t.test('stale catalog drafts cannot overwrite stock reduced by online orders', async () => {
      globalThis.fetch = async () => ({ok:true,json:async()=>({result:'CONFLICT'})});
      const res=response(); await handler({method:'PUT',cookies:{farminix_admin:cookie},body:{config:{products:[],theme:{},inventoryRevision:0}}},res);
      assert.equal(res.statusCode,409); assert.equal(res.body.config,undefined);
    });
    await t.test('storage failure cannot report successful publication',async () => {
      globalThis.fetch=async()=>{throw Error('offline');};
      const res=response();await handler({method:'PUT',cookies:{farminix_admin:cookie},body:{config:{products:[],theme:{}}}},res);
      assert.equal(res.statusCode,502);assert.equal(res.body.config,undefined);
    });
  } finally {globalThis.fetch=fetchOriginal;for(const key of Object.keys(process.env)) if(!(key in saved)) delete process.env[key];Object.assign(process.env,saved);}
});
