import type { AdminUserStore } from './admin-users.js';
import { sqlCustomerAccount } from './customer-sql.js';
import { sqlCustomerOrder } from './customer-order-view.js';
import { query } from './db.js';

export const sqlAdminUsers: AdminUserStore = {
  async listCustomers() { return (await query('SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC', ['CUSTOMER'])).rows.map(sqlCustomerAccount); },
  async findCustomer(id) {
    const row = (await query('SELECT * FROM users WHERE id = $1', [id])).rows[0];
    return row && row.role === 'CUSTOMER' ? sqlCustomerAccount(row) : null;
  },
  async summaries() {
    return (await query('SELECT user_id, COUNT(*) AS order_count, COALESCE(SUM(final_amount), 0) AS order_value, MAX(created_at) AS last_order_at FROM orders WHERE user_id IS NOT NULL GROUP BY user_id')).rows
      .map(row => ({ customerId: row.user_id, orderCount: Number(row.order_count), orderValue: Number(row.order_value), lastOrderAt: row.last_order_at ? new Date(row.last_order_at).toISOString() : null }));
  },
  async orders(id, cursor) {
    const rows = (await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 21 OFFSET $2', [id, cursor])).rows;
    return { orders: rows.slice(0, 20).map(sqlCustomerOrder), nextCursor: rows.length > 20 ? cursor + 20 : null };
  },
};
