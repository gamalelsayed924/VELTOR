import React from 'react';
import { useStore } from '../context/StoreContext';
import { BRAND_ASSETS } from '../data/catalog';
import { ResilientImage } from '../components/ResilientImage';
import { Button } from '../components/Button';

export const AboutPage: React.FC = () => {
  const { lang, navigate } = useStore();

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20">
      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <p className="font-brand text-xs tracking-[0.28em] text-[#C6A365] uppercase">
          ABOUT VELTOR · DRIVE YOUR PASSION
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F1EA] balance-text">
          {lang === 'ar'
            ? 'من نحن — رؤية فنية تحتفي بهندسة السيارات'
            : 'About VELTOR — An Artistic Vision Celebrating Automotive Design'}
        </h1>
        <p className="text-base sm:text-lg text-[#9E9A90] leading-relaxed">
          {lang === 'ar'
            ? 'تأسست الهوية البصرية لعلامة VELTOR لتخاطب عشاق السيارات والمهتمين بالتصميم الداخلي الفاخر في مصر، عبر تقديم لوحات فنية ذات طابع جرافيكي يجمع بين الجرأة والبساطة والرقي.'
            : 'VELTOR was conceived for automotive enthusiasts and luxury interior design lovers in Egypt, presenting graphic-designed wall art that balances boldness, minimalism, and exclusivity.'}
        </p>
      </div>

      {/* Split Editorial Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch bg-[#131318] border border-white/10">
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F1EA]">
            {lang === 'ar'
              ? 'حيث يلتقي الشغف الهندسي بالتصميم الداخلي'
              : 'Where Automotive Proportion Meets Interior Architecture'}
          </h2>
          <p className="text-sm sm:text-base text-[#9E9A90] leading-relaxed">
            {lang === 'ar'
              ? 'لا تقتصر قيمة السيارة الأيقونية على أدائها الميكانيكي فحسب، بل تمتد إلى خطوطها الانسيابية وتفاصيلها البصرية التي تجعل منها عملاً نحتياً متكاملاً. في VELTOR، نعيد صياغة هذا الشغف في قوالب فنية جدارية تمنح الغرف والمكاتب التنفيذية والمساحات الخاصة طابعاً متفرداً.'
              : 'An iconic automobile is defined not only by mechanical performance, but by silhouette, stance, and proportion. VELTOR translates that visual language into graphic wall art tailored for modern living spaces, executive offices, and collector studios.'}
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={() => navigate({ page: 'shop' })}>
              {lang === 'ar' ? 'استكشف المجموعات' : 'Explore Collections'}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-6 min-h-[320px] bg-[#0B0B0E]">
          <ResilientImage
            src={BRAND_ASSETS.interiorShowcase}
            alt="VELTOR Interior Concept"
            className="w-full h-full object-cover lg:h-full"
          />
        </div>
      </div>

      {/* Placeholder Notice for Future Official Brand Story Additions */}
      <div className="p-8 bg-[#131318] border border-white/10 space-y-3">
        <h3 className="text-base font-bold text-[#F4F1EA]">
          {lang === 'ar'
            ? 'مساحة مخصصة للمعلومات الرسمية الإضافية (Placeholder)'
            : 'Reserved Section for Official Corporate Details (Placeholder)'}
        </h3>
        <p className="text-xs sm:text-sm text-[#9E9A90] leading-relaxed">
          {lang === 'ar'
            ? 'تم إعداد هذا القسم ليتم تحديثه لاحقاً بالمواصفات التفصيلية للإنتاج، فريق التصميم، والشراكات الرسمية الخاصة بعلامة VELTOR في مصر دون اختلاق أي ادعاءات تصنيعية غير معتمدة حالياً.'
            : 'This section is reserved for official production specifications, studio background, and verified brand milestones to be supplied by VELTOR without inventing unsupported manufacturing claims.'}
        </p>
      </div>
    </div>
  );
};
