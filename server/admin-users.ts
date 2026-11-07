import { createHmac, timingSafeEqual } from 'node:crypto';
import { customerSameOrigin, publicCustomer } from './customer-auth.js';
import type { CustomerAccount } from './customer-auth.js';

export interface CustomerOrderSummary {
  customerId: string; orderCount: number; orderValue: number; lastOrderAt: string | null;
}
export interface AdminUserStore {
  listCustomers(): Promise<CustomerAccount[]>;
  findCustomer(id: string): Promise<CustomerAccount | null>;
  summaries(): Promise<CustomerOrderSummary[]>;
  orders(id: string, cursor: number): Promise<{ orders: any[]; nextCursor: number | null }>;
}
export function adminUserSession(req: any) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const [expires, signature] = String(req.cookies?.farminix_admin || '').split('.');
  if (!secret || !Number.isFinite(Number(expires)) || Number(expires) <= Date.now() || !signature) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(expires).digest('hex'));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
const validDate = (value: unknown): string | null => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
const userView = (account: CustomerAccount, summary?: CustomerOrderSummary) => ({
  ...publicCustomer(account), createdAt: validDate(account.createdAt),
  orderCount: summary?.orderCount || 0, orderValue: summary?.orderValue || 0, lastOrderAt: validDate(summary?.lastOrderAt),
});

// Shared contract for the Redis and PostgreSQL admin directories. Authorization precedes all reads.
export async function handleAdminUsers(req: any, res: any, store: AdminUserStore, authorized: boolean) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!authorized) return res.status(401).json({ error: 'Sign in as an administrator to view users.' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  if (!customerSameOrigin(req)) return res.status(403).json({ error: 'Please use the Farminix admin website.' });
  const { customerId, search = '', page = '0', cursor = '0' } = req.query || {};
  if ((customerId !== undefined && (typeof customerId !== 'string' || !customerId || customerId.length > 100)) || typeof search !== 'string' || search.length > 200) return res.status(400).json({ error: 'Invalid user search.' });
  const pageNumber = Number(page), offset = Number(cursor);
  if (!Number.isInteger(pageNumber) || pageNumber < 0 || pageNumber > 100000 || !Number.isInteger(offset) || offset < 0 || offset > 100000) return res.status(400).json({ error: 'Invalid user-history page.' });
  try {
    if (customerId) {
      const account = await store.findCustomer(customerId);
      if (!account) return res.status(404).json({ error: 'Registered user not found.' });
      const [summaries, history] = await Promise.all([store.summaries(), store.orders(account.id, offset)]);
      return res.status(200).json({ user: userView(account, summaries.find(summary => summary.customerId === account.id)), ...history });
    }
    const [accounts, summaries] = await Promise.all([store.listCustomers(), store.summaries()]);
    const byCustomer = new Map(summaries.map(summary => [summary.customerId, summary]));
    const registered = accounts.map(account => userView(account, byCustomer.get(account.id)));
    const query = search.trim().toLowerCase();
    const matching = registered.filter(user => `${user.id} ${user.name} ${user.email} ${user.phone}`.toLowerCase().includes(query))
      .sort((a, b) => (Date.parse(b.createdAt || '') || 0) - (Date.parse(a.createdAt || '') || 0) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
    const pageSize = 25, start = pageNumber * pageSize;
    return res.status(200).json({ users: matching.slice(start, start + pageSize), totalUsers: registered.length,
      usersWithOrders: registered.filter(user => user.orderCount > 0).length,
      totalOrders: registered.reduce((sum, user) => sum + user.orderCount, 0),
      matchedUsers: matching.length, page: pageNumber, pageSize, hasMore: start + pageSize < matching.length });
  } catch { return res.status(503).json({ error: 'Unable to load registered users. Please try again.' }); }
}

export function summarizeCustomerOrders(orders: any[]): CustomerOrderSummary[] {
  const summaries = new Map<string, CustomerOrderSummary>();
  for (const order of orders) {
    if (!order.customerId) continue;
    const entry = summaries.get(order.customerId) || { customerId: order.customerId, orderCount: 0, orderValue: 0, lastOrderAt: null };
    entry.orderCount++; entry.orderValue += Number(order.finalAmount) || 0;
    if (validDate(order.date) && (!entry.lastOrderAt || Date.parse(order.date) > Date.parse(entry.lastOrderAt))) entry.lastOrderAt = validDate(order.date);
    summaries.set(order.customerId, entry);
  }
  return [...summaries.values()];
}
