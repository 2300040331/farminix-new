import type { CustomerAccount, CustomerSession, CustomerStore } from './customer-auth.js';
import { CUSTOMER_SESSION_SECONDS } from './customer-auth.js';

export async function customerRedis(command: unknown[]) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Customer storage is not configured.');
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), signal: AbortSignal.timeout(15000) });
  const data: any = await response.json();
  if (!response.ok || data.error) throw new Error('Customer storage is unavailable.');
  return data.result;
}
const ACCOUNTS = 'farminix:customers:v1';
const EMAILS = 'farminix:customer-emails:v1';
const PHONES = 'farminix:customer-phones:v1';
export const PAYMENT_OWNERS = 'farminix:customer-payment-orders:v1';
export const customerOrderKey = (id: string) => `farminix:customer-orders:v1:${id}`;
export const registerCustomerScript = `if redis.call('HEXISTS',KEYS[2],ARGV[2])==1 or redis.call('HEXISTS',KEYS[3],ARGV[3])==1 then return 0 end; redis.call('HSET',KEYS[1],ARGV[1],ARGV[4]); redis.call('HSET',KEYS[2],ARGV[2],ARGV[1]); redis.call('HSET',KEYS[3],ARGV[3],ARGV[1]); return 1`;
export const redisCustomerStore: CustomerStore = {
  async findByEmail(email) { const id = await customerRedis(['HGET', EMAILS, email]); return id ? this.findById(id) : null; },
  async findById(id) { const raw = await customerRedis(['HGET', ACCOUNTS, id]); return raw ? JSON.parse(raw) as CustomerAccount : null; },
  async create(account) { return Number(await customerRedis(['EVAL', registerCustomerScript, 3, ACCOUNTS, EMAILS, PHONES, account.id, account.email, account.phone, JSON.stringify(account)])) === 1; },
  async saveAddresses(account, addresses) { await customerRedis(['HSET', ACCOUNTS, account.id, JSON.stringify({ ...account, addresses })]); },
  async putSession(hash, session) { await customerRedis(['SET', `farminix:customer-session:v1:${hash}`, JSON.stringify(session), 'EX', CUSTOMER_SESSION_SECONDS]); },
  async getSession(hash) { const raw = await customerRedis(['GET', `farminix:customer-session:v1:${hash}`]); return raw ? JSON.parse(raw) as CustomerSession : null; },
  async deleteSession(hash) { await customerRedis(['DEL', `farminix:customer-session:v1:${hash}`]); },
  async allowAttempt(identity) { return Number(await customerRedis(['EVAL', "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n", 1, `farminix:auth-attempts:v1:${identity}`])) <= 20; },
};
