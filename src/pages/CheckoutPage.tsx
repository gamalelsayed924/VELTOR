import React, { useState, useRef } from 'react';
import {
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Upload,
  FileText,
  X,
  Copy,
  Check,
  Smartphone,
  Eye,
  Loader2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../data/catalog';
import { Button } from '../components/Button';
import { ResilientImage } from '../components/ResilientImage';

const EGYPT_GOVERNORATES = [
  { ar: 'القاهرة', en: 'Cairo' },
  { ar: 'الجيزة', en: 'Giza' },
  { ar: 'الإسكندرية', en: 'Alexandria' },
  { ar: 'القليوبية', en: 'Qalyubia' },
  { ar: 'الشرقية', en: 'Sharqia' },
  { ar: 'الدقهلية', en: 'Dakahlia' },
  { ar: 'البحيرة', en: 'Beheira' },
  { ar: 'المنوفية', en: 'Menoufia' },
  { ar: 'الغربية', en: 'Gharbia' },
  { ar: 'كفر الشيخ', en: 'Kafr El Sheikh' },
  { ar: 'دمياط', en: 'Damietta' },
  { ar: 'بورسعيد', en: 'Port Said' },
  { ar: 'الإسماعيلية', en: 'Ismailia' },
  { ar: 'السويس', en: 'Suez' },
  { ar: 'بني سويف', en: 'Beni Suef' },
  { ar: 'الفيوم', en: 'Faiyum' },
  { ar: 'المنيا', en: 'Minya' },
  { ar: 'أسيوط', en: 'Asyut' },
  { ar: 'سوهاج', en: 'Sohag' },
  { ar: 'قنا', en: 'Qena' },
  { ar: 'الأقصر', en: 'Luxor' },
  { ar: 'أسوان', en: 'Aswan' },
  { ar: 'البحر الأحمر', en: 'Red Sea' },
  { ar: 'جنوب سيناء', en: 'South Sinai' },
  { ar: 'شمال سيناء', en: 'North Sinai' },
  { ar: 'مطروح', en: 'Matrouh' },
  { ar: 'الوادي الجديد', en: 'New Valley' },
];

export const CheckoutPage: React.FC = () => {
  const {
    lang,
    isRtl,
    navigate,
    cart,
    cartCount,
    subtotal,
    shippingFee,
    totalAmount,
    shippingFeePerItem,
    vodafoneCashNumber,
    clearCart,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [governorate, setGovernorate] = useState(EGYPT_GOVERNORATES[0][lang]);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Mandatory Receipt Upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string | null>(null);
  const [isReceiptDragging, setIsReceiptDragging] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy number state
  const [copiedNumber, setCopiedNumber] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(vodafoneCashNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleReceiptSelection = (file: File) => {
    setReceiptError(null);
    setErrorMessage(null);

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimes.includes(file.type)) {
      setReceiptError(
        lang === 'ar'
          ? 'صيغة الملف غير مدعومة. يرجى اختيار صورة (JPEG, PNG, WebP) أو ملف PDF.'
          : 'Invalid file format. Please choose an image (JPEG, PNG, WebP) or PDF file.'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setReceiptError(
        lang === 'ar'
          ? 'حجم الملف كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت.'
          : 'File size exceeds maximum limit of 10MB.'
      );
      return;
    }

    setReceiptFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptBase64(reader.result as string);
    };
    reader.onerror = () => {
      setReceiptError(lang === 'ar' ? 'حدث خطأ أثناء قراءة الملف.' : 'Error reading file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleReceiptSelection(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsReceiptDragging(true);
  };

  const handleDragLeave = () => {
    setIsReceiptDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsReceiptDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleReceiptSelection(file);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptBase64(null);
    setReceiptError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If cart is empty, redirect to shop
  if (cart.length === 0) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6 animate-fade-in">
        <ShoppingBag className="w-12 h-12 text-[#C6A365] mx-auto opacity-70" />
        <h1 className="text-2xl font-bold text-[#F4F1EA]">
          {lang === 'ar' ? 'لا توجد منتجات لإتمام الطلب' : 'No Items to Checkout'}
        </h1>
        <p className="text-sm text-[#9E9A90]">
          {lang === 'ar'
            ? 'حقيبة التسوق فارغة حالياً. أضف لوحاتك المفضلة للمتابعة.'
            : 'Your shopping bag is currently empty. Add your selected pieces to continue.'}
        </p>
        <Button variant="primary" onClick={() => navigate({ page: 'shop' })}>
          {lang === 'ar' ? 'تصفح المتجر' : 'Browse Store'}
        </Button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setReceiptError(null);

    // Validate fields
    if (!customerName.trim()) {
      setErrorMessage(lang === 'ar' ? 'يرجى كتابة الاسم بالكامل.' : 'Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.trim().replace(/[\s-]/g, '');
    const egPhoneRegex = /^(?:\+?20|0020)?0?1[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(cleanPhone)) {
      setErrorMessage(
        lang === 'ar'
          ? 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو 011 أو 012 أو 015).'
          : 'Please enter a valid Egyptian mobile number (e.g. 01012345678, 011, 012, or 015).'
      );
      return;
    }

    if (!city.trim()) {
      setErrorMessage(lang === 'ar' ? 'يرجى إدخال المدينة أو الحي.' : 'Please enter your city or area.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage(lang === 'ar' ? 'يرجى إدخال العنوان التفصيلي لتوصيل اللوحة.' : 'Please enter your full delivery address.');
      return;
    }

    // MANDATORY RECEIPT ENFORCEMENT BEFORE ORDER CONFIRMATION
    if (!receiptFile || !receiptBase64) {
      setReceiptError(
        lang === 'ar'
          ? 'يجب إرفاق إيصال تحويل فودافون كاش قبل تأكيد الطلب.'
          : 'Please upload your Vodafone Cash transfer receipt before confirming your order.'
      );
      setErrorMessage(
        lang === 'ar'
          ? 'إرفاق إيصال التحويل إلزامي لإتمام الطلب. يرجى تحويل المبلغ ورفع صورة الإيصال أدناه.'
          : 'Transfer receipt is mandatory. Please transfer the amount and upload your receipt below.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_phone: cleanPhone,
        customer_whatsapp: customerWhatsapp.trim() || undefined,
        governorate: governorate.trim(),
        city: city.trim(),
        address: address.trim(),
        delivery_instructions: deliveryInstructions.trim() || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          productSlug: item.product.slug,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedFrame: item.selectedFrame,
        })),
        receipt: {
          fileData: receiptBase64,
          fileName: receiptFile.name,
          fileType: receiptFile.type,
        },
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (lang === 'ar' ? 'تعذر تسجيل الطلب' : 'Failed to create order'));
      }

      // Order created successfully with verified receipt attached
      clearCart();
      navigate({ page: 'order-confirmation', orderRef: data.orderRef });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate({ page: 'cart' })}
            className="inline-flex items-center gap-2 text-xs text-[#9E9A90] hover:text-[#C6A365] mb-2 cursor-pointer min-h-[44px] touch-press"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'العودة إلى حقيبة التسوق' : 'Back to Shopping Bag'}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F4F1EA] tracking-tight">
            {lang === 'ar' ? 'إتمام الطلب وتأكيد الدفع' : 'Checkout & Payment'}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#C6A365] bg-[#131318] border border-white/10 px-3.5 py-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{lang === 'ar' ? 'دفع آمن عبر فودافون كاش' : 'Secure Vodafone Cash Checkout'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Main Column: Delivery details & Vodafone Cash Transfer (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Delivery Information */}
            <div className="bg-[#131318] border border-white/10 p-5 sm:p-7 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#F4F1EA] flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#C6A365] text-[#0B0B0E] text-xs font-bold inline-flex items-center justify-center font-mono-tabular shrink-0">
                    1
                  </span>
                  <span>{lang === 'ar' ? 'بيانات التوصيل والشحن' : 'Delivery & Shipping Details'}</span>
                </h2>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="p-4 bg-red-950/40 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-start gap-3 animate-slide-down"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#F4F1EA] mb-1.5">
                    {lang === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: أحمد محمد' : 'e.g., Ahmed Mohamed'}
                    className="w-full h-12 px-4 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA] placeholder-[#9E9A90] focus:outline-none focus:border-[#C6A365] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#F4F1EA] mb-1.5">
                      {lang === 'ar' ? 'رقم الهاتف (مصر) *' : 'Egyptian Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full h-12 px-4 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA] placeholder-[#9E9A90] font-mono-tabular focus:outline-none focus:border-[#C6A365] transition-colors"
                    />
                    <span className="block text-[11px] text-[#9E9A90] mt-1">
                      {lang === 'ar' ? 'رقم الهاتف للتواصل وتأكيد الشحن' : 'For shipping & delivery confirmation'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#F4F1EA] mb-1.5">
                      {lang === 'ar' ? 'رقم الواتساب (اختياري)' : 'WhatsApp Number (Optional)'}
                    </label>
                    <input
                      type="tel"
                      value={customerWhatsapp}
                      onChange={(e) => setCustomerWhatsapp(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full h-12 px-4 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA] placeholder-[#9E9A90] font-mono-tabular focus:outline-none focus:border-[#C6A365] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#F4F1EA] mb-1.5">
                      {lang === 'ar' ? 'المحافظة *' : 'Governorate *'}
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full h-12 px-4 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA] focus:outline-none focus:border-[#C6A365] cursor-pointer"
                    >
                      {EGYPT_GOVERNORATES.map((gov) => (
                        <option key={gov.en} value={gov[lang]} className="bg-[#131318]">
                          {gov[lang]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#F4F1EA] mb-1.5">
                      {lang === 'ar' ? 'المدينة أو الحي *' : 'City or Area *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: التجمع الخامس، المعادي، الشيخ زايد...' : 'e.g. New Cairo, Maadi, Zayed...'}
                      className="w-full h-12 px-4 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA] placeholder-[#9E9A90] focus:outline-none focus:border-[#C6A365] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F4F1EA] mb-1.5">
                    {lang === 'ar' ? 'العنوان التفصيلي *' : 'Full Delivery Address *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'اسم الشارع، رقم العقار، رقم الشقة أو تفاصيل المعلم القريب...'
                        : 'Street name, building number, apartment, landmark...'
                    }
                    className="w-full p-4 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA] placeholder-[#9E9A90] focus:outline-none focus:border-[#C6A365] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F4F1EA] mb-1.5">
                    {lang === 'ar' ? 'ملاحظات إضافية للتوصيل (اختياري)' : 'Additional Instructions (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder={lang === 'ar' ? 'أي توجيهات خاصة لمندوب الشحن...' : 'Special courier notes...'}
                    className="w-full h-12 px-4 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA] placeholder-[#9E9A90] focus:outline-none focus:border-[#C6A365] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Vodafone Cash Transfer & Mandatory Receipt Upload */}
            <div className="bg-[#131318] border border-[#C6A365]/30 p-5 sm:p-7 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#F4F1EA] flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#C6A365] text-[#0B0B0E] text-xs font-bold inline-flex items-center justify-center font-mono-tabular shrink-0">
                    2
                  </span>
                  <span>{lang === 'ar' ? 'التحويل عبر فودافون كاش ورفع الإيصال' : 'Vodafone Cash & Receipt Upload'}</span>
                </h2>
                <span className="text-[11px] font-semibold text-[#C6A365] uppercase tracking-wider bg-[#C6A365]/10 px-2 py-1 border border-[#C6A365]/30">
                  {lang === 'ar' ? 'مطلوب إلزامي' : 'Mandatory'}
                </span>
              </div>

              {/* Vodafone Cash Box */}
              <div className="p-4 sm:p-5 bg-[#0B0B0E] border border-white/15 space-y-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[#C6A365] shrink-0" />
                  <p className="text-xs sm:text-sm text-[#F4F1EA]">
                    {lang === 'ar' ? (
                      <>
                        يرجى تحويل المبلغ الإجمالي دقيقاً (
                        <span className="font-mono-tabular font-bold text-[#C6A365]">
                          {formatCurrency(totalAmount, lang)}
                        </span>
                        ) إلى محفظة فودافون كاش الرسمية:
                      </>
                    ) : (
                      <>
                        Please transfer the exact total amount (
                        <span className="font-mono-tabular font-bold text-[#C6A365]">
                          {formatCurrency(totalAmount, lang)}
                        </span>
                        ) to our official Vodafone Cash wallet:
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#1A1A22] border border-[#C6A365]/40">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-[#9E9A90] block">
                      {lang === 'ar' ? 'رقم محفظة فودافون كاش' : 'Vodafone Cash Wallet Number'}
                    </span>
                    <span className="font-mono-tabular text-lg sm:text-xl font-bold text-[#F4F1EA] tracking-wider">
                      {vodafoneCashNumber}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#C6A365] text-[#0B0B0E] hover:bg-[#D6B578] transition-colors cursor-pointer min-h-[44px] touch-press shrink-0"
                  >
                    {copiedNumber ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'نسخ الرقم' : 'Copy Number'}</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-[#9E9A90] leading-relaxed">
                  {lang === 'ar'
                    ? 'بعد إتمام التحويل من هاتفك أو محفظتك، التقط لقطة شاشة واضحة لرسالة التحويل أو الإيصال وقم برفعها في المربع أدناه لتأكيد طلبك مباشرة.'
                    : 'After completing the transfer, take a clear screenshot of the confirmation SMS or receipt and upload it below to verify and place your order.'}
                </p>
              </div>

              {/* Mandatory File Uploader */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#F4F1EA]">
                    {lang === 'ar' ? 'إيصال التحويل (صورة أو PDF) *' : 'Transfer Receipt (Image or PDF) *'}
                  </label>
                  <span className="text-[11px] text-[#9E9A90]">
                    {lang === 'ar' ? 'الحد الأقصى: 10 ميجابايت' : 'Max 10MB'}
                  </span>
                </div>

                {receiptError && (
                  <div
                    role="alert"
                    className="p-3 bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{receiptError}</span>
                  </div>
                )}

                {!receiptFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                      isReceiptDragging
                        ? 'border-[#C6A365] bg-[#C6A365]/10'
                        : 'border-white/20 bg-[#0B0B0E] hover:border-[#C6A365]/70 hover:bg-[#131318]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-[#C6A365] mx-auto mb-3 opacity-80" />
                    <p className="text-xs sm:text-sm font-semibold text-[#F4F1EA]">
                      {lang === 'ar'
                        ? 'اضغط هنا لرفع إيصال التحويل أو اسحب الملف وأفلته'
                        : 'Click to upload transfer receipt or drag and drop'}
                    </p>
                    <p className="text-[11px] text-[#9E9A90] mt-1.5">
                      {lang === 'ar'
                        ? 'الصيغ المدعومة: JPEG, PNG, WebP أو PDF (حتى 10MB)'
                        : 'Supported formats: JPEG, PNG, WebP or PDF (up to 10MB)'}
                    </p>
                    <div className="mt-4">
                      <span className="inline-block px-3 py-1.5 text-xs font-semibold bg-white/[0.08] text-[#F4F1EA] hover:bg-white/[0.15] border border-white/10">
                        {lang === 'ar' ? 'اختيار الملف من جهازك' : 'Browse File'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#0B0B0E] border border-[#C6A365]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 w-full sm:w-auto">
                      {receiptFile.type === 'application/pdf' ? (
                        <div className="w-16 h-20 bg-red-950/40 border border-red-500/40 flex flex-col items-center justify-center shrink-0">
                          <FileText className="w-8 h-8 text-red-400" />
                          <span className="text-[9px] font-bold text-red-300 mt-1 uppercase">PDF</span>
                        </div>
                      ) : receiptBase64 ? (
                        <div className="w-16 h-20 bg-[#131318] border border-white/15 overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={receiptBase64}
                            alt="Receipt Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <FileText className="w-8 h-8 text-[#C6A365]" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F1EA]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">{receiptFile.name}</span>
                        </div>
                        <p className="text-[11px] text-[#9E9A90] mt-0.5 font-mono-tabular">
                          {(receiptFile.size / 1024).toFixed(1)} KB
                        </p>
                        <p className="text-[11px] text-[#C6A365] mt-0.5">
                          {lang === 'ar' ? 'جاهز للإرسال مع الطلب' : 'Ready to submit with order'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 text-xs text-[#F4F1EA] hover:text-[#C6A365] border border-white/10 hover:border-white/20 transition-colors cursor-pointer min-h-[44px] touch-press"
                      >
                        {lang === 'ar' ? 'تغيير الملف' : 'Change'}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveReceipt}
                        className="p-2.5 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/50 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center touch-press"
                        aria-label={lang === 'ar' ? 'حذف الإيصال' : 'Remove receipt'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column: Order Review & Submit (5 cols) */}
          <div className="lg:col-span-5 bg-[#131318] border border-white/10 p-5 sm:p-7 md:p-8 space-y-6 lg:sticky lg:top-24">
            <h2 className="text-lg sm:text-xl font-bold text-[#F4F1EA] border-b border-white/10 pb-4">
              {lang === 'ar' ? 'ملخص اللوحات والمبالغ' : 'Order Summary & Total'}
            </h2>

            {/* Items review */}
            <div className="space-y-3 max-h-64 overflow-y-auto pe-1 no-scrollbar">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-2.5 bg-[#0B0B0E] border border-white/5"
                >
                  <div className="w-14 h-18 bg-[#131318] overflow-hidden shrink-0 p-1 flex items-center justify-center">
                    <ResilientImage
                      src={item.product.image}
                      alt={item.product.name_en}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#F4F1EA] truncate">
                      {lang === 'ar' ? item.product.name_ar : item.product.name_en}
                    </p>
                    <p className="text-[11px] text-[#9E9A90] mt-0.5">
                      {item.quantity} × {formatCurrency(item.product.price, lang)}
                    </p>
                  </div>
                  <span className="font-mono-tabular text-xs font-bold text-[#C6A365] shrink-0">
                    {formatCurrency(item.product.price * item.quantity, lang)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing breakdown */}
            <div className="space-y-3 border-t border-white/10 pt-4 text-xs sm:text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-[#9E9A90]">{lang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-mono-tabular text-[#F4F1EA] font-semibold">
                  {formatCurrency(subtotal, lang)}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[#9E9A90] block">
                    {lang === 'ar' ? 'رسوم الشحن:' : 'Shipping Fee:'}
                  </span>
                  <span className="text-[11px] text-[#9E9A90]">
                    {lang === 'ar'
                      ? `(${shippingFeePerItem} ج.م × ${cartCount} قطع)`
                      : `(${shippingFeePerItem} EGP × ${cartCount} items)`}
                  </span>
                </div>
                <span className="font-mono-tabular text-[#F4F1EA] font-semibold">
                  {formatCurrency(shippingFee, lang)}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline font-bold">
                <span className="text-sm sm:text-base text-[#F4F1EA]">
                  {lang === 'ar' ? 'الإجمالي المطلوب دفعه:' : 'Total Payable:'}
                </span>
                <span className="font-mono-tabular text-xl sm:text-2xl text-[#C6A365]">
                  {formatCurrency(totalAmount, lang)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting || !receiptFile}
              className="min-h-[52px] touch-press font-semibold"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'ar' ? 'جارٍ تسجيل الطلب وحفظ الإيصال...' : 'Submitting Order & Receipt...'}</span>
                </span>
              ) : (
                <span>
                  {lang === 'ar' ? 'تأكيد الطلب وإرسال الإيصال' : 'Submit Order & Receipt'}
                </span>
              )}
            </Button>

            {!receiptFile && (
              <p className="text-[11px] text-[#C6A365] text-center font-medium bg-[#C6A365]/10 p-2.5 border border-[#C6A365]/30">
                {lang === 'ar'
                  ? 'يرجى تحويل المبلغ ورفع صورة الإيصال لتفعيل زر تأكيد الطلب'
                  : 'Please transfer payment & upload receipt to enable order confirmation'}
              </p>
            )}

            <p className="text-[11px] text-[#9E9A90] text-center leading-relaxed">
              {lang === 'ar'
                ? 'بالضغط على تأكيد الطلب، سيتم إرسال إيصال الدفع وبيانات التوصيل لمراجعتها بواسطة الإدارة، وإصدار رقم مرجعي فريد لتتبع طلبك.'
                : 'By confirming your order, your receipt and delivery details will be securely submitted for admin verification with a unique tracking reference.'}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
