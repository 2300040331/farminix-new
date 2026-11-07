import { validDeliveryLocation } from './delivery-policy.js';
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const deriveKey = promisify(scrypt);
export const CUSTOMER_COOKIE = 'farminix_customer';
export const CUSTOMER_SESSION_SECONDS = 7 * 24 * 60 * 60;
export interface CustomerAccount {
  id: string; name: string; email: string; phone: string; passwordHash: string;
  addresses: any[]; rewardPoints?: number; walletBalance?: number; createdAt?: string;
}
export interface CustomerSession { customerId: string; expiresAt: number }
export interface CustomerStore {
  findByEmail(email: string): Promise<CustomerAccount | null>;
  findById(id: string): Promise<CustomerAccount | null>;
  create(account: CustomerAccount): Promise<boolean>;
  saveAddresses(account: CustomerAccount, addresses: any[]): Promise<void>;
  putSession(hash: string, session: CustomerSession): Promise<void>;
  getSession(hash: string): Promise<CustomerSession | null>;
  deleteSession(hash: string): Promise<void>;
  allowAttempt?(identity: string): Promise<boolean>;
  verifyLegacyPassword?(password: string, hash: string): Promise<boolean>;
}
export const sessionHash = (token: string) => createHash('sha256').update(token).digest('hex');
export function customerToken(req: any): string {
  const value = req.cookies?.[CUSTOMER_COOKIE] || String(req.headers?.cookie || '').split(';').map((part: string) => part.trim()).find((part: string) => part.startsWith(`${CUSTOMER_COOKIE}=`))?.slice(CUSTOMER_COOKIE.length + 1) || '';
  return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : '';
}
export async function authenticatedCustomer(req: any, store: CustomerStore): Promise<CustomerAccount | null> {
  const token = customerToken(req);
  if (!token) return null;
  const session = await store.getSession(sessionHash(token));
  if (!session || session.expiresAt <= Date.now()) return null;
  return store.findById(session.customerId);
}
export const publicCustomer = (customer: CustomerAccount) => ({
  id: customer.id, name: customer.name, email: customer.email, phone: customer.phone,
  addresses: customer.addresses || [], rewardPoints: customer.rewardPoints || 0, walletBalance: customer.walletBalance || 0,
});
export async function hashCustomerPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = await deriveKey(password, salt, 64) as Buffer;
  return `scrypt:${salt}:${hash.toString('hex')}`;
}
export async function verifyCustomerPassword(password: string, encoded: string, legacy?: CustomerStore['verifyLegacyPassword']) {
  if (!encoded.startsWith('scrypt:')) return legacy ? legacy(password, encoded) : false;
  const [, salt, expected] = encoded.split(':');
  if (!/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(expected || '')) return false;
  const hash = await deriveKey(password, salt, 64) as Buffer;
  return timingSafeEqual(hash, Buffer.from(expected, 'hex'));
}
const attempts = new Map<string, { count: number; expiresAt: number }>();
const localAttempt = async (identity: string) => {
  const now = Date.now();
  if (attempts.size > 10000) for (const [key, value] of attempts) if (value.expiresAt <= now) attempts.delete(key);
  const previous = attempts.get(identity);
  const value = previous && previous.expiresAt > now ? previous : { count: 0, expiresAt: now + 600000 };
  value.count++; attempts.set(identity, value); return value.count <= 20;
};
const cookie = (req: any, token: string, maxAge: number) => `${CUSTOMER_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' || req.headers?.['x-forwarded-proto'] === 'https' ? '; Secure' : ''}`;
export const customerSameOrigin = (req: any) => {
  if (!req.headers?.origin) return true;
  try {
    const origin = new URL(String(req.headers.origin)), host = new URL(`http://${String(req.headers.host)}`);
    return origin.host === host.host || (process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(origin.hostname) && ['localhost', '127.0.0.1'].includes(host.hostname));
  } catch { return false; }
};

export async function handleCustomerAuth(req: any, res: any, store: CustomerStore) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method || '')) return res.status(405).json({ error: 'Method not allowed.' });
  if (!customerSameOrigin(req)) return res.status(403).json({ error: 'Please use the Farminix website to manage your account.' });
  try {
    if (req.method === 'GET') {
      const customer = await authenticatedCustomer(req, store);
      return res.status(200).json({ authenticated: Boolean(customer), user: customer ? publicCustomer(customer) : null });
    }
    if (req.method === 'DELETE') {
      const token = customerToken(req);
      if (token) await store.deleteSession(sessionHash(token));
      res.setHeader('Set-Cookie', cookie(req, '', 0));
      return res.status(200).json({ authenticated: false, user: null });
    }
    if (req.method === 'PUT') {
      const customer = await authenticatedCustomer(req, store);
      if (!customer) return res.status(401).json({ code: 'LOGIN_REQUIRED', error: 'Please log in to manage your addresses.' });
      const addresses = req.body?.addresses;
      if (!Array.isArray(addresses) || addresses.length > 20 || addresses.some(address =>
        !address || ['id', 'name', 'street', 'city', 'state', 'pincode', 'phone'].some(key => typeof address[key] !== 'string' || !address[key].trim() || address[key].length > 300) || !/^\d{6}$/.test(address.pincode) || !/^\d{10}$/.test(address.phone.replace(/\D/g, '')))) {
        return res.status(400).json({ error: 'Enter valid delivery address details.' });
      }
      const clean = addresses.map(address => ({ id: address.id.trim(), name: address.name.trim(), street: address.street.trim(), city: address.city.trim(), state: address.state.trim(), pincode: address.pincode, phone: address.phone.replace(/\D/g, ''), isDefault: Boolean(address.isDefault), ...(validDeliveryLocation(address.deliveryLocation) ? { deliveryLocation: { lat: address.deliveryLocation.lat, lng: address.deliveryLocation.lng } } : {}) }));
      await store.saveAddresses(customer, clean);
      return res.status(200).json({ user: publicCustomer({ ...customer, addresses: clean }) });
    }
    const { action, name, email, phone, password } = req.body || {};
    if (JSON.stringify(req.body || {}).length > 4096 || !['login', 'register'].includes(action) || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof password !== 'string' || password.length < (action === 'register' ? 8 : 1) || password.length > 128) {
      return res.status(400).json({ error: 'Enter a valid email and a password of 8–128 characters.' });
    }
    const identity = sessionHash(String(req.ip || req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown') + ':' + email.trim().toLowerCase());
    if (!await (store.allowAttempt || localAttempt)(identity)) return res.status(429).json({ error: 'Too many sign-in attempts. Please try again in ten minutes.' });
    const normalizedEmail = email.trim().toLowerCase();
    let customer: CustomerAccount | null;
    if (action === 'register') {
      if (typeof name !== 'string' || !name.trim() || name.trim().length > 100 || typeof phone !== 'string' || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) return res.status(400).json({ error: 'Enter your name and a valid 10-digit mobile number.' });
      customer = { id: `usr-${randomUUID()}`, name: name.trim(), email: normalizedEmail, phone: phone.replace(/\D/g, ''), passwordHash: await hashCustomerPassword(password), addresses: [], createdAt: new Date().toISOString() };
      if (!await store.create(customer)) return res.status(409).json({ code: 'ACCOUNT_EXISTS', error: 'An account with this email or mobile already exists. Please log in.' });
    } else {
      customer = await store.findByEmail(normalizedEmail);
      if (!customer) return res.status(404).json({ code: 'ACCOUNT_NOT_FOUND', error: 'You need to create a Farminix account before placing an order.' });
      if (!await verifyCustomerPassword(password, customer.passwordHash, store.verifyLegacyPassword)) return res.status(401).json({ code: 'INVALID_CREDENTIALS', error: 'The email or password is incorrect.' });
    }
    const token = randomBytes(32).toString('base64url');
    await store.putSession(sessionHash(token), { customerId: customer.id, expiresAt: Date.now() + CUSTOMER_SESSION_SECONDS * 1000 });
    res.setHeader('Set-Cookie', cookie(req, token, CUSTOMER_SESSION_SECONDS));
    return res.status(action === 'register' ? 201 : 200).json({ authenticated: true, user: publicCustomer(customer) });
  } catch {
    return res.status(503).json({ error: 'Account services are temporarily unavailable. Please try again.' });
  }
}
