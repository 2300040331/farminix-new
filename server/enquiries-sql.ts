import { query } from './db.js';
import { sameEnquiry } from './enquiries.js';
import type { EnquiryRecord, EnquiryStore } from './enquiries.js';
const record = (row: any): EnquiryRecord => ({ id: row.id, name: row.name, mobile: row.mobile, email: row.email || '', message: row.message, kind: row.kind, status: row.status,
  source: row.source || 'enquiry', customerId: row.customer_id || undefined, orderId: row.order_id || undefined,
  adminNotes: row.admin_notes || '', publicReply: row.public_reply || '', createdAt: new Date(row.created_at).toISOString(), repliedAt: row.replied_at ? new Date(row.replied_at).toISOString() : undefined, deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : undefined });
export const sqlEnquiries: EnquiryStore = {
  async enabled() { const row = (await query('SELECT config FROM site_config WHERE key = $1', ['farminix:site-config:v1'])).rows[0]; const config = typeof row?.config === 'string' ? JSON.parse(row.config) : row?.config; return config?.queriesPage?.enabled !== false; },
  async orderOwner(id) { return (await query('SELECT * FROM orders WHERE id = $1', [id])).rows[0]?.user_id || null; },
  async create(row) {
    await query(`INSERT INTO customer_enquiries (id, name, mobile, email, message, kind, source, customer_id, order_id, status, admin_notes, public_reply, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new', '', '', NOW()) ON CONFLICT (id) DO NOTHING`, [row.id, row.name, row.mobile, row.email, row.message, row.kind, row.source, row.customerId || null, row.orderId || null]);
    const saved = (await query('SELECT * FROM customer_enquiries WHERE id = $1', [row.id])).rows[0];
    if (!saved) throw Error('Enquiry persistence failed.');
    const result = record(saved); return sameEnquiry(result, row) ? result : null;
  },
  async list(page, trash, customerId) {
    const filter = customerId ? 'customer_id = $1 AND deleted_at IS NULL' : trash ? 'deleted_at IS NOT NULL' : 'deleted_at IS NULL';
    const params = customerId ? [customerId, 25, page * 25] : [25, page * 25];
    const [rows, count] = await Promise.all([
      query(`SELECT * FROM customer_enquiries WHERE ${filter} ORDER BY created_at DESC, id DESC LIMIT $${customerId ? 2 : 1} OFFSET $${customerId ? 3 : 2}`, params),
      query(`SELECT COUNT(*) AS total FROM customer_enquiries WHERE ${filter}`, customerId ? [customerId] : []),
    ]);
    return { enquiries: rows.rows.map(record), total: Number(count.rows[0]?.total || 0) };
  },
  async update(id, status, notes, reply) {
    const rows = reply === undefined
      ? await query('UPDATE customer_enquiries SET status = $1, admin_notes = $2 WHERE id = $3 RETURNING *', [status, notes, id])
      : await query(`UPDATE customer_enquiries SET status = $1, admin_notes = $2, replied_at = CASE WHEN public_reply IS DISTINCT FROM $3 THEN NOW() ELSE replied_at END, public_reply = $3 WHERE id = $4 RETURNING *`, [status, notes, reply, id]);
    return rows.rows[0] ? record(rows.rows[0]) : null;
  },
  async move(id, restore) { const rows = await query(`UPDATE customer_enquiries SET deleted_at = ${restore ? 'NULL' : 'NOW()'} WHERE id = $1 RETURNING *`, [id]); return rows.rows[0] ? record(rows.rows[0]) : null; },
};
