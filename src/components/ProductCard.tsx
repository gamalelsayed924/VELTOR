import React from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { Product, formatCurrency } from '../data/catalog';
import { useStore } from '../context/StoreContext';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { lang, navigate, addToCart } = useStore();

  const title = lang === 'ar' ? product.name_ar : product.name_en;
  const description = lang === 'ar' ? product.description_ar : product.description_en;
  const category = lang === 'ar' ? product.category_ar : product.category_en;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.size_ar || undefined, product.frame_ar || undefined, 1);
  };

  const handleOpenDetail = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    navigate({ page: 'product', slug: product.slug });
  };

  const altText = lang === 'ar' ? (product.alt_ar || title) : (product.alt_en || title);

  return (
    <article
      onClick={() => handleOpenDetail()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpenDetail();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={title}
      className="group flex flex-col bg-[#131318] border border-white/10 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#C6A365]/60 hover:shadow-xl hover:shadow-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A365] cursor-pointer text-start touch-press"
    >
      {/* Artwork Image Container with 3:4 portrait aspect ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0A0A0E] p-3 flex items-center justify-center">
        <ResilientImage
          src={product.image}
          alt={altText}
          aspectClass="aspect-[3/4]"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0E]/60 via-transparent to-transparent opacity-40 pointer-events-none" />
      </div>

      {/* Clean Unboxed Metadata and Selling Price */}
      <div className="flex flex-col flex-1 justify-between p-5 md:p-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#9E9A90] mb-2">
            <span>{category}</span>
            {product.frame_ar && (
              <>
                <span aria-hidden="true">·</span>
                <span>{lang === 'ar' ? `إطار ${product.frame_ar}` : `${product.frame_en} Frame`}</span>
              </>
            )}
            {/* Show size only if provided (hidden for Product 04 as requested!) */}
            {product.size_ar && product.size_ar.trim() !== '' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">{lang === 'ar' ? product.size_ar : product.size_en}</span>
              </>
            )}
          </div>

          <h3 className="text-base font-semibold text-[#F4F1EA] group-hover:text-[#C6A365] transition-colors line-clamp-1">
            {title}
          </h3>

          <p className="mt-1.5 text-xs text-[#9E9A90] line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          {/* Selling Price in EGP */}
          <div>
            <span className="block text-[11px] text-[#9E9A90]">
              {lang === 'ar' ? 'السعر' : 'Price'}
            </span>
            <span className="font-mono-tabular text-base font-bold text-[#C6A365]">
              {formatCurrency(product.price, lang)}
            </span>
          </div>

          {/* Action Buttons with touch targets >= 44x44px */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenDetail}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 text-[#9E9A90] hover:text-[#F4F1EA] border border-white/10 hover:border-white/25 transition-colors cursor-pointer"
              title={lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
              aria-label={lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleQuickAdd}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold bg-white/[0.06] hover:bg-[#C6A365] text-[#F4F1EA] hover:text-[#0B0B0E] border border-white/10 hover:border-[#C6A365] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إضافة للحقيبة' : 'Add to Bag'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
