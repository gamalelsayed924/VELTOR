import React from 'react';
import { Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LegalPolicyPageProps {
  policyType: 'privacy' | 'terms' | 'shipping';
}

export const LegalPolicyPage: React.FC<LegalPolicyPageProps> = ({ policyType }) => {
  const { lang, isRtl, navigate } = useStore();

  const contentMap = {
    privacy: {
      code: 'PRIVACY POLICY PLACEHOLDER',
      title: {
        ar: 'سياسة الخصوصية (قالب مبدئي)',
        en: 'Privacy Policy (Template Placeholder)',
      },
      summary: {
        ar: 'هذه الصفحة مخصصة لإدراج نص سياسة الخصوصية وحماية البيانات الرسمي المعتمد من إدارة VELTOR.',
        en: 'This page is reserved for the official VELTOR privacy and data protection policy.',
      },
      sections: [
        {
          heading: {
            ar: '1. جمع البيانات واستخدامها [عنصر نائب]',
            en: '1. Data Collection & Usage [Placeholder]',
          },
          body: {
            ar: 'سيتم في هذا القسم توضيح نوع البيانات التي يتم جمعها عند تفعيل الطلبات الرسمية وحسابات العملاء في مصر، وكيفية حمايتها وعدم مشاركتها مع أطراف غير مصرح لها.',
            en: 'This section will specify what customer data is collected once live ordering and accounts are enabled in Egypt, and how it is safeguarded.',
          },
        },
        {
          heading: {
            ar: '2. ملفات تعريف الارتباط (Cookies) [عنصر نائب]',
            en: '2. Cookies & Preferences [Placeholder]',
          },
          body: {
            ar: 'سيتم إدراج السياسة التفصيلية الخاصة بملفات تعريف الارتباط وتفضيلات اللغة والتصفح فور اعتماد الصياغة القانونية النهائية.',
            en: 'Detailed cookie and language preference policies will be inserted here upon legal finalization.',
          },
        },
      ],
    },
    terms: {
      code: 'TERMS & CONDITIONS PLACEHOLDER',
      title: {
        ar: 'الشروط والأحكام (قالب مبدئي)',
        en: 'Terms & Conditions (Template Placeholder)',
      },
      summary: {
        ar: 'هذه الصفحة مخصصة لإدراج الشروط والأحكام القانونية المنظمة لاستخدام موقع VELTOR وعمليات الشراء المستقبلية.',
        en: 'This page is reserved for the official legal Terms & Conditions governing the use of VELTOR and future commercial transactions.',
      },
      sections: [
        {
          heading: {
            ar: '1. حقوق الملكية الفكرية والتصاميم [عنصر نائب]',
            en: '1. Intellectual Property & Artwork Rights [Placeholder]',
          },
          body: {
            ar: 'يُدرج هنا النص القانوني الخاص بحقوق ملكية التصاميم الجرافيكية والعلامة التجارية VELTOR، وضوابط الاستخدام الشخصي والتجاري.',
            en: 'Official legal text regarding VELTOR graphic artwork copyrights and brand usage restrictions will be placed here.',
          },
        },
        {
          heading: {
            ar: '2. ضوابط الطلبات والتسعير [عنصر نائب]',
            en: '2. Ordering & Pricing Terms [Placeholder]',
          },
          body: {
            ar: 'سيتم تحديث هذا البند بشروط إتمام الطلبات والعملة المعتمدة والضرائب المطبقة في جمهورية مصر العربية عند الإطلاق التجاري.',
            en: 'Terms governing order confirmation, currency, and applicable Egyptian regulations will be populated here prior to launch.',
          },
        },
      ],
    },
    shipping: {
      code: 'SHIPPING & RETURNS PLACEHOLDER',
      title: {
        ar: 'الشحن والاستبدال (قالب مبدئي)',
        en: 'Shipping & Returns (Template Placeholder)',
      },
      summary: {
        ar: 'هذه الصفحة مخصصة لإدراج سياسات الشحن والتوصيل والاستبدال الرسمية دون اختلاق مواعيد أو رسوم غير معتمدة حالياً.',
        en: 'This page is reserved for official shipping, delivery, and return policies without inventing unverified delivery promises or fees.',
      },
      sections: [
        {
          heading: {
            ar: '1. نطاق التوصيل ومواعيد الشحن داخل مصر [عنصر نائب]',
            en: '1. Domestic Egypt Delivery Zones & Timelines [Placeholder]',
          },
          body: {
            ar: 'سيتم هنا تحديد المحافظات المشمولة بخدمة التوصيل، شركات الشحن المعتمدة، والمدد الزمنية الفعلية لتجهيز وتوصيل اللوحات فور بدء التشغيل.',
            en: 'Covered Egyptian governorates, logistics partners, and verified dispatch timelines will be documented here.',
          },
        },
        {
          heading: {
            ar: '2. سياسة الفحص والاستبدال والاسترجاع [عنصر نائب]',
            en: '2. Inspection, Returns & Exchanges [Placeholder]',
          },
          body: {
            ar: 'سيتم إدراج الشروط الرسمية للاستبدال أو الاسترجاع والإجراءات المتبعة في حال وجود ملاحظات عند الاستلام.',
            en: 'Official return eligibility windows and inspection procedures upon delivery will be specified here.',
          },
        },
      ],
    },
  };

  const activePolicy = contentMap[policyType];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-10">
      <button
        type="button"
        onClick={() => navigate({ page: 'home' })}
        className="inline-flex items-center gap-2 text-xs text-[#9E9A90] hover:text-[#C6A365] transition-colors cursor-pointer"
      >
        {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        <span>{lang === 'ar' ? 'العودة إلى الرئيسية' : 'Back to Homepage'}</span>
      </button>

      <div className="space-y-3 border-b border-white/10 pb-8">
        <p className="font-mono-tabular text-xs text-[#C6A365]">{activePolicy.code}</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#F4F1EA]">
          {activePolicy.title[lang]}
        </h1>
        <p className="text-sm sm:text-base text-[#9E9A90] leading-relaxed">
          {activePolicy.summary[lang]}
        </p>
      </div>

      {/* Policy Switcher Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['privacy', 'terms', 'shipping'] as const).map((typeKey) => (
          <button
            key={typeKey}
            type="button"
            onClick={() => navigate({ page: typeKey })}
            className={`px-4 py-2 text-xs font-medium border transition-colors cursor-pointer ${
              policyType === typeKey
                ? 'bg-[#C6A365] text-[#0B0B0E] border-[#C6A365] font-semibold'
                : 'bg-[#131318] text-[#9E9A90] border-white/10 hover:text-[#F4F1EA]'
            }`}
          >
            {contentMap[typeKey].title[lang]}
          </button>
        ))}
      </div>

      <div className="p-4 bg-[#131318] border border-[#C6A365]/40 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#C6A365] shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-[#9E9A90] leading-relaxed">
          {lang === 'ar'
            ? 'تنبيه: التزاماً بعدم اختلاق سياسات تجارية أو وعود شحن غير معتمدة، تم تجهيز هذه البنود كقوالب هيكلية جاهزة لإدراج النصوص القانونية الرسمية الخاصة بعلامة VELTOR.'
            : 'Notice: In accordance with project guidelines not to invent unauthorized business policies or shipping promises, these sections serve as structured placeholders awaiting official legal copy.'}
        </p>
      </div>

      <div className="space-y-6">
        {activePolicy.sections.map((sec, idx) => (
          <div key={idx} className="p-6 sm:p-8 bg-[#131318] border border-white/10 space-y-3">
            <h2 className="text-lg font-bold text-[#F4F1EA]">{sec.heading[lang]}</h2>
            <p className="text-sm text-[#9E9A90] leading-relaxed">{sec.body[lang]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
