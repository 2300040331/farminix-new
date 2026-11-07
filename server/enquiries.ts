import { authenticatedCustomer, customerSameOrigin, customerToken } from './customer-auth.js';
import type { CustomerStore } from './customer-auth.js';

export interface EnquiryRecord {
  id: string; name: string; mobile: string; email: string; message: string;
  kind: 'query' | 'complaint' | 'compliance'; status: 'new' | 'in-progress' | 'resolved';
  source: 'support' | 'enquiry'; customerId?: string; orderId?: string;
  adminNotes: string; publicReply: string; createdAt: string; repliedAt?: string; deletedAt?: string;
}
export interface EnquiryStore {
  enabled(): Promise<boolean>;
  create(record: EnquiryRecord): Promise<EnquiryRecord | null>;
  list(page: number, trash: boolean, customerId?: string): Promise<{ enquiries: EnquiryRecord[]; total: number }>;
  update(id: string, status: EnquiryRecord['status'], adminNotes: string, publicReply?: string): Promise<EnquiryRecord | null>;
  move(id: string, restore: boolean): Promise<EnquiryRecord | null>;
  orderOwner(id: string): Promise<string | null>;
}
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9-]{36}$/i.test(value);
export function sameEnquiry(a: EnquiryRecord, b: EnquiryRecord) {
  return ['name', 'mobile', 'email', 'message', 'kind', 'source', 'customerId', 'orderId'].every(key => ((a as any)[key] || (key === 'source' ? 'enquiry' : '')) === ((b as any)[key] || (key === 'source' ? 'enquiry' : '')));
}
export const customerEnquiryView = (row: EnquiryRecord) => ({ id: row.id, message: row.message, kind: row.kind, status: row.status, source: row.source || 'enquiry', orderId: row.orderId, createdAt: row.createdAt, publicReply: row.publicReply || '', repliedAt: row.repliedAt });

export async function handleEnquiries(req: any, res: any, store: EnquiryStore, customers: CustomerStore, admin: boolean) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!['POST', 'GET', 'PATCH', 'DELETE'].includes(req.method || '')) return res.status(405).json({ error: 'Method not allowed.' });
  const mine = req.method === 'GET' && req.query?.mine === '1';
  if (req.method !== 'POST' && !mine && !admin) return res.status(401).json({ error: 'Please sign in as an administrator to view customer enquiries.' });
  if (!customerSameOrigin(req)) return res.status(403).json({ error: 'Please use the Farminix website to manage support requests.' });
  try {
    if (req.method === 'POST') {
      if (JSON.stringify(req.body || {}).length > 20000) return res.status(400).json({ error: 'Message is too long.' });
      const { name, mobile, email, message, kind, website, requestId, orderId } = req.body || {};
      if (website) return res.status(400).json({ error: 'Unable to submit this enquiry.' });
      if (typeof name !== 'string' || name.trim().length < 2 || name.length > 120 || typeof message !== 'string' || message.trim().length < 5 || message.length > 5000) return res.status(400).json({ error: 'Enter your name and a message between 5 and 5,000 characters.' });
      if (typeof mobile !== 'string' || !/^\+?[\d\s()-]{10,24}$/.test(mobile) || mobile.replace(/\D/g, '').length < 10 || mobile.replace(/\D/g, '').length > 15) return res.status(400).json({ error: 'Enter a valid mobile number.' });
      if (email && (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return res.status(400).json({ error: 'Enter a valid email address or leave it empty.' });
      if (!['query', 'complaint', 'compliance'].includes(kind) || !uuid(requestId)) return res.status(400).json({ error: 'Select an enquiry topic and refresh the page if necessary.' });
      if (orderId !== undefined && (typeof orderId !== 'string' || orderId.length > 100)) return res.status(400).json({ error: 'Enter a valid order reference.' });
      const customer = customerToken(req) ? await authenticatedCustomer(req, customers) : null;
      if (customerToken(req) && !customer) return res.status(401).json({ error: 'Your login expired. Sign in again and retry; your message has been retained.' });
      const linkedOrder = orderId?.trim() || undefined;
      if (linkedOrder && (!customer || await store.orderOwner(linkedOrder) !== customer.id)) return res.status(400).json({ error: 'Select an order from your own account, or include your reference in the message instead.' });
      if (!await store.enabled()) return res.status(403).json({ error: 'Support requests are currently unavailable. Please use the listed contact options.' });
      const record: EnquiryRecord = { id: requestId, name: name.trim(), mobile: mobile.trim(), email: typeof email === 'string' ? email.trim() : '', message: message.trim(), kind,
        source: req.body.source === 'support' ? 'support' : 'enquiry', customerId: customer?.id, orderId: linkedOrder,
        status: 'new', adminNotes: '', publicReply: '', createdAt: new Date().toISOString() };
      const saved = await store.create(record);
      if (!saved) return res.status(409).json({ error: 'This reference was used for a different request. Start a new request and try again.' });
      return res.status(201).json({ id: saved.id });
    }
    if (req.method === 'GET') {
      const page = Number(req.query?.page || 0);
      if (!Number.isInteger(page) || page < 0 || page > 100000) return res.status(400).json({ error: 'Invalid support-history page.' });
      if (mine) {
        const customer = await authenticatedCustomer(req, customers);
        if (!customer) return res.status(401).json({ error: 'Please log in to view your support requests.' });
        const result = await store.list(page, false, customer.id);
        return res.status(200).json({ enquiries: result.enquiries.filter(row => row.customerId === customer.id && !row.deletedAt).map(customerEnquiryView), total: result.total, page });
      }
      return res.status(200).json({ ...await store.list(page, req.query?.trash === '1'), page });
    }
    const { id } = req.body || {};
    if (typeof id !== 'string' || !/^[a-z0-9_-]{1,100}$/i.test(id)) return res.status(400).json({ error: 'Invalid enquiry reference.' });
    if (req.method === 'DELETE' || req.body?.action === 'restore') {
      const restore = req.body?.action === 'restore';
      const record = await store.move(id, restore);
      if (!record) return res.status(404).json({ error: 'Enquiry not found.' });
      return res.status(200).json({ enquiry: record, deleted: !restore });
    }
    const { status, adminNotes, publicReply } = req.body || {};
    if (!['new', 'in-progress', 'resolved'].includes(status) || typeof adminNotes !== 'string' || adminNotes.length > 5000 || (publicReply !== undefined && (typeof publicReply !== 'string' || publicReply.length > 5000))) return res.status(400).json({ error: 'Invalid enquiry update.' });
    const record = await store.update(id, status, adminNotes.trim(), publicReply?.trim());
    if (!record) return res.status(404).json({ error: 'Enquiry not found.' });
    return res.status(200).json({ enquiry: record });
  } catch { return res.status(503).json({ error: req.method === 'POST' ? 'Unable to reach support storage. Your request has not been confirmed. Please retry with the same message.' : req.method === 'GET' ? 'Unable to load support requests. Please retry.' : 'Unable to confirm this update. Refresh the inbox and try again.' }); }
}
