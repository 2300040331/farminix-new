import { customerRedis } from './customer-redis.js';
import type { EnquiryStore, EnquiryRecord } from './enquiries.js';
const RECORDS = 'farminix:enquiries:records:v1', INDEX = 'farminix:enquiries:index:v1', TRASH = 'farminix:enquiries:trash:v1';
const customerIndex = (id: string) => `farminix:enquiries:customer-index:v1:${id}`;
const createScript = `local old=redis.call('HGET',KEYS[1],ARGV[1]); if old then local a=cjson.decode(old); local b=cjson.decode(ARGV[2]); for _,k in ipairs({'name','mobile','email','message','kind','customerId','orderId'}) do if (a[k] or '')~=(b[k] or '') then return 'CONFLICT' end end; if (a.source or 'enquiry')~=(b.source or 'enquiry') then return 'CONFLICT' end; return old end; redis.call('HSET',KEYS[1],ARGV[1],ARGV[2]); redis.call('ZADD',KEYS[2],ARGV[3],ARGV[1]); if #KEYS==3 then redis.call('ZADD',KEYS[3],ARGV[3],ARGV[1]) end; return ARGV[2]`;
export const redisEnquiries: EnquiryStore = {
  async enabled() { const raw = await customerRedis(['GET', 'farminix:site-config:v1']); return !raw || JSON.parse(raw).queriesPage?.enabled !== false; },
  async orderOwner(id) { const raw = await customerRedis(['HGET', 'farminix:orders:records:v1', id]); return raw ? JSON.parse(raw).customerId || null : null; },
  async create(row) {
    const keys = [RECORDS, INDEX, ...(row.customerId ? [customerIndex(row.customerId)] : [])];
    const raw = await customerRedis(['EVAL', createScript, keys.length, ...keys, row.id, JSON.stringify(row), Date.parse(row.createdAt)]);
    return raw === 'CONFLICT' ? null : JSON.parse(raw);
  },
  async list(page, trash, customerId) {
    const index = customerId ? customerIndex(customerId) : trash ? TRASH : INDEX;
    const [ids, total] = await Promise.all([customerRedis(['ZREVRANGE', index, page * 25, page * 25 + 24]), customerRedis(['ZCARD', index])]);
    const rows: (string | null)[] = ids.length ? await customerRedis(['HMGET', RECORDS, ...ids]) : [];
    return { enquiries: rows.filter(Boolean).map(row => JSON.parse(row!)), total: Number(total) };
  },
  async update(id, status, adminNotes, publicReply) {
    const script = `local raw=redis.call('HGET',KEYS[1],ARGV[1]); if not raw then return false end; local item=cjson.decode(raw); item.status=ARGV[2]; item.adminNotes=ARGV[3]; if ARGV[4]=='1' and (item.publicReply or '')~=ARGV[5] then item.publicReply=ARGV[5]; item.repliedAt=ARGV[6] end; local updated=cjson.encode(item); redis.call('HSET',KEYS[1],ARGV[1],updated); return updated`;
    const raw = await customerRedis(['EVAL', script, 1, RECORDS, id, status, adminNotes, publicReply === undefined ? '0' : '1', publicReply || '', new Date().toISOString()]);
    return raw ? JSON.parse(raw) : null;
  },
  async move(id, restore) {
    const previous = await customerRedis(['HGET', RECORDS, id]);
    if (!previous) return null;
    const row: EnquiryRecord = JSON.parse(previous);
    const keys = [RECORDS, INDEX, TRASH, ...(row.customerId ? [customerIndex(row.customerId)] : [])];
    const script = `local raw=redis.call('HGET',KEYS[1],ARGV[1]); if not raw then return false end; local item=cjson.decode(raw); if ARGV[2]=='restore' then item.deletedAt=nil; redis.call('ZREM',KEYS[3],ARGV[1]); redis.call('ZADD',KEYS[2],ARGV[3],ARGV[1]); if #KEYS==4 then redis.call('ZADD',KEYS[4],ARGV[3],ARGV[1]) end; else item.deletedAt=ARGV[4]; redis.call('ZREM',KEYS[2],ARGV[1]); redis.call('ZADD',KEYS[3],ARGV[3],ARGV[1]); if #KEYS==4 then redis.call('ZREM',KEYS[4],ARGV[1]) end; end; local updated=cjson.encode(item); redis.call('HSET',KEYS[1],ARGV[1],updated); return updated`;
    const raw = await customerRedis(['EVAL', script, keys.length, ...keys, id, restore ? 'restore' : 'trash', Date.parse(row.createdAt), new Date().toISOString()]);
    return raw ? JSON.parse(raw) : null;
  },
};
