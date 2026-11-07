import { handleEnquiries } from './enquiries.js';
import { sqlEnquiries } from './enquiries-sql.js';
import { checkDelivery, deliverySettingsError } from './delivery-policy.js';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, query, transaction, isUsingPostgres } from './db.js';
import { authenticatedCustomer, customerSameOrigin, handleCustomerAuth, verifyCustomerPassword } from './customer-auth.js';
import { sqlCustomerStore } from './customer-sql.js';
import { handleAdminUsers } from './admin-users.js';
import { sqlAdminUsers } from './admin-users-sql.js';
import { sqlCustomerOrder } from './customer-order-view.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'farminix-super-jwt-secret-key-2026';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'farminix-super-refresh-secret-2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Farminix@2026';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'farminix-admin-session-secret-salt-key-2026';

// Razorpay Credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

const razorpayClient = (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper: Timing safe comparison
const timingSafeEqual = (a: string, b: string): boolean => {
  try {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && crypto.timingSafeEqual(x, y);
  } catch {
    return false;
  }
};

// Helper: Sign session token
const signSession = (value: string): string => {
  return crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(value).digest('hex');
};

// Helper: Admin Session Verification
const verifyAdminSession = (req: Request): boolean => {
  const cookie = req.cookies?.farminix_admin || (req.headers.cookie?.match(/farminix_admin=([^;]+)/)?.[1]);
  if (!cookie) return false;

  const [expires, signature] = cookie.split('.');
  if (!expires || !signature) return false;

  const expiryTime = Number(expires);
  if (!Number.isFinite(expiryTime) || expiryTime <= Date.now()) return false;

  const expectedSignature = signSession(expires);
  return timingSafeEqual(expectedSignature, signature);
};

// Middleware: Require Admin Authentication
const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!verifyAdminSession(req)) {
    res.status(401).json({ error: 'Admin authentication required or session expired.' });
    return;
  }
  next();
};

// Middleware: Customer JWT Authentication
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired access token' });
      return;
    }
    (req as any).user = decoded;
    next();
  });
};

const requireCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!customerSameOrigin(req)) { res.status(403).json({ error: 'Please use the Farminix website to place orders.' }); return; }
    const customer = await authenticatedCustomer(req, sqlCustomerStore);
    if (!customer) { res.status(401).json({ code: 'LOGIN_REQUIRED', error: 'Please log in before placing an order.' }); return; }
    (req as any).customer = customer; next();
  } catch { res.status(503).json({ error: 'Account services are temporarily unavailable. Please try again.' }); }
};
app.all('/api/customer-auth', async (req: Request, res: Response): Promise<void> => { await handleCustomerAuth(req, res, sqlCustomerStore); });
app.all('/api/site-config/users', requireAdmin, async (req: Request, res: Response): Promise<void> => { await handleAdminUsers(req, res, sqlAdminUsers, true); });
app.get('/api/customer-orders', requireCustomer, async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'private, no-store');
  const offset = Number(req.query.cursor || 0);
  if (!Number.isInteger(offset) || offset < 0 || offset > 100000) { res.status(400).json({ error: 'Invalid order-history page.' }); return; }
  try {
    const rows = (await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 21 OFFSET $2', [(req as any).customer.id, offset])).rows;
    const orders = rows.slice(0, 20).map(sqlCustomerOrder);
    res.json({ orders, nextCursor: rows.length > 20 ? offset + 20 : null });
  } catch { res.status(503).json({ error: 'Unable to load your order history. Please try again.' }); }
});

// ============================================================
// 1. HEALTH & STATUS ENDPOINT
// ============================================================
app.get('/api/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: isUsingPostgres() ? 'PostgreSQL (Connected)' : 'Fallback Store (Active)',
    razorpayConfigured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
  });
});

// ============================================================
// 2. SITE CONFIGURATION MODULE (/api/site-config)
// ============================================================

// 2.1 Admin Session Check / Get Published Store Config
app.get('/api/site-config', async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.query.session === '1') {
    const authenticated = verifyAdminSession(req);
    res.json({ authenticated });
    return;
  }

  try {
    const result = await query('SELECT config, inventory_revision FROM site_config WHERE key = $1', ['farminix:site-config:v1']);
    if (result.rowCount > 0) {
      const row = result.rows[0];
      const config = typeof row.config === 'string' ? JSON.parse(row.config) : row.config;
      config.inventoryRevision = row.inventory_revision || 0;
      res.json({ config });
      return;
    }

    res.json({ config: null });
  } catch (error: any) {
    console.error('[GET /api/site-config error]:', error);
    res.status(500).json({ error: 'Failed to retrieve site configuration' });
  }
});

// 2.2 Admin Login
app.post('/api/site-config', (req: Request, res: Response): void => {
  res.setHeader('Cache-Control', 'no-store');
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  const validEmails = ['admin', 'admin@farminix.com', 'admin@farminix.in'];
  if (!validEmails.includes(email) || !timingSafeEqual(password, ADMIN_PASSWORD)) {
    res.status(401).json({ error: 'Invalid admin credentials.' });
    return;
  }

  // Issue signed cookie valid for 8 hours
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  const signature = signSession(expires);
  const cookieValue = `${expires}.${signature}`;

  res.cookie('farminix_admin', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({ authenticated: true });
});

// 2.3 Admin Logout
app.delete('/api/site-config', (_req: Request, res: Response): void => {
  res.clearCookie('farminix_admin', { path: '/' });
  res.json({ authenticated: false });
});

// 2.4 Publish Store Config (Admin Only)
app.put('/api/site-config', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'no-store');
  const incomingConfig = req.body?.config;

  if (!incomingConfig || !Array.isArray(incomingConfig.products) || !incomingConfig.theme) {
    res.status(400).json({ error: 'Invalid store configuration payload.' });
    return;
  }

  try {
    const deliveryError = deliverySettingsError(incomingConfig.checkoutPayment?.deliveryArea);
    if (deliveryError) { res.status(400).json({ error: deliveryError }); return; }
    // Strip private credentials and orders before saving
    const { razorpayKeySecret: _secret, ...paymentSettings } = incomingConfig.checkoutPayment || {};
    const sanitizedConfig = {
      ...incomingConfig,
      orders: [],
      users: [],
      checkoutPayment: paymentSettings,
    };

    const newRevision = (Number(sanitizedConfig.inventoryRevision) || 0) + 1;
    sanitizedConfig.inventoryRevision = newRevision;

    await transaction(async (client) => {
      // 1. Update site_config table
      await client.query(
        `INSERT INTO site_config (key, config, inventory_revision, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (key) DO UPDATE
         SET config = EXCLUDED.config, inventory_revision = EXCLUDED.inventory_revision, updated_at = NOW()`,
        ['farminix:site-config:v1', JSON.stringify(sanitizedConfig), newRevision]
      );

      // 2. Sync products table from config.products
      if (Array.isArray(incomingConfig.products)) {
        for (const prod of incomingConfig.products) {
          if (!prod.id || !prod.name) continue;
          await client.query(
            `INSERT INTO products (id, name, brand, category, weight, price, old_price, discount_percentage, image_url, description, stock_qty, in_stock, enabled, raw_data, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
             ON CONFLICT (id) DO UPDATE
             SET name = EXCLUDED.name, brand = EXCLUDED.brand, category = EXCLUDED.category,
                 weight = EXCLUDED.weight, price = EXCLUDED.price, old_price = EXCLUDED.old_price,
                 discount_percentage = EXCLUDED.discount_percentage, image_url = EXCLUDED.image_url,
                 description = EXCLUDED.description, stock_qty = EXCLUDED.stock_qty,
                 in_stock = EXCLUDED.in_stock, enabled = EXCLUDED.enabled, raw_data = EXCLUDED.raw_data, updated_at = NOW()`,
            [
              prod.id,
              prod.name,
              prod.brand || 'Farminix',
              prod.category || 'General',
              prod.weight || '1 unit',
              Number(prod.price) || 0,
              prod.oldPrice ? Number(prod.oldPrice) : null,
              prod.discountPercentage || 0,
              prod.image || '',
              prod.description || '',
              Number(prod.stockCount) || 0,
              prod.inStock !== false,
              prod.enabled !== false,
              JSON.stringify(prod),
            ]
          );
        }
      }

      // 3. Sync categories table
      if (Array.isArray(incomingConfig.categories)) {
        for (const cat of incomingConfig.categories) {
          if (!cat.id || !cat.name) continue;
          await client.query(
            `INSERT INTO categories (id, name, image, item_count, enabled)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE
             SET name = EXCLUDED.name, image = EXCLUDED.image, item_count = EXCLUDED.item_count, enabled = EXCLUDED.enabled`,
            [cat.id, cat.name, cat.image || '', cat.itemCount || 0, cat.enabled !== false]
          );
        }
      }
    });

    res.json({ config: sanitizedConfig });
  } catch (error: any) {
    console.error('[PUT /api/site-config error]:', error);
    res.status(500).json({ error: 'Failed to publish store configuration.' });
  }
});

// ============================================================
// 3. ORDERS MODULE (/api/site-config/orders)
// ============================================================

// 3.1 List Online Orders (Admin Only)
app.get('/api/site-config/orders', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'private, no-store');

  try {
    const ordersResult = await query(
      `SELECT * FROM orders ORDER BY created_at DESC LIMIT 500`
    );

    const configResult = await query(
      `SELECT config, inventory_revision FROM site_config WHERE key = $1`,
      ['farminix:site-config:v1']
    );

    let products: any[] = [];
    let inventoryRevision = 0;

    if (configResult.rowCount > 0) {
      const cfg = typeof configResult.rows[0].config === 'string'
        ? JSON.parse(configResult.rows[0].config)
        : configResult.rows[0].config;
      products = cfg.products || [];
      inventoryRevision = configResult.rows[0].inventory_revision || 0;
    }

    const formattedOrders = ordersResult.rows.map((row: any) => ({
      id: row.id,
      date: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      totalAmount: Number(row.total_amount),
      discount: Number(row.discount_amount || 0),
      deliveryFee: Number(row.delivery_fee || 0),
      handlingFee: Number(row.handling_fee || 0),
      finalAmount: Number(row.final_amount),
      status: row.status,
      deliveryAddress: typeof row.delivery_address === 'string' ? JSON.parse(row.delivery_address) : row.delivery_address,
      paymentMethod: row.payment_method,
      couponCode: row.coupon_code || undefined,
      estimatedTime: row.estimated_time || '10-30 mins',
    }));

    res.json({
      orders: formattedOrders,
      products,
      inventoryRevision,
    });
  } catch (error: any) {
    console.error('[GET /api/site-config/orders error]:', error);
    res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

// 3.2 Place Online Order (Customer Checkout)
app.post('/api/site-config/orders', requireCustomer, async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'private, no-store');

  const { requestId, items, address, payment, couponCode, expectedAmount } = req.body || {};

  // Basic validation
  if (!requestId || !Array.isArray(items) || items.length === 0 || !address || !payment) {
    res.status(400).json({ error: 'Invalid order request payload.' });
    return;
  }

  // Address validation
  const requiredAddressFields = ['name', 'street', 'city', 'state', 'pincode', 'phone'];
  for (const field of requiredAddressFields) {
    if (!address[field] || typeof address[field] !== 'string' || !address[field].trim()) {
      res.status(400).json({ error: `Please provide a valid ${field} in delivery address.` });
      return;
    }
  }

  if (!/^\d{6}$/.test(String(address.pincode).trim())) {
    res.status(400).json({ error: 'Enter a valid 6-digit postal pincode.' });
    return;
  }

  const cleanPhone = String(address.phone).replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    res.status(400).json({ error: 'Enter a valid 10-digit mobile phone number.' });
    return;
  }

  // Idempotency: Return existing order if already confirmed with this requestId
  try {
    const existingResult = await query('SELECT * FROM orders WHERE request_id = $1', [requestId]);
    if (existingResult.rowCount > 0) {
      const existing = existingResult.rows[0];
      if (existing.user_id !== (req as any).customer.id) { res.status(409).json({ error: 'This order request belongs to another account.' }); return; }
      res.json({
        order: {
          id: existing.id,
          date: existing.created_at ? new Date(existing.created_at).toISOString() : new Date().toISOString(),
          items: typeof existing.items === 'string' ? JSON.parse(existing.items) : existing.items,
          totalAmount: Number(existing.total_amount),
          discount: Number(existing.discount_amount || 0),
          deliveryFee: Number(existing.delivery_fee || 0),
          handlingFee: Number(existing.handling_fee || 0),
          finalAmount: Number(existing.final_amount),
          status: existing.status,
          deliveryAddress: typeof existing.delivery_address === 'string' ? JSON.parse(existing.delivery_address) : existing.delivery_address,
          paymentMethod: existing.payment_method,
          couponCode: existing.coupon_code || undefined,
        },
      });
      return;
    }
  } catch (err: any) {
    console.warn('[Idempotency check warning]:', err.message);
  }

  // Payment Verification for Razorpay
  if (payment.method === 'RAZORPAY') {
    try {
      const owner = await query('SELECT * FROM customer_payment_orders WHERE id = $1', [payment.razorpay_order_id]);
      if (owner.rows[0]?.user_id !== (req as any).customer.id) { res.status(403).json({ error: 'This payment belongs to another account.' }); return; }
    } catch { res.status(503).json({ error: 'Unable to validate this payment. Please retry.' }); return; }
    if (!payment.razorpay_payment_id || !payment.razorpay_order_id || !payment.razorpay_signature) {
      res.status(400).json({ error: 'Razorpay payment confirmation details are missing.' });
      return;
    }

    if (RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`)
        .digest('hex');

      if (!timingSafeEqual(generatedSignature, payment.razorpay_signature)) {
        res.status(400).json({ error: 'Razorpay payment signature mismatch.' });
        return;
      }
    }
  }

  try {
    // Load current catalog to validate prices and stock
    const configResult = await query('SELECT config, inventory_revision FROM site_config WHERE key = $1', ['farminix:site-config:v1']);
    if (configResult.rowCount === 0) {
      res.status(503).json({ error: 'Store configuration not found. Please contact support.' });
      return;
    }

    const config = typeof configResult.rows[0].config === 'string'
      ? JSON.parse(configResult.rows[0].config)
      : configResult.rows[0].config;

    const delivery = checkDelivery(address, config.checkoutPayment?.deliveryArea);
    if (!delivery.allowed) { res.status(delivery.code === 'DELIVERY_NOT_CONFIGURED' ? 503 : 422).json({ code: delivery.code, error: delivery.message }); return; }

    const catalogProducts: any[] = config.products || [];

    // Aggregate required quantities by product ID
    const requestedQuantities = new Map<string, number>();
    for (const it of items) {
      if (!it.productId || !Number.isInteger(it.quantity) || it.quantity <= 0) {
        res.status(400).json({ error: 'Invalid product quantity in cart.' });
        return;
      }
      requestedQuantities.set(it.productId, (requestedQuantities.get(it.productId) || 0) + it.quantity);
    }

    // Check stock and compute subtotal
    let subtotal = 0;
    const validatedCartItems: any[] = [];

    for (const it of items) {
      const product = catalogProducts.find((p) => p.id === it.productId && p.enabled !== false);
      if (!product) {
        res.status(400).json({ error: `Product not found or unavailable.` });
        return;
      }

      const totalReq = requestedQuantities.get(it.productId) || it.quantity;
      const currentStock = Number(product.stockCount || product.stock_qty || 0);

      if (!product.inStock || totalReq > currentStock) {
        res.status(400).json({ error: `"${product.name}" is out of stock or requested quantity exceeds available stock.` });
        return;
      }

      subtotal += product.price * it.quantity;
      validatedCartItems.push({
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          weight: product.weight,
          image: product.image,
        },
        quantity: it.quantity,
        selectedWeight: it.selectedWeight || product.weight,
      });
    }

    // Coupon discount calculation
    let discount = 0;
    if (couponCode && config.cart?.couponsEnabled !== false && Array.isArray(config.cart?.coupons)) {
      const coupon = config.cart.coupons.find(
        (c: any) => c.enabled && String(c.code).toUpperCase() === String(couponCode).toUpperCase()
      );
      if (coupon && subtotal >= (coupon.minimumSpend || 0)) {
        discount = Math.round((subtotal * Math.min(100, Math.max(0, coupon.discountPercentage))) / 100);
      }
    }

    const discountedTotal = Math.max(0, subtotal - discount);
    const deliveryFee = delivery.deliveryFee!;
    const handlingFee = Number(config.cart?.handlingFee) || 0;
    const computedFinalAmount = discountedTotal + deliveryFee + handlingFee;

    if (!Number.isFinite(expectedAmount) || Math.round(expectedAmount * 100) !== Math.round(computedFinalAmount * 100)) {
      res.status(409).json({ error: 'Order total mismatch due to price or fee changes. Please refresh checkout.' });
      return;
    }

    if (payment.method === 'RAZORPAY') {
      if (!razorpayClient) { res.status(503).json({ error: 'Payment verification is unavailable. Please contact support.' }); return; }
      const verified = await razorpayClient.payments.fetch(payment.razorpay_payment_id);
      if (verified.order_id !== payment.razorpay_order_id || !['authorized', 'captured'].includes(verified.status) || verified.currency !== 'INR' || Number(verified.amount) !== Math.round(computedFinalAmount * 100)) {
        res.status(409).json({ error: 'The payment does not match the order and delivery charges. Please contact support with your payment reference.' }); return;
      }
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: orderId,
      customerId: (req as any).customer.id,
      date: new Date().toISOString(),
      items: validatedCartItems,
      totalAmount: subtotal,
      discount,
      deliveryFee,
      handlingFee,
      finalAmount: computedFinalAmount,
      status: 'Order Received' as const,
      estimatedTime: '10-30 mins',
      deliveryAddress: address,
      paymentMethod: payment.method === 'RAZORPAY' ? 'Razorpay Online' : 'Cash on Delivery (COD)',
      couponCode: couponCode || undefined,
    };

    // Execute atomic transaction: decrement stock, save order, save line items
    await transaction(async (client) => {
      // 1. Decrement product stock in products table
      for (const [prodId, qty] of requestedQuantities.entries()) {
        await client.query(
          `UPDATE products 
           SET stock_qty = GREATEST(0, stock_qty - $1), 
               in_stock = (GREATEST(0, stock_qty - $1) > 0), 
               updated_at = NOW() 
           WHERE id = $2`,
          [qty, prodId]
        );
      }

      // 2. Decrement stock in site_config JSON and bump inventory revision
      for (const p of catalogProducts) {
        if (requestedQuantities.has(p.id)) {
          const qty = requestedQuantities.get(p.id)!;
          const currentStock = Number(p.stockCount || p.stock_qty || 0);
          p.stockCount = Math.max(0, currentStock - qty);
          p.inStock = p.stockCount > 0;
        }
      }

      const nextRev = (Number(configResult.rows[0].inventory_revision) || 0) + 1;
      config.inventoryRevision = nextRev;

      await client.query(
        `UPDATE site_config SET config = $1, inventory_revision = $2, updated_at = NOW() WHERE key = $3`,
        [JSON.stringify(config), nextRev, 'farminix:site-config:v1']
      );

      // 3. Insert order record into orders table
      await client.query(
        `INSERT INTO orders (id, request_id, customer_name, customer_phone, customer_email, delivery_address, items, total_amount, discount_amount, delivery_fee, handling_fee, final_amount, coupon_code, status, payment_method, payment_details, user_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())`,
        [
          orderId,
          requestId,
          address.name,
          cleanPhone,
          (req as any).customer.email,
          JSON.stringify(address),
          JSON.stringify(validatedCartItems),
          subtotal,
          discount,
          deliveryFee,
          handlingFee,
          computedFinalAmount,
          couponCode || null,
          'Order Received',
          payment.method,
          payment.method === 'RAZORPAY' ? JSON.stringify(payment) : null,
          (req as any).customer.id,
        ]
      );

      // 4. Insert order line items into order_items table
      for (const it of validatedCartItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, weight)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, it.product.id, it.product.name, it.quantity, it.product.price, it.selectedWeight]
        );
      }
    });

    res.status(201).json({ order: newOrder });
  } catch (error: any) {
    console.error('[POST /api/site-config/orders error]:', error);
    res.status(500).json({ error: error.message || 'Failed to place order. Please try again.' });
  }
});

// 3.3 Update Order Status (Admin Only)
app.patch('/api/site-config/orders', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'private, no-store');
  const { id, status } = req.body || {};

  const validStatuses = ['Order Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!id || !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Valid order ID and status are required.' });
    return;
  }

  try {
    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const row = result.rows[0];
    const updatedOrder = {
      id: row.id,
      date: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      totalAmount: Number(row.total_amount),
      discount: Number(row.discount_amount || 0),
      deliveryFee: Number(row.delivery_fee || 0),
      handlingFee: Number(row.handling_fee || 0),
      finalAmount: Number(row.final_amount),
      status: row.status,
      deliveryAddress: typeof row.delivery_address === 'string' ? JSON.parse(row.delivery_address) : row.delivery_address,
      paymentMethod: row.payment_method,
    };

    res.json({ order: updatedOrder });
  } catch (error: any) {
    console.error('[PATCH /api/site-config/orders error]:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// ============================================================
// 4. CUSTOMER ENQUIRIES / SUPPORT QUERIES MODULE (/api/site-config/queries)
// ============================================================

app.all('/api/site-config/queries', async (req: Request, res: Response): Promise<void> => { await handleEnquiries(req, res, sqlEnquiries, sqlCustomerStore, verifyAdminSession(req)); });

// ============================================================
// 5. PAYMENT MODULE (/api/payment/*)
// ============================================================

// 5.1 Fetch Razorpay Public Key
app.get(['/api/payment/razorpay-key', '/api/payment/razorpay-key/'], (_req: Request, res: Response): void => {
  res.json({
    success: true,
    keyId: RAZORPAY_KEY_ID || '',
    isConfigured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
  });
});

// 5.2 Create Server-Validated Razorpay Order
app.post(['/api/payment/create-order', '/api/payment/create-order/'], requireCustomer, async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'INR', receipt, notes, cart, couponCode, address } = req.body || {};
    const configRes = await query('SELECT config FROM site_config WHERE key = $1', ['farminix:site-config:v1']);
    if (!configRes.rows[0]) { res.status(503).json({ error: 'Store configuration is unavailable.' }); return; }
    const config = typeof configRes.rows[0].config === 'string' ? JSON.parse(configRes.rows[0].config) : configRes.rows[0].config;
    const delivery = checkDelivery(address, config.checkoutPayment?.deliveryArea);
    if (!delivery.allowed) { res.status(delivery.code === 'DELIVERY_NOT_CONFIGURED' ? 503 : 422).json({ code: delivery.code, error: delivery.message }); return; }
    if (currency !== 'INR' || !Array.isArray(cart) || !cart.length || cart.length > 100) { res.status(400).json({ error: 'A valid cart and INR payment are required.' }); return; }
    const quantities = new Map<string, number>();
    for (const item of cart) {
      if (!item || typeof item.productId !== 'string' || !Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 10000) { res.status(400).json({ error: 'Invalid cart quantity.' }); return; }
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    }
    const coupon = config.cart?.couponsEnabled !== false ? config.cart?.coupons?.find((item: any) => item.enabled && String(item.code).toUpperCase() === String(couponCode || '').toUpperCase() && (!item.expiresAt || Date.parse(item.expiresAt) > Date.now())) : null;
    let subtotal = 0, eligible = 0;
    for (const [id, quantity] of quantities) {
      const product = (config.products || []).find((item: any) => item.id === id && item.enabled !== false);
      if (!product || !product.inStock || quantity > product.stockCount) { res.status(409).json({ error: 'An item is unavailable or exceeds the remaining stock.' }); return; }
      subtotal += product.price * quantity;
      if (coupon && (!coupon.productIds?.length || coupon.productIds.includes(id))) eligible += product.price * quantity;
    }
    const discount = coupon && eligible >= (coupon.minimumSpend || 0) ? Math.round(eligible * Math.min(100, Math.max(0, coupon.discountPercentage)) / 100) : 0;
    const validatedAmount = Math.round((subtotal - discount + delivery.deliveryFee! + (config.cart?.handlingFee || 0)) * 100);
    if (!Number.isFinite(validatedAmount) || validatedAmount <= 0 || Math.round(Number(amount) * 100) !== validatedAmount) { res.status(409).json({ error: 'Order prices or delivery charges changed. Refresh checkout before paying.' }); return; }
    if (!razorpayClient) { res.status(503).json({ error: 'Online payments are not configured.' }); return; }

    // Sanitize notes for Razorpay (max 15 key-value pairs, key max 30 chars, val max 256 chars, UTF-8 clean without emojis)
    const sanitizedNotes: Record<string, string> = {};
    if (notes && typeof notes === 'object' && !Array.isArray(notes)) {
      for (const [rawKey, rawVal] of Object.entries(notes)) {
        if (rawKey && rawVal !== undefined && rawVal !== null) {
          const cleanKey = String(rawKey)
            .replace(/[^\w\s-]/g, '')
            .trim()
            .slice(0, 30);
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
    }

    const orderOptions = {
      amount: validatedAmount,
      currency: currency || 'INR',
      receipt: (receipt ? String(receipt) : `farminix_${Date.now()}`).slice(0, 40),
      notes: { ...sanitizedNotes, customer_id: (req as any).customer.id },
    };

    const order = await razorpayClient.orders.create(orderOptions);
    await query('INSERT INTO customer_payment_orders (id, user_id) VALUES ($1, $2)', [order.id, (req as any).customer.id]);

    res.json({
      success: true,
      order,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('[Razorpay Create Order Error]:', error);
    const errorMsg = error?.error?.description || error?.message || 'Failed to create Razorpay order.';
    res.status(error?.statusCode || 500).json({
      success: false,
      error: errorMsg,
    });
  }
});

// 5.3 Verify Payment Signature
app.post(['/api/payment/verify-signature', '/api/payment/verify-signature/'], (req: Request, res: Response): void => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id) {
      res.status(400).json({ success: false, error: 'Missing razorpay_payment_id' });
      return;
    }

    if (!RAZORPAY_KEY_SECRET) {
      res.status(500).json({ success: false, error: 'Razorpay secret key not configured on server.' });
      return;
    }

    if (razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (!timingSafeEqual(generatedSignature, razorpay_signature)) {
        res.status(400).json({
          success: false,
          verified: false,
          error: 'Payment signature verification failed.',
        });
        return;
      }
    }

    res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error: any) {
    console.error('[Signature Verification Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Verification failed.' });
  }
});

// 5.4 Razorpay Webhook
app.post(['/api/payment/webhook', '/api/razorpay-webhook'], (req: Request, res: Response): void => {
  const signature = req.headers['x-razorpay-signature'] as string;

  if (RAZORPAY_WEBHOOK_SECRET && signature) {
    const payload = JSON.stringify(req.body);
    const expected = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    if (!timingSafeEqual(expected, signature)) {
      res.status(400).json({ error: 'Invalid webhook signature.' });
      return;
    }
  }

  console.log(`[RAZORPAY WEBHOOK] Received event: ${req.body?.event}`);
  res.json({ status: 'ok', received: true });
});

// ============================================================
// 6. CUSTOMER AUTH & USER PROFILE MODULE (/api/auth, /api/profile, /api/addresses)
// ============================================================

// 6.1 Register
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: 'Name, email, phone, and password are required.' });
    return;
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1 OR phone = $2', [email.trim(), phone.trim()]);
    if (existing.rowCount > 0) {
      res.status(409).json({ error: 'A user with this email or phone already exists.' });
      return;
    }

    const userId = `usr-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    await query(
      `INSERT INTO users (id, name, email, phone, password_hash, role, reward_points, wallet_balance, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'CUSTOMER', 100, 0.00, true, NOW(), NOW())`,
      [userId, name.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash]
    );

    const token = jwt.sign({ id: userId, role: 'CUSTOMER' }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registered successfully',
      token,
      refreshToken,
      user: { id: userId, name, email, phone, rewardPoints: 100, walletBalance: 0 },
    });
  } catch (error: any) {
    console.error('[Register error]:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// 6.2 Login
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (result.rowCount === 0) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const user = result.rows[0];
    if (!await verifyCustomerPassword(password, user.password_hash, async (value, hash) => bcrypt.compare(value, hash))) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        rewardPoints: user.reward_points,
        walletBalance: Number(user.wallet_balance),
      },
    });
  } catch (error: any) {
    console.error('[Login error]:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Retire the old demonstration OTP endpoints; customers use real credentials.
app.post(['/api/auth/otp-send', '/api/auth/otp-verify'], (_req: Request, res: Response): void => {
  res.status(410).json({ error: 'Please sign in with your email and password or create an account.' });
});

// 6.4 User Profile
app.get('/api/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;
  try {
    const result = await query('SELECT id, name, email, phone, role, reward_points, wallet_balance FROM users WHERE id = $1', [userId]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json({ user: result.rows[0] });
  } catch (error: any) {
    console.error('[Profile error]:', error);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// 6.5 User Addresses
app.get('/api/addresses', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;
  try {
    const result = await query('SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [userId]);
    res.json({ addresses: result.rows });
  } catch (error: any) {
    console.error('[Addresses error]:', error);
    res.status(500).json({ error: 'Failed to fetch addresses.' });
  }
});

app.post('/api/addresses', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;
  const { name, street, city, state, pincode, phone, addressType } = req.body;

  if (!name || !street || !city || !state || !pincode || !phone) {
    res.status(400).json({ error: 'All address fields are required.' });
    return;
  }

  const addrId = `addr-${Date.now()}`;
  try {
    const countRes = await query('SELECT COUNT(*) as total FROM user_addresses WHERE user_id = $1', [userId]);
    const isDefault = parseInt(countRes.rows[0]?.total || '0', 10) === 0;

    await query(
      `INSERT INTO user_addresses (id, user_id, name, street, city, state, pincode, phone, address_type, is_default, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [addrId, userId, name, street, city, state, pincode, phone, addressType || 'HOME', isDefault]
    );

    res.status(201).json({
      message: 'Address saved successfully',
      address: { id: addrId, userId, name, street, city, state, pincode, phone, addressType, isDefault },
    });
  } catch (error: any) {
    console.error('[Address create error]:', error);
    res.status(500).json({ error: 'Failed to save address.' });
  }
});

// ============================================================
// 7. SUPPORT CHATBOT & ADMIN DASHBOARD STATS
// ============================================================
// The previous demonstration chatbot did not create support requests.
app.post('/api/support/chat', (_req: Request, res: Response): void => {
  res.status(410).json({ error: 'Use the Support request form to send your issue to the Farminix team.' });
});

// Admin Dashboard Stats
app.get('/api/admin/dashboard', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const ordersRes = await query('SELECT COUNT(*) as total_orders, COALESCE(SUM(final_amount), 0) as total_sales FROM orders');
    const customersRes = await query('SELECT COUNT(DISTINCT customer_phone) as total_customers FROM orders');
    const productsRes = await query('SELECT COUNT(*) as total_products FROM products WHERE enabled = true');

    res.json({
      stats: {
        totalSales: Number(ordersRes.rows[0]?.total_sales || 0),
        totalOrders: parseInt(ordersRes.rows[0]?.total_orders || '0', 10),
        totalCustomers: parseInt(customersRes.rows[0]?.total_customers || '0', 10),
        totalProducts: parseInt(productsRes.rows[0]?.total_products || '0', 10),
      },
    });
  } catch (error: any) {
    console.error('[Admin dashboard stats error]:', error);
    res.status(500).json({ error: 'Failed to load dashboard metrics.' });
  }
});

// ============================================================
// 8. STATIC FRONTEND PRODUCTION SERVING (KVM2 Unified Deployment)
// ============================================================
const possibleDistPaths = [
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(process.cwd(), 'dist'),
];
const distPath = possibleDistPaths.find((p) => fs.existsSync(p));
if (distPath) {
  console.log(`[FARMINIX SERVER] Serving frontend static assets from: ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback: any non-API route serves index.html
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.warn(`[FARMINIX SERVER WARNING] Frontend dist folder not found. Looked in:`, possibleDistPaths);
}

// 404 for unmatched API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});

// Start Server if run directly as main script
export async function start() {
  await initDatabase();
  return new Promise<void>((resolve) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`  🌾 Farminix Full-Stack Server Active`);
      console.log(`  🚀 Port: http://0.0.0.0:${PORT}`);
      console.log(`  🗄️  Database: ${isUsingPostgres() ? 'PostgreSQL (Active SQL Tables)' : 'In-Memory / Fallback Storage'}`);
      console.log(`=======================================================`);
      resolve();
    });
  });
}

const isMainModule = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));
if (isMainModule && process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('[FATAL SERVER START ERROR]:', err);
    process.exit(1);
  });
}

export default app;
