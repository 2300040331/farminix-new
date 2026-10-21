import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    res.status(500).json({
      success: false,
      error: 'Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) not configured in environment',
    });
    return;
  }

  try {
    const { amount, currency = 'INR', receipt, notes, cart, couponCode } = req.body;
    const storageUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const storageToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!storageUrl || !storageToken) return res.status(503).json({ error: 'Shared store storage is not configured.' });
    const stored = await fetch(storageUrl, { method: 'POST', headers: { Authorization: `Bearer ${storageToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(['GET', 'farminix:site-config:v1']) });
    const data = await stored.json();
    if (!stored.ok || !data.result) return res.status(503).json({ error: 'Publish the store configuration before accepting payments.' });
    const config = JSON.parse(data.result);
    if (!Array.isArray(cart) || !cart.length) return res.status(400).json({ error: 'Cart is required.' });
    const quantities = new Map<string, number>();
    for (const item of cart) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) return res.status(400).json({ error: 'Invalid quantity.' });
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    }
    let subtotal = 0, eligible = 0;
    const coupon = config.cart?.couponsEnabled !== false ? config.cart?.coupons?.find((c: any) => c.enabled && c.code.toUpperCase() === String(couponCode || '').toUpperCase() && (!c.expiresAt || Date.parse(c.expiresAt) > Date.now())) : null;
    for (const [productId, quantity] of quantities) {
      const product = config.products.find((p: any) => p.id === productId && p.enabled !== false);
      if (!product || !product.inStock || quantity > product.stockCount) return res.status(400).json({ error: 'Product is unavailable or quantity exceeds stock.' });
      subtotal += product.price * quantity;
      if (coupon && (!coupon.productIds?.length || coupon.productIds.includes(productId))) eligible += product.price * quantity;
    }
    const discount = coupon && eligible >= (coupon.minimumSpend || 0) ? Math.round(eligible * Math.min(100, Math.max(0, coupon.discountPercentage)) / 100) : 0;
    const total = subtotal - discount;
    const delivery = total >= (config.cart?.freeDeliveryThreshold || 0) ? 0 : (config.cart?.deliveryFee || 0);
    const validatedAmount = Math.round((total + delivery + (config.cart?.handlingFee || 0)) * 100);
    if (Math.round(Number(amount) * 100) !== validatedAmount) return res.status(409).json({ error: 'Prices or coupon eligibility changed. Refresh checkout.' });

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, error: 'Valid amount is required' });
      return;
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Sanitize notes for Razorpay (max 15 key-value pairs, key max 30 chars, val max 256 chars, UTF-8 clean without emojis)
    const sanitizedNotes: Record<string, string> = {};
    const rawNotes = {
      ...(typeof notes === 'object' && !Array.isArray(notes) ? notes : {}),
      coupon_code: discount > 0 ? coupon.code : '',
      coupon_discount: String(discount),
    };
    for (const [rawKey, rawVal] of Object.entries(rawNotes)) {
      if (rawKey && rawVal !== undefined && rawVal !== null) {
        const cleanKey = String(rawKey).replace(/[^\w\s-]/g, '').trim().slice(0, 30);
        const cleanVal = String(rawVal)
          .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          .replace(/[^\x20-\x7E\u0900-\u097F]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 250);
        if (cleanKey) {
          sanitizedNotes[cleanKey] = cleanVal;
        }
      }
    }

    const order = await razorpay.orders.create({
      amount: validatedAmount, // server-validated amount in paise
      currency: currency || 'INR',
      receipt: (receipt ? String(receipt) : `farminix_${Date.now()}`).slice(0, 40),
      notes: sanitizedNotes,
    });

    res.status(200).json({
      success: true,
      order,
      keyId,
    });
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    const errorMsg = error?.error?.description || error?.message || 'Failed to create Razorpay order';
    res.status(error?.statusCode || 500).json({
      success: false,
      error: errorMsg,
    });
  }
}
