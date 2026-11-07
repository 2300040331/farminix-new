import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticatedCustomer, customerSameOrigin } from '../server/customer-auth.js';
import { customerOrderKey, customerRedis, redisCustomerStore } from '../server/customer-redis.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  if (!customerSameOrigin(req)) return res.status(403).json({ error: 'Please use the Farminix website to view orders.' });
  try {
    const customer = await authenticatedCustomer(req, redisCustomerStore);
    if (!customer) return res.status(401).json({ code: 'LOGIN_REQUIRED', error: 'Please log in to view your order history.' });
    const offset = Number(req.query?.cursor || 0);
    if (!Number.isInteger(offset) || offset < 0 || offset > 100000) return res.status(400).json({ error: 'Invalid order-history page.' });
    const ids: string[] = await customerRedis(['ZREVRANGE', customerOrderKey(customer.id), offset, offset + 20]);
    const rows: (string | null)[] = ids.length ? await customerRedis(['HMGET', 'farminix:orders:records:v1', ...ids.slice(0, 20)]) : [];
    const orders = rows.filter(Boolean).map(row => JSON.parse(row!)).filter(order => order.customerId === customer.id);
    return res.status(200).json({ orders, nextCursor: ids.length > 20 ? offset + 20 : null });
  } catch { return res.status(503).json({ error: 'Unable to load your order history. Please try again.' }); }
}
