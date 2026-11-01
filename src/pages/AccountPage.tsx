import React, { useEffect, useState } from 'react';
import { User, LogOut, Package, Phone, Mail, ShieldCheck, ChevronRight, ChevronLeft, Clock, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/Button';
import { formatCurrency } from '../data/catalog';

interface CustomerOrder {
  id: string;
  order_ref: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export const AccountPage: React.FC = () => {
  const { lang, isRtl, navigate, authToken, authUser, userRole, logout } = useStore();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!authToken) {
      navigate({ page: 'login' });
      return;
    }

    if (userRole === 'admin') {
      // If admin visits account, they can also go to /admin
      return;
    }

    // Fetch customer orders
    setLoadingOrders(true);
    fetch('/api/customer/orders', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, [authToken, userRole, navigate]);

  if (!authToken || !authUser) {
    return null;
  }

  const paymentStatusLabels: Record<string, { ar: string; en: string }> = {
    awaiting_payment: { ar: 'بانتظار الدفع', en: 'Awaiting Payment' },
    verification_pending: { ar: 'قيد مراجعة الإيصال', en: 'Receipt Under Review' },
    paid: { ar: 'تم التحقق والدفع', en: 'Payment Confirmed' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
  };

  return (
    <div className="min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Account Header */}
      <div className="bg-[#131318] border border-white/10 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#1A1A22] border border-[#C6A365]/30 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-[#C6A365]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F4F1EA]">
              {authUser.name || authUser.email}
            </h1>
            <p className="text-xs text-[#9E9A90] font-mono mt-0.5">{authUser.email}</p>
            {authUser.phone && (
              <p className="text-xs text-[#9E9A90] mt-0.5 font-mono">{authUser.phone}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {userRole === 'admin' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate({ page: 'admin' })}
              className="gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'ar' ? 'لوحة التحكم الإدارية' : 'Admin Dashboard'}</span>
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </Button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#C6A365]" />
            <h2 className="text-base font-bold text-[#F4F1EA]">
              {lang === 'ar' ? 'سجل الطلبات' : 'Order History'}
            </h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate({ page: 'shop' })}
          >
            {lang === 'ar' ? 'تصفح المتجر' : 'Browse Shop'}
          </Button>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-xs text-[#9E9A90]">
            {lang === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#131318] border border-white/10 p-8 text-center space-y-3">
            <p className="text-sm text-[#F4F1EA]">
              {lang === 'ar' ? 'لا توجد طلبات سابقة مسجلة' : 'No previous orders found'}
            </p>
            <p className="text-xs text-[#9E9A90]">
              {lang === 'ar'
                ? 'عند إتمام أي طلب باستخدام رقم هاتفك، سيظهر سجله وحالة الشحن هنا تلقائياً.'
                : 'When you place orders with your phone number, they will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-[#131318] border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#F4F1EA]">
                      {ord.order_ref}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-[#1A1A22] border border-white/10 text-[#C6A365]">
                      {paymentStatusLabels[ord.payment_status]?.[lang] || ord.payment_status}
                    </span>
                  </div>
                  <p className="text-xs text-[#9E9A90]">
                    {new Date(ord.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-mono-tabular font-bold text-[#C6A365] text-sm">
                    {formatCurrency(ord.total_amount, lang)}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'order-confirmation', orderRef: ord.order_ref })}
                    className="inline-flex items-center gap-1 text-xs text-[#F4F1EA] hover:text-[#C6A365] transition-colors cursor-pointer"
                  >
                    <span>{lang === 'ar' ? 'تفاصيل الطلب' : 'Details'}</span>
                    {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
