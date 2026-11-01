import React from 'react';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { COLLECTIONS, REAL_PRODUCTS } from '../data/catalog';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';
import { Button } from '../components/Button';

interface CollectionDetailPageProps {
  slug: string;
}

export const CollectionDetailPage: React.FC<CollectionDetailPageProps> = ({ slug }) => {
  const { lang, isRtl, navigate, products } = useStore();

  const collection = COLLECTIONS.find((c) => c.slug === slug) || COLLECTIONS[0];
  const sampleItems = products && products.length > 0 ? products : REAL_PRODUCTS;

  return (
    <div className="pb-20 space-y-16">
      {/* Collection Hero Header */}
      <section className="relative bg-[#131318] border-b border-white/10 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <button
            type="button"
            onClick={() => navigate({ page: 'shop' })}
            className="inline-flex items-center gap-2 text-xs text-[#9E9A90] hover:text-[#C6A365] mb-8 transition-colors cursor-pointer"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{lang === 'ar' ? 'العودة إلى المتجر والمجموعات' : 'Back to Shop & Collections'}</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs text-[#C6A365]">
                <span>{lang === 'ar' ? 'نموذج قسم' : 'Collection Placeholder'}</span>
                <span>·</span>
                <span>VELTOR CURATION</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F1EA]">
                {collection.title[lang]}
              </h1>
              <p className="text-base sm:text-lg text-[#F4F1EA]/85 font-medium">
                {collection.subtitle[lang]}
              </p>
              <p className="text-sm sm:text-base text-[#9E9A90] leading-relaxed max-w-2xl">
                {collection.description[lang]}
              </p>

              {/* Other Collections Switcher */}
              <div className="pt-4 flex flex-wrap items-center gap-2">
                {COLLECTIONS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => navigate({ page: 'collection', slug: col.slug })}
                    className={`px-3.5 py-2 text-xs font-medium border transition-colors cursor-pointer ${
                      col.slug === collection.slug
                        ? 'bg-[#C6A365] text-[#0B0B0E] border-[#C6A365] font-semibold'
                        : 'bg-[#0B0B0E] text-[#9E9A90] border-white/10 hover:text-[#F4F1EA]'
                    }`}
                  >
                    {col.title[lang]}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="aspect-[4/3] overflow-hidden border border-white/10 bg-[#0B0B0E]">
                <ResilientImage
                  src={collection.image}
                  alt={collection.title[lang]}
                  aspectClass="aspect-[4/3]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Sample Products Grid */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-4 bg-[#131318] border border-[#C6A365]/40 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#C6A365] shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-[#9E9A90] leading-relaxed">
            {lang === 'ar'
              ? `يعرض قسم "${collection.title.ar}" حالياً نماذج لوحات تجريبية (Sample Placeholders) لتوضيح شكل القسم قبل إدراج اللوحات الفعلية.`
              : `The "${collection.title.en}" collection page currently displays sample product templates awaiting real product listings.`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {sampleItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex justify-between items-center">
          <Button variant="secondary" onClick={() => navigate({ page: 'shop' })}>
            {lang === 'ar' ? 'عرض جميع المجموعات' : 'View All Collections'}
          </Button>
        </div>
      </section>
    </div>
  );
};
