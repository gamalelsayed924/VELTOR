import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, ShoppingBag, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, formatCurrency } from '../data/catalog';
import { ResilientImage } from '../components/ResilientImage';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { lang, isRtl, navigate, addToCart, products } = useStore();

  const product: Product =
    products.find((p) => p.slug === slug || p.id === slug) || products[0];

  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);

  const title = lang === 'ar' ? product.name_ar : product.name_en;
  const description = lang === 'ar' ? product.description_ar : product.description_en;
  const category = lang === 'ar' ? product.category_ar : product.category_en;
  const size = lang === 'ar' ? product.size_ar : product.size_en;
  const orientation = lang === 'ar' ? product.orientation_ar : product.orientation_en;
  const frame = lang === 'ar' ? product.frame_ar : product.frame_en;
  const quantityPerSet = lang === 'ar' ? product.quantity_per_set_ar : product.quantity_per_set_en;

  // Product-specific SEO metadata
  useEffect(() => {
    const seoTitle = `${title} | VELTOR`;
    document.title = seoTitle;

    // First sentence of description for meta description
    const firstSentence = description.split(/[.،。\n]/)[0].trim();
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', firstSentence);

    return () => {
      document.title = 'VELTOR — DRIVE YOUR PASSION | لوحات فنية للسيارات الفاخرة';
    };
  }, [title, description]);

  const handleAddToBag = () => {
    addToCart(product, product.size_ar || undefined, product.frame_ar || undefined, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2200);
  };

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);

  // Check if size is provided (hide for Product 04!)
  const hasSize = Boolean(size && size.trim() !== '');

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-20">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={() => navigate({ page: 'shop' })}
          className="inline-flex items-center gap-2 text-xs text-[#9E9A90] hover:text-[#C6A365] transition-colors cursor-pointer min-h-[44px]"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{lang === 'ar' ? 'العودة إلى المتجر' : 'Back to Shop'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#9E9A90]">
          <span>{category}</span>
          <span>/</span>
          <span className="text-[#C6A365] font-semibold">{title}</span>
        </div>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Artwork Showcase Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] max-h-[720px] bg-[#0A0A0E] border border-white/10 p-4 sm:p-8 flex items-center justify-center overflow-hidden">
            <ResilientImage
              src={product.image}
              alt={lang === 'ar' ? (product.alt_ar || title) : (product.alt_en || title)}
              aspectClass="aspect-[3/4]"
              className="w-full h-full object-contain max-h-[660px]"
            />
          </div>
        </div>

        {/* Purchase & Specifications Module (5 cols) */}
        <div className="lg:col-span-5 bg-[#131318] border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="space-y-3 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-xs text-[#9E9A90]">
              <span>{category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#C6A365] font-brand tracking-widest uppercase">VELTOR EXCLUSIVE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F1EA] leading-tight">
              {title}
            </h1>

            {/* Price display */}
            <div className="pt-2 flex items-baseline gap-3">
              <span className="font-mono-tabular text-3xl font-bold text-[#C6A365]">
                {formatCurrency(product.price, lang)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-[#F4F1EA] uppercase tracking-wider">
              {lang === 'ar' ? 'الوصف' : 'Description'}
            </h2>
            <p className="text-sm text-[#9E9A90] leading-relaxed">
              {description}
            </p>
          </div>

          {/* Specifications (Only provided specifications; hide size if empty!) */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h2 className="text-xs font-semibold text-[#F4F1EA] uppercase tracking-wider">
              {lang === 'ar' ? 'المواصفات' : 'Specifications'}
            </h2>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              {hasSize && (
                <div className="p-3 bg-[#0B0B0E] border border-white/5">
                  <dt className="text-[#9E9A90] mb-1">{lang === 'ar' ? 'المقاس:' : 'Size:'}</dt>
                  <dd className="font-mono-tabular text-[#F4F1EA] font-semibold">{size}</dd>
                </div>
              )}

              {orientation && (
                <div className="p-3 bg-[#0B0B0E] border border-white/5">
                  <dt className="text-[#9E9A90] mb-1">{lang === 'ar' ? 'الاتجاه:' : 'Orientation:'}</dt>
                  <dd className="text-[#F4F1EA] font-semibold">{orientation}</dd>
                </div>
              )}

              {frame && (
                <div className="p-3 bg-[#0B0B0E] border border-white/5">
                  <dt className="text-[#9E9A90] mb-1">{lang === 'ar' ? 'الإطار:' : 'Frame:'}</dt>
                  <dd className="text-[#F4F1EA] font-semibold">{frame}</dd>
                </div>
              )}

              {quantityPerSet && (
                <div className="p-3 bg-[#0B0B0E] border border-white/5">
                  <dt className="text-[#9E9A90] mb-1">{lang === 'ar' ? 'العدد في المجموعة:' : 'Quantity per set:'}</dt>
                  <dd className="text-[#F4F1EA] font-semibold">{quantityPerSet}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Quantity Selector & Add to Bag */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-white/15 bg-[#0B0B0E] h-12">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-full text-[#F4F1EA] hover:text-[#C6A365] cursor-pointer flex items-center justify-center text-lg min-w-[44px] min-h-[44px]"
                  aria-label={lang === 'ar' ? 'تقليل الكمية' : 'Decrease quantity'}
                >
                  -
                </button>
                <span className="w-12 text-center font-mono-tabular text-sm font-semibold text-[#F4F1EA]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-full text-[#F4F1EA] hover:text-[#C6A365] cursor-pointer flex items-center justify-center text-lg min-w-[44px] min-h-[44px]"
                  aria-label={lang === 'ar' ? 'زيادة الكمية' : 'Increase quantity'}
                >
                  +
                </button>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleAddToBag}
                className="min-h-[48px]"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-[#0B0B0E]" />
                    <span>{lang === 'ar' ? 'تمت الإضافة بنجاح' : 'Added to Bag'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إضافة إلى حقيبة التسوق' : 'Add to Shopping Bag'}</span>
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => {
                handleAddToBag();
                navigate({ page: 'cart' });
              }}
              className="min-h-[44px]"
            >
              {lang === 'ar' ? 'إتمام الطلب الآن' : 'Proceed to Checkout'}
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <section className="pt-12 border-t border-white/10 space-y-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F4F1EA]">
          {lang === 'ar' ? 'لوحات فنية أخرى قد تعجبك' : 'Related Artworks'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
};
