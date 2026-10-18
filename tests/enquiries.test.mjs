import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { createHmac, randomUUID } from 'node:crypto';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const source=ts.transpileModule(fs.readFileSync(new URL('../api/site-config/queries.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exports={};new Function('require','exports',source)(require,exports);
const handler=exports.default;
const response=()=>({statusCode:200,headers:{},setHeader(key,value){this.headers[key]=value;},status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}});
test('enquiry validation, private inbox and retry-safe persistence',async t=>{
 const env={...process.env},oldFetch=globalThis.fetch;
 process.env.ADMIN_SESSION_SECRET='isolated-enquiry-test-secret';process.env.KV_REST_API_URL='https://storage.invalid';process.env.KV_REST_API_TOKEN='isolated-token';
 const expiry=String(Date.now()+60000);const cookie=expiry+'.'+createHmac('sha256',process.env.ADMIN_SESSION_SECRET).update(expiry).digest('hex');
 const records=new Map();const trashed=new Set();let calls=0;
 globalThis.fetch=async(_url,options)=>{calls++;const command=JSON.parse(options.body);let result=null;
  if(command[0]==='GET')result=JSON.stringify({queriesPage:{enabled:true}});
  if(command[0]==='EVAL'&&command[2]===2){const id=command[5];if(!records.has(id))records.set(id,command[6]);result=records.get(id);}
  if(command[0]==='ZREVRANGE')result=[...records.keys()].filter(id=>command[1].includes(':trash:')?trashed.has(id):!trashed.has(id));
  if(command[0]==='HMGET')result=command.slice(2).map(id=>records.get(id)||null);
  if(command[0]==='ZCARD')result=command[1].includes(':trash:')?trashed.size:records.size-trashed.size;
  if(command[0]==='EVAL'&&command[2]===3){const id=command[6];if(records.has(id)){const row=JSON.parse(records.get(id));if(command[7]==='restore'){trashed.delete(id);delete row.deletedAt;}else{trashed.add(id);row.deletedAt=command[9];}result=JSON.stringify(row);records.set(id,result);}}
  if(command[0]==='EVAL'&&command[2]===1){const id=command[4];if(records.has(id)){const row=JSON.parse(records.get(id));row.status=command[5];row.adminNotes=command[6];result=JSON.stringify(row);records.set(id,result);}}
  return{ok:true,json:async()=>({result})};};
 try{
  await t.test('unauthenticated inbox and staff updates are rejected before reading storage',async()=>{for(const method of ['GET','PATCH','DELETE']){const res=response();await handler({method,cookies:{},query:{}},res);assert.equal(res.statusCode,401);}assert.equal(calls,0);});
  await t.test('invalid customer data is not stored',async()=>{const res=response();await handler({method:'POST',body:{name:'',mobile:'1',message:'',kind:'query'}},res);assert.equal(res.statusCode,400);assert.equal(records.size,0);});
  const id=randomUUID();const fixture={name:'Unit test fixture',mobile:'9999999999',email:'',message:'Isolated unit test only; never sent to production.',kind:'compliance',requestId:id};
  await t.test('valid submission persists atomically; retry does not create a second enquiry',async()=>{for(let attempt=0;attempt<2;attempt++){const res=response();await handler({method:'POST',body:fixture},res);assert.equal(res.statusCode,201);assert.equal(res.body.id,id);assert.equal(res.body.mobile,undefined);}assert.equal(records.size,1);});
  await t.test('authenticated inbox can read the actual saved record',async()=>{const res=response();await handler({method:'GET',cookies:{farminix_admin:cookie},query:{}},res);assert.equal(res.statusCode,200);assert.equal(res.body.total,1);assert.equal(res.body.enquiries[0].message,fixture.message);});
  await t.test('staff can update status and notes without altering the customer message',async()=>{const res=response();await handler({method:'PATCH',cookies:{farminix_admin:cookie},body:{id,status:'resolved',adminNotes:'Unit test note'}},res);assert.equal(res.statusCode,200);assert.equal(res.body.enquiry.status,'resolved');assert.equal(res.body.enquiry.message,fixture.message);});
  await t.test('delete moves an enquiry to private Trash, and restore recovers the same record',async()=>{
   const removed=response();await handler({method:'DELETE',cookies:{farminix_admin:cookie},body:{id}},removed);assert.equal(removed.statusCode,200);assert.equal(removed.body.deleted,true);assert.ok(removed.body.enquiry.deletedAt);
   const inbox=response();await handler({method:'GET',cookies:{farminix_admin:cookie},query:{}},inbox);assert.equal(inbox.body.total,0);assert.equal(inbox.body.enquiries.length,0);
   const trash=response();await handler({method:'GET',cookies:{farminix_admin:cookie},query:{trash:'1'}},trash);assert.equal(trash.body.total,1);assert.equal(trash.body.enquiries[0].message,fixture.message);
   const restored=response();await handler({method:'PATCH',cookies:{farminix_admin:cookie},body:{id,action:'restore'}},restored);assert.equal(restored.statusCode,200);assert.equal(restored.body.enquiry.deletedAt,undefined);assert.equal(restored.body.enquiry.message,fixture.message);assert.equal(trashed.size,0);
  });
  await t.test('storage failure does not falsely confirm receipt',async()=>{globalThis.fetch=async()=>{throw Error('offline');};const res=response();await handler({method:'POST',body:{...fixture,requestId:randomUUID()}},res);assert.equal(res.statusCode,503);assert.equal(res.body.id,undefined);});
 }finally{globalThis.fetch=oldFetch;for(const key of Object.keys(process.env))if(!(key in env))delete process.env[key];Object.assign(process.env,env);}
});
