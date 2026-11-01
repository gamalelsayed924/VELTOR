import React from 'react';
import { ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { CollectionPlaceholder } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ResilientImage } from './ResilientImage';

interface CollectionCardProps {
  collection: CollectionPlaceholder;
  index: number;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ collection, index }) => {
  const { lang, isRtl, navigate } = useStore();

  return (
    <article
      onClick={() => navigate({ page: 'collection', slug: collection.slug })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate({ page: 'collection', slug: collection.slug });
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={collection.title[lang]}
      className="group relative flex flex-col bg-[#131318] border border-white/10 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A365] cursor-pointer text-start"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0E0E12]">
        <ResilientImage
          src={collection.image}
          alt={collection.title[lang]}
          aspectClass="aspect-[4/3]"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/30 to-transparent opacity-85" />

        <div className="absolute top-4 start-4 end-4 flex items-center justify-between text-xs text-[#F4F1EA]/75">
          <span className="font-mono-tabular">0{index + 1}</span>
          <span className="text-[11px] text-[#C6A365]">
            {lang === 'ar' ? 'نموذج قسم' : 'Collection Placeholder'}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 justify-between p-6 md:p-7 bg-[#131318]">
        <div>
          <p className="text-xs text-[#9E9A90] mb-2">
            {collection.curationNote[lang]}
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-[#F4F1EA] group-hover:text-[#C6A365] transition-colors">
            {collection.title[lang]}
          </h3>
          <p className="mt-2.5 text-sm text-[#9E9A90] leading-relaxed line-clamp-2">
            {collection.subtitle[lang]}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-medium text-[#F4F1EA]">
          <span className="group-hover:text-[#C6A365] transition-colors">
            {lang === 'ar' ? 'استكشف القسم' : 'Explore Collection'}
          </span>
          {isRtl ? (
            <ArrowUpLeft className="w-4 h-4 text-[#C6A365] transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-[#C6A365] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </div>
      </div>
    </article>
  );
};
