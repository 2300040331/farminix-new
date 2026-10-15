import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

const KEY = 'farminix:site-config:v1';
const equal = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const secret = process.env.ADMIN_SESSION_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  const sign = (value: string) => createHmac('sha256', secret!).update(value).digest('hex');
  if (req.method === 'POST') {
    if (!secret || !password) return res.status(503).json({ error: 'Admin publishing is not configured on the server.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!['admin', 'admin@farminix.com'].includes(email) || !equal(String(req.body?.password || ''), password)) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }
    const expires = String(Date.now() + 8 * 60 * 60 * 1000);
    res.setHeader('Set-Cookie', `farminix_admin=${expires}.${sign(expires)}; HttpOnly; Secure; SameSite=Strict; Path=/api/site-config; Max-Age=28800`);
    return res.status(200).json({ authenticated: true });
  }
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'farminix_admin=; HttpOnly; Secure; SameSite=Strict; Path=/api/site-config; Max-Age=0');
    return res.status(200).json({ authenticated: false });
  }
  if (!['GET', 'PUT'].includes(req.method || '')) return res.status(405).json({ error: 'Method not allowed.' });
  if (req.method === 'PUT') {
    const token = req.cookies?.farminix_admin || '';
    const [expires, signature] = token.split('.');
    if (!secret || !expires || Number(expires) <= Date.now() || !signature || !equal(signature, sign(expires))) {
      return res.status(401).json({ error: 'Please sign out and sign in again to publish changes.' });
    }
    if (!req.body?.config || !Array.isArray(req.body.config.products) || !req.body.config.theme) {
      return res.status(400).json({ error: 'Invalid store configuration.' });
    }
  }
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(503).json({ error: 'Shared store storage is not configured. Connect Redis to this Vercel project.' });
  try {
    let config = req.body?.config;
    if (req.method === 'PUT') {
      // Never publish customer records or private payment credentials in the public document.
      const { razorpayKeySecret: _secret, ...payment } = config.checkoutPayment || {};
      config = { ...config, orders: [], users: [], checkoutPayment: payment };
    }
    const command = req.method === 'GET' ? ['GET', KEY] : ['SET', KEY, JSON.stringify(config)];
    const result = await fetch(url, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command), signal: AbortSignal.timeout(15000),
    });
    const data = await result.json();
    if (!result.ok || data.error) throw new Error('Storage request failed');
    return res.status(200).json({ config: req.method === 'GET' ? (data.result ? JSON.parse(data.result) : null) : config });
  } catch {
    return res.status(502).json({ error: 'Unable to reach shared storage. Your changes have not been published; please retry.' });
  }
}
