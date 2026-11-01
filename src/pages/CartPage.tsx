import React from 'react';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../data/catalog';
import { ResilientImage } from '../components/ResilientImage';
import { Button } from '../components/Button';

export const CartPage: React.FC = () => {
  const {
    lang,
    isRtl,
    navigate,
    cart,
    cartCount,
    subtotal,
    shippingFee,
    totalAmount,
    shippingFeePerItem,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useStore();

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="font-brand text-xs tracking-[0.28em] text-[#C6A365] uppercase">
            VELTOR SHOPPING BAG
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F4F1EA] mt-1">
            {lang === 'ar' ? 'حقيبة التسوق' : 'Shopping Bag'}
          </h1>
        </div>
        <span className="font-mono-tabular text-sm text-[#9E9A90]">
          {lang === 'ar'
            ? `إجمالي القطع: ${cartCount}`
            : `Total items: ${cartCount}`}
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="p-12 md:p-20 bg-[#131318] border border-white/10 text-center space-y-6">
          <ShoppingBag className="w-12 h-12 text-[#C6A365] mx-auto opacity-70" />
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-[#F4F1EA]">
              {lang === 'ar' ? 'حقيبة التسوق فارغة حالياً' : 'Your Shopping Bag Is Empty'}
            </h2>
            <p className="text-xs sm:text-sm text-[#9E9A90] leading-relaxed">
              {lang === 'ar'
                ? 'استكشف لوحاتنا الجدارية الفاخرة للسيارات واختر ما يناسب مساحتك الخاصة.'
                : 'Explore our luxury framed automotive wall art collection to find the perfect statement piece.'}
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate({ page: 'shop' })} className="touch-press">
            {lang === 'ar' ? 'تصفح المتجر' : 'Explore Storefront'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Itemized List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const title = lang === 'ar' ? item.product.name_ar : item.product.name_en;
              const hasSize = Boolean(item.selectedSize && item.selectedSize.trim() !== '');

              return (
                <div
                  key={item.product.id}
                  className="p-4 sm:p-6 bg-[#131318] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'product', slug: item.product.slug })}
                      className="w-20 sm:w-28 aspect-[3/4] bg-[#0A0A0E] overflow-hidden shrink-0 cursor-pointer p-1 sm:p-2 flex items-center justify-center border border-white/5 touch-press"
                    >
                      <ResilientImage
                        src={item.product.image}
                        alt={title}
                        aspectClass="aspect-[3/4]"
                        className="w-full h-full object-contain"
                      />
                    </button>

                    <div className="flex-1 min-w-0 space-y-1 sm:hidden">
                      <button
                        type="button"
                        onClick={() => navigate({ page: 'product', slug: item.product.slug })}
                        className="text-sm font-bold text-[#F4F1EA] hover:text-[#C6A365] text-start block cursor-pointer transition-colors truncate touch-press"
                      >
                        {title}
                      </button>
                      <div className="text-[11px] text-[#9E9A90] space-y-0.5">
                        {hasSize && (
                          <p>
                            {lang === 'ar' ? 'المقاس:' : 'Size:'}{' '}
                            <span className="font-mono-tabular text-[#F4F1EA]">{item.selectedSize}</span>
                          </p>
                        )}
                        <p>
                          {lang === 'ar' ? 'الإطار:' : 'Frame:'}{' '}
                          <span className="text-[#F4F1EA]">
                            {lang === 'ar' ? item.product.frame_ar || 'أسود' : item.product.frame_en || 'Black'}
                          </span>
                        </p>
                      </div>
                      <p className="text-sm font-mono-tabular font-bold text-[#C6A365]">
                        {formatCurrency(item.product.price, lang)}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:block flex-1 min-w-0 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'product', slug: item.product.slug })}
                      className="text-base font-bold text-[#F4F1EA] hover:text-[#C6A365] text-start block cursor-pointer transition-colors"
                    >
                      {title}
                    </button>

                    <div className="text-xs text-[#9E9A90] space-y-0.5">
                      {hasSize && (
                        <p>
                          {lang === 'ar' ? 'المقاس:' : 'Size:'}{' '}
                          <span className="font-mono-tabular text-[#F4F1EA]">{item.selectedSize}</span>
                        </p>
                      )}
                      <p>
                        {lang === 'ar' ? 'الإطار:' : 'Frame:'}{' '}
                        <span className="text-[#F4F1EA]">
                          {lang === 'ar' ? item.product.frame_ar || 'أسود' : item.product.frame_en || 'Black'}
                        </span>
                      </p>
                    </div>

                    <p className="text-sm font-mono-tabular font-bold text-[#C6A365] pt-1">
                      {formatCurrency(item.product.price, lang)}
                    </p>
                  </div>

                  {/* Quantity Steppers & Remove */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t border-white/5 sm:border-0">
                    <div className="flex items-center border border-white/15 bg-[#0B0B0E] h-10">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-10 h-full text-[#F4F1EA] hover:text-[#C6A365] cursor-pointer flex items-center justify-center min-w-[40px] min-h-[40px] touch-press font-mono-tabular text-sm font-bold"
                        aria-label={lang === 'ar' ? 'إنقاص الكمية' : 'Decrease quantity'}
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-mono-tabular text-xs font-semibold text-[#F4F1EA]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-10 h-full text-[#F4F1EA] hover:text-[#C6A365] cursor-pointer flex items-center justify-center min-w-[40px] min-h-[40px] touch-press font-mono-tabular text-sm font-bold"
                        aria-label={lang === 'ar' ? 'زيادة الكمية' : 'Increase quantity'}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2.5 text-[#9E9A90] hover:text-red-400 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-press"
                      aria-label={lang === 'ar' ? 'حذف العنصر' : 'Remove item'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate({ page: 'shop' })}
                className="inline-flex items-center gap-2 text-xs text-[#9E9A90] hover:text-[#C6A365] cursor-pointer min-h-[44px] touch-press"
              >
                {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{lang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}</span>
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-[#9E9A90] hover:text-red-400 cursor-pointer min-h-[44px] flex items-center touch-press"
              >
                {lang === 'ar' ? 'إفراغ الحقيبة' : 'Clear Bag'}
              </button>
            </div>
          </div>

          {/* Bag Summary & Shipping Fee Calculation (4 cols) */}
          <div className="lg:col-span-4 bg-[#131318] border border-white/10 p-6 sm:p-8 space-y-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-[#F4F1EA] border-b border-white/10 pb-4">
              {lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
            </h2>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-[#9E9A90]">
                  {lang === 'ar' ? 'عدد القطع:' : 'Total Items:'}
                </span>
                <span className="font-mono-tabular text-[#F4F1EA] font-semibold">{cartCount}</span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-[#9E9A90]">
                  {lang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}
                </span>
                <span className="font-mono-tabular text-[#F4F1EA] font-semibold">
                  {formatCurrency(subtotal, lang)}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[#9E9A90] block">
                    {lang === 'ar' ? 'رسوم الشحن داخل مصر:' : 'Shipping Fee (Egypt):'}
                  </span>
                  <span className="text-[11px] text-[#9E9A90]">
                    {lang === 'ar'
                      ? `(${shippingFeePerItem} ج.م لكل قطعة × ${cartCount})`
                      : `(${shippingFeePerItem} EGP per item × ${cartCount})`}
                  </span>
                </div>
                <span className="font-mono-tabular text-[#F4F1EA] font-semibold">
                  {formatCurrency(shippingFee, lang)}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline text-base font-bold">
                <span className="text-[#F4F1EA]">
                  {lang === 'ar' ? 'الإجمالي المستحق:' : 'Total Payable:'}
                </span>
                <span className="font-mono-tabular text-xl sm:text-2xl text-[#C6A365]">
                  {formatCurrency(totalAmount, lang)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate({ page: 'checkout' })}
              className="min-h-[50px] touch-press font-semibold"
            >
              <span>{lang === 'ar' ? 'متابعة إتمام الطلب' : 'Proceed to Checkout'}</span>
              {isRtl ? <ArrowUpLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
