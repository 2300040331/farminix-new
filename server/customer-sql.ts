import bcrypt from 'bcryptjs';
import { query } from './db.js';
import type { CustomerAccount, CustomerStore } from './customer-auth.js';

export const sqlCustomerAccount = (row: any): CustomerAccount => ({
  id: row.id, name: row.name, email: row.email, phone: row.phone, passwordHash: row.password_hash,
  addresses: typeof row.saved_addresses === 'string' ? JSON.parse(row.saved_addresses) : row.saved_addresses || [],
  rewardPoints: Number(row.reward_points || 0), walletBalance: Number(row.wallet_balance || 0),
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
});
export const sqlCustomerStore: CustomerStore = {
  async findByEmail(email) { const result = await query('SELECT * FROM users WHERE email = $1', [email]); return result.rows[0] ? sqlCustomerAccount(result.rows[0]) : null; },
  async findById(id) { const result = await query('SELECT * FROM users WHERE id = $1', [id]); return result.rows[0] ? sqlCustomerAccount(result.rows[0]) : null; },
  async create(customer) {
    try {
      const existing = await query('SELECT id FROM users WHERE email = $1 OR phone = $2', [customer.email, customer.phone]);
      if (existing.rowCount) return false;
      await query(`INSERT INTO users (id, name, email, phone, password_hash, role, reward_points, wallet_balance, is_verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 'CUSTOMER', 0, 0, true, NOW(), NOW())`, [customer.id, customer.name, customer.email, customer.phone, customer.passwordHash]);
      return true;
    } catch (error: any) { if (error.code === '23505') return false; throw error; }
  },
  async saveAddresses(customer, addresses) { await query('UPDATE users SET saved_addresses = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(addresses), customer.id]); },
  async putSession(hash, session) { await query('INSERT INTO customer_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)', [hash, session.customerId, new Date(session.expiresAt).toISOString()]); },
  async getSession(hash) { const result = await query('SELECT * FROM customer_sessions WHERE token_hash = $1', [hash]); return result.rows[0] ? { customerId: result.rows[0].user_id, expiresAt: new Date(result.rows[0].expires_at).getTime() } : null; },
  async deleteSession(hash) { await query('DELETE FROM customer_sessions WHERE token_hash = $1', [hash]); },
  async verifyLegacyPassword(password, hash) { return hash ? bcrypt.compare(password, hash) : false; },
};
