import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read database connection settings
const DATABASE_URL = process.env.DATABASE_URL || '';
const PGHOST = process.env.PGHOST || 'localhost';
const PGPORT = parseInt(process.env.PGPORT || '5432', 10);
const PGUSER = process.env.PGUSER || 'postgres';
const PGPASSWORD = process.env.PGPASSWORD || '';
const PGDATABASE = process.env.PGDATABASE || 'farminix_db';

let pool: pg.Pool | null = null;
let usePostgres = false;

// In-memory fallback storage in case PostgreSQL is temporarily unavailable
interface FallbackStore {
  siteConfig: Map<string, { config: any; inventoryRevision: number; updatedAt: Date }>;
  products: Map<string, any>;
  categories: Map<string, any>;
  orders: Map<string, any>;
  orderItems: any[];
  enquiries: Map<string, any>;
  users: Map<string, any>;
  addresses: Map<string, any>;
  adminSessions: Map<string, { token: string; expiresAt: number }>;
}

const fallback: FallbackStore = {
  siteConfig: new Map(),
  products: new Map(),
  categories: new Map(),
  orders: new Map(),
  orderItems: [],
  enquiries: new Map(),
  users: new Map(),
  addresses: new Map(),
  adminSessions: new Map(),
};

/**
 * Initialize connection pool to PostgreSQL
 */
export async function initDatabase(): Promise<boolean> {
  const hasPgConfig = Boolean(DATABASE_URL || process.env.PGHOST || process.env.PGDATABASE);

  if (!hasPgConfig) {
    console.log('[DB] No DATABASE_URL or PGHOST provided. Initializing in self-contained fallback mode.');
    seedInitialData();
    return false;
  }

  try {
    pool = DATABASE_URL
      ? new Pool({
          connectionString: DATABASE_URL,
          ssl: DATABASE_URL.includes('sslmode=require') || DATABASE_URL.includes('supabase') || DATABASE_URL.includes('neon')
            ? { rejectUnauthorized: false }
            : false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        })
      : new Pool({
          host: PGHOST,
          port: PGPORT,
          user: PGUSER,
          password: PGPASSWORD,
          database: PGDATABASE,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle client:', err.message);
    });

    // Test connection
    const client = await pool.connect();
    try {
      console.log('[DB] Connected successfully to PostgreSQL.');
      usePostgres = true;

      // Apply schema migrations
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('[DB] SQL schema tables verified/created successfully.');
      }

      // Check if products and site_config exist, auto-seed if empty
      const configRes = await client.query('SELECT key FROM site_config LIMIT 1');
      if (configRes.rowCount === 0) {
        console.log('[DB] Fresh database detected. Seeding initial store configuration...');
        await seedPostgresData(client);
      }
    } finally {
      client.release();
    }

    return true;
  } catch (error: any) {
    console.warn(`[DB WARNING] PostgreSQL connection failed (${error.message}). Running with resilient fallback storage.`);
    console.warn('[DB WARNING] To use live PostgreSQL on KVM2, verify DATABASE_URL in .env and run: psql -U postgres -d farminix_db -f schema.sql');
    usePostgres = false;
    seedInitialData();
    return false;
  }
}

/**
 * Execute a SQL query (routes to PostgreSQL or fallback)
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<{ rows: T[]; rowCount: number }> {
  if (usePostgres && pool) {
    try {
      const res = await pool.query(sql, params);
      return { rows: res.rows, rowCount: res.rowCount || 0 };
    } catch (err: any) {
      console.error('[DB QUERY ERROR]:', err.message, 'SQL:', sql);
      throw err;
    }
  }

  // Resilient fallback query emulation
  return executeFallbackQuery<T>(sql, params);
}

/**
 * Execute an atomic transaction
 */
export async function transaction<T>(callback: (client: pg.PoolClient | any) => Promise<T>): Promise<T> {
  if (usePostgres && pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Fallback transaction
  return await callback({
    query: async (sql: string, params: any[] = []) => executeFallbackQuery(sql, params),
  });
}

export function isUsingPostgres(): boolean {
  return usePostgres;
}

// ------------------------------------------------------------
// Initial Seed Data
// ------------------------------------------------------------
const defaultRiceProduct = {
  id: 'r1',
  name: 'Farminix Family Choice Rice',
  category: 'Rice & Grains',
  price: 2100,
  oldPrice: 3000,
  discountPercentage: 30,
  weight: '26 Kg',
  weightOptions: ['26 Kg'],
  image: '/farminix_rice_front.png',
  galleryImages: ['/farminix_rice_back.png'],
  deliveryTime: 'Express Delivery (10-30 Mins)',
  inStock: true,
  stockCount: 150,
  brand: 'Farminix',
  description: "Farminix Signature Family Choice Rice is safely selected from quality harvests across India's fertile rice-growing regions.",
  ingredients: ['100% Quality Harvest Milled Rice (Premium Select Grains)'],
  badges: ['Farminix Official', '100% Genuine', 'Direct from Mill', '26 Kg Family Bag'],
  enabled: true,
};

const defaultCategory = {
  id: 'rice',
  name: 'Rice & Grains',
  image: '/farminix_rice_front.png',
  itemCount: 1,
  enabled: true,
};

const defaultInitialConfig = {
  theme: {
    colorPrimary: '#7C3AED',
    colorPrimaryHover: '#6D28D9',
    colorSecondary: '#15803D',
    colorSecondaryHover: '#166534',
    colorAccent: '#EA580C',
    colorBackground: '#F8FAFC',
    colorSurface: '#FFFFFF',
    colorTextPrimary: '#0F172A',
    colorTextMuted: '#64748B',
    colorBorder: '#E2E8F0',
  },
  products: [defaultRiceProduct],
  categories: [defaultCategory],
  cart: {
    couponsEnabled: true,
    handlingFee: 3,
    deliveryFee: 40,
    freeDeliveryThreshold: 500,
    coupons: [
      { code: 'FARM10', discountPercentage: 10, minimumSpend: 500, description: '10% OFF on orders over ₹500', enabled: true },
    ],
  },
  checkoutPayment: {
    paymentMethods: [
      { id: 'cod', name: 'Cash on Delivery (COD)', subtitle: 'Pay in cash or UPI when your bag arrives', icon: 'Banknote', enabled: true },
      { id: 'online', name: 'Instant Online Payment', subtitle: 'UPI Apps, Credit/Debit Cards, Net Banking', icon: 'ShieldCheck', enabled: true },
    ],
  },
  inventoryRevision: 0,
};

function seedInitialData() {
  fallback.siteConfig.set('farminix:site-config:v1', {
    config: defaultInitialConfig,
    inventoryRevision: 0,
    updatedAt: new Date(),
  });
  fallback.products.set(defaultRiceProduct.id, {
    ...defaultRiceProduct,
    stock_qty: defaultRiceProduct.stockCount,
  });
  fallback.categories.set(defaultCategory.id, defaultCategory);
  console.log('[DB] Fallback storage seeded with catalog and products.');
}

async function seedPostgresData(client: pg.PoolClient) {
  try {
    await client.query(
      `INSERT INTO site_config (key, config, inventory_revision, updated_at) 
       VALUES ($1, $2, $3, NOW()) 
       ON CONFLICT (key) DO NOTHING`,
      ['farminix:site-config:v1', JSON.stringify(defaultInitialConfig), 0]
    );

    await client.query(
      `INSERT INTO categories (id, name, image, item_count, enabled)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [defaultCategory.id, defaultCategory.name, defaultCategory.image, defaultCategory.itemCount, true]
    );

    await client.query(
      `INSERT INTO products (id, name, brand, category, weight, price, old_price, discount_percentage, image_url, description, stock_qty, in_stock, enabled, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING`,
      [
        defaultRiceProduct.id,
        defaultRiceProduct.name,
        defaultRiceProduct.brand,
        defaultRiceProduct.category,
        defaultRiceProduct.weight,
        defaultRiceProduct.price,
        defaultRiceProduct.oldPrice,
        defaultRiceProduct.discountPercentage,
        defaultRiceProduct.image,
        defaultRiceProduct.description,
        defaultRiceProduct.stockCount,
        true,
        true,
        JSON.stringify(defaultRiceProduct),
      ]
    );

    console.log('[DB] PostgreSQL seeded successfully.');
  } catch (err: any) {
    console.warn('[DB] Seeding error:', err.message);
  }
}

// ------------------------------------------------------------
// Resilient In-Memory SQL Emulator for Dev / Offline Fallback
// ------------------------------------------------------------
function executeFallbackQuery<T>(sql: string, params: any[]): { rows: T[]; rowCount: number } {
  const normalized = sql.trim().toUpperCase();

  // 1. SELECT site_config
  if (normalized.startsWith('SELECT') && normalized.includes('FROM SITE_CONFIG')) {
    const key = params[0] || 'farminix:site-config:v1';
    const entry = fallback.siteConfig.get(key);
    if (!entry) return { rows: [], rowCount: 0 };
    return {
      rows: [{ key, config: entry.config, inventory_revision: entry.inventoryRevision, updated_at: entry.updatedAt }] as any,
      rowCount: 1,
    };
  }

  // 2. INSERT / UPDATE site_config
  if (normalized.startsWith('INSERT INTO SITE_CONFIG') || normalized.startsWith('UPDATE SITE_CONFIG')) {
    const key = params[0] || 'farminix:site-config:v1';
    const config = typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1];
    const revision = Number(params[2]) || 0;
    fallback.siteConfig.set(key, { config, inventoryRevision: revision, updatedAt: new Date() });
    return { rows: [{ key, config, inventory_revision: revision }] as any, rowCount: 1 };
  }

  // 3. SELECT products
  if (normalized.startsWith('SELECT') && normalized.includes('FROM PRODUCTS')) {
    let list = Array.from(fallback.products.values());
    if (params.length === 1 && typeof params[0] === 'string') {
      const p = fallback.products.get(params[0]);
      return { rows: p ? [p] : [] as any, rowCount: p ? 1 : 0 };
    }
    return { rows: list as any, rowCount: list.length };
  }

  // 4. UPDATE products stock
  if (normalized.startsWith('UPDATE PRODUCTS') && normalized.includes('STOCK_QTY')) {
    const qty = Number(params[0]);
    const id = params[1];
    const p = fallback.products.get(id);
    if (p) {
      p.stock_qty = Math.max(0, (p.stock_qty || p.stockCount || 0) - qty);
      p.stockCount = p.stock_qty;
      p.in_stock = p.stock_qty > 0;
      fallback.products.set(id, p);
      return { rows: [p] as any, rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 5. INSERT INTO orders
  if (normalized.startsWith('INSERT INTO ORDERS')) {
    const orderId = params[0];
    const requestId = params[1];
    const customerName = params[2];
    const customerPhone = params[3];
    const customerEmail = params[4];
    const deliveryAddress = typeof params[5] === 'string' ? JSON.parse(params[5]) : params[5];
    const items = typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6];
    const totalAmount = Number(params[7]);
    const discountAmount = Number(params[8]);
    const deliveryFee = Number(params[9]);
    const handlingFee = Number(params[10]);
    const finalAmount = Number(params[11]);
    const couponCode = params[12];
    const status = params[13] || 'Order Received';
    const paymentMethod = params[14] || 'COD';
    const paymentDetails = params[15] ? (typeof params[15] === 'string' ? JSON.parse(params[15]) : params[15]) : null;

    const orderRecord = {
      id: orderId,
      request_id: requestId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      delivery_address: deliveryAddress,
      items,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      delivery_fee: deliveryFee,
      handling_fee: handlingFee,
      final_amount: finalAmount,
      coupon_code: couponCode,
      status,
      payment_method: paymentMethod,
      payment_details: paymentDetails,
      created_at: new Date(),
      updated_at: new Date(),
    };

    fallback.orders.set(orderId, orderRecord);
    return { rows: [orderRecord] as any, rowCount: 1 };
  }

  // 6. SELECT orders
  if (normalized.startsWith('SELECT') && normalized.includes('FROM ORDERS')) {
    if (normalized.includes('REQUEST_ID = $1')) {
      const match = Array.from(fallback.orders.values()).find((o) => o.request_id === params[0]);
      return { rows: match ? [match] : [] as any, rowCount: match ? 1 : 0 };
    }
    if (normalized.includes('ID = $1')) {
      const match = fallback.orders.get(params[0]);
      return { rows: match ? [match] : [] as any, rowCount: match ? 1 : 0 };
    }
    const list = Array.from(fallback.orders.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return { rows: list as any, rowCount: list.length };
  }

  // 7. UPDATE orders status
  if (normalized.startsWith('UPDATE ORDERS') && normalized.includes('SET STATUS')) {
    const status = params[0];
    const id = params[1];
    const o = fallback.orders.get(id);
    if (o) {
      o.status = status;
      o.updated_at = new Date();
      fallback.orders.set(id, o);
      return { rows: [o] as any, rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 8. INSERT INTO customer_enquiries
  if (normalized.startsWith('INSERT INTO CUSTOMER_ENQUIRIES')) {
    const id = params[0];
    const name = params[1];
    const mobile = params[2];
    const email = params[3];
    const message = params[4];
    const kind = params[5];
    const enquiry = {
      id,
      name,
      mobile,
      email,
      message,
      kind,
      status: 'new',
      admin_notes: '',
      created_at: new Date(),
      deleted_at: null,
    };
    fallback.enquiries.set(id, enquiry);
    return { rows: [enquiry] as any, rowCount: 1 };
  }

  // 9. SELECT customer_enquiries
  if (normalized.startsWith('SELECT') && normalized.includes('FROM CUSTOMER_ENQUIRIES')) {
    let list = Array.from(fallback.enquiries.values());
    if (normalized.includes('DELETED_AT IS NOT NULL')) {
      list = list.filter((e) => e.deleted_at !== null);
    } else if (normalized.includes('DELETED_AT IS NULL')) {
      list = list.filter((e) => e.deleted_at === null);
    }
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { rows: list as any, rowCount: list.length };
  }

  // 10. UPDATE customer_enquiries
  if (normalized.startsWith('UPDATE CUSTOMER_ENQUIRIES')) {
    const id = params[params.length - 1];
    const e = fallback.enquiries.get(id);
    if (e) {
      if (normalized.includes('DELETED_AT = NULL')) {
        e.deleted_at = null;
      } else if (normalized.includes('DELETED_AT = NOW()') || normalized.includes('DELETED_AT = $1')) {
        e.deleted_at = new Date();
      }
      if (normalized.includes('STATUS = $1')) {
        e.status = params[0];
        e.admin_notes = params[1] || e.admin_notes;
      }
      fallback.enquiries.set(id, e);
      return { rows: [e] as any, rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 11. USERS fallback
  if (normalized.startsWith('INSERT INTO USERS')) {
    const id = params[0];
    const name = params[1];
    const email = params[2];
    const phone = params[3];
    const password_hash = params[4];
    const role = params[5] || 'CUSTOMER';
    const reward_points = Number(params[6]) || 0;
    const wallet_balance = Number(params[7]) || 0;
    const is_verified = params[8] !== false;

    const userRecord = {
      id,
      name,
      email,
      phone,
      password_hash,
      role,
      reward_points,
      wallet_balance,
      is_verified,
      created_at: new Date(),
      updated_at: new Date(),
    };
    fallback.users.set(id, userRecord);
    return { rows: [userRecord] as any, rowCount: 1 };
  }

  if (normalized.includes('FROM USERS')) {
    if (normalized.includes('WHERE EMAIL = $1 OR PHONE = $2')) {
      const match = Array.from(fallback.users.values()).find(
        (u) => u.email === params[0] || u.phone === params[1]
      );
      return { rows: match ? [match] : [] as any, rowCount: match ? 1 : 0 };
    }
    if (normalized.includes('WHERE EMAIL = $1')) {
      const match = Array.from(fallback.users.values()).find((u) => u.email === params[0]);
      return { rows: match ? [match] : [] as any, rowCount: match ? 1 : 0 };
    }
    if (normalized.includes('WHERE PHONE = $1')) {
      const match = Array.from(fallback.users.values()).find((u) => u.phone === params[0]);
      return { rows: match ? [match] : [] as any, rowCount: match ? 1 : 0 };
    }
    if (normalized.includes('WHERE ID = $1')) {
      const match = fallback.users.get(params[0]);
      return { rows: match ? [match] : [] as any, rowCount: match ? 1 : 0 };
    }
    const list = Array.from(fallback.users.values());
    return { rows: list as any, rowCount: list.length };
  }

  // 12. USER_ADDRESSES fallback
  if (normalized.startsWith('INSERT INTO USER_ADDRESSES')) {
    const id = params[0];
    const user_id = params[1];
    const addr = {
      id,
      user_id,
      name: params[2],
      street: params[3],
      city: params[4],
      state: params[5],
      pincode: params[6],
      phone: params[7],
      address_type: params[8] || 'HOME',
      is_default: Boolean(params[9]),
      created_at: new Date(),
    };
    fallback.addresses.set(id, addr);
    return { rows: [addr] as any, rowCount: 1 };
  }

  if (normalized.includes('FROM USER_ADDRESSES')) {
    const userId = params[0];
    const list = Array.from(fallback.addresses.values()).filter((a) => a.user_id === userId);
    return { rows: list as any, rowCount: list.length };
  }

  return { rows: [], rowCount: 0 };
}
