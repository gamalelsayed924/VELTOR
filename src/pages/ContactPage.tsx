import React, { useState } from 'react';
import { AlertCircle, Info, Mail, Phone, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/Button';

export const ContactPage: React.FC = () => {
  const { lang, setIsFaqOpen } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(
        lang === 'ar'
          ? 'يرجى استكمال جميع الحقول المطلوبة قبل التحقق.'
          : 'Please complete all required fields before validation.'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(
        lang === 'ar'
          ? 'صيغة البريد الإلكتروني غير صحيحة.'
          : 'Please enter a valid email address.'
      );
      return;
    }

    setError(null);
    setStatusNotice(
      lang === 'ar'
        ? 'تم التحقق من صحة بيانات النموذج بنجاح. ملاحظة: هذا النموذج واجهة تأسيسية (Frontend Template) بانتظار ربط بريد خدمة العملاء الرسمي عند الإطلاق.'
        : 'Form inputs validated. Note: This form is a foundational template awaiting live customer service backend integration.'
    );
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
      <div className="max-w-2xl space-y-3">
        <p className="font-brand text-xs tracking-[0.28em] text-[#C6A365] uppercase">
          CONTACT VELTOR
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F1EA]">
          {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
        </h1>
        <p className="text-sm sm:text-base text-[#9E9A90] leading-relaxed">
          {lang === 'ar'
            ? 'صفحة مخصصة لاستقبال استفسارات العملاء وطلبات التصميم الداخلي. تحتوي البطاقات أدناه على عناصر نائبة (Placeholders) مهيأة لإدراج بيانات التواصل الرسمية.'
            : 'Dedicated contact template for client inquiries and interior curation requests. Contact cards below display clearly identified placeholders awaiting official business details.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Information Placeholders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#131318] border border-white/10 space-y-5">
            <h2 className="text-lg font-bold text-[#F4F1EA]">
              {lang === 'ar'
                ? 'قنوات التواصل الرسمية (عناصر نائبة)'
                : 'Official Contact Channels (Placeholders)'}
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#C6A365] shrink-0 mt-1" />
                <div>
                  <span className="block text-xs text-[#9E9A90]">
                    {lang === 'ar' ? 'البريد الإلكتروني الرسمي:' : 'Official Email:'}
                  </span>
                  <span className="text-[#F4F1EA] font-mono-tabular">
                    [Official Email Placeholder]
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#C6A365] shrink-0 mt-1" />
                <div>
                  <span className="block text-xs text-[#9E9A90]">
                    {lang === 'ar' ? 'رقم الهاتف / واتساب:' : 'Phone / WhatsApp:'}
                  </span>
                  <span className="text-[#F4F1EA] font-mono-tabular">
                    [Official Phone Number Placeholder]
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C6A365] shrink-0 mt-1" />
                <div>
                  <span className="block text-xs text-[#9E9A90]">
                    {lang === 'ar' ? 'المقر / نطاق الخدمة:' : 'Location / Service Area:'}
                  </span>
                  <span className="text-[#F4F1EA]">
                    {lang === 'ar'
                      ? 'جمهورية مصر العربية — [يُضاف العنوان التفصيلي هنا]'
                      : 'Egypt — [Official studio address placeholder]'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsFaqOpen(true)}
              >
                {lang === 'ar' ? 'استعرض الأسئلة الشائعة' : 'View Frequently Asked Questions'}
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Form Template (7 cols) */}
        <div className="lg:col-span-7 bg-[#131318] border border-white/10 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#F4F1EA] mb-6">
            {lang === 'ar' ? 'نموذج المراسلة' : 'Inquiry Form Template'}
          </h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#F4F1EA] mb-2">
                {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                className="w-full h-11 px-4 bg-[#0B0B0E] border border-white/15 text-sm text-[#F4F1EA] placeholder-[#9E9A90] focus:outline-none focus:border-[#C6A365]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F4F1EA] mb-2">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 px-4 bg-[#0B0B0E] border border-white/15 text-sm text-[#F4F1EA] placeholder-[#9E9A90] focus:outline-none focus:border-[#C6A365]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F4F1EA] mb-2">
                {lang === 'ar' ? 'الرسالة أو الاستفسار' : 'Message'}
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'اكتب تفاصيل استفسارك هنا...'
                    : 'Write your inquiry details here...'
                }
                className="w-full p-4 bg-[#0B0B0E] border border-white/15 text-sm text-[#F4F1EA] placeholder-[#9E9A90] focus:outline-none focus:border-[#C6A365]"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {statusNotice && (
              <div
                role="status"
                className="p-3.5 bg-[#1A1A22] border border-[#C6A365]/50 text-[#F4F1EA] text-xs flex items-start gap-2.5 leading-relaxed"
              >
                <Info className="w-4 h-4 text-[#C6A365] shrink-0 mt-0.5" />
                <span>{statusNotice}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="md">
              {lang === 'ar' ? 'التحقق من الرسالة' : 'Validate Inquiry'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
