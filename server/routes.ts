import express, { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, verifyPassword, hashPassword, generateOrderRef } from './db.js';
import { sendOrderNotification, sendReceiptNotification } from './email.js';

export const router = express.Router();
const RECEIPTS_DIR = path.resolve(process.cwd(), 'data', 'receipts');

// -------------------------------------------------------------------
// AUTH MIDDLEWARE FOR ADMIN
// -------------------------------------------------------------------
interface AuthenticatedRequest extends Request {
  admin?: { id: string; email: string; role: string };
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const stmt = db.prepare(`
    SELECT s.token, s.expires_at, a.id, a.email, a.role
    FROM admin_sessions s
    JOIN admins a ON s.admin_id = a.id
    WHERE s.token = ?
  `);
  const session = stmt.get(token) as { token: string; expires_at: string; id: string; email: string; role: string } | undefined;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session not found' });
  }

  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    return res.status(401).json({ error: 'Unauthorized: Session expired' });
  }

  req.admin = { id: session.id, email: session.email, role: session.role };
  next();
}

// -------------------------------------------------------------------
// 1. PUBLIC SETTINGS
// -------------------------------------------------------------------
router.get('/settings', (req, res) => {
  const stmt = db.prepare('SELECT key, value FROM settings');
  const rows = stmt.all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json({
    shipping_fee_per_item: parseFloat(settings.shipping_fee_per_item || '25'),
    vodafone_cash_number: settings.vodafone_cash_number || '01040283853',
    whatsapp_number: settings.whatsapp_number || '01285938198',
  });
});

// -------------------------------------------------------------------
// 2. PUBLIC PRODUCTS
// -------------------------------------------------------------------
router.get('/products', (req, res) => {
  const stmt = db.prepare(`
    SELECT * FROM products
    WHERE status = 'published'
    ORDER BY created_at ASC
  `);
  const products = stmt.all();
  res.json(products);
});

router.get('/products/:slug', (req, res) => {
  const stmt = db.prepare('SELECT * FROM products WHERE slug = ?');
  const product = stmt.get(req.params.slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// -------------------------------------------------------------------
// 3. ORDER CREATION (SERVER-AUTHORITATIVE CALCULATIONS)
// -------------------------------------------------------------------
router.post('/orders', async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_whatsapp,
      governorate,
      city,
      address,
      delivery_instructions,
      items,
      receipt,
    } = req.body;

    // Field Validations
    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!customer_phone || !customer_phone.trim()) {
      return res.status(400).json({ error: 'Customer phone number is required' });
    }

    // Clean phone and check Egyptian format (010, 011, 012, 015 - 11 digits)
    const cleanPhone = customer_phone.trim().replace(/[\s-]/g, '');
    const egPhoneRegex = /^(?:\+?20|0020)?0?1[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        error: 'Invalid Egyptian phone number. Must be a valid mobile number (e.g., 010..., 011..., 012..., 015...).',
      });
    }

    if (!governorate || !governorate.trim()) {
      return res.status(400).json({ error: 'Governorate is required' });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ error: 'City / Area is required' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one product' });
    }

    // MANDATORY RECEIPT VALIDATION: Block order creation if receipt is missing or invalid
    if (!receipt || !receipt.fileData) {
      return res.status(400).json({
        error: 'إرفاق إيصال تحويل فودافون كاش إلزامي قبل تأكيد الطلب.',
        error_en: 'Payment transfer receipt is required before order confirmation.',
        error_code: 'RECEIPT_REQUIRED',
      });
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const detectedMime = (receipt.fileType || 'image/jpeg').toLowerCase();
    if (!allowedMimes.includes(detectedMime)) {
      return res.status(400).json({
        error: 'صيغة الملف غير مدعومة. يرجى رفع صورة بصيغة JPEG أو PNG أو WebP أو ملف PDF.',
        error_en: 'Invalid file format. Please upload JPEG, PNG, WebP, or PDF.',
      });
    }

    // Decode base64 receipt
    let receiptBuffer: Buffer;
    try {
      const base64Data = receipt.fileData.replace(/^data:[a-zA-Z0-9/.-]+;base64,/, '');
      receiptBuffer = Buffer.from(base64Data, 'base64');
    } catch {
      return res.status(400).json({
        error: 'بيانات الملف غير صالحة. يرجى إعادة اختيار ملف الإيصال.',
        error_en: 'Invalid file data encoding.',
      });
    }

    if (!receiptBuffer || receiptBuffer.length === 0) {
      return res.status(400).json({
        error: 'ملف الإيصال فارغ. يرجى التأكد من رفع إيصال صحيح.',
        error_en: 'Receipt file is empty.',
      });
    }

    // Max 10MB limit
    if (receiptBuffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({
        error: 'حجم ملف الإيصال يتجاوز الحد الأقصى (10 ميجابايت).',
        error_en: 'Receipt file exceeds 10MB maximum limit.',
      });
    }

    // Server-side pricing & product validation (never trust client totals!)
    const getProductStmt = db.prepare("SELECT * FROM products WHERE id = ? AND status = 'published'");
    const orderItemsToInsert: Array<{
      productId: string;
      productSlug: string;
      name_ar: string;
      name_en: string;
      price: number;
      quantity: number;
      image: string;
      size: string;
      frame: string;
    }> = [];

    let subtotal = 0;
    let totalItemQuantity = 0;

    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: 'Invalid quantity for product' });
      }

      // Check product by id or slug
      let prod = getProductStmt.get(item.productId) as Record<string, unknown> | undefined;
      if (!prod && item.productSlug) {
        prod = db.prepare("SELECT * FROM products WHERE slug = ? AND status = 'published'").get(item.productSlug) as Record<string, unknown> | undefined;
      }

      if (!prod) {
        return res.status(400).json({ error: `Product not found or unavailable: ${item.productId}` });
      }

      const unitPrice = Number(prod.price);
      subtotal += unitPrice * qty;
      totalItemQuantity += qty;

      orderItemsToInsert.push({
        productId: String(prod.id),
        productSlug: String(prod.slug),
        name_ar: String(prod.name_ar),
        name_en: String(prod.name_en),
        price: unitPrice,
        quantity: qty,
        image: String(prod.image),
        size: item.selectedSize || String(prod.size_ar || ''),
        frame: item.selectedFrame || String(prod.frame_ar || 'أسود'),
      });
    }

    // Fetch dynamic shipping fee per item
    const settingRow = db.prepare("SELECT value FROM settings WHERE key = 'shipping_fee_per_item'").get() as { value: string } | undefined;
    const shippingFeePerItem = settingRow ? parseFloat(settingRow.value) : 25;
    const shippingFee = shippingFeePerItem * totalItemQuantity;
    const totalAmount = subtotal + shippingFee;

    // Unique order reference
    let orderRef = generateOrderRef();
    let collisionCheck = db.prepare('SELECT id FROM orders WHERE order_ref = ?').get(orderRef);
    while (collisionCheck) {
      orderRef = generateOrderRef();
      collisionCheck = db.prepare('SELECT id FROM orders WHERE order_ref = ?').get(orderRef);
    }

    const orderId = crypto.randomUUID();
    const receiptId = crypto.randomUUID();
    const now = new Date().toISOString();
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Save receipt file securely to disk
    const ext = detectedMime === 'image/png' ? 'png' : detectedMime === 'image/webp' ? 'webp' : detectedMime === 'application/pdf' ? 'pdf' : 'jpg';
    const safeFilename = `${receiptId}.${ext}`;
    const targetPath = path.join(RECEIPTS_DIR, safeFilename);
    fs.writeFileSync(targetPath, receiptBuffer);

    // Insert Order with verification_pending (payment MUST remain pending until admin verification)
    const insertOrderStmt = db.prepare(`
      INSERT INTO orders (
        id, order_ref, customer_name, customer_phone, customer_whatsapp,
        governorate, city, address, delivery_instructions,
        subtotal, shipping_fee, total_amount, currency, item_count,
        payment_method, payment_status, order_status, receipt_id, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, 'EGP', ?,
        'vodafone_cash', 'verification_pending', 'verification_pending', ?, ?, ?
      )
    `);

    insertOrderStmt.run(
      orderId,
      orderRef,
      customer_name.trim(),
      customer_phone.trim(),
      customer_whatsapp ? customer_whatsapp.trim() : null,
      governorate.trim(),
      city.trim(),
      address.trim(),
      delivery_instructions ? delivery_instructions.trim() : null,
      subtotal,
      shippingFee,
      totalAmount,
      totalItemQuantity,
      receiptId,
      now,
      now
    );

    // Insert Receipt Record
    db.prepare(`
      INSERT INTO receipts (
        id, order_id, file_path, file_mime, file_size, uploaded_at, uploaded_by_ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      receiptId,
      orderId,
      targetPath,
      detectedMime,
      receiptBuffer.length,
      now,
      clientIp
    );

    // Insert Order Items Snapshot
    const insertItemStmt = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_slug, name_ar, name_en,
        price, quantity, image, size, frame
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of orderItemsToInsert) {
      insertItemStmt.run(
        crypto.randomUUID(),
        orderId,
        item.productId,
        item.productSlug,
        item.name_ar,
        item.name_en,
        item.price,
        item.quantity,
        item.image,
        item.size,
        item.frame
      );
    }

    // Get Vodafone Cash Number
    const vfRow = db.prepare("SELECT value FROM settings WHERE key = 'vodafone_cash_number'").get() as { value: string } | undefined;
    const vodafoneCashNumber = vfRow ? vfRow.value : '01040283853';

    // Trigger asynchronous notification (persists and logs)
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    sendOrderNotification({
      orderRef,
      orderDate: now,
      customerName: customer_name.trim(),
      customerPhone: customer_phone.trim(),
      deliveryAddress: `${address.trim()}, ${city.trim()}, ${governorate.trim()}`,
      items: orderItemsToInsert.map((i) => ({ name: i.name_en, quantity: i.quantity, price: i.price })),
      subtotal,
      shippingFee,
      totalPayable: totalAmount,
      paymentStatus: 'verification_pending (Receipt Uploaded - Vodafone Cash)',
      adminLink: `${appUrl}/admin/orders/${orderId}`,
    }).catch((err) => console.error('Notification error:', err));

    sendReceiptNotification({
      orderRef,
      customerName: customer_name.trim(),
      customerPhone: customer_phone.trim(),
      uploadDate: now,
      adminLink: `${appUrl}/admin/orders/${orderId}`,
    }).catch((err) => console.error('Receipt notification error:', err));

    res.status(201).json({
      success: true,
      orderId,
      orderRef,
      subtotal,
      shippingFee,
      totalAmount,
      itemCount: totalItemQuantity,
      paymentStatus: 'verification_pending',
      orderStatus: 'verification_pending',
      hasReceipt: true,
      receiptId,
      vodafoneCashNumber,
      createdAt: now,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Internal server error while processing order', details: message });
  }
});

// -------------------------------------------------------------------
// 4. CUSTOMER ORDER LOOKUP BY ORDER REF
// -------------------------------------------------------------------
router.get('/orders/:orderRef', (req, res) => {
  const orderRef = req.params.orderRef.toUpperCase();
  const orderStmt = db.prepare('SELECT * FROM orders WHERE order_ref = ?');
  const order = orderStmt.get(orderRef) as Record<string, unknown> | undefined;

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const items = itemsStmt.all(order.id as string);

  const vfRow = db.prepare("SELECT value FROM settings WHERE key = 'vodafone_cash_number'").get() as { value: string } | undefined;
  const waRow = db.prepare("SELECT value FROM settings WHERE key = 'whatsapp_number'").get() as { value: string } | undefined;

  res.json({
    id: order.id,
    orderRef: order.order_ref,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerWhatsapp: order.customer_whatsapp,
    governorate: order.governorate,
    city: order.city,
    address: order.address,
    deliveryInstructions: order.delivery_instructions,
    subtotal: order.subtotal,
    shippingFee: order.shipping_fee,
    totalAmount: order.total_amount,
    currency: order.currency,
    itemCount: order.item_count,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
    rejectionReason: order.rejection_reason,
    paymentVerifiedAt: order.payment_verified_at,
    hasReceipt: Boolean(order.receipt_id),
    receiptId: order.receipt_id,
    receiptUrl: order.receipt_id ? `/api/orders/${order.order_ref}/receipt` : null,
    createdAt: order.created_at,
    items,
    vodafoneCashNumber: vfRow?.value || '01040283853',
    whatsappNumber: waRow?.value || '01285938198',
  });
});

// -------------------------------------------------------------------
// 5. RECEIPT VIEW & RE-UPLOAD
// -------------------------------------------------------------------

// Customer / Order confirmation receipt preview endpoint
router.get('/orders/:orderRef/receipt', (req, res) => {
  const orderRef = req.params.orderRef.toUpperCase();
  const order = db.prepare('SELECT id, receipt_id FROM orders WHERE order_ref = ?').get(orderRef) as { id: string; receipt_id: string } | undefined;

  if (!order || !order.receipt_id) {
    return res.status(404).json({ error: 'Receipt not found' });
  }

  const receipt = db.prepare('SELECT file_path, file_mime FROM receipts WHERE id = ?').get(order.receipt_id) as {
    file_path: string;
    file_mime: string;
  } | undefined;

  if (!receipt || !fs.existsSync(receipt.file_path)) {
    return res.status(404).json({ error: 'Receipt file not found on disk' });
  }

  res.setHeader('Content-Type', receipt.file_mime);
  res.setHeader('Cache-Control', 'private, max-age=86400');
  const stream = fs.createReadStream(receipt.file_path);
  stream.pipe(res);
});

// Re-upload receipt for an existing order if required
router.post('/orders/:orderRef/receipt', async (req, res) => {
  try {
    const orderRef = req.params.orderRef.toUpperCase();
    const orderStmt = db.prepare('SELECT * FROM orders WHERE order_ref = ?');
    const order = orderStmt.get(orderRef) as Record<string, unknown> | undefined;

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { fileData, fileName, fileType } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: 'No receipt file data provided' });
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const detectedMime = (fileType || 'image/jpeg').toLowerCase();
    if (!allowedMimes.includes(detectedMime)) {
      return res.status(400).json({ error: 'Invalid file type. Please upload a JPEG, PNG, WebP image, or PDF.' });
    }

    // Decode base64
    const base64Data = fileData.replace(/^data:[a-zA-Z0-9/.-]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Max 10MB limit
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds maximum limit of 10MB' });
    }

    // Generate safe UUID filename (Never trust client filename)
    const ext = detectedMime === 'image/png' ? 'png' : detectedMime === 'image/webp' ? 'webp' : detectedMime === 'application/pdf' ? 'pdf' : 'jpg';
    const receiptId = crypto.randomUUID();
    const safeFilename = `${receiptId}.${ext}`;
    const targetPath = path.join(RECEIPTS_DIR, safeFilename);

    fs.writeFileSync(targetPath, buffer);

    const now = new Date().toISOString();
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Insert receipt record
    const insertReceiptStmt = db.prepare(`
      INSERT INTO receipts (id, order_id, file_path, file_mime, file_size, uploaded_at, uploaded_by_ip)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertReceiptStmt.run(receiptId, order.id as string, targetPath, detectedMime, buffer.length, now, clientIp);

    // Update order status: Payment verification pending (DO NOT mark as paid!)
    const updateOrderStmt = db.prepare(`
      UPDATE orders
      SET payment_status = 'verification_pending',
          order_status = CASE WHEN order_status = 'new' THEN 'verification_pending' ELSE order_status END,
          receipt_id = ?,
          rejection_reason = NULL,
          updated_at = ?
      WHERE id = ?
    `);
    updateOrderStmt.run(receiptId, now, order.id as string);

    // Send Admin Notification
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    sendReceiptNotification({
      orderRef,
      customerName: String(order.customer_name),
      customerPhone: String(order.customer_phone),
      uploadDate: now,
      adminLink: `${appUrl}/admin/orders/${order.id}`,
    }).catch((err) => console.error('Receipt notification error:', err));

    res.json({
      success: true,
      message: 'Payment receipt uploaded successfully and submitted for administrator verification.',
      receiptId,
      receiptUrl: `/api/orders/${orderRef}/receipt`,
      uploadedAt: now,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Receipt upload error:', err);
    res.status(500).json({ error: 'Failed to process receipt upload', details: message });
  }
});

// -------------------------------------------------------------------
// 6. UNIFIED AUTHENTICATION (ADMIN & CUSTOMERS)
// -------------------------------------------------------------------

// Unified Login Endpoint: Handles both Administrator (gex92012@gmail.com) and Customers
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
      error_ar: 'البريد الإلكتروني وكلمة المرور مطلوبان',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check if user is an Administrator
  const adminStmt = db.prepare('SELECT * FROM admins WHERE LOWER(email) = ?');
  const admin = adminStmt.get(normalizedEmail) as {
    id: string;
    email: string;
    password_hash: string;
    salt: string;
    role: string;
  } | undefined;

  if (admin && verifyPassword(password, admin.password_hash, admin.salt)) {
    // Generate secure 7-day admin session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO admin_sessions (token, admin_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, admin.id, expiresAt, now);

    // Audit log
    db.prepare(`
      INSERT INTO admin_audit_logs (id, admin_email, action, target_type, target_id, details, created_at)
      VALUES (?, ?, 'login', 'admin', ?, 'Successful admin sign-in via unified login', ?)
    `).run(crypto.randomUUID(), admin.email, admin.id, now);

    return res.json({
      success: true,
      role: 'admin',
      token,
      redirectTo: '/admin',
      user: {
        id: admin.id,
        email: admin.email,
        role: 'admin',
        name: 'مدير النظام (Admin)',
      },
    });
  }

  // 2. Check if user is a Customer
  const custStmt = db.prepare('SELECT * FROM customers WHERE LOWER(email) = ?');
  const customer = custStmt.get(normalizedEmail) as {
    id: string;
    email: string;
    name: string;
    phone?: string;
    password_hash: string;
    salt: string;
    role: string;
  } | undefined;

  if (customer && verifyPassword(password, customer.password_hash, customer.salt)) {
    // Generate 30-day customer session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO customer_sessions (token, customer_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, customer.id, expiresAt, now);

    return res.json({
      success: true,
      role: 'customer',
      token,
      redirectTo: '/account',
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        role: 'customer',
      },
    });
  }

  // Neither matched: return clear credentials error
  return res.status(401).json({
    error: 'Invalid email or password',
    error_ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.',
  });
});

// Customer Registration Endpoint
router.post('/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Name, email, and password are required',
      error_ar: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check email conflict in admins or customers
  const adminExists = db.prepare('SELECT id FROM admins WHERE LOWER(email) = ?').get(normalizedEmail);
  const custExists = db.prepare('SELECT id FROM customers WHERE LOWER(email) = ?').get(normalizedEmail);

  if (adminExists || custExists) {
    return res.status(400).json({
      error: 'An account with this email address already exists',
      error_ar: 'يوجد حساب مسجل بالفعل بهذا البريد الإلكتروني',
    });
  }

  const { hash, salt } = hashPassword(password);
  const custId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO customers (id, email, password_hash, salt, name, phone, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'customer', ?)
  `).run(custId, normalizedEmail, hash, salt, name.trim(), phone ? phone.trim() : null, now);

  // Auto-login session
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(`
    INSERT INTO customer_sessions (token, customer_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(token, custId, expiresAt, now);

  res.json({
    success: true,
    role: 'customer',
    token,
    redirectTo: '/account',
    user: {
      id: custId,
      email: normalizedEmail,
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      role: 'customer',
    },
  });
});

// Unified Current User Check
router.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Check admin session
  const adminSession = db.prepare(`
    SELECT s.token, s.expires_at, a.id, a.email, a.role
    FROM admin_sessions s
    JOIN admins a ON s.admin_id = a.id
    WHERE s.token = ?
  `).get(token) as { token: string; expires_at: string; id: string; email: string; role: string } | undefined;

  if (adminSession) {
    if (new Date(adminSession.expires_at) < new Date()) {
      db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
      return res.status(401).json({ error: 'Session expired' });
    }
    return res.json({
      role: 'admin',
      user: {
        id: adminSession.id,
        email: adminSession.email,
        role: 'admin',
        name: 'مدير النظام (Admin)',
      },
    });
  }

  // Check customer session
  const custSession = db.prepare(`
    SELECT s.token, s.expires_at, c.id, c.email, c.name, c.phone, c.role
    FROM customer_sessions s
    JOIN customers c ON s.customer_id = c.id
    WHERE s.token = ?
  `).get(token) as { token: string; expires_at: string; id: string; email: string; name: string; phone?: string; role: string } | undefined;

  if (custSession) {
    if (new Date(custSession.expires_at) < new Date()) {
      db.prepare('DELETE FROM customer_sessions WHERE token = ?').run(token);
      return res.status(401).json({ error: 'Session expired' });
    }
    return res.json({
      role: 'customer',
      user: {
        id: custSession.id,
        email: custSession.email,
        name: custSession.name,
        phone: custSession.phone,
        role: 'customer',
      },
    });
  }

  return res.status(401).json({ error: 'Session not found' });
});

// Unified Logout Endpoint
router.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (token) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
    db.prepare('DELETE FROM customer_sessions WHERE token = ?').run(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Customer Orders Lookup
router.get('/customer/orders', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const custSession = db.prepare(`
    SELECT c.id, c.email, c.phone
    FROM customer_sessions s
    JOIN customers c ON s.customer_id = c.id
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, new Date().toISOString()) as { id: string; email: string; phone?: string } | undefined;

  if (!custSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Find orders matching phone
  let orders: unknown[] = [];
  if (custSession.phone) {
    orders = db.prepare(`
      SELECT * FROM orders
      WHERE customer_phone = ? OR customer_phone LIKE ?
      ORDER BY created_at DESC
    `).all(custSession.phone, `%${custSession.phone.slice(-8)}%`);
  }

  res.json({ orders });
});

// Legacy Admin Endpoints (Backward compatibility)
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const adminStmt = db.prepare('SELECT * FROM admins WHERE LOWER(email) = ?');
  const admin = adminStmt.get(email.trim().toLowerCase()) as {
    id: string;
    email: string;
    password_hash: string;
    salt: string;
    role: string;
  } | undefined;

  if (!admin || !verifyPassword(password, admin.password_hash, admin.salt)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO admin_sessions (token, admin_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(token, admin.id, expiresAt, now);

  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_email, action, target_type, target_id, details, created_at)
    VALUES (?, ?, 'login', 'admin', ?, 'Successful admin login', ?)
  `).run(crypto.randomUUID(), admin.email, admin.id, now);

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
  });
});

router.get('/admin/me', requireAdmin, (req: AuthenticatedRequest, res) => {
  res.json({ admin: req.admin });
});

router.post('/admin/logout', requireAdmin, (req: AuthenticatedRequest, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (token) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// -------------------------------------------------------------------
// 7. ADMINISTRATOR ORDER MANAGEMENT
// -------------------------------------------------------------------
router.get('/admin/orders', requireAdmin, (req, res) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 15;
  const offset = (page - 1) * limit;

  const status = req.query.status as string;
  const paymentStatus = req.query.payment_status as string;
  const search = (req.query.search as string || '').trim().toLowerCase();

  let query = 'SELECT * FROM orders WHERE 1=1';
  const params: (string | number)[] = [];

  if (status && status !== 'all') {
    query += ' AND order_status = ?';
    params.push(status);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    query += ' AND payment_status = ?';
    params.push(paymentStatus);
  }

  if (search) {
    query += ' AND (LOWER(order_ref) LIKE ? OR LOWER(customer_name) LIKE ? OR customer_phone LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  // Count total matching
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countRow = db.prepare(countQuery).get(...params) as { total: number };
  const total = countRow ? countRow.total : 0;

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const orders = db.prepare(query).all(...params);
  res.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

router.get('/admin/orders/:id', requireAdmin, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id as string);
  const receipts = db.prepare('SELECT id, file_mime, file_size, uploaded_at FROM receipts WHERE order_id = ? ORDER BY uploaded_at DESC').all(order.id as string);
  const auditLogs = db.prepare('SELECT * FROM admin_audit_logs WHERE target_id = ? ORDER BY created_at DESC').all(order.id as string);

  res.json({
    order,
    items,
    receipts,
    auditLogs,
  });
});

// Securely view private receipt image
router.get('/admin/receipts/:id', requireAdmin, (req, res) => {
  const receipt = db.prepare('SELECT * FROM receipts WHERE id = ?').get(req.params.id) as {
    id: string;
    file_path: string;
    file_mime: string;
  } | undefined;

  if (!receipt || !fs.existsSync(receipt.file_path)) {
    return res.status(404).json({ error: 'Receipt file not found' });
  }

  res.setHeader('Content-Type', receipt.file_mime);
  res.setHeader('Cache-Control', 'private, max-age=86400');
  const stream = fs.createReadStream(receipt.file_path);
  stream.pipe(res);
});

// Verify payment
router.post('/admin/orders/:id/verify-payment', requireAdmin, (req: AuthenticatedRequest, res) => {
  const now = new Date().toISOString();
  const adminEmail = req.admin?.email || 'admin';

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.prepare(`
    UPDATE orders
    SET payment_status = 'paid',
        order_status = CASE WHEN order_status IN ('new', 'awaiting_payment', 'verification_pending') THEN 'paid' ELSE order_status END,
        payment_verified_at = ?,
        payment_verified_by = ?,
        rejection_reason = NULL,
        updated_at = ?
    WHERE id = ?
  `).run(now, adminEmail, now, req.params.id);

  // Audit trail
  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_email, action, target_type, target_id, details, created_at)
    VALUES (?, ?, 'verify_payment', 'order', ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    adminEmail,
    req.params.id,
    `Payment verified and marked as PAID. Order reference: ${order.order_ref}`,
    now
  );

  res.json({ success: true, message: 'Payment verified successfully and marked as paid.' });
});

// Reject receipt
router.post('/admin/orders/:id/reject-receipt', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Rejection reason is required' });
  }

  const now = new Date().toISOString();
  const adminEmail = req.admin?.email || 'admin';

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.prepare(`
    UPDATE orders
    SET payment_status = 'rejected',
        rejection_reason = ?,
        updated_at = ?
    WHERE id = ?
  `).run(reason.trim(), now, req.params.id);

  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_email, action, target_type, target_id, details, created_at)
    VALUES (?, ?, 'reject_receipt', 'order', ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    adminEmail,
    req.params.id,
    `Receipt rejected with reason: ${reason.trim()}`,
    now
  );

  res.json({ success: true, message: 'Receipt rejected and customer requested to upload valid replacement.' });
});

// Update order status
router.post('/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { status } = req.body;
  const validStatuses = ['new', 'awaiting_payment', 'verification_pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  const now = new Date().toISOString();
  const adminEmail = req.admin?.email || 'admin';

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.prepare(`
    UPDATE orders
    SET order_status = ?,
        updated_at = ?
    WHERE id = ?
  `).run(status, now, req.params.id);

  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_email, action, target_type, target_id, details, created_at)
    VALUES (?, ?, 'update_order_status', 'order', ?, ?, ?)
  `).run(
    crypto.randomUUID(),
    adminEmail,
    req.params.id,
    `Order status updated from '${order.order_status}' to '${status}'`,
    now
  );

  res.json({ success: true, message: `Order status updated to ${status}` });
});

// -------------------------------------------------------------------
// 8. DASHBOARD STATS
// -------------------------------------------------------------------
router.get('/admin/dashboard-stats', requireAdmin, (req, res) => {
  const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number }).count;
  const awaitingPayment = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'awaiting_payment' AND order_status != 'cancelled'").get() as { count: number }).count;
  const verificationPending = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'verification_pending' AND order_status != 'cancelled'").get() as { count: number }).count;
  const verifiedPaid = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'paid' AND order_status != 'cancelled'").get() as { count: number }).count;
  const cancelledOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'cancelled'").get() as { count: number }).count;

  // Revenue strictly from verified paid non-cancelled orders
  const revenueRow = db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'paid' AND order_status != 'cancelled'").get() as { total: number | null };
  const confirmedRevenue = revenueRow && revenueRow.total ? revenueRow.total : 0;

  res.json({
    total_orders: totalOrders,
    awaiting_payment: awaitingPayment,
    verification_pending: verificationPending,
    verified_paid: verifiedPaid,
    cancelled_orders: cancelledOrders,
    confirmed_revenue: confirmedRevenue,
  });
});

// -------------------------------------------------------------------
// 9. PRODUCT MANAGEMENT
// -------------------------------------------------------------------
router.put('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const {
    name_ar,
    name_en,
    description_ar,
    description_en,
    price,
    image,
    category_ar,
    category_en,
    size_ar,
    size_en,
    orientation_ar,
    orientation_en,
    frame_ar,
    frame_en,
    quantity_per_set_ar,
    quantity_per_set_en,
    seo_title_ar,
    seo_title_en,
    seo_description_ar,
    seo_description_en,
    status,
  } = req.body;

  const now = new Date().toISOString();
  const adminEmail = req.admin?.email || 'admin';

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updateStmt = db.prepare(`
    UPDATE products SET
      name_ar = COALESCE(?, name_ar),
      name_en = COALESCE(?, name_en),
      description_ar = COALESCE(?, description_ar),
      description_en = COALESCE(?, description_en),
      price = COALESCE(?, price),
      image = COALESCE(?, image),
      category_ar = COALESCE(?, category_ar),
      category_en = COALESCE(?, category_en),
      size_ar = ?,
      size_en = ?,
      orientation_ar = COALESCE(?, orientation_ar),
      orientation_en = COALESCE(?, orientation_en),
      frame_ar = COALESCE(?, frame_ar),
      frame_en = COALESCE(?, frame_en),
      quantity_per_set_ar = COALESCE(?, quantity_per_set_ar),
      quantity_per_set_en = COALESCE(?, quantity_per_set_en),
      seo_title_ar = COALESCE(?, seo_title_ar),
      seo_title_en = COALESCE(?, seo_title_en),
      seo_description_ar = COALESCE(?, seo_description_ar),
      seo_description_en = COALESCE(?, seo_description_en),
      status = COALESCE(?, status),
      updated_at = ?
    WHERE id = ?
  `);

  updateStmt.run(
    name_ar ?? null,
    name_en ?? null,
    description_ar ?? null,
    description_en ?? null,
    price !== undefined ? parseFloat(price) : null,
    image ?? null,
    category_ar ?? null,
    category_en ?? null,
    size_ar !== undefined ? size_ar : product.size_ar,
    size_en !== undefined ? size_en : product.size_en,
    orientation_ar ?? null,
    orientation_en ?? null,
    frame_ar ?? null,
    frame_en ?? null,
    quantity_per_set_ar ?? null,
    quantity_per_set_en ?? null,
    seo_title_ar ?? null,
    seo_title_en ?? null,
    seo_description_ar ?? null,
    seo_description_en ?? null,
    status ?? null,
    now,
    req.params.id
  );

  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_email, action, target_type, target_id, details, created_at)
    VALUES (?, ?, 'update_product', 'product', ?, 'Updated product details and specifications', ?)
  `).run(crypto.randomUUID(), adminEmail, req.params.id, now);

  const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json({ success: true, product: updatedProduct });
});

// -------------------------------------------------------------------
// 10. SETTINGS MANAGEMENT
// -------------------------------------------------------------------
router.get('/admin/settings', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  res.json(rows);
});

router.put('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { shipping_fee_per_item, vodafone_cash_number, whatsapp_number } = req.body;
  const now = new Date().toISOString();
  const adminEmail = req.admin?.email || 'admin';

  const upsertStmt = db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);

  if (shipping_fee_per_item !== undefined) {
    upsertStmt.run('shipping_fee_per_item', String(shipping_fee_per_item), now);
  }
  if (vodafone_cash_number !== undefined) {
    upsertStmt.run('vodafone_cash_number', String(vodafone_cash_number).trim(), now);
  }
  if (whatsapp_number !== undefined) {
    upsertStmt.run('whatsapp_number', String(whatsapp_number).trim(), now);
  }

  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_email, action, target_type, target_id, details, created_at)
    VALUES (?, ?, 'update_settings', 'settings', 'global', 'Updated storefront settings', ?)
  `).run(crypto.randomUUID(), adminEmail, now);

  res.json({ success: true, message: 'Settings updated successfully' });
});

// -------------------------------------------------------------------
// 11. NOTIFICATIONS LOG AUDIT
// -------------------------------------------------------------------
router.get('/admin/notifications', requireAdmin, (req, res) => {
  const logs = db.prepare('SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 50').all();
  res.json(logs);
});
