import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Upload,
  AlertCircle,
  FileCheck,
  Clock,
  MessageCircle,
  ShieldAlert,
  FileText,
  ExternalLink,
  Package,
  Truck,
  ArrowRight,
  ArrowLeft,
  Smartphone,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../data/catalog';
import { Button } from '../components/Button';
import { ResilientImage } from '../components/ResilientImage';

interface OrderConfirmationPageProps {
  orderRef: string;
}

interface OrderDetail {
  id: string;
  orderRef: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  governorate: string;
  city: string;
  address: string;
  deliveryInstructions?: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  itemCount: number;
  paymentMethod: string;
  paymentStatus: 'awaiting_payment' | 'verification_pending' | 'paid' | 'rejected';
  orderStatus: string;
  rejectionReason?: string;
  paymentVerifiedAt?: string;
  hasReceipt: boolean;
  receiptId?: string;
  receiptUrl?: string;
  createdAt: string;
  items: Array<{
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
    frame?: string;
  }>;
  vodafoneCashNumber: string;
  whatsappNumber: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderRef }) => {
  const { lang, isRtl, navigate } = useStore();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Re-upload state (if needed)
  const [showReupload, setShowReupload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Copy state
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderRef}`);
      if (!res.ok) {
        throw new Error(lang === 'ar' ? 'لم يتم العثور على الطلب' : 'Order not found');
      }
      const data: OrderDetail = await res.json();
      setOrder(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [orderRef, lang]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCopy = (text: string, type: 'number' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'number') {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(false);

    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validMimes.includes(file.type)) {
      setUploadError(
        lang === 'ar'
          ? 'يرجى اختيار صورة (JPEG, PNG, WebP) أو ملف PDF.'
          : 'Please select a valid image (JPEG, PNG, WebP) or PDF file.'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        lang === 'ar'
          ? 'حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت.'
          : 'File size exceeds maximum limit of 10MB.'
      );
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile || !previewUrl || !order) return;

    setUploading(true);
    setUploadError(null);

    try {
      const res = await fetch(`/api/orders/${order.orderRef}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: previewUrl,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (lang === 'ar' ? 'فشل رفع الإيصال' : 'Failed to upload receipt'));
      }

      setUploadSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowReupload(false);
      await fetchOrder();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4 animate-fade-in">
        <div className="w-10 h-10 border-2 border-[#C6A365] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[#9E9A90]">
          {lang === 'ar' ? 'جارٍ تحميل تفاصيل الطلب...' : 'Loading order details...'}
        </p>
      </div>
    );
  }

  if (fetchError || !order) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6 animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h1 className="text-2xl font-bold text-[#F4F1EA]">
          {lang === 'ar' ? 'تعذر تحميل بيانات الطلب' : 'Unable to Load Order'}
        </h1>
        <p className="text-sm text-[#9E9A90]">{fetchError}</p>
        <div className="flex justify-center gap-4">
          <Button variant="primary" onClick={() => fetchOrder()}>
            {lang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
          <Button variant="secondary" onClick={() => navigate({ page: 'shop' })}>
            {lang === 'ar' ? 'العودة للمتجر' : 'Return to Shop'}
          </Button>
        </div>
      </div>
    );
  }

  // Payment status badge details
  const getPaymentStatusDisplay = () => {
    switch (order.paymentStatus) {
      case 'paid':
        return {
          title: lang === 'ar' ? 'تم تأكيد الدفع بنجاح' : 'Payment Verified & Confirmed',
          desc:
            lang === 'ar'
              ? 'تم التحقق من تحويل فودافون كاش بنجاح وجارٍ تجهيز اللوحات للتسليم لمندوب الشحن.'
              : 'Vodafone Cash transfer verified. Artworks are being framed and packed for delivery.',
          bg: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300',
          badgeText: lang === 'ar' ? 'مؤكد ومدفوع' : 'Paid',
          badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
          icon: CheckCircle2,
        };
      case 'verification_pending':
        return {
          title: lang === 'ar' ? 'قيد مراجعة إيصال التحويل' : 'Payment Verification Pending',
          desc:
            lang === 'ar'
              ? 'تم استلام إيصال التحويل المرفق مع الطلب، وهو قيد المراجعة والتدقيق بواسطة إدارة VELTOR.'
              : 'Transfer receipt received with your order. Currently awaiting manual review by VELTOR administration.',
          bg: 'bg-amber-950/30 border-amber-500/40 text-amber-200',
          badgeText: lang === 'ar' ? 'قيد المراجعة' : 'Under Review',
          badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
          icon: Clock,
        };
      case 'rejected':
        return {
          title: lang === 'ar' ? 'تم رفض الإيصال — يرجى إعادة الرفع' : 'Receipt Rejected — Action Required',
          desc:
            order.rejectionReason ||
            (lang === 'ar'
              ? 'الإيصال غير واضح أو لم يتم العثور على التحويل. يرجى إعادة رفع إيصال واضح أدناه.'
              : 'The transfer could not be verified. Please re-upload a clear receipt below.'),
          bg: 'bg-red-950/40 border-red-500/50 text-red-200',
          badgeText: lang === 'ar' ? 'مرفوض' : 'Rejected',
          badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/40',
          icon: ShieldAlert,
        };
      default:
        return {
          title: lang === 'ar' ? 'قيد انتظار التحقق' : 'Awaiting Verification',
          desc:
            lang === 'ar'
              ? 'جارٍ فحص بيانات التحويل وتأكيد الحجز.'
              : 'Processing transfer verification.',
          bg: 'bg-[#1A1A22] border-[#C6A365]/50 text-[#C6A365]',
          badgeText: lang === 'ar' ? 'قيد التدقيق' : 'Pending',
          badgeClass: 'bg-[#C6A365]/20 text-[#C6A365] border border-[#C6A365]/40',
          icon: Clock,
        };
    }
  };

  const statusInfo = getPaymentStatusDisplay();
  const StatusIcon = statusInfo.icon;

  const waPrefill = encodeURIComponent(
    lang === 'ar'
      ? `مرحباً VELTOR، بخصوص طلبي برقم مرجعي: ${order.orderRef}`
      : `Hello VELTOR, regarding my order reference: ${order.orderRef}`
  );
  const waUrl = `https://wa.me/20${order.whatsappNumber.replace(/^0+/, '')}?text=${waPrefill}`;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10 animate-fade-in">
      {/* Top Success Banner */}
      <div className="p-6 sm:p-8 bg-[#131318] border border-white/10 space-y-6 text-start">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3.5">
            <CheckCircle2 className="w-8 h-8 text-[#C6A365] shrink-0" />
            <div>
              <p className="text-xs text-[#9E9A90] font-brand uppercase tracking-wider">
                {lang === 'ar' ? 'تم تسجيل الطلب وإرفاق الإيصال' : 'Order & Receipt Submitted'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F1EA]">
                {lang === 'ar' ? 'شكراً لاختيارك لوحات VELTOR' : 'Thank You for Choosing VELTOR'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#0B0B0E] border border-white/15 px-4 py-2.5">
            <span className="text-xs text-[#9E9A90]">{lang === 'ar' ? 'الرقم المرجعي:' : 'Order Ref:'}</span>
            <span className="font-mono-tabular font-bold text-[#C6A365]">{order.orderRef}</span>
            <button
              type="button"
              onClick={() => handleCopy(order.orderRef, 'ref')}
              className="p-1 text-[#9E9A90] hover:text-[#F4F1EA] cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center touch-press"
              title="Copy"
            >
              {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Current Payment Status Banner */}
        <div className={`p-4 sm:p-5 border flex items-start gap-3.5 ${statusInfo.bg}`}>
          <StatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base">{statusInfo.title}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-none ${statusInfo.badgeClass}`}>
                {statusInfo.badgeText}
              </span>
            </div>
            <p className="mt-1 opacity-90 leading-relaxed">{statusInfo.desc}</p>
          </div>
        </div>

        {/* Order Progress Stepper */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-[#9E9A90] mb-3">
            {lang === 'ar' ? 'مراحل متابعة طلبك:' : 'Order Progress Tracking:'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Step 1: Placed */}
            <div className="p-3 bg-[#0B0B0E] border border-emerald-500/30 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-emerald-300">
                  {lang === 'ar' ? '1. تسجيل الطلب' : '1. Order Placed'}
                </p>
                <p className="text-[#9E9A90] text-[10px]">
                  {lang === 'ar' ? 'تم استلام الإيصال' : 'Receipt Received'}
                </p>
              </div>
            </div>

            {/* Step 2: Verification */}
            <div
              className={`p-3 bg-[#0B0B0E] border flex items-center gap-2.5 ${
                order.paymentStatus === 'paid'
                  ? 'border-emerald-500/30'
                  : 'border-[#C6A365]/50 bg-[#C6A365]/5'
              }`}
            >
              {order.paymentStatus === 'paid' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-[#C6A365] shrink-0 animate-pulse" />
              )}
              <div className="text-[11px] leading-tight">
                <p
                  className={`font-bold ${
                    order.paymentStatus === 'paid' ? 'text-emerald-300' : 'text-[#C6A365]'
                  }`}
                >
                  {lang === 'ar' ? '2. مراجعة الإيصال' : '2. Verification'}
                </p>
                <p className="text-[#9E9A90] text-[10px]">
                  {order.paymentStatus === 'paid'
                    ? lang === 'ar'
                      ? 'تم تأكيد الدفع'
                      : 'Verified'
                    : lang === 'ar'
                    ? 'جارٍ التحقق'
                    : 'Under Review'}
                </p>
              </div>
            </div>

            {/* Step 3: Preparation */}
            <div className="p-3 bg-[#0B0B0E] border border-white/10 flex items-center gap-2.5 opacity-70">
              <Package className="w-4 h-4 text-[#9E9A90] shrink-0" />
              <div className="text-[11px] leading-tight">
                <p className="font-semibold text-[#F4F1EA]">
                  {lang === 'ar' ? '3. تجهيز اللوحة' : '3. Framing & Pack'}
                </p>
                <p className="text-[#9E9A90] text-[10px]">
                  {lang === 'ar' ? 'بانتظار التأكيد' : 'Next Step'}
                </p>
              </div>
            </div>

            {/* Step 4: Delivery */}
            <div className="p-3 bg-[#0B0B0E] border border-white/10 flex items-center gap-2.5 opacity-70">
              <Truck className="w-4 h-4 text-[#9E9A90] shrink-0" />
              <div className="text-[11px] leading-tight">
                <p className="font-semibold text-[#F4F1EA]">
                  {lang === 'ar' ? '4. الشحن والتسليم' : '4. Delivery'}
                </p>
                <p className="text-[#9E9A90] text-[10px]">
                  {order.governorate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Receipt Details & Re-upload (7 cols) */}
        <div className="lg:col-span-7 bg-[#131318] border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F4F1EA] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#C6A365]" />
              <span>{lang === 'ar' ? 'إيصال التحويل المرفق' : 'Submitted Transfer Receipt'}</span>
            </h2>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 border border-emerald-500/30">
              {lang === 'ar' ? 'مرفق بالطلب' : 'Attached'}
            </span>
          </div>

          {/* Attached Receipt Visual Card */}
          <div className="p-4 sm:p-5 bg-[#0B0B0E] border border-white/15 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-32 bg-[#131318] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {order.hasReceipt ? (
                  <img
                    src={`/api/orders/${order.orderRef}/receipt`}
                    alt="Receipt"
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => window.open(`/api/orders/${order.orderRef}/receipt`, '_blank')}
                  />
                ) : (
                  <FileText className="w-10 h-10 text-[#C6A365]" />
                )}
              </div>

              <div className="space-y-1.5 flex-1 text-center sm:text-start">
                <p className="text-xs font-semibold text-[#F4F1EA]">
                  {lang === 'ar' ? 'تم حفظ الإيصال وربطه بالطلب بنجاح' : 'Receipt successfully linked to order'}
                </p>
                <p className="text-[11px] text-[#9E9A90]">
                  {lang === 'ar'
                    ? 'سيقوم فريق المراجعة بمطابقة مبلغ الإيصال مع محفظة فودافون كاش.'
                    : 'Our verification team will reconcile this transfer against Vodafone Cash.'}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <a
                    href={`/api/orders/${order.orderRef}/receipt`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C6A365] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'عرض الإيصال بالكامل' : 'View Full Receipt'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowReupload(!showReupload)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9E9A90] hover:text-[#F4F1EA] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'رفع إيصال بديل' : 'Re-upload / Replace'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Re-upload section if user wants to replace */}
          {showReupload && (
            <div className="p-5 bg-[#0B0B0E] border border-[#C6A365]/40 space-y-4 animate-slide-down">
              <h3 className="text-sm font-bold text-[#F4F1EA]">
                {lang === 'ar' ? 'رفع صورة إيصال جديدة أو بديلة:' : 'Upload Replacement Receipt:'}
              </h3>

              {uploadError && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lang === 'ar' ? 'تم تحديث الإيصال بنجاح.' : 'Receipt updated successfully.'}</span>
                </div>
              )}

              <div className="space-y-3">
                {previewUrl ? (
                  <div className="space-y-2">
                    <div className="max-w-[200px] max-h-[200px] overflow-hidden border border-white/15">
                      <img src={previewUrl} alt="New Preview" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-xs text-[#9E9A90]">{selectedFile?.name}</p>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/15 text-[#F4F1EA] border border-white/15 min-h-[44px]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'اختيار ملف جديد' : 'Choose New File'}</span>
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>

                  {previewUrl && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={uploading}
                      onClick={handleUploadReceipt}
                      className="min-h-[44px]"
                    >
                      {uploading ? (
                        <span>{lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                      ) : (
                        <span>{lang === 'ar' ? 'تأكيد رفع الإيصال الجديد' : 'Confirm Replacement'}</span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vodafone Cash & Support Assistance */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-[#F4F1EA]">
              {lang === 'ar' ? 'تحتاج مساعدة أو استفسار بخصوص طلبك؟' : 'Need Assistance with Your Order?'}
            </h3>
            <p className="text-xs text-[#9E9A90] leading-relaxed">
              {lang === 'ar'
                ? 'فريق خدمة عملاء VELTOR متاح لمساعدتك عبر الواتساب مباشرة للتأكيد السريع أو تعديل بيانات الشحن.'
                : 'VELTOR concierge team is available directly on WhatsApp for expedited review or address updates.'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#25D366] text-[#0B0B0E] hover:bg-[#20bd5a] transition-colors cursor-pointer min-h-[44px] touch-press"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تواصل معنا عبر واتساب' : 'Chat on WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={() => navigate({ page: 'account' })}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/10 hover:bg-white/15 text-[#F4F1EA] border border-white/15 transition-colors cursor-pointer min-h-[44px] touch-press"
              >
                <span>{lang === 'ar' ? 'عرض في حسابي' : 'View in My Account'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Financial Summary (5 cols) */}
        <div className="lg:col-span-5 bg-[#131318] border border-white/10 p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-bold text-[#F4F1EA] border-b border-white/10 pb-4">
            {lang === 'ar' ? 'تفاصيل اللوحات والعنوان' : 'Items & Delivery'}
          </h2>

          {/* Items List */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2.5 bg-[#0B0B0E] border border-white/5">
                <div className="w-14 h-18 bg-[#131318] overflow-hidden shrink-0 p-1 flex items-center justify-center">
                  <ResilientImage
                    src={item.image}
                    alt={item.name_en}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#F4F1EA] truncate">
                    {lang === 'ar' ? item.name_ar : item.name_en}
                  </p>
                  <p className="text-[11px] text-[#9E9A90] mt-0.5">
                    {item.quantity} × {formatCurrency(item.price, lang)}
                  </p>
                  {item.frame && (
                    <span className="text-[10px] text-[#C6A365]">
                      {lang === 'ar' ? `إطار: ${item.frame}` : `Frame: ${item.frame}`}
                    </span>
                  )}
                </div>
                <span className="font-mono-tabular text-xs font-bold text-[#C6A365] shrink-0">
                  {formatCurrency(item.price * item.quantity, lang)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-3 border-t border-white/10 pt-4 text-xs sm:text-sm">
            <div className="flex justify-between items-baseline">
              <span className="text-[#9E9A90]">{lang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
              <span className="font-mono-tabular text-[#F4F1EA] font-semibold">
                {formatCurrency(order.subtotal, lang)}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-[#9E9A90]">{lang === 'ar' ? 'رسوم الشحن والتوصيل:' : 'Shipping Fee:'}</span>
              <span className="font-mono-tabular text-[#F4F1EA] font-semibold">
                {formatCurrency(order.shippingFee, lang)}
              </span>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-baseline font-bold">
              <span className="text-sm text-[#F4F1EA]">{lang === 'ar' ? 'الإجمالي:' : 'Total Amount:'}</span>
              <span className="font-mono-tabular text-xl text-[#C6A365]">
                {formatCurrency(order.totalAmount, lang)}
              </span>
            </div>
          </div>

          {/* Delivery Address Snapshot */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-xs font-bold text-[#F4F1EA] flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#C6A365]" />
              <span>{lang === 'ar' ? 'عنوان التوصيل المسجل:' : 'Delivery Address:'}</span>
            </p>
            <div className="p-3 bg-[#0B0B0E] border border-white/5 text-xs text-[#9E9A90] space-y-1">
              <p className="font-semibold text-[#F4F1EA]">{order.customerName}</p>
              <p className="font-mono-tabular">{order.customerPhone}</p>
              <p>{order.address}, {order.city}, {order.governorate}</p>
              {order.deliveryInstructions && (
                <p className="text-[#C6A365] italic text-[11px] mt-1">
                  "{order.deliveryInstructions}"
                </p>
              )}
            </div>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate({ page: 'shop' })}
            className="min-h-[46px] touch-press"
          >
            {lang === 'ar' ? 'متابعة التسوق واستكشاف اللوحات' : 'Continue Shopping'}
          </Button>
        </div>
      </div>
    </div>
  );
};
