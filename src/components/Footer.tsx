import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { COLLECTIONS } from '../data/catalog';

export const Footer: React.FC = () => {
  const { lang, navigate, setIsFaqOpen, whatsappNumber, vodafoneCashNumber } = useStore();

  const waUrl = `https://wa.me/20${whatsappNumber.replace(/^0+/, '')}`;

  return (
    <footer className="bg-[#08080A] border-t border-white/10 text-[#9E9A90]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Brand Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <button
              type="button"
              onClick={() => navigate({ page: 'home' })}
              className="font-brand text-2xl font-bold text-[#F4F1EA] hover:text-[#C6A365] transition-colors cursor-pointer block"
            >
              VELTOR
            </button>
            <p className="font-brand text-xs tracking-[0.28em] text-[#C6A365] uppercase">
              DRIVE YOUR PASSION
            </p>
            <p className="text-sm text-[#9E9A90] leading-relaxed max-w-sm">
              {lang === 'ar'
                ? 'علامة متخصصة في اللوحات الفنية الجدارية للسيارات، صُممت لعشاق التفاصيل والأداء والباحثين عن التميز في التصميم الداخلي في مصر.'
                : 'A luxury automotive graphic wall art brand crafted for car enthusiasts and refined interior design collectors in Egypt.'}
            </p>
            <div className="pt-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#131318] hover:bg-[#1A1A22] border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'ar' ? 'تواصل عبر واتساب (WhatsApp)' : 'Chat on WhatsApp'}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-semibold text-[#F4F1EA] tracking-wider uppercase">
              {lang === 'ar' ? 'التنقل' : 'Navigation'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'home' })}
                  className="hover:text-[#F4F1EA] transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'الرئيسية' : 'Home'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop' })}
                  className="hover:text-[#F4F1EA] transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'المتجر' : 'Shop'}
                </button>
              </li>
              {COLLECTIONS.map((col) => (
                <li key={col.id}>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'collection', slug: col.slug })}
                    className="hover:text-[#F4F1EA] transition-colors cursor-pointer"
                  >
                    {col.title[lang]}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'about' })}
                  className="hover:text-[#F4F1EA] transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'من نحن' : 'About VELTOR'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'contact' })}
                  className="hover:text-[#F4F1EA] transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies & FAQs (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold text-[#F4F1EA] tracking-wider uppercase">
              {lang === 'ar' ? 'السياسات والمساعدة' : 'Policies & Support'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'privacy' })}
                  className="hover:text-[#F4F1EA] transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'terms' })}
                  className="hover:text-[#F4F1EA] transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shipping' })}
                  className="hover:text-[#F4F1EA] transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'الشحن والاستبدال' : 'Shipping & Returns'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsFaqOpen(true)}
                  className="hover:text-[#F4F1EA] transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQs'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care & Vodafone Cash */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-semibold text-[#F4F1EA] tracking-wider uppercase">
              {lang === 'ar' ? 'الدفع والتواصل' : 'Payment & Contact'}
            </h3>
            <div className="p-4 bg-[#131318] border border-white/10 space-y-2 text-xs">
              <p className="text-[#F4F1EA] font-medium">
                {lang === 'ar' ? 'خدمة العملاء في مصر' : 'Egypt Customer Service'}
              </p>
              <p className="text-[#9E9A90]">
                {lang === 'ar' ? 'واتساب الرسمي:' : 'Official WhatsApp:'}{' '}
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="font-mono-tabular text-[#C6A365] hover:underline">
                  {whatsappNumber}
                </a>
              </p>
              <p className="text-[#9E9A90]">
                {lang === 'ar' ? 'محفظة فودافون كاش:' : 'Vodafone Cash Wallet:'}{' '}
                <span className="font-mono-tabular text-[#F4F1EA]">{vodafoneCashNumber}</span>
              </p>
              <p className="text-[#9E9A90]">
                {lang === 'ar' ? 'الشحن: جميع محافظات مصر (25 ج.م للقطعة)' : 'Shipping: All Egypt Governorates (25 EGP/item)'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9E9A90]">
          <p>
            © {new Date().getFullYear()} VELTOR — DRIVE YOUR PASSION.{' '}
            {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-[#9E9A90]">
            <span>{lang === 'ar' ? 'لوحات سيارات بإطار فاخر' : 'Luxury Framed Automotive Posters'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
