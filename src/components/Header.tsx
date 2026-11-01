import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  Globe,
  ArrowUpLeft,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { COLLECTIONS, formatCurrency } from '../data/catalog';
import { ResilientImage } from './ResilientImage';

export const Header: React.FC = () => {
  const {
    lang,
    toggleLang,
    isRtl,
    route,
    navigate,
    products,
    cartCount,
    isSearchOpen,
    setIsSearchOpen,
    lastAddedNotice,
    adminToken,
    vodafoneCashNumber,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  // Lock body scroll when mobile menu or search modal is open
  useEffect(() => {
    if (mobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, isSearchOpen]);

  // Handle Escape key to close open overlays
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (isSearchOpen) setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, isSearchOpen, setIsSearchOpen]);

  const navItems = [
    {
      id: 'home',
      label: { ar: 'الرئيسية', en: 'Home' },
      isActive: route.page === 'home',
      onClick: () => navigate({ page: 'home' }),
    },
    {
      id: 'shop',
      label: { ar: 'المتجر', en: 'Shop' },
      isActive: route.page === 'shop' || route.page === 'product',
      onClick: () => navigate({ page: 'shop' }),
    },
    {
      id: 'collections',
      label: { ar: 'مجموعاتنا', en: 'Collections' },
      isActive: route.page === 'collection',
      onClick: () => navigate({ page: 'collection', slug: COLLECTIONS[0].slug }),
    },
    {
      id: 'about',
      label: { ar: 'من نحن', en: 'About Us' },
      isActive: route.page === 'about',
      onClick: () => navigate({ page: 'about' }),
    },
    {
      id: 'contact',
      label: { ar: 'تواصل معنا', en: 'Contact' },
      isActive: route.page === 'contact',
      onClick: () => navigate({ page: 'contact' }),
    },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchedCollections = normalizedQuery
    ? COLLECTIONS.filter(
        (c) =>
          c.title.ar.toLowerCase().includes(normalizedQuery) ||
          c.title.en.toLowerCase().includes(normalizedQuery) ||
          c.subtitle.ar.toLowerCase().includes(normalizedQuery) ||
          c.subtitle.en.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const matchedProducts = normalizedQuery
    ? products.filter(
        (p) =>
          p.name_ar.toLowerCase().includes(normalizedQuery) ||
          p.name_en.toLowerCase().includes(normalizedQuery) ||
          p.slug.toLowerCase().includes(normalizedQuery) ||
          p.category_ar.toLowerCase().includes(normalizedQuery) ||
          p.category_en.toLowerCase().includes(normalizedQuery)
      )
    : [];

  return (
    <>
      {/* Slim Announcement Bar */}
      {announcementVisible && (
        <div className="bg-[#131318] border-b border-white/10 text-[#9E9A90] text-xs h-9 flex items-center justify-between px-4 md:px-8">
          <div className="w-6 hidden sm:block" aria-hidden="true" />
          <p className="truncate text-center font-normal px-2">
            {lang === 'ar'
              ? 'شحن سريع لجميع محافظات مصر — الدفع الآمن عبر فودافون كاش (Vodafone Cash)'
              : 'Fast shipping across Egypt — Manual Vodafone Cash payment available'}
          </p>
          <button
            type="button"
            onClick={() => setAnnouncementVisible(false)}
            className="text-[#9E9A90] hover:text-[#F4F1EA] p-1.5 transition-colors cursor-pointer shrink-0 touch-press"
            aria-label={lang === 'ar' ? 'إغلاق الشريط الإعلاني' : 'Dismiss announcement bar'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              navigate({ page: 'home' });
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }}
            className="font-brand text-xl md:text-2xl font-bold text-[#F4F1EA] hover:text-[#C6A365] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A365] touch-press py-2"
          >
            VELTOR
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav
            aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Main Navigation'}
            className="hidden lg:flex items-center gap-7"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  item.isActive
                    ? 'text-[#C6A365]'
                    : 'text-[#F4F1EA]/80 hover:text-[#F4F1EA]'
                }`}
              >
                {item.label[lang]}
                {item.isActive && (
                  <span className="absolute bottom-0 inset-x-0 h-[1.5px] bg-[#C6A365]" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Storefront Utilities & Mobile Hamburger */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#F4F1EA]/85 hover:text-[#C6A365] border border-white/10 hover:border-[#C6A365]/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] min-w-[44px] touch-press"
              aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
              title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe className="w-3.5 h-3.5 text-[#C6A365] shrink-0" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-[#F4F1EA]/85 hover:text-[#C6A365] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-press"
              aria-label={lang === 'ar' ? 'بحث في المنتجات' : 'Search products'}
              title={lang === 'ar' ? 'بحث' : 'Search'}
            >
              <Search className="w-5 h-5 shrink-0" />
            </button>

            {/* Account / User Icon */}
            <button
              type="button"
              onClick={() => {
                if (adminToken) {
                  navigate({ page: 'admin' });
                } else if (route.page === 'account' || route.page === 'login') {
                  // already on auth page
                } else {
                  navigate({ page: 'login' });
                }
              }}
              className="p-2.5 text-[#F4F1EA]/85 hover:text-[#C6A365] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-press"
              aria-label={lang === 'ar' ? 'حسابي / تسجيل الدخول' : 'My Account / Sign In'}
              title={lang === 'ar' ? 'حسابي' : 'Account'}
            >
              <User className="w-5 h-5 shrink-0" />
            </button>

            {/* Shopping Cart Icon with Tabular Counter */}
            <button
              type="button"
              onClick={() => navigate({ page: 'cart' })}
              className="relative inline-flex items-center justify-center gap-1.5 p-2.5 text-[#F4F1EA] hover:text-[#C6A365] transition-colors cursor-pointer min-h-[44px] min-w-[44px] touch-press"
              aria-label={
                lang === 'ar'
                  ? `حقيبة التسوق تحتوي على ${cartCount} قطع`
                  : `Shopping bag contains ${cartCount} items`
              }
              title={lang === 'ar' ? 'حقيبة التسوق' : 'Shopping Bag'}
            >
              <ShoppingBag className="w-5 h-5 shrink-0" />
              <span className="font-mono-tabular text-xs font-bold text-[#C6A365]">
                ({cartCount})
              </span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-[#F4F1EA] hover:text-[#C6A365] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-press"
              aria-label={
                mobileMenuOpen
                  ? lang === 'ar'
                    ? 'إغلاق القائمة'
                    : 'Close menu'
                  : lang === 'ar'
                  ? 'فتح القائمة الرئيسية'
                  : 'Open navigation menu'
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 shrink-0" /> : <Menu className="w-6 h-6 shrink-0" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-[#0B0B0E]/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div
            className={`fixed inset-y-0 ${
              isRtl ? 'right-0' : 'left-0'
            } w-[85vw] max-w-sm bg-[#131318] border-${
              isRtl ? 'l' : 'r'
            } border-white/10 shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-scale-in z-10`}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-brand text-xl font-bold text-[#F4F1EA] tracking-wider">
                  VELTOR
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#9E9A90] hover:text-[#F4F1EA] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-press"
                  aria-label={lang === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5" aria-label="Mobile Navigation">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      item.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-start py-3.5 px-3 text-base font-semibold border-b border-white/5 flex items-center justify-between cursor-pointer min-h-[48px] transition-colors touch-press ${
                      item.isActive
                        ? 'text-[#C6A365] bg-[#C6A365]/5'
                        : 'text-[#F4F1EA] hover:text-[#C6A365]'
                    }`}
                  >
                    <span>{item.label[lang]}</span>
                    {isRtl ? (
                      <ArrowUpLeft className="w-4 h-4 opacity-60 shrink-0" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 opacity-60 shrink-0" />
                    )}
                  </button>
                ))}

                {/* Account / Login link in mobile menu */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (adminToken) {
                      navigate({ page: 'admin' });
                    } else {
                      navigate({ page: 'login' });
                    }
                  }}
                  className="w-full text-start py-3.5 px-3 text-base font-semibold border-b border-white/5 flex items-center justify-between text-[#F4F1EA] hover:text-[#C6A365] cursor-pointer min-h-[48px] transition-colors touch-press"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#C6A365] shrink-0" />
                    <span>{lang === 'ar' ? 'حسابي / تسجيل الدخول' : 'My Account / Sign In'}</span>
                  </span>
                  {isRtl ? (
                    <ArrowUpLeft className="w-4 h-4 opacity-60 shrink-0" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 opacity-60 shrink-0" />
                  )}
                </button>
              </nav>
            </div>

            {/* Drawer Footer Information */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9E9A90]">{lang === 'ar' ? 'اللغة:' : 'Language:'}</span>
                <button
                  type="button"
                  onClick={() => {
                    toggleLang();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F4F1EA] border border-white/15 bg-white/5"
                >
                  <Globe className="w-3.5 h-3.5 text-[#C6A365]" />
                  <span>{lang === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}</span>
                </button>
              </div>

              <div className="p-3 bg-[#0B0B0E] border border-white/5 text-[11px] text-[#9E9A90] space-y-1">
                <p className="font-semibold text-[#F4F1EA] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C6A365]" />
                  <span>{lang === 'ar' ? 'فودافون كاش المعتمد:' : 'Official Vodafone Cash:'}</span>
                </p>
                <p className="font-mono-tabular text-[#C6A365] font-bold">{vodafoneCashNumber}</p>
                <p>{lang === 'ar' ? 'توصيل لجميع أنحاء مصر' : 'Express shipping across Egypt'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Feedback Toast */}
      {lastAddedNotice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 end-5 z-50 bg-[#1A1A22] border border-[#C6A365]/60 text-[#F4F1EA] px-5 py-3.5 shadow-2xl flex items-center gap-4 max-w-md animate-slide-up"
        >
          <ShoppingBag className="w-4 h-4 text-[#C6A365] shrink-0" />
          <span className="text-xs sm:text-sm">{lastAddedNotice}</span>
          <button
            type="button"
            onClick={() => navigate({ page: 'cart' })}
            className="text-xs font-semibold text-[#C6A365] hover:underline whitespace-nowrap shrink-0 cursor-pointer min-h-[44px] flex items-center"
          >
            {lang === 'ar' ? 'عرض الحقيبة' : 'View Bag'}
          </button>
        </div>
      )}

      {/* Search Overlay Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0B0B0E]/90 backdrop-blur-md flex items-start justify-center p-4 sm:p-8 overflow-y-auto animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'ar' ? 'البحث في الموقع' : 'Site Search'}
        >
          <div className="w-full max-w-3xl bg-[#131318] border border-white/15 p-6 sm:p-8 mt-4 sm:mt-8 animate-scale-in">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <Search className="w-5 h-5 text-[#C6A365] shrink-0" />
                <input
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'ابحث في اللوحات (مثال: سوبرا، بورش، فيراري، E46)...'
                      : 'Search artworks (e.g. Supra, Porsche, Ferrari, E46)...'
                  }
                  className="w-full bg-transparent text-[#F4F1EA] placeholder-[#9E9A90] text-sm sm:text-base focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 text-[#9E9A90] hover:text-[#F4F1EA] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-press"
                aria-label={lang === 'ar' ? 'إغلاق البحث' : 'Close search'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!normalizedQuery ? (
              <div className="py-8 space-y-4">
                <p className="text-xs text-[#9E9A90]">
                  {lang === 'ar' ? 'اللوحات الأكثر طلباً وبحثاً:' : 'Popular searches:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        navigate({ page: 'product', slug: p.slug });
                        setIsSearchOpen(false);
                      }}
                      className="p-3 bg-[#1A1A22] border border-white/10 hover:border-[#C6A365] text-start flex items-center justify-between transition-colors cursor-pointer touch-press min-h-[48px]"
                    >
                      <span className="text-xs font-semibold text-[#F4F1EA]">
                        {lang === 'ar' ? p.name_ar : p.name_en}
                      </span>
                      <span className="text-xs font-mono-tabular text-[#C6A365]">
                        {formatCurrency(p.price, lang)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : matchedCollections.length === 0 && matchedProducts.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-base font-medium text-[#F4F1EA]">
                  {lang === 'ar'
                    ? `لا توجد نتائج مطابقة لـ "${searchQuery}"`
                    : `No matching results for "${searchQuery}"`}
                </p>
                <p className="text-xs text-[#9E9A90]">
                  {lang === 'ar'
                    ? 'جرّب البحث عن Supra أو Porsche أو Ferrari أو E46'
                    : 'Try searching for Supra, Porsche, Ferrari, or E46'}
                </p>
              </div>
            ) : (
              <div className="py-6 space-y-6">
                {matchedProducts.length > 0 && (
                  <div>
                    <h4 className="text-xs text-[#9E9A90] mb-3">
                      {lang === 'ar' ? 'اللوحات الفنية المطابقة' : 'Matching Artworks'}
                    </h4>
                    <div className="space-y-2.5">
                      {matchedProducts.map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => {
                            navigate({ page: 'product', slug: prod.slug });
                            setIsSearchOpen(false);
                          }}
                          className="w-full p-3 bg-[#1A1A22] border border-white/10 hover:border-[#C6A365] text-start flex items-center gap-4 transition-colors cursor-pointer touch-press"
                        >
                          <div className="w-14 h-18 shrink-0 overflow-hidden bg-[#0B0B0E] p-1 flex items-center justify-center">
                            <ResilientImage src={prod.image} alt={prod.name_en} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#F4F1EA] truncate">
                              {lang === 'ar' ? prod.name_ar : prod.name_en}
                            </p>
                            <p className="text-xs font-mono-tabular font-bold text-[#C6A365] mt-1">
                              {formatCurrency(prod.price, lang)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
