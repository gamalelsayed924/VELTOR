import React from 'react';
import { useStore } from '../context/StoreContext';
import { COLLECTIONS } from '../data/catalog';
import { ProductCard } from '../components/ProductCard';
import { CollectionCard } from '../components/CollectionCard';

export const ShopPage: React.FC = () => {
  const { lang, products } = useStore();

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-8 space-y-3">
        <p className="font-brand text-xs tracking-[0.25em] text-[#C6A365] uppercase">
          VELTOR COLLECTION
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F1EA]">
          {lang === 'ar' ? 'متجر اللوحات الجدارية' : 'Automotive Wall Art Collection'}
        </h1>
        <p className="text-sm sm:text-base text-[#9E9A90] max-w-2xl leading-relaxed">
          {lang === 'ar'
            ? 'لوحات فنية جدارية مؤطرة لعشاق السيارات والتصميم الفاخر في مصر. كل لوحة تأتي بإطار أسود أنيق وتصميم جرافيكي فائق الدقة.'
            : 'Framed automotive wall art for car enthusiasts and luxury interior collectors in Egypt. Each piece features a refined black frame and high-precision graphic design.'}
        </p>
      </div>

      {/* The 5 Real Products Catalog */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F4F1EA]">
              {lang === 'ar' ? 'اللوحات المتاحة' : 'Available Artworks'}
            </h2>
            <p className="text-xs text-[#9E9A90] mt-1 font-mono-tabular">
              {lang === 'ar'
                ? `عرض ${products.length} لوحات مؤطرة`
                : `Showing ${products.length} framed posters`}
            </p>
          </div>
        </div>

        {/* 1 or 2 columns on mobile, 3 or 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Collections Section */}
      <section className="space-y-6 pt-12 border-t border-white/10">
        <div className="space-y-1">
          <p className="text-xs text-[#C6A365] font-medium uppercase tracking-wider">
            {lang === 'ar' ? 'سلسلة المجموعات' : 'Series & Collections'}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F4F1EA]">
            {lang === 'ar' ? 'مجموعات VELTOR الفنية' : 'VELTOR Artwork Series'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {COLLECTIONS.map((col, idx) => (
            <CollectionCard key={col.id} collection={col} index={idx} />
          ))}
        </div>
      </section>
    </div>
  );
};
