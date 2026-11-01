import React, { useState } from 'react';
import {
  Compass,
  Flame,
  Sparkles,
  ArrowUpLeft,
  ArrowUpRight,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  BRAND_ASSETS,
  COLLECTIONS,
} from '../data/catalog';
import { Button } from '../components/Button';
import { CollectionCard } from '../components/CollectionCard';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';

export const HomePage: React.FC = () => {
  const { lang, isRtl, navigate, products } = useStore();

  // Brand Experience interactive space tabs
  const [activeSpace, setActiveSpace] = useState<'living' | 'office' | 'garage'>('office');

  // Newsletter state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [backendNotice, setBackendNotice] = useState<string | null>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendNotice(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError(
        lang === 'ar'
          ? 'يرجى إدخال عنوان البريد الإلكتروني.'
          : 'Please enter your email address.'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError(
        lang === 'ar'
          ? 'صيغة البريد الإلكتروني غير صحيحة. يرجى التأكد من كتابة بريد صالح (مثال: name@domain.com).'
          : 'Invalid email format. Please enter a valid address (e.g., name@domain.com).'
      );
      return;
    }

    setEmailError(null);
    setBackendNotice(
      lang === 'ar'
        ? 'تم التحقق من صحة صيغة البريد الإلكتروني بنجاح. ملاحظة: لم يتم تسجيل الاشتراك فعلياً نظراً لعدم ربط خادم القائمة البريدية (Backend) في هذه المرحلة.'
        : 'Email syntax validated. Note: Subscription was not simulated because no live mailing backend is connected.'
    );
  };

  const spaceConfigs = {
    office: {
      label: { ar: 'المكتب التنفيذي', en: 'Executive Office' },
      title: {
        ar: 'حضور بصري يليق بمساحة القرار',
        en: 'Visual authority for executive workspaces',
      },
      description: {
        ar: 'تمنح اللوحات الفنية المستوحاة من هندسة السيارات لمسة من الوقار والتركيز داخل المكاتب التنفيذية وقاعات الاجتماعات، حيث تلتقي الخطوط الجرافيكية المتقنة مع الديكور العصري.',
        en: 'Automotive graphic compositions bring structure and focal poise to executive offices and private studies, pairing clean architectural lines with refined interior aesthetics.',
      },
      image: BRAND_ASSETS.interiorShowcase,
    },
    living: {
      label: { ar: 'غرفة المعيشة والمجالس', en: 'Living Lounge' },
      title: {
        ar: 'نقطة ارتكاز فنية في قلب منزلك',
        en: 'An artistic centerpiece for contemporary living areas',
      },
      description: {
        ar: 'صُممت لوحات VELTOR لتنسجم مع الإضاءة الهادئة والأثاث الفاخر في غرف المعيشة والمجالس الخاصة، محوّلةً شغف السيارات إلى قطعة حوارية راقية.',
        en: 'Designed to harmonize with ambient lighting and curated furniture in modern Egyptian living spaces, turning automotive passion into a sophisticated visual statement.',
      },
      image: BRAND_ASSETS.heroGallery,
    },
    garage: {
      label: { ar: 'المرآب الخاص وصالة العرض', en: 'Private Garage & Studio' },
      title: {
        ar: 'تكامل الهوية لعشاق الاقتناء',
        en: 'Completing the sanctuary of automotive collectors',
      },
      description: {
        ar: 'في المرآب الخاص أو ركن الهوايات، تضفي التكوينات الجرافيكية المستلهمة من أساطير السرعة طابع المعرض الفني الخاص الذي يعكس ذائقتك الفريدة.',
        en: 'Within a private collector garage or studio lounge, graphic studies of speed legends elevate the surrounding space into a personal gallery.',
      },
      image: BRAND_ASSETS.speedLegends,
    },
  };

  const currentSpace = spaceConfigs[activeSpace];

  const brandValues = [
    {
      icon: Compass,
      title: {
        ar: 'تصميم يهتم بالتفاصيل',
        en: 'Detail-Driven Graphic Design',
      },
      description: {
        ar: 'نركز في كل تكوين بصري على إبراز النسب الهندسية والخطوط الانسيابية التي تميز كل سيارة، برؤية فنية متوازنة وهادئة.',
        en: 'Every graphic composition focuses on geometric proportion, silhouette balance, and visual clarity tailored for discerning eyes.',
      },
    },
    {
      icon: Flame,
      title: {
        ar: 'شغف يتجاوز الطريق',
        en: 'Passion Beyond the Asphalt',
      },
      description: {
        ar: 'ننقل روح الأداء وعالم السيارات من الحلبات والطرقات إلى المساحات الداخلية الراقية بأسلوب يحترم ذائقة عشاق السيارات في مصر.',
        en: 'We translate the emotion of automotive culture from the road into refined interior spaces across Egypt.',
      },
    },
    {
      icon: Sparkles,
      title: {
        ar: 'فن يعبّر عن شخصيتك',
        en: 'Art That Reflects Your Identity',
      },
      description: {
        ar: 'سواء كنت تميل إلى الكلاسيكيات الفاخرة أو السيارات الرياضية الحديثة، تعكس اختياراتك الفنية حضورك وشغفك الخاص في مكانك.',
        en: 'Whether drawn to timeless grand tourers or modern aerodynamic icons, your wall art speaks directly to your personal aesthetic.',
      },
    },
  ];

  return (
    <div className="space-y-24 md:space-y-32 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[78vh] flex items-center border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0">
          <ResilientImage
            src={BRAND_ASSETS.heroGallery}
            alt={
              lang === 'ar'
                ? 'لوحة فنية لسيارة رياضية فاخرة داخل غرفة معيشة عصرية'
                : 'Luxury automotive wall art in a contemporary collector lounge'
            }
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/75 to-[#0B0B0E]/45" />
          <div
            className={`absolute inset-0 ${
              isRtl
                ? 'bg-gradient-to-l from-[#0B0B0E]/95 via-[#0B0B0E]/70 to-transparent'
                : 'bg-gradient-to-r from-[#0B0B0E]/95 via-[#0B0B0E]/70 to-transparent'
            }`}
          />
        </div>

        <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 w-full">
          <div className="max-w-2xl space-y-6">
            <p className="font-brand text-xs sm:text-sm tracking-[0.3em] text-[#C6A365] uppercase">
              VELTOR · DRIVE YOUR PASSION
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F1EA] leading-[1.18] balance-text">
              {lang === 'ar'
                ? 'شغف السيارات... يتحول إلى فن'
                : 'Automotive Passion... Transformed Into Art'}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#F4F1EA]/85 leading-relaxed max-w-xl">
              {lang === 'ar'
                ? 'اكتشف لوحات فنية صُممت لعشاق التفاصيل، والأداء، والفخامة.'
                : 'Discover graphic-designed wall art crafted for lovers of detail, performance, and luxury interiors.'}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate({ page: 'shop' })}
              >
                <span>{lang === 'ar' ? 'اكتشف المجموعة' : 'Explore Collection'}</span>
                {isRtl ? (
                  <ArrowUpLeft className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate({ page: 'about' })}
              >
                <span>{lang === 'ar' ? 'تعرّف على VELTOR' : 'Discover VELTOR'}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COLLECTIONS */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs text-[#C6A365] font-medium mb-2 uppercase tracking-wider">
              {lang === 'ar' ? 'المجموعات الفنية' : 'Curated Collections'}
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F4F1EA] balance-text">
              {lang === 'ar' ? 'مجموعاتنا الرئيسية' : 'Featured Collections'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate({ page: 'shop' })}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#C6A365] hover:underline whitespace-nowrap shrink-0 cursor-pointer self-start md:self-auto min-h-[44px]"
          >
            <span>{lang === 'ar' ? 'عرض جميع اللوحات' : 'View All Artworks'}</span>
            {isRtl ? <ArrowUpLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {COLLECTIONS.map((col, idx) => (
            <CollectionCard key={col.id} collection={col} index={idx} />
          ))}
        </div>
      </section>

      {/* 3. BRAND STATEMENT */}
      <section className="bg-[#131318] border-y border-white/10 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="font-brand text-xs tracking-[0.28em] text-[#C6A365] uppercase">
            VELTOR PHILOSOPHY
          </p>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#F4F1EA] leading-tight balance-text">
            {lang === 'ar'
              ? 'ليست مجرد لوحة. إنها شغفك على الحائط.'
              : 'Not Just a Frame. It Is Your Passion on the Wall.'}
          </h2>
          <p className="text-base sm:text-lg text-[#9E9A90] leading-relaxed max-w-2xl mx-auto">
            {lang === 'ar'
              ? 'في VELTOR، نؤمن بأن التصميم الهندسي للسيارات يحمل قيمة فنية تتجاوز حدود الطرقات. لذلك نبتكر لوحات جرافيكية تجمع بين دقة الخطوط الانسيابية، التعبير الفني الراقي، وجماليات الديكور الداخلي الحديث، لنمنح مساحتك الخاصة في مصر هوية بصرية تعبّر عن شغفك بالتفرد.'
              : 'At VELTOR, we believe automotive design carries an artistic language that transcends the road. We create graphic compositions where aerodynamic proportion, artistic expression, and interior architecture converge—giving contemporary Egyptian spaces a distinctive visual signature.'}
          </p>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (THE 5 REAL PUBLISHED PRODUCTS) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs text-[#C6A365] font-medium mb-2 uppercase tracking-wider">
              {lang === 'ar' ? 'لوحات سيارات بإطار' : 'Framed Automotive Posters'}
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F4F1EA] balance-text">
              {lang === 'ar' ? 'أحدث اللوحات المتاحة' : 'Featured Artworks'}
            </h2>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate({ page: 'shop' })}
          >
            {lang === 'ar' ? 'عرض الكتالوج الكامل' : 'Browse Full Catalog'}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. BRAND EXPERIENCE */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#131318] border border-white/10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Content Column */}
            <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <p className="text-xs text-[#C6A365] font-medium uppercase tracking-wider">
                  {lang === 'ar' ? 'تجربة VELTOR في المساحات الداخلية' : 'The VELTOR Interior Experience'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F1EA] balance-text">
                  {lang === 'ar'
                    ? 'حضور فني يثري كل مساحة'
                    : 'Elevating Rooms, Executive Offices & Collector Spaces'}
                </h2>

                {/* Interactive Space Switcher Tabs */}
                <div className="pt-2 flex flex-wrap gap-2" role="tablist">
                  {(['office', 'living', 'garage'] as const).map((spaceKey) => (
                    <button
                      key={spaceKey}
                      type="button"
                      role="tab"
                      aria-selected={activeSpace === spaceKey}
                      onClick={() => setActiveSpace(spaceKey)}
                      className={`px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border min-h-[44px] ${
                        activeSpace === spaceKey
                          ? 'bg-[#C6A365] text-[#0B0B0E] border-[#C6A365] font-semibold'
                          : 'bg-[#1A1A22] text-[#9E9A90] border-white/10 hover:text-[#F4F1EA]'
                      }`}
                    >
                      {spaceConfigs[spaceKey].label[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 py-4 border-y border-white/10">
                <h3 className="text-lg sm:text-xl font-bold text-[#F4F1EA]">
                  {currentSpace.title[lang]}
                </h3>
                <p className="text-sm text-[#9E9A90] leading-relaxed">
                  {currentSpace.description[lang]}
                </p>
              </div>

              <div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate({ page: 'shop' })}
                >
                  {lang === 'ar' ? 'استكشف اللوحات' : 'Explore Artworks'}
                </Button>
              </div>
            </div>

            {/* Image Showcase Column */}
            <div className="lg:col-span-7 relative min-h-[320px] sm:min-h-[420px] bg-[#0B0B0E]">
              <ResilientImage
                src={currentSpace.image}
                alt={currentSpace.title[lang]}
                className="w-full h-full object-cover lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E]/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 start-5 end-5 flex items-center justify-between text-xs text-[#F4F1EA]/90">
                <span>{currentSpace.label[lang]}</span>
                <span className="text-[#C6A365] font-brand tracking-widest">VELTOR INTERIOR CONCEPT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BRAND VALUES */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <p className="text-xs text-[#C6A365] font-medium uppercase tracking-wider">
            {lang === 'ar' ? 'ركائز العلامة' : 'Core Brand Pillars'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F1EA]">
            {lang === 'ar' ? 'قيم VELTOR الفنية' : 'What Defines VELTOR'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {brandValues.map((val, idx) => {
            const IconComponent = val.icon;
            return (
              <div
                key={idx}
                className="p-7 md:p-8 bg-[#131318] border border-white/10 flex flex-col justify-between space-y-6"
              >
                <div className="w-11 h-11 bg-[#1A1A22] border border-white/10 flex items-center justify-center text-[#C6A365]">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="space-y-2.5">
                  <h3 className="text-lg font-bold text-[#F4F1EA]">
                    {val.title[lang]}
                  </h3>
                  <p className="text-sm text-[#9E9A90] leading-relaxed">
                    {val.description[lang]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. NEWSLETTER */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 md:p-16 bg-[#131318] border border-white/10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <p className="font-brand text-xs tracking-[0.25em] text-[#C6A365] uppercase">
              VELTOR JOURNAL
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F1EA] balance-text">
              {lang === 'ar'
                ? 'انضم إلى قائمة المهتمين بإصدارات VELTOR'
                : 'Join the VELTOR Collector Dispatch'}
            </h2>
            <p className="text-sm text-[#9E9A90] leading-relaxed">
              {lang === 'ar'
                ? 'أدخل بريدك الإلكتروني للتحقق من الجاهزية واستلام الإشعارات فور تفعيل خدمة النشرة البريدية عند الإطلاق الرسمي.'
                : 'Enter your email address below. Validated submissions will be ready once the live newsletter backend is connected.'}
            </p>

            <form onSubmit={handleNewsletterSubmit} noValidate className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 text-start">
                  <label htmlFor="newsletter-email" className="sr-only">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                      if (backendNotice) setBackendNotice(null);
                    }}
                    placeholder={
                      lang === 'ar'
                        ? 'أدخل بريدك الإلكتروني (مثال: collector@example.com)'
                        : 'Enter your email address (e.g., collector@example.com)'
                    }
                    aria-invalid={Boolean(emailError)}
                    className={`w-full h-12 px-4 bg-[#0B0B0E] border text-sm text-[#F4F1EA] placeholder-[#9E9A90] focus:outline-none ${
                      emailError
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-white/15 focus:border-[#C6A365]'
                    }`}
                  />
                </div>
                <Button type="submit" variant="primary" size="md">
                  {lang === 'ar' ? 'تحقق من البريد' : 'Validate Email'}
                </Button>
              </div>

              {emailError && (
                <div
                  role="alert"
                  className="p-3 bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 text-start"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              {backendNotice && (
                <div
                  role="status"
                  className="p-3.5 bg-[#1A1A22] border border-[#C6A365]/50 text-[#F4F1EA] text-xs flex items-start gap-2.5 text-start leading-relaxed"
                >
                  <Info className="w-4 h-4 text-[#C6A365] shrink-0 mt-0.5" />
                  <span>{backendNotice}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
