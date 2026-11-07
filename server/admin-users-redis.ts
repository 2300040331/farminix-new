import type { AdminUserStore } from './admin-users.js';
import { summarizeCustomerOrders } from './admin-users.js';
import { customerRedis, customerOrderKey, redisCustomerStore } from './customer-redis.js';

export const redisAdminUsers: AdminUserStore = {
  async listCustomers() { return (await customerRedis(['HVALS', 'farminix:customers:v1'])).map((row: string) => JSON.parse(row)); },
  findCustomer: id => redisCustomerStore.findById(id),
  async summaries() { return summarizeCustomerOrders((await customerRedis(['HVALS', 'farminix:orders:records:v1'])).map((row: string) => JSON.parse(row))); },
  async orders(id, cursor) {
    const ids: string[] = await customerRedis(['ZREVRANGE', customerOrderKey(id), cursor, cursor + 20]);
    const rows: (string | null)[] = ids.length ? await customerRedis(['HMGET', 'farminix:orders:records:v1', ...ids.slice(0, 20)]) : [];
    return { orders: rows.filter(Boolean).map(row => JSON.parse(row!)).filter(order => order.customerId === id), nextCursor: ids.length > 20 ? cursor + 20 : null };
  },
};
