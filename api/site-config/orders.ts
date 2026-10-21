import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'node:crypto';

const CONFIG = 'farminix:site-config:v1';
const RECORDS = 'farminix:orders:records:v1';
const REQUESTS = 'farminix:orders:requests:v1';
const statuses = ['Order Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
const equal = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
const isAdmin = (req: VercelRequest) => {
  const [expires, signature] = (req.cookies?.farminix_admin || '').split('.');
  const secret = process.env.ADMIN_SESSION_SECRET;
  return Boolean(secret && Number(expires) > Date.now() && signature && equal(signature, createHmac('sha256', secret).update(expires).digest('hex')));
};
async function redis(command: unknown[]) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw Error('Shared order storage is not configured.');
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok || data.error) throw Error('Unable to reach order storage.');
  return data.result;
}

// Compare the catalog snapshot inside the transaction so two buyers cannot oversell stock.
export const placeOrderScript = `
local previous=redis.call('HGET',KEYS[3],ARGV[1]); if previous then return previous end
if redis.call('GET',KEYS[1])~=ARGV[2] then return 'RETRY' end
redis.call('SET',KEYS[1],ARGV[3]); redis.call('HSET',KEYS[2],ARGV[4],ARGV[5]);
redis.call('HSET',KEYS[3],ARGV[1],ARGV[5]); return ARGV[5]
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!['GET', 'POST', 'PATCH'].includes(req.method || '')) return res.status(405).json({ error: 'Method not allowed.' });
  if (req.method !== 'POST' && !isAdmin(req)) return res.status(401).json({ error: 'Sign in to view online orders.' });
  try {
    if (req.method === 'GET') {
      const rows = await redis(['HVALS', RECORDS]);
      const raw = await redis(['GET', CONFIG]);
      if (!raw) return res.status(503).json({ error: 'Publish the store catalog to load online stock.' });
      const config = JSON.parse(raw);
      return res.status(200).json({ orders: rows.map((row: string) => JSON.parse(row)).sort((a: any, b: any) => Date.parse(b.date) - Date.parse(a.date)), products: config?.products || [], inventoryRevision: config?.inventoryRevision || 0 });
    }
    if (req.method === 'PATCH') {
      const { id, status } = req.body || {};
      if (typeof id !== 'string' || id.length > 100 || !statuses.includes(status)) return res.status(400).json({ error: 'Invalid order update.' });
      const result = await redis(['EVAL', "local raw=redis.call('HGET',KEYS[1],ARGV[1]); if not raw then return false end; local item=cjson.decode(raw); item.status=ARGV[2]; local updated=cjson.encode(item); redis.call('HSET',KEYS[1],ARGV[1],updated); return updated", 1, RECORDS, id, status]);
      if (!result) return res.status(404).json({ error: 'Order not found.' });
      return res.status(200).json({ order: JSON.parse(result) });
    }
    const { requestId, items, address, payment, couponCode, expectedAmount } = req.body || {};
    if (JSON.stringify(req.body || {}).length > 30000 || typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId) || !Array.isArray(items) || !items.length || items.length > 100) return res.status(400).json({ error: 'Invalid order request.' });
    if (!address || ['name', 'street', 'city', 'state', 'pincode', 'phone'].some(key => typeof address[key] !== 'string' || !address[key].trim() || address[key].length > 300) || !/^\d{6}$/.test(address.pincode) || address.phone.replace(/\D/g, '').length < 10) return res.status(400).json({ error: 'Enter a complete delivery address and valid phone number.' });
    if (!payment || !['COD', 'RAZORPAY'].includes(payment.method)) return res.status(400).json({ error: 'Invalid payment method.' });
    let verifiedPayment: any;
    if (payment.method === 'RAZORPAY') {
      const secret = process.env.RAZORPAY_KEY_SECRET, key = process.env.RAZORPAY_KEY_ID;
      if (!secret || !key || typeof payment.razorpay_order_id !== 'string' || typeof payment.razorpay_payment_id !== 'string' || typeof payment.razorpay_signature !== 'string') return res.status(400).json({ error: 'Payment verification details are required.' });
      const signature = createHmac('sha256', secret).update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`).digest('hex');
      if (!equal(signature, payment.razorpay_signature)) return res.status(400).json({ error: 'Payment verification failed.' });
      const response = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(payment.razorpay_payment_id)}`, { headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}` }, signal: AbortSignal.timeout(15000) });
      verifiedPayment = await response.json();
      if (!response.ok || verifiedPayment.order_id !== payment.razorpay_order_id || !['authorized', 'captured'].includes(verifiedPayment.status) || verifiedPayment.currency !== 'INR') return res.status(400).json({ error: 'Payment could not be confirmed.' });
    }
    const identity = verifiedPayment ? `payment:${payment.razorpay_payment_id}` : requestId;
    const existing = await redis(['HGET', REQUESTS, identity]);
    if (existing) return res.status(200).json({ order: JSON.parse(existing) });
    for (let attempt = 0; attempt < 3; attempt++) {
      const raw = await redis(['GET', CONFIG]);
      if (!raw) return res.status(503).json({ error: 'Publish the store catalog before accepting orders.' });
      const config = JSON.parse(raw);
      const quantities = new Map<string, number>();
      for (const item of items) {
        if (typeof item.productId !== 'string' || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 10000) return res.status(400).json({ error: 'Invalid item quantity.' });
        quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
      }
      const coupon = config.cart?.couponsEnabled !== false ? config.cart?.coupons?.find((c: any) => c.enabled && c.code.toUpperCase() === String(couponCode || '').toUpperCase() && (!c.expiresAt || Date.parse(c.expiresAt) > Date.now())) : null;
      let subtotal = 0, eligible = 0;
      const orderItems = [];
      for (const item of items) {
        const product = config.products.find((p: any) => p.id === item.productId && p.enabled !== false);
        if (!product || !product.inStock || quantities.get(item.productId)! > product.stockCount) return res.status(409).json({ error: 'An item is unavailable or exceeds the remaining stock. Refresh your cart.' });
        if (item.selectedWeight !== product.weight && !product.weightOptions?.includes(item.selectedWeight)) return res.status(400).json({ error: 'Invalid product weight.' });
        subtotal += product.price * item.quantity;
        if (coupon && (!coupon.productIds?.length || coupon.productIds.includes(product.id))) eligible += product.price * item.quantity;
        orderItems.push({ product, quantity: item.quantity, selectedWeight: item.selectedWeight });
      }
      if (payment.method === 'COD' && !config.checkoutPayment?.paymentMethods?.some((p: any) => p.id === 'cod' && p.enabled)) return res.status(400).json({ error: 'Cash on delivery is unavailable.' });
      const discount = coupon && eligible >= (coupon.minimumSpend || 0) ? Math.round(eligible * Math.min(100, Math.max(0, coupon.discountPercentage)) / 100) : 0;
      const deliveryFee = subtotal - discount >= (config.cart?.freeDeliveryThreshold || 0) ? 0 : (config.cart?.deliveryFee || 0);
      const finalAmount = Math.round((subtotal - discount + deliveryFee + (config.cart?.handlingFee || 0)) * 100) / 100;
      if (!Number.isFinite(finalAmount) || Math.round(expectedAmount * 100) !== Math.round(finalAmount * 100) || (verifiedPayment && verifiedPayment.amount !== Math.round(finalAmount * 100))) return res.status(409).json({ error: 'Prices or coupon eligibility changed. Refresh checkout before placing the order.' });
      const order = { id: `FMX-${requestId.toUpperCase()}`, date: new Date().toISOString(), items: orderItems, totalAmount: subtotal, discount, couponCode: discount ? coupon.code : undefined, deliveryFee, handlingFee: config.cart?.handlingFee || 0, finalAmount, status: 'Order Received', estimatedTime: 'Awaiting dispatch', deliveryAddress: { id: requestId, name: address.name.trim(), street: address.street.trim(), city: address.city.trim(), state: address.state.trim(), pincode: address.pincode, phone: address.phone.trim(), isDefault: false }, paymentMethod: verifiedPayment ? `Razorpay • Paid (${payment.razorpay_payment_id})` : 'Cash on Delivery (COD)' };
      config.products = config.products.map((p: any) => quantities.has(p.id) ? { ...p, stockCount: p.stockCount - quantities.get(p.id)!, inStock: p.stockCount - quantities.get(p.id)! > 0 } : p);
      config.inventoryRevision = (config.inventoryRevision || 0) + 1;
      const result = await redis(['EVAL', placeOrderScript, 3, CONFIG, RECORDS, REQUESTS, identity, raw, JSON.stringify(config), order.id, JSON.stringify(order)]);
      if (result !== 'RETRY') return res.status(201).json({ order: JSON.parse(result) });
    }
    return res.status(409).json({ error: 'Stock changed while placing your order. Please retry.' });
  } catch {
    return res.status(503).json({ error: 'Unable to confirm your order. Your cart has been retained. Retry with the same payment if already paid.' });
  }
}
