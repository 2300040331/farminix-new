import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

const RECORDS='farminix:enquiries:records:v1';
const INDEX='farminix:enquiries:index:v1';
const TRASH='farminix:enquiries:trash:v1';
const clean=(value: unknown, max: number)=>typeof value==='string'?value.trim().slice(0,max):'';
const isAdmin=(req: VercelRequest)=>{
  const secret=process.env.ADMIN_SESSION_SECRET;
  const [expires,signature]=(req.cookies?.farminix_admin || '').split('.');
  if(!secret || !expires || !Number.isFinite(Number(expires)) || Number(expires)<=Date.now() || !signature)return false;
  const expected=Buffer.from(createHmac('sha256',secret).update(expires).digest('hex'));
  const provided=Buffer.from(signature);
  return expected.length===provided.length && timingSafeEqual(expected,provided);
};
async function redis(command: unknown[]) {
  const url=process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token=process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if(!url || !token)throw new Error('Storage unavailable');
  const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(12000)});
  const data=await response.json();
  if(!response.ok || data.error)throw new Error('Storage unavailable');
  return data.result;
}
export default async function handler(req: VercelRequest,res: VercelResponse) {
  res.setHeader('Cache-Control','private, no-store');
  if(!['POST','GET','PATCH','DELETE'].includes(req.method || ''))return res.status(405).json({error:'Method not allowed.'});
  if(req.method!=='POST' && !isAdmin(req))return res.status(401).json({error:'Please sign in to view customer enquiries.'});
  try {
    if(req.method==='POST') {
      if(JSON.stringify(req.body || {}).length>20000)return res.status(400).json({error:'Message is too long.'});
      const {name,mobile,email,message,kind,website,requestId}=req.body || {};
      if(website)return res.status(400).json({error:'Unable to submit this enquiry.'});
      if(typeof name!=='string' || name.trim().length<2 || name.length>120 || typeof message!=='string' || message.trim().length<5 || message.length>5000)return res.status(400).json({error:'Enter your name and a message between 5 and 5,000 characters.'});
      if(typeof mobile!=='string' || !/^\+?[\d\s()-]{10,24}$/.test(mobile) || mobile.replace(/\D/g,'').length<10 || mobile.replace(/\D/g,'').length>15)return res.status(400).json({error:'Enter a valid mobile number.'});
      if(email && (typeof email!=='string' || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return res.status(400).json({error:'Enter a valid email address or leave it empty.'});
      if(!['query','complaint','compliance'].includes(kind))return res.status(400).json({error:'Select an enquiry topic.'});
      if(typeof requestId!=='string' || !/^[a-f0-9-]{36}$/i.test(requestId))return res.status(400).json({error:'Refresh the page and try again.'});
      const config=await redis(['GET','farminix:site-config:v1']);
      if(config && JSON.parse(config).queriesPage?.enabled===false)return res.status(403).json({error:'Enquiries are currently unavailable.'});
      const enquiry={id:requestId,name:clean(name,120),mobile:clean(mobile,24),email:clean(email,254),message:clean(message,5000),kind,status:'new',adminNotes:'',createdAt:new Date().toISOString()};
      // The request ID makes retries safe; both record and index are written atomically.
      const result=await redis(['EVAL',"local old=redis.call('HGET',KEYS[1],ARGV[1]); if old then return old end; redis.call('HSET',KEYS[1],ARGV[1],ARGV[2]); redis.call('ZADD',KEYS[2],ARGV[3],ARGV[1]); return ARGV[2]",2,RECORDS,INDEX,enquiry.id,JSON.stringify(enquiry),Date.now()]);
      return res.status(201).json({id:JSON.parse(result).id});
    }
    if(req.method==='GET') {
      const page=Math.max(0,Math.floor(Number(req.query.page)||0));
      const list=req.query.trash==='1'?TRASH:INDEX;
      const ids=await redis(['ZREVRANGE',list,page*25,page*25+24]);
      const rows=ids.length?await redis(['HMGET',RECORDS,...ids]):[];
      const total=await redis(['ZCARD',list]);
      return res.status(200).json({enquiries:rows.filter(Boolean).map((row: string)=>JSON.parse(row)),total,page});
    }
    if(req.method==='DELETE' || req.body?.action==='restore') {
      const id=req.body?.id;
      if(typeof id!=='string' || !/^[a-f0-9-]{36}$/i.test(id))return res.status(400).json({error:'Invalid enquiry reference.'});
      const restore=req.method!=='DELETE';
      const result=await redis(['EVAL',"local raw=redis.call('HGET',KEYS[1],ARGV[1]); if not raw then return false end; local item=cjson.decode(raw); if ARGV[2]=='restore' then item.deletedAt=nil; redis.call('ZREM',KEYS[3],ARGV[1]); redis.call('ZADD',KEYS[2],ARGV[3],ARGV[1]); else item.deletedAt=ARGV[4]; redis.call('ZREM',KEYS[2],ARGV[1]); redis.call('ZADD',KEYS[3],ARGV[3],ARGV[1]); end; local updated=cjson.encode(item); redis.call('HSET',KEYS[1],ARGV[1],updated); return updated",3,RECORDS,INDEX,TRASH,id,restore?'restore':'trash',Date.now(),new Date().toISOString()]);
      if(!result)return res.status(404).json({error:'Enquiry not found.'});
      return res.status(200).json({enquiry:JSON.parse(result),deleted:!restore});
    }
    const {id,status,adminNotes}=req.body || {};
    if(typeof id!=='string' || !/^[a-f0-9-]{36}$/i.test(id) || !['new','in-progress','resolved'].includes(status) || typeof adminNotes!=='string' || adminNotes.length>5000)return res.status(400).json({error:'Invalid enquiry update.'});
    const result=await redis(['EVAL',"local raw=redis.call('HGET',KEYS[1],ARGV[1]); if not raw then return false end; local item=cjson.decode(raw); item.status=ARGV[2]; item.adminNotes=ARGV[3]; local updated=cjson.encode(item); redis.call('HSET',KEYS[1],ARGV[1],updated); return updated",1,RECORDS,id,status,adminNotes.trim()]);
    if(!result)return res.status(404).json({error:'Enquiry not found.'});
    return res.status(200).json({enquiry:JSON.parse(result)});
  } catch {return res.status(503).json({error:'Unable to reach enquiry storage. Please retry; your message has not been confirmed.'});}
}
