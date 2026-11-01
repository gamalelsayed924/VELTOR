import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'veltor.db');
const RECEIPTS_DIR = path.resolve(process.cwd(), 'data', 'receipts');

if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high performance and integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  // 1. Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_ar TEXT NOT NULL,
      description_en TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EGP',
      category_ar TEXT NOT NULL DEFAULT 'لوحات سيارات بإطار',
      category_en TEXT NOT NULL DEFAULT 'Framed Automotive Posters',
      image TEXT NOT NULL,
      secondary_image TEXT,
      size_ar TEXT,
      size_en TEXT,
      orientation_ar TEXT DEFAULT 'عمودي',
      orientation_en TEXT DEFAULT 'Vertical',
      frame_ar TEXT DEFAULT 'أسود',
      frame_en TEXT DEFAULT 'Black',
      quantity_per_set_ar TEXT DEFAULT 'قطعة واحدة',
      quantity_per_set_en TEXT DEFAULT '1 piece',
      seo_title_ar TEXT,
      seo_title_en TEXT,
      seo_description_ar TEXT,
      seo_description_en TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 3. Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_ref TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_whatsapp TEXT,
      governorate TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      delivery_instructions TEXT,
      subtotal REAL NOT NULL,
      shipping_fee REAL NOT NULL,
      total_amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EGP',
      item_count INTEGER NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'vodafone_cash',
      payment_status TEXT NOT NULL DEFAULT 'awaiting_payment',
      order_status TEXT NOT NULL DEFAULT 'new',
      receipt_id TEXT,
      payment_verified_at TEXT,
      payment_verified_by TEXT,
      rejection_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 4. Order Items Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_slug TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      image TEXT NOT NULL,
      size TEXT,
      frame TEXT
    );
  `);

  // 5. Receipts Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      file_path TEXT NOT NULL,
      file_mime TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_at TEXT NOT NULL,
      uploaded_by_ip TEXT
    );
  `);

  // 6. Admins Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );
  `);

  // 7. Admin Sessions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 8. Customers Table (for regular customer accounts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL
    );
  `);

  // 9. Customer Sessions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customer_sessions (
      token TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 10. Admin Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 9. Notification Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_logs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      created_at TEXT NOT NULL
    );
  `);

  seedInitialData();
}

// Password hashing helpers using secure node:crypto scrypt
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
}

function seedInitialData() {
  const now = new Date().toISOString();

  // Seed Default Settings
  const defaultSettings: Record<string, string> = {
    shipping_fee_per_item: '25',
    vodafone_cash_number: '01040283853',
    whatsapp_number: '01285938198',
    admin_email: 'gex92012@gmail.com',
  };

  const getSettingStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const insertSettingStmt = db.prepare(
    'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)'
  );

  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = getSettingStmt.get(key);
    if (!existing) {
      insertSettingStmt.run(key, value, now);
    }
  }

  // Seed Initial Admin (gex92012@gmail.com / GEMY2012)
  const getAdminStmt = db.prepare('SELECT id FROM admins WHERE email = ?');
  const existingAdmin = getAdminStmt.get('gex92012@gmail.com');
  if (!existingAdmin) {
    const { hash, salt } = hashPassword('GEMY2012');
    const insertAdminStmt = db.prepare(`
      INSERT INTO admins (id, email, password_hash, salt, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertAdminStmt.run(
      crypto.randomUUID(),
      'gex92012@gmail.com',
      hash,
      salt,
      'admin',
      now
    );
  }

  // Seed Initial Demo Customer for testing (client@veltor.eg / VELTOR2026)
  const getCustomerStmt = db.prepare('SELECT id FROM customers WHERE email = ?');
  const existingCustomer = getCustomerStmt.get('client@veltor.eg');
  if (!existingCustomer) {
    const { hash, salt } = hashPassword('VELTOR2026');
    const insertCustomerStmt = db.prepare(`
      INSERT INTO customers (id, email, password_hash, salt, name, phone, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertCustomerStmt.run(
      crypto.randomUUID(),
      'client@veltor.eg',
      hash,
      salt,
      'أحمد ممدوح',
      '01012345678',
      'customer',
      now
    );
  }

  // Seed 5 Real Products
  const seedProducts = [
    {
      id: 'prod-01-supra',
      slug: 'toyota-supra-mk4-graffiti-poster',
      name_ar: 'لوحة تويوتا سوبرا MK4 – جرافيتي سماوي',
      name_en: 'Toyota Supra MK4 – Cyan Graffiti Framed Poster',
      description_ar:
        'لوحة بتصميم جرافيتي نابض بدرجات السماوي، تتوسطها تويوتا سوبرا MK4 في مشهد ليلي حضري. إطار أسود أنيق ومقاس عمودي 20×30 سم.',
      description_en:
        'A vibrant cyan graffiti design featuring the Toyota Supra MK4 in an urban night scene, presented in a black frame measuring 20×30 cm in portrait orientation.',
      price: 499,
      currency: 'EGP',
      category_ar: 'لوحات سيارات بإطار',
      category_en: 'Framed Automotive Posters',
      image: '/images/products/toyota_supra_mk4_graffiti.webp',
      secondary_image: '/src/assets/images/hero_automotive_gallery_1793368162924.jpg',
      size_ar: '20×30 سم',
      size_en: '20×30 cm',
      orientation_ar: 'عمودي',
      orientation_en: 'Vertical',
      frame_ar: 'أسود',
      frame_en: 'Black',
      quantity_per_set_ar: 'قطعة واحدة',
      quantity_per_set_en: '1 piece',
      seo_title_ar: 'لوحة تويوتا سوبرا MK4 – جرافيتي سماوي | VELTOR',
      seo_title_en: 'Toyota Supra MK4 – Cyan Graffiti Framed Poster | VELTOR',
      seo_description_ar:
        'لوحة بتصميم جرافيتي نابض بدرجات السماوي، تتوسطها تويوتا سوبرا MK4 في مشهد ليلي حضري.',
      seo_description_en:
        'A vibrant cyan graffiti design featuring the Toyota Supra MK4 in an urban night scene.',
      status: 'published',
    },
    {
      id: 'prod-02-bmw-e46',
      slug: 'bmw-e46-devil-poster',
      name_ar: 'لوحة بي إم دبليو E46 – DEVIL',
      name_en: 'BMW E46 "Devil" Framed Poster – Black & Red',
      description_ar:
        'لوحة داكنة تبرز بي إم دبليو E46 بعيون حمراء مضيئة وخط "DEVIL" الأحمر الجريء. إطار أسود ومقاس عمودي حوالي 20×30 سم.',
      description_en:
        'A dark BMW E46 artwork featuring glowing red eyes and bold red "DEVIL" lettering, presented in a black frame measuring approximately 20×30 cm in portrait orientation.',
      price: 499,
      currency: 'EGP',
      category_ar: 'لوحات سيارات بإطار',
      category_en: 'Framed Automotive Posters',
      image: '/images/products/bmw_e46_devil.webp',
      secondary_image: '/src/assets/images/hero_automotive_gallery_1793368162924.jpg',
      size_ar: 'حوالي 20×30 سم',
      size_en: 'Approximately 20×30 cm',
      orientation_ar: 'عمودي',
      orientation_en: 'Vertical',
      frame_ar: 'أسود',
      frame_en: 'Black',
      quantity_per_set_ar: 'قطعة واحدة',
      quantity_per_set_en: '1 piece',
      seo_title_ar: 'لوحة بي إم دبليو E46 – DEVIL | VELTOR',
      seo_title_en: 'BMW E46 "Devil" Framed Poster – Black & Red | VELTOR',
      seo_description_ar:
        'لوحة داكنة تبرز بي إم دبليو E46 بعيون حمراء مضيئة وخط "DEVIL" الأحمر الجريء.',
      seo_description_en:
        'A dark BMW E46 artwork featuring glowing red eyes and bold red "DEVIL" lettering.',
      status: 'published',
    },
    {
      id: 'prod-03-porsche-yellow',
      slug: 'porsche-911-gt3-rs-yellow-poster',
      name_ar: 'لوحة بورش 911 GT3 RS الصفراء',
      name_en: 'Porsche 911 GT3 RS – Yellow Framed Poster',
      description_ar:
        'لوحة بورش 911 GT3 RS بدرجات الأصفر مع رقم 911 الأحمر الكبير في الخلفية. إطار أسود ومقاس عمودي 30×40 سم.',
      description_en:
        'A yellow-toned Porsche 911 GT3 RS artwork featuring a large red 911 number in the background, presented in a black frame measuring 30×40 cm in portrait orientation.',
      price: 499,
      currency: 'EGP',
      category_ar: 'لوحات سيارات بإطار',
      category_en: 'Framed Automotive Posters',
      image: '/images/products/porsche_911_gt3_rs_yellow.webp',
      secondary_image: '/src/assets/images/hero_automotive_gallery_1793368162924.jpg',
      size_ar: '30×40 سم',
      size_en: '30×40 cm',
      orientation_ar: 'عمودي',
      orientation_en: 'Vertical',
      frame_ar: 'أسود',
      frame_en: 'Black',
      quantity_per_set_ar: 'قطعة واحدة',
      quantity_per_set_en: '1 piece',
      seo_title_ar: 'لوحة بورش 911 GT3 RS الصفراء | VELTOR',
      seo_title_en: 'Porsche 911 GT3 RS – Yellow Framed Poster | VELTOR',
      seo_description_ar:
        'لوحة بورش 911 GT3 RS بدرجات الأصفر مع رقم 911 الأحمر الكبير في الخلفية.',
      seo_description_en:
        'A yellow-toned Porsche 911 GT3 RS artwork featuring a large red 911 number in the background.',
      status: 'published',
    },
    {
      id: 'prod-04-porsche-dark',
      slug: 'porsche-911-gt3-rs-dark-poster',
      name_ar: 'لوحة بورش 911 GT3 RS – رمادي داكن',
      name_en: 'Porsche 911 GT3 RS – Dark Grey Framed Poster',
      description_ar:
        'تصميم داكن ومينيمالي يجمع اسم PORSCHE وطراز 911 GT3 RS بخطوط مائلة مع سيارة بلون الفحم داخل إطار أسود.',
      description_en:
        'A dark, minimalist design combining PORSCHE lettering and the 911 GT3 RS model name in diagonal typography, featuring a charcoal-colored car inside a black frame.',
      price: 550,
      currency: 'EGP',
      category_ar: 'لوحات سيارات بإطار',
      category_en: 'Framed Automotive Posters',
      image: '/images/products/porsche_911_gt3_rs_dark.webp',
      secondary_image: '/src/assets/images/hero_automotive_gallery_1793368162924.jpg',
      // CRITICAL REQUIREMENT: Size is unknown. Leave empty and hide in storefront until supplied!
      size_ar: '',
      size_en: '',
      orientation_ar: 'عمودي',
      orientation_en: 'Vertical',
      frame_ar: 'أسود',
      frame_en: 'Black',
      quantity_per_set_ar: 'قطعة واحدة',
      quantity_per_set_en: '1 piece',
      seo_title_ar: 'لوحة بورش 911 GT3 RS – رمادي داكن | VELTOR',
      seo_title_en: 'Porsche 911 GT3 RS – Dark Grey Framed Poster | VELTOR',
      seo_description_ar:
        'تصميم داكن ومينيمالي يجمع اسم PORSCHE وطراز 911 GT3 RS بخطوط مائلة مع سيارة بلون الفحم داخل إطار أسود.',
      seo_description_en:
        'A dark, minimalist design combining PORSCHE lettering and the 911 GT3 RS model name in diagonal typography.',
      status: 'published',
    },
    {
      id: 'prod-05-ferrari-sp3',
      slug: 'ferrari-daytona-sp3-poster',
      name_ar: 'لوحة فيراري ديتونا SP3',
      name_en: 'Ferrari Daytona SP3 – Framed Poster',
      description_ar:
        'لوحة بحرف FERRARI الكبير وفيراري ديتونا SP3 الحمراء في المقدمة. إطار أسود ومقاس عمودي 30×40 سم.',
      description_en:
        'An automotive artwork featuring large FERRARI lettering with the red Ferrari Daytona SP3 prominently displayed in the foreground, presented in a black frame measuring 30×40 cm in portrait orientation.',
      price: 499,
      currency: 'EGP',
      category_ar: 'لوحات سيارات بإطار',
      category_en: 'Framed Automotive Posters',
      image: '/images/products/ferrari_daytona_sp3.webp',
      secondary_image: '/src/assets/images/hero_automotive_gallery_1793368162924.jpg',
      size_ar: '30×40 سم',
      size_en: '30×40 cm',
      orientation_ar: 'عمودي',
      orientation_en: 'Vertical',
      frame_ar: 'أسود',
      frame_en: 'Black',
      quantity_per_set_ar: 'قطعة واحدة',
      quantity_per_set_en: '1 piece',
      seo_title_ar: 'لوحة فيراري ديتونا SP3 | VELTOR',
      seo_title_en: 'Ferrari Daytona SP3 – Framed Poster | VELTOR',
      seo_description_ar:
        'لوحة بحرف FERRARI الكبير وفيراري ديتونا SP3 الحمراء في المقدمة.',
      seo_description_en:
        'An automotive artwork featuring large FERRARI lettering with the red Ferrari Daytona SP3 prominently displayed in the foreground.',
      status: 'published',
    },
  ];

  const getProductStmt = db.prepare('SELECT id FROM products WHERE slug = ?');
  const insertProductStmt = db.prepare(`
    INSERT INTO products (
      id, slug, name_ar, name_en, description_ar, description_en,
      price, currency, category_ar, category_en, image, secondary_image,
      size_ar, size_en, orientation_ar, orientation_en, frame_ar, frame_en,
      quantity_per_set_ar, quantity_per_set_en, seo_title_ar, seo_title_en,
      seo_description_ar, seo_description_en, status, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  for (const prod of seedProducts) {
    const existing = getProductStmt.get(prod.slug);
    if (!existing) {
      insertProductStmt.run(
        prod.id,
        prod.slug,
        prod.name_ar,
        prod.name_en,
        prod.description_ar,
        prod.description_en,
        prod.price,
        prod.currency,
        prod.category_ar,
        prod.category_en,
        prod.image,
        prod.secondary_image,
        prod.size_ar,
        prod.size_en,
        prod.orientation_ar,
        prod.orientation_en,
        prod.frame_ar,
        prod.frame_en,
        prod.quantity_per_set_ar,
        prod.quantity_per_set_en,
        prod.seo_title_ar,
        prod.seo_title_en,
        prod.seo_description_ar,
        prod.seo_description_en,
        prod.status,
        now,
        now
      );
    }
  }
}

// Generate unique order reference like VLT-2026-8742
export function generateOrderRef(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `VLT-${year}-${randomPart}`;
}
