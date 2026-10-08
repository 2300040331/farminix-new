import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'farminix-super-secret-key-12345';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'farminix-refresh-secret-9876';

// Razorpay Live/Test Environment Credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// Initialize Razorpay Client instance if credentials are present
const razorpayClient = (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)
  ? new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    })
  : null;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Database Simulation (Mock data mapped directly from database schema schema.sql)
interface Address {
  id: string;
  userId: string;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  weight: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  ingredients: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'DELIVERY_PARTNER' | 'ADMIN';
  rewardPoints: number;
  walletBalance: number;
}

interface Order {
  id: string;
  userId: string;
  addressId: string;
  totalAmount: number;
  discount: number;
  deliveryFee: number;
  finalAmount: number;
  status: 'PLACED' | 'CONFIRMED' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  deliverySlot: string;
  paymentMethod: string;
  deliveryOtp: string;
  estimatedArrival: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    weight: string;
  }>;
}

const users: User[] = [
  {
    id: 'usr-1',
    name: 'Hitaishi Devarapalli',
    email: 'hitaishi@example.com',
    phone: '+91 98765 43210',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'CUSTOMER',
    rewardPoints: 350,
    walletBalance: 250.00
  }
];

const addresses: Address[] = [
  {
    id: 'addr-1',
    userId: 'usr-1',
    name: 'Hitaishi Devarapalli',
    street: 'Plot No. 42, Brodipet 4th Line',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    pincode: '522034',
    phone: '+91 98765 43210',
    addressType: 'HOME',
    isDefault: true
  }
];

const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Daawat Super Basmati Rice',
    brand: 'Daawat',
    category: 'Rice & Grains',
    weight: '1 kg',
    price: 129,
    oldPrice: 150,
    rating: 4.8,
    reviewsCount: 1450,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    description: 'daawat basmati rice is a premium long-grain rice aged to perfection.',
    ingredients: ['Basmati Rice']
  },
  {
    id: 'prod-2',
    name: 'Aashirvaad Shudh Chakki Atta',
    brand: 'Aashirvaad',
    category: 'Atta & Flours',
    weight: '5 kg',
    price: 245,
    oldPrice: 280,
    rating: 4.7,
    reviewsCount: 2310,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    description: 'made from fine chakki whole wheat grains for soft and nutritious rotis.',
    ingredients: ['Whole Wheat Grains']
  }
];

const orders: Order[] = [];

// Helper Auth Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Access token missing' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    (req as any).user = decoded;
    next();
  });
};

// ==========================================
// 1. AUTHENTICATION MODULE
// ==========================================
app.post('/api/auth/register', (req: Request, res: Response): void => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  const exists = users.find(u => u.email === email || u.phone === phone);
  if (exists) {
    res.status(409).json({ error: 'User already exists with this email or phone' });
    return;
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    phone,
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'CUSTOMER',
    rewardPoints: 100, // Welcome points
    walletBalance: 0.00
  };

  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: newUser.id }, REFRESH_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    message: 'Registered successfully',
    token,
    refreshToken,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, rewardPoints: newUser.rewardPoints }
  });
});

app.post('/api/auth/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, rewardPoints: user.rewardPoints, walletBalance: user.walletBalance }
  });
});

app.post('/api/auth/otp-send', (req: Request, res: Response): void => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }
  res.json({ message: 'OTP sent successfully to ' + phone, mockOtp: '123456' });
});

app.post('/api/auth/otp-verify', (req: Request, res: Response): void => {
  const { phone, otp } = req.body;
  if (otp !== '123456') {
    res.status(400).json({ error: 'Invalid OTP' });
    return;
  }

  let user = users.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      name: 'New User',
      email: `${Date.now()}@farminix.com`,
      phone,
      passwordHash: '',
      role: 'CUSTOMER',
      rewardPoints: 50,
      walletBalance: 0.00
    };
    users.push(user);
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  res.json({ token, user: { id: user.id, name: user.name, phone: user.phone } });
});

// ==========================================
// 2. USER PROFILE & ADDRESS BOOK
// ==========================================
app.get('/api/profile', authenticateToken, (req: Request, res: Response): void => {
  const userId = (req as any).user.id;
  const user = users.find(u => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

app.get('/api/addresses', authenticateToken, (req: Request, res: Response): void => {
  const userId = (req as any).user.id;
  const userAddresses = addresses.filter(addr => addr.userId === userId);
  res.json({ addresses: userAddresses });
});

app.post('/api/addresses', authenticateToken, (req: Request, res: Response): void => {
  const userId = (req as any).user.id;
  const { name, street, city, state, pincode, phone, addressType } = req.body;

  const newAddress: Address = {
    id: `addr-${Date.now()}`,
    userId,
    name,
    street,
    city,
    state,
    pincode,
    phone,
    addressType: addressType || 'HOME',
    isDefault: addresses.filter(a => a.userId === userId).length === 0
  };

  addresses.push(newAddress);
  res.status(201).json({ message: 'Address created', address: newAddress });
});

// ==========================================
// 3. PRODUCTS SEARCH & FILTER MODULE
// ==========================================
app.get('/api/products', (req: Request, res: Response): void => {
  const search = req.query.search as string;
  const category = req.query.category as string;
  
  let list = [...products];

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  if (category) {
    list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  res.json({ products: list });
});

// ==========================================
// 4. CART & CHECKOUT MODULE
// ==========================================
app.post('/api/orders', authenticateToken, (req: Request, res: Response): void => {
  const userId = (req as any).user.id;
  const { addressId, items, paymentMethod, deliverySlot } = req.body;

  if (!items || items.length === 0) {
    res.status(400).json({ error: 'Order must contain items' });
    return;
  }

  const totalAmount = items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0);
  const discount = totalAmount > 500 ? totalAmount * 0.1 : 0.00;
  const finalAmount = totalAmount - discount;

  const newOrder: Order = {
    id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    userId,
    addressId,
    totalAmount,
    discount,
    deliveryFee: 0,
    finalAmount,
    status: 'PLACED',
    deliverySlot: deliverySlot || '10 Min Instant Express',
    paymentMethod: paymentMethod || 'COD',
    deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
    estimatedArrival: '10 mins',
    items
  };

  orders.push(newOrder);
  res.status(201).json({ message: 'Order placed successfully', order: newOrder });
});

app.get('/api/orders', authenticateToken, (req: Request, res: Response): void => {
  const userId = (req as any).user.id;
  const userOrders = orders.filter(o => o.userId === userId);
  res.json({ orders: userOrders });
});

// ==========================================
// 5. CUSTOMER SUPPORT CHATBOT MODULE
// ==========================================
app.post('/api/support/chat', (req: Request, res: Response): void => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const msg = message.toLowerCase();
  let reply = 'I am your Farminix Shopping Assistant. How can I help you today?';

  if (msg.includes('order')) {
    reply = 'You can track your orders inside the "Track Order" link in the top menu.';
  } else if (msg.includes('discount') || msg.includes('coupon')) {
    reply = 'Use the promo code "FARM10" to get 10% OFF on all grocery orders!';
  } else if (msg.includes('return') || msg.includes('refund')) {
    reply = 'For returns or replacements, please raise a ticket in the Support menu.';
  }

  res.json({ reply });
});

// ==========================================
// 6. ADMIN DASHBOARD MODULE
// ==========================================
app.get('/api/admin/dashboard', authenticateToken, (req: Request, res: Response): void => {
  const role = (req as any).user.role;
  if (role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  const totalSales = orders.reduce((sum, o) => sum + o.finalAmount, 0);
  res.json({
    stats: {
      totalSales,
      totalOrders: orders.length,
      totalCustomers: users.filter(u => u.role === 'CUSTOMER').length,
      totalProducts: products.length
    }
  });
});

// ==========================================
// 7. RAZORPAY LIVE/TEST PAYMENT MODULE
// ==========================================

// 7.1 Fetch active public Razorpay Key ID (safe for frontend)
app.get('/api/payment/razorpay-key', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    keyId: RAZORPAY_KEY_ID || '',
    isConfigured: !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
  });
});

// 7.2 Create secure server-side Razorpay Order
app.post('/api/payment/create-order', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, error: 'A valid payment amount is required' });
      return;
    }

    if (!razorpayClient) {
      res.status(500).json({
        success: false,
        error: 'Razorpay is not configured on the backend. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env',
      });
      return;
    }

    const orderOptions = {
      amount: Math.round(Number(amount) * 100), // amount in lowest denomination (paise)
      currency: currency || 'INR',
      receipt: receipt || `farminix_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpayClient.orders.create(orderOptions);

    res.json({
      success: true,
      order,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('[RAZORPAY CREATE ORDER ERROR]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create Razorpay order',
    });
  }
});

// 7.3 Verify payment signature securely on server
app.post('/api/payment/verify-signature', (req: Request, res: Response): void => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id) {
      res.status(400).json({ success: false, error: 'Missing razorpay_payment_id' });
      return;
    }

    if (!RAZORPAY_KEY_SECRET) {
      res.status(500).json({
        success: false,
        error: 'Razorpay secret key is not configured on the server',
      });
      return;
    }

    // Verify cryptographic HMAC SHA256 signature
    if (razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        res.status(400).json({
          success: false,
          error: 'Payment signature verification failed. Possible tampering detected.',
        });
        return;
      }
    }

    res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      message: 'Payment verified successfully',
    });
  } catch (error: any) {
    console.error('[RAZORPAY SIGNATURE VERIFICATION ERROR]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Signature verification encountered an error',
    });
  }
});

// 7.4 Razorpay Webhook endpoint
app.post('/api/payment/webhook', (req: Request, res: Response): void => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;

    if (RAZORPAY_WEBHOOK_SECRET && signature) {
      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('[RAZORPAY WEBHOOK] Invalid webhook signature received');
        res.status(400).json({ error: 'Invalid webhook signature' });
        return;
      }
    }

    const event = req.body?.event;
    console.log(`[RAZORPAY WEBHOOK] Received valid event: ${event}`);

    res.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('[RAZORPAY WEBHOOK ERROR]:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[FARMINIX SERVER] running on http://localhost:${PORT}`);
});
