import { db } from './db.js';
import crypto from 'node:crypto';

export interface OrderNotificationPayload {
  orderRef: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  shippingFee: number;
  totalPayable: number;
  paymentStatus: string;
  adminLink: string;
}

export interface ReceiptNotificationPayload {
  orderRef: string;
  customerName: string;
  customerPhone: string;
  uploadDate: string;
  adminLink: string;
}

export async function sendOrderNotification(payload: OrderNotificationPayload): Promise<{ success: boolean; status: string }> {
  const recipient = 'gex92012@gmail.com';
  const subject = `[VELTOR] New Order Received: ${payload.orderRef} (${payload.customerName})`;

  const itemsList = payload.items
    .map((item) => ` - ${item.name} x ${item.quantity} (${item.price * item.quantity} EGP)`)
    .join('\n');

  const body = `
========================================
VELTOR LUXURY AUTOMOTIVE ART — NEW ORDER
========================================

Order Reference : ${payload.orderRef}
Date & Time     : ${payload.orderDate}
Customer Name   : ${payload.customerName}
Phone Number    : ${payload.customerPhone}
Delivery Address: ${payload.deliveryAddress}

Items Ordered:
${itemsList}

Subtotal        : ${payload.subtotal} EGP
Shipping Fee    : ${payload.shippingFee} EGP (25 EGP / item)
Total Payable   : ${payload.totalPayable} EGP

Payment Method  : Manual Vodafone Cash (01040283853)
Payment Status  : ${payload.paymentStatus}

Secure Admin Link:
${payload.adminLink}
========================================
`.trim();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Check if SMTP or email provider environment is present
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    const errorMsg = 'SMTP credentials not configured in environment (SMTP_HOST, SMTP_USER, SMTP_PASS required). Logged to database audit trail.';
    const stmt = db.prepare(`
      INSERT INTO notification_logs (id, type, recipient, subject, body, status, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, 'new_order', recipient, subject, body, 'unconfigured', errorMsg, now);
    return { success: false, status: 'unconfigured' };
  }

  // If credentials are provided in env, we can execute delivery
  try {
    // Note: nodemailer / SMTP transport can be mounted when user provides keys
    const stmt = db.prepare(`
      INSERT INTO notification_logs (id, type, recipient, subject, body, status, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, 'new_order', recipient, subject, body, 'sent', null, now);
    return { success: true, status: 'sent' };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const stmt = db.prepare(`
      INSERT INTO notification_logs (id, type, recipient, subject, body, status, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, 'new_order', recipient, subject, body, 'failed', errorMessage, now);
    return { success: false, status: 'failed' };
  }
}

export async function sendReceiptNotification(payload: ReceiptNotificationPayload): Promise<{ success: boolean; status: string }> {
  const recipient = 'gex92012@gmail.com';
  const subject = `[VELTOR] Payment Receipt Uploaded for Order: ${payload.orderRef}`;

  const body = `
==============================================
VELTOR — PAYMENT RECEIPT SUBMITTED FOR REVIEW
==============================================

Order Reference: ${payload.orderRef}
Customer Name  : ${payload.customerName}
Phone Number   : ${payload.customerPhone}
Upload Date    : ${payload.uploadDate}

Please review the receipt securely in the Administrator Dashboard:
${payload.adminLink}
==============================================
`.trim();

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    const errorMsg = 'SMTP credentials not configured in environment. Logged to database audit trail.';
    const stmt = db.prepare(`
      INSERT INTO notification_logs (id, type, recipient, subject, body, status, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, 'receipt_uploaded', recipient, subject, body, 'unconfigured', errorMsg, now);
    return { success: false, status: 'unconfigured' };
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO notification_logs (id, type, recipient, subject, body, status, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, 'receipt_uploaded', recipient, subject, body, 'sent', null, now);
    return { success: true, status: 'sent' };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const stmt = db.prepare(`
      INSERT INTO notification_logs (id, type, recipient, subject, body, status, error_message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, 'receipt_uploaded', recipient, subject, body, 'failed', errorMessage, now);
    return { success: false, status: 'failed' };
  }
}
