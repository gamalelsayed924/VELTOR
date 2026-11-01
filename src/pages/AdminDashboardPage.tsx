import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  LogOut,
  Package,
  Sliders,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  Mail,
  Edit,
  Save,
  Search,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, formatCurrency } from '../data/catalog';
import { Button } from '../components/Button';

interface OrderItem {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  frame?: string;
}

interface OrderRecord {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  customer_whatsapp?: string;
  governorate: string;
  city: string;
  address: string;
  delivery_instructions?: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  currency: string;
  item_count: number;
  payment_method: string;
  payment_status: 'awaiting_payment' | 'verification_pending' | 'paid' | 'rejected';
  order_status: string;
  receipt_id?: string;
  payment_verified_at?: string;
  payment_verified_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  total_orders: number;
  awaiting_payment: number;
  verification_pending: number;
  verified_paid: number;
  cancelled_orders: number;
  confirmed_revenue: number;
}

export const AdminDashboardPage: React.FC = () => {
  const { lang, isRtl, navigate, adminToken, adminUser, logoutAdmin, products, refreshProducts } = useStore();

  // Route guard: Direct access without valid administrator credentials must be blocked
  useEffect(() => {
    if (!adminToken) {
      navigate({ page: 'login', redirectAfter: '/admin' });
    }
  }, [adminToken, navigate]);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings' | 'notifications'>('orders');

  // Orders state
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  // Reject receipt reason modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);

  // Product edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSaveSuccess, setProductSaveSuccess] = useState(false);

  // Settings edit state
  const [settingsShippingFee, setSettingsShippingFee] = useState(25);
  const [settingsVodafoneCash, setSettingsVodafoneCash] = useState('01040283853');
  const [settingsWhatsApp, setSettingsWhatsApp] = useState('01285938198');
  const [settingsSaveNotice, setSettingsSaveNotice] = useState<string | null>(null);

  // Notifications audit logs
  interface NotificationLog {
    id: string;
    type: string;
    recipient: string;
    subject: string;
    body: string;
    status: string;
    error_message?: string;
    created_at: string;
  }
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);

  // Copied helper
  const [copiedPhone, setCopiedPhone] = useState(false);



  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [adminToken]);

  // Fetch Orders List
  const fetchOrders = useCallback(async () => {
    if (!adminToken) return;
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        status: statusFilter,
        payment_status: paymentFilter,
        search: searchQuery,
      });

      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.status === 401) {
        logoutAdmin();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, [adminToken, page, statusFilter, paymentFilter, searchQuery, logoutAdmin]);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const rows: Array<{ key: string; value: string }> = await res.json();
        const map: Record<string, string> = {};
        rows.forEach((r) => (map[r.key] = r.value));
        if (map.shipping_fee_per_item) setSettingsShippingFee(parseFloat(map.shipping_fee_per_item));
        if (map.vodafone_cash_number) setSettingsVodafoneCash(map.vodafone_cash_number);
        if (map.whatsapp_number) setSettingsWhatsApp(map.whatsapp_number);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  }, [adminToken]);

  // Fetch Notification Logs
  const fetchNotifications = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotificationLogs(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken) {
      fetchStats();
      fetchOrders();
      fetchSettings();
      fetchNotifications();
    }
  }, [adminToken, fetchStats, fetchOrders, fetchSettings, fetchNotifications]);

  // Open Order Detail Modal
  const openOrderDetail = async (orderId: string) => {
    if (!adminToken) return;
    setOrderDetailLoading(true);
    setReceiptUrl(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data.order);
        setSelectedOrderItems(data.items);
        if (data.order.receipt_id) {
          // Fetch authenticated receipt blob
          const receiptRes = await fetch(`/api/admin/receipts/${data.order.receipt_id}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          if (receiptRes.ok) {
            const blob = await receiptRes.blob();
            const objectUrl = URL.createObjectURL(blob);
            setReceiptUrl(objectUrl);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load order detail:', err);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  // Verify Payment Action
  const handleVerifyPayment = async (orderId: string) => {
    if (!adminToken || actionProcessing) return;
    setActionProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        await fetchOrders();
        await fetchStats();
        if (selectedOrder) openOrderDetail(orderId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Reject Receipt Action
  const handleRejectReceipt = async () => {
    if (!adminToken || !selectedOrder || !rejectionReason.trim() || actionProcessing) return;
    setActionProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/reject-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      if (res.ok) {
        setIsRejectModalOpen(false);
        setRejectionReason('');
        await fetchOrders();
        await fetchStats();
        openOrderDetail(selectedOrder.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Update Order Status Action
  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (!adminToken || actionProcessing) return;
    setActionProcessing(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchOrders();
        await fetchStats();
        if (selectedOrder) openOrderDetail(orderId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setSettingsSaveNotice(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          shipping_fee_per_item: settingsShippingFee,
          vodafone_cash_number: settingsVodafoneCash.trim(),
          whatsapp_number: settingsWhatsApp.trim(),
        }),
      });
      if (res.ok) {
        setSettingsSaveNotice(lang === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
        setTimeout(() => setSettingsSaveNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Edited Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !editingProduct) return;
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(editingProduct),
      });
      if (res.ok) {
        setProductSaveSuccess(true);
        await refreshProducts();
        setTimeout(() => {
          setProductSaveSuccess(false);
          setEditingProduct(null);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------------------------------------------
  // 1. ROUTE PROTECTION GUARD (IF NOT AUTHENTICATED AS ADMIN)
  // -----------------------------------------------------------------
  if (!adminToken) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#131318] border border-white/10 p-8 space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-[#1A1A22] border border-[#C6A365]/30 text-[#C6A365] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="font-brand text-[10px] tracking-[0.25em] text-[#C6A365] uppercase">
            RESTRICTED ACCESS
          </p>
          <h2 className="text-lg font-bold text-[#F4F1EA]">
            {lang === 'ar' ? 'منطقة إدارية محمية' : 'Restricted Admin Area'}
          </h2>
          <p className="text-xs text-[#9E9A90] leading-relaxed">
            {lang === 'ar'
              ? 'الوصول إلى هذه اللوحة مخصص لمدير النظام فقط. جاري تحويلك إلى صفحة تسجيل الدخول...'
              : 'Access to this panel requires administrator credentials. Redirecting to sign in...'}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate({ page: 'login', redirectAfter: '/admin' })}
              className="w-full justify-center min-h-[44px]"
            >
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // 2. AUTHENTICATED DASHBOARD VIEW
  // -----------------------------------------------------------------
  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-xs text-[#C6A365] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-brand uppercase tracking-wider">VELTOR MANAGEMENT</span>
            <span>·</span>
            <span className="font-mono-tabular text-[#9E9A90]">{adminUser?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F1EA]">
            {lang === 'ar' ? 'لوحة تحكم الإدارة والطلبات' : 'Administrator Control Panel'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={logoutAdmin}
            className="text-red-400 hover:text-red-300 min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </Button>
        </div>
      </div>

      {/* Accurate Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-[#131318] border border-white/10 space-y-2">
            <span className="text-xs text-[#9E9A90] block">
              {lang === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
            </span>
            <span className="font-mono-tabular text-2xl font-bold text-[#F4F1EA]">
              {stats.total_orders}
            </span>
          </div>

          <div className="p-5 bg-[#131318] border border-amber-500/30 space-y-2">
            <span className="text-xs text-amber-300 block">
              {lang === 'ar' ? 'إيصالات قيد المراجعة' : 'Receipts Awaiting Review'}
            </span>
            <span className="font-mono-tabular text-2xl font-bold text-amber-400">
              {stats.verification_pending}
            </span>
          </div>

          <div className="p-5 bg-[#131318] border border-[#C6A365]/30 space-y-2">
            <span className="text-xs text-[#C6A365] block">
              {lang === 'ar' ? 'بانتظار التحويل' : 'Awaiting Payment'}
            </span>
            <span className="font-mono-tabular text-2xl font-bold text-[#C6A365]">
              {stats.awaiting_payment}
            </span>
          </div>

          <div className="p-5 bg-[#131318] border border-emerald-500/30 space-y-2">
            <span className="text-xs text-emerald-300 block">
              {lang === 'ar' ? 'طلبات مدفوعة ومؤكدة' : 'Verified Paid Orders'}
            </span>
            <span className="font-mono-tabular text-2xl font-bold text-emerald-400">
              {stats.verified_paid}
            </span>
          </div>

          <div className="p-5 bg-[#131318] border border-white/10 space-y-2 col-span-2 lg:col-span-1">
            <span className="text-xs text-[#9E9A90] block">
              {lang === 'ar' ? 'الإيرادات المؤكدة (المدفوعة)' : 'Confirmed Revenue (Paid)'}
            </span>
            <span className="font-mono-tabular text-xl sm:text-2xl font-bold text-[#C6A365]">
              {formatCurrency(stats.confirmed_revenue, lang)}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs for Admin */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-xs font-semibold transition-colors min-h-[44px] cursor-pointer border ${
            activeTab === 'orders'
              ? 'bg-[#C6A365] text-[#0B0B0E] border-[#C6A365]'
              : 'bg-[#131318] text-[#9E9A90] border-white/10 hover:text-[#F4F1EA]'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إدارة الطلبات والتحقق' : 'Orders & Verification'}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-xs font-semibold transition-colors min-h-[44px] cursor-pointer border ${
            activeTab === 'products'
              ? 'bg-[#C6A365] text-[#0B0B0E] border-[#C6A365]'
              : 'bg-[#131318] text-[#9E9A90] border-white/10 hover:text-[#F4F1EA]'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Edit className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إدارة المنتجات والمواصفات' : 'Products & Specs'}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 text-xs font-semibold transition-colors min-h-[44px] cursor-pointer border ${
            activeTab === 'settings'
              ? 'bg-[#C6A365] text-[#0B0B0E] border-[#C6A365]'
              : 'bg-[#131318] text-[#9E9A90] border-white/10 hover:text-[#F4F1EA]'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إعدادات الشحن والمحفظة' : 'Store Settings'}</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 text-xs font-semibold transition-colors min-h-[44px] cursor-pointer border ${
            activeTab === 'notifications'
              ? 'bg-[#C6A365] text-[#0B0B0E] border-[#C6A365]'
              : 'bg-[#131318] text-[#9E9A90] border-white/10 hover:text-[#F4F1EA]'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{lang === 'ar' ? 'سجل إشعارات البريد' : 'Email Notification Logs'}</span>
          </span>
        </button>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* TAB 1: ORDERS & VERIFICATION */}
      {/* ----------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filters and Search Bar */}
          <div className="p-4 bg-[#131318] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Payment Filter */}
              <select
                value={paymentFilter}
                onChange={(e) => {
                  setPaymentFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 bg-[#0B0B0E] border border-white/15 text-xs text-[#F4F1EA] cursor-pointer focus:outline-none focus:border-[#C6A365]"
              >
                <option value="all">{lang === 'ar' ? 'جميع حالات الدفع' : 'All Payment States'}</option>
                <option value="verification_pending">{lang === 'ar' ? 'قيد مراجعة الإيصال' : 'Verification Pending'}</option>
                <option value="awaiting_payment">{lang === 'ar' ? 'بانتظار التحويل' : 'Awaiting Payment'}</option>
                <option value="paid">{lang === 'ar' ? 'تم الدفع وتأكيد الإيصال' : 'Paid'}</option>
                <option value="rejected">{lang === 'ar' ? 'إيصالات مرفوضة' : 'Rejected Receipts'}</option>
              </select>

              {/* Order Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 bg-[#0B0B0E] border border-white/15 text-xs text-[#F4F1EA] cursor-pointer focus:outline-none focus:border-[#C6A365]"
              >
                <option value="all">{lang === 'ar' ? 'جميع حالات الطلب' : 'All Order Statuses'}</option>
                <option value="new">{lang === 'ar' ? 'طلب جديد' : 'New'}</option>
                <option value="verification_pending">{lang === 'ar' ? 'قيد المراجعة' : 'Verification Pending'}</option>
                <option value="paid">{lang === 'ar' ? 'مدفوع' : 'Paid'}</option>
                <option value="preparing">{lang === 'ar' ? 'جارٍ التجهيز' : 'Preparing'}</option>
                <option value="shipped">{lang === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                <option value="delivered">{lang === 'ar' ? 'تم التوصيل' : 'Delivered'}</option>
                <option value="cancelled">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#9E9A90] absolute top-3 start-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={
                  lang === 'ar'
                    ? 'ابحث بالرقم المرجعي، الاسم، أو الهاتف...'
                    : 'Search by reference, name, or phone...'
                }
                className="w-full h-10 ps-9 pe-3 bg-[#0B0B0E] border border-white/15 text-xs text-[#F4F1EA] placeholder-[#9E9A90] focus:outline-none focus:border-[#C6A365]"
              />
            </div>
          </div>

          {/* Orders Container: Responsive Mobile Cards + Desktop Table */}
          <div className="bg-[#131318] border border-white/10">
            {ordersLoading ? (
              <div className="p-16 text-center text-sm text-[#9E9A90]">
                {lang === 'ar' ? 'جارٍ تحميل الطلبات...' : 'Loading orders...'}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-16 text-center text-sm text-[#9E9A90] space-y-2">
                <p>{lang === 'ar' ? 'لا توجد طلبات مطابقة للبحث' : 'No matching orders found'}</p>
              </div>
            ) : (
              <>
                {/* Mobile View: High-contrast touch-friendly cards for <768px */}
                <div className="md:hidden divide-y divide-white/10">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => openOrderDetail(ord.id)}
                      className="p-4 space-y-3 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono-tabular font-bold text-sm text-[#C6A365]">
                          {ord.order_ref}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {ord.payment_status === 'paid' && (
                            <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-400 font-semibold">
                              {lang === 'ar' ? 'تم الدفع' : 'Paid'}
                            </span>
                          )}
                          {ord.payment_status === 'verification_pending' && (
                            <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-500/40 text-[10px] text-amber-300 font-semibold animate-pulse">
                              {lang === 'ar' ? 'مراجعة الإيصال' : 'Review'}
                            </span>
                          )}
                          {ord.payment_status === 'awaiting_payment' && (
                            <span className="px-2 py-0.5 bg-amber-950/30 border border-[#C6A365]/30 text-[10px] text-[#C6A365]">
                              {lang === 'ar' ? 'بانتظار التحويل' : 'Awaiting'}
                            </span>
                          )}
                          {ord.payment_status === 'rejected' && (
                            <span className="px-2 py-0.5 bg-red-950/60 border border-red-500/40 text-[10px] text-red-300">
                              {lang === 'ar' ? 'مرفوض' : 'Rejected'}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-[#1A1A22] border border-white/10 text-[10px] text-[#9E9A90]">
                            {ord.order_status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#F4F1EA]">
                        <span className="font-medium truncate max-w-[180px]">{ord.customer_name}</span>
                        <span className="font-mono-tabular font-bold text-[#C6A365]">
                          {formatCurrency(ord.total_amount, lang)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#9E9A90] pt-1">
                        <span className="font-mono-tabular">{ord.customer_phone}</span>
                        <span>
                          {ord.item_count} {lang === 'ar' ? 'قطع' : 'items'} ·{' '}
                          {new Date(ord.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                        </span>
                      </div>

                      <div className="pt-1 flex items-center justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openOrderDetail(ord.id);
                          }}
                          className="w-full justify-center min-h-[40px] text-xs"
                        >
                          {lang === 'ar' ? 'معاينة الطلب والإيصال' : 'View Order & Receipt'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Full data table for >=768px */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-start text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#0B0B0E] text-[#9E9A90]">
                        <th className="p-4 text-start">{lang === 'ar' ? 'المرجع' : 'Order Ref'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'الهاتف' : 'Phone'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'القطع' : 'Items'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'الإجمالي' : 'Total'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'حالة الدفع' : 'Payment'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'حالة الطلب' : 'Status'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((ord) => (
                        <tr
                          key={ord.id}
                          className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                          onClick={() => openOrderDetail(ord.id)}
                        >
                          <td className="p-4 font-mono-tabular font-bold text-[#C6A365]">
                            {ord.order_ref}
                          </td>
                          <td className="p-4 font-medium text-[#F4F1EA]">{ord.customer_name}</td>
                          <td className="p-4 font-mono-tabular text-[#9E9A90]">{ord.customer_phone}</td>
                          <td className="p-4 font-mono-tabular text-[#9E9A90]">
                            {new Date(ord.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                          </td>
                          <td className="p-4 font-mono-tabular">{ord.item_count}</td>
                          <td className="p-4 font-mono-tabular font-bold text-[#F4F1EA]">
                            {formatCurrency(ord.total_amount, lang)}
                          </td>
                          <td className="p-4">
                            {ord.payment_status === 'paid' && (
                              <span className="text-emerald-400 font-semibold">{lang === 'ar' ? 'تم الدفع' : 'Paid'}</span>
                            )}
                            {ord.payment_status === 'verification_pending' && (
                              <span className="text-amber-400 font-semibold animate-pulse">{lang === 'ar' ? 'إيصال قيد المراجعة' : 'Review Pending'}</span>
                            )}
                            {ord.payment_status === 'awaiting_payment' && (
                              <span className="text-[#C6A365]">{lang === 'ar' ? 'بانتظار التحويل' : 'Awaiting Payment'}</span>
                            )}
                            {ord.payment_status === 'rejected' && (
                              <span className="text-red-400">{lang === 'ar' ? 'إيصال مرفوض' : 'Rejected'}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-[#1A1A22] border border-white/10 text-[11px] text-[#F4F1EA]">
                              {ord.order_status}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openOrderDetail(ord.id);
                              }}
                            >
                              {lang === 'ar' ? 'عرض' : 'View'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#9E9A90] pt-2">
              <span>
                {lang === 'ar'
                  ? `صفحة ${page} من ${totalPages}`
                  : `Page ${page} of ${totalPages}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-[#131318] border border-white/10 disabled:opacity-30 cursor-pointer min-h-[44px]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-[#131318] border border-white/10 disabled:opacity-30 cursor-pointer min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 2: PRODUCT MANAGEMENT */}
      {/* ----------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#F4F1EA]">
                {lang === 'ar' ? 'المنتجات والمواصفات' : 'Products & Specifications'}
              </h2>
              <p className="text-xs text-[#9E9A90] mt-0.5">
                {lang === 'ar'
                  ? 'يمكنك تعديل الأسعار، العناوين، الأوصاف، المقاسات (بما في ذلك تحديد مقاس المنتج 04)، وروابط الصور.'
                  : 'Edit pricing, titles, descriptions, dimensions (including adding size to Product 04), and image URLs.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="p-5 bg-[#131318] border border-white/10 space-y-4">
                <div className="aspect-[3/4] bg-[#0B0B0E] p-2 flex items-center justify-center border border-white/5">
                  <img src={p.image} alt={p.name_en} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F4F1EA] truncate">{p.name_ar}</h3>
                  <p className="text-xs text-[#9E9A90] truncate">{p.name_en}</p>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="font-mono-tabular font-bold text-[#C6A365]">
                      {formatCurrency(p.price, lang)}
                    </span>
                    <span className="text-[11px] text-[#9E9A90]">
                      {p.size_ar && p.size_ar.trim() !== '' ? p.size_ar : (lang === 'ar' ? 'المقاس: غير محدد' : 'Size: Not set')}
                    </span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => setEditingProduct({ ...p })}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تعديل المنتج' : 'Edit Product'}</span>
                </Button>
              </div>
            ))}
          </div>

          {/* Edit Product Modal */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 bg-[#0B0B0E]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
              <div className="max-w-2xl w-full bg-[#131318] border border-white/15 p-6 sm:p-8 space-y-5 my-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-[#F4F1EA]">
                    {lang === 'ar' ? `تعديل المنتج: ${editingProduct.slug}` : `Edit Product: ${editingProduct.slug}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="p-1.5 text-[#9E9A90] hover:text-[#F4F1EA]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {productSaveSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Product updated successfully'}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#9E9A90] mb-1">الاسم بالعربية</label>
                      <input
                        type="text"
                        value={editingProduct.name_ar}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name_ar: e.target.value })}
                        className="w-full h-10 px-3 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9E9A90] mb-1">English Title</label>
                      <input
                        type="text"
                        value={editingProduct.name_en}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                        className="w-full h-10 px-3 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#9E9A90] mb-1">السعر (ج.م / EGP)</label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                        className="w-full h-10 px-3 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA] font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9E9A90] mb-1">رابط صورة المنتج (Image URL)</label>
                      <input
                        type="text"
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full h-10 px-3 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA] font-mono-tabular"
                      />
                    </div>
                  </div>

                  {/* Size Specification (Crucial for Product 04 editing!) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-[#0B0B0E] border border-white/5">
                    <div>
                      <label className="block text-[#9E9A90] mb-1">
                        المقاس بالعربية (اتركه فارغاً لإخفائه)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.size_ar || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, size_ar: e.target.value })}
                        placeholder="مثال: 30×40 سم (أو اتركه فارغاً)"
                        className="w-full h-10 px-3 bg-[#131318] border border-white/15 text-[#F4F1EA]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#9E9A90] mb-1">
                        Size in English (Leave empty to hide)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.size_en || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, size_en: e.target.value })}
                        placeholder="e.g. 30×40 cm"
                        className="w-full h-10 px-3 bg-[#131318] border border-white/15 text-[#F4F1EA]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#9E9A90] mb-1">الوصف بالعربية</label>
                    <textarea
                      rows={2}
                      value={editingProduct.description_ar}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description_ar: e.target.value })}
                      className="w-full p-3 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#9E9A90] mb-1">English Description</label>
                    <textarea
                      rows={2}
                      value={editingProduct.description_en}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                      className="w-full p-3 bg-[#0B0B0E] border border-white/15 text-[#F4F1EA]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                    <Button variant="secondary" size="sm" type="button" onClick={() => setEditingProduct(null)}>
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      <Save className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</span>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 3: STORE SETTINGS */}
      {/* ----------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="max-w-xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-[#F4F1EA]">
              {lang === 'ar' ? 'إعدادات المتجر والشحن' : 'Store & Payment Settings'}
            </h2>
            <p className="text-xs text-[#9E9A90] mt-0.5">
              {lang === 'ar'
                ? 'تحديث رسوم الشحن لكل قطعة، رقم فودافون كاش، ورقم الواتساب الرسمي.'
                : 'Configure domestic shipping fee per item, Vodafone Cash receiver number, and WhatsApp link.'}
            </p>
          </div>

          {settingsSaveNotice && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{settingsSaveNotice}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="bg-[#131318] border border-white/10 p-6 space-y-5 text-xs">
            <div>
              <label className="block font-medium text-[#F4F1EA] mb-1.5">
                {lang === 'ar' ? 'رسوم الشحن لكل قطعة (EGP)' : 'Shipping Fee Per Item (EGP)'}
              </label>
              <input
                type="number"
                required
                value={settingsShippingFee}
                onChange={(e) => setSettingsShippingFee(parseFloat(e.target.value) || 0)}
                className="w-full h-11 px-4 bg-[#0B0B0E] border border-white/15 text-sm text-[#F4F1EA] font-mono-tabular"
              />
              <span className="block text-[11px] text-[#9E9A90] mt-1">
                {lang === 'ar'
                  ? 'يتم ضرب هذا الرقم في عدد القطع الإجمالي لحساب تكلفة الشحن الإجمالية (مثال: 25 ج.م × 2 = 50 ج.م).'
                  : 'Multiplied by total items ordered (e.g. 25 EGP × 2 = 50 EGP).'}
              </span>
            </div>

            <div>
              <label className="block font-medium text-[#F4F1EA] mb-1.5">
                {lang === 'ar' ? 'رقم فودافون كاش المعتمد' : 'Vodafone Cash Wallet Number'}
              </label>
              <input
                type="text"
                required
                value={settingsVodafoneCash}
                onChange={(e) => setSettingsVodafoneCash(e.target.value)}
                className="w-full h-11 px-4 bg-[#0B0B0E] border border-white/15 text-sm text-[#F4F1EA] font-mono-tabular"
              />
            </div>

            <div>
              <label className="block font-medium text-[#F4F1EA] mb-1.5">
                {lang === 'ar' ? 'رقم الواتساب لخدمة العملاء' : 'Customer Service WhatsApp Number'}
              </label>
              <input
                type="text"
                required
                value={settingsWhatsApp}
                onChange={(e) => setSettingsWhatsApp(e.target.value)}
                className="w-full h-11 px-4 bg-[#0B0B0E] border border-white/15 text-sm text-[#F4F1EA] font-mono-tabular"
              />
              <span className="block text-[11px] text-[#9E9A90] mt-1">
                {lang === 'ar' ? 'يستخدم في روابط المراسلة المباشرة (wa.me)' : 'Used for international click-to-chat links.'}
              </span>
            </div>

            <Button type="submit" variant="primary" size="md">
              <Save className="w-4 h-4" />
              <span>{lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}</span>
            </Button>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TAB 4: NOTIFICATIONS LOG AUDIT */}
      {/* ----------------------------------------------------------- */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-[#F4F1EA]">
              {lang === 'ar' ? 'سجل إشعارات البريد الإلكتروني' : 'Email Notification Dispatch Logs'}
            </h2>
            <p className="text-xs text-[#9E9A90] mt-0.5">
              {lang === 'ar'
                ? 'يوثق جميع الإشعارات المرسلة إلى gex92012@gmail.com وحالة تسليمها أو عدم تهيئة الـ SMTP.'
                : 'Audit log of all notification dispatches to gex92012@gmail.com.'}
            </p>
          </div>

          <div className="bg-[#131318] border border-white/10 divide-y divide-white/5">
            {notificationLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#9E9A90]">
                {lang === 'ar' ? 'لا توجد إشعارات مسجلة بعد' : 'No notifications recorded yet'}
              </div>
            ) : (
              notificationLogs.map((log) => (
                <div key={log.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F4F1EA]">{log.subject}</span>
                    <span className="font-mono-tabular text-[#9E9A90]">
                      {new Date(log.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#9E9A90]">{lang === 'ar' ? 'الحالة:' : 'Status:'}</span>
                    {log.status === 'sent' && (
                      <span className="text-emerald-400 font-bold">{lang === 'ar' ? 'تم الإرسال' : 'Sent'}</span>
                    )}
                    {log.status === 'unconfigured' && (
                      <span className="text-amber-400 font-bold">
                        {lang === 'ar' ? 'بانتظار تهيئة SMTP (محفوظ في السجل)' : 'Unconfigured (Logged to DB)'}
                      </span>
                    )}
                    {log.status === 'failed' && (
                      <span className="text-red-400 font-bold">{lang === 'ar' ? 'فشل' : 'Failed'}</span>
                    )}
                  </div>
                  {log.error_message && (
                    <p className="text-[11px] text-amber-300 bg-black/40 p-2 font-mono">{log.error_message}</p>
                  )}
                  <pre className="text-[11px] text-[#9E9A90] bg-[#0B0B0E] p-3 overflow-x-auto whitespace-pre-wrap font-mono">
                    {log.body}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* ORDER DETAIL MODAL */}
      {/* ----------------------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0E]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full bg-[#131318] border border-white/15 p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono-tabular text-xl font-bold text-[#C6A365]">
                  {selectedOrder.order_ref}
                </span>
                <span className="text-xs px-2.5 py-1 bg-[#1A1A22] border border-white/10 text-[#F4F1EA]">
                  {selectedOrder.order_status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#9E9A90] hover:text-[#F4F1EA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderDetailLoading ? (
              <div className="p-12 text-center text-sm text-[#9E9A90]">Loading...</div>
            ) : (
              <div className="space-y-6 text-xs">
                {/* Customer Details & Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#0B0B0E] border border-white/5">
                  <div className="space-y-1">
                    <span className="text-[#9E9A90] block">{lang === 'ar' ? 'العميل:' : 'Customer:'}</span>
                    <p className="text-sm font-bold text-[#F4F1EA]">{selectedOrder.customer_name}</p>
                    <p className="text-[#9E9A90] leading-relaxed">
                      {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.governorate}
                    </p>
                    {selectedOrder.delivery_instructions && (
                      <p className="text-[#C6A365] italic">ملاحظات: {selectedOrder.delivery_instructions}</p>
                    )}
                  </div>

                  <div className="space-y-3 sm:text-end">
                    <div>
                      <span className="text-[#9E9A90] block">{lang === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</span>
                      <div className="flex items-center sm:justify-end gap-2 pt-1">
                        <span className="font-mono-tabular text-sm font-bold text-[#F4F1EA]">
                          {selectedOrder.customer_phone}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrder.customer_phone);
                            setCopiedPhone(true);
                            setTimeout(() => setCopiedPhone(false), 2000);
                          }}
                          className="p-1 text-[#9E9A90] hover:text-[#F4F1EA] border border-white/10"
                          title="Copy phone"
                        >
                          {copiedPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <a
                          href={`https://wa.me/20${selectedOrder.customer_phone.replace(/^0+/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#9E9A90] block">{lang === 'ar' ? 'حالة الدفع الحالية:' : 'Payment Status:'}</span>
                      <span className="font-bold text-sm text-[#C6A365]">{selectedOrder.payment_status}</span>
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[#F4F1EA] uppercase">{lang === 'ar' ? 'المنتجات المطلوبة' : 'Items'}</h4>
                  <div className="divide-y divide-white/5 border border-white/5 bg-[#0B0B0E]">
                    {selectedOrderItems.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#F4F1EA]">{lang === 'ar' ? item.name_ar : item.name_en}</p>
                          <p className="text-[11px] text-[#9E9A90]">
                            {item.quantity} × {formatCurrency(item.price, lang)}
                            {item.size ? ` · مقاس: ${item.size}` : ''}
                          </p>
                        </div>
                        <span className="font-mono-tabular font-bold text-[#C6A365]">
                          {formatCurrency(item.price * item.quantity, lang)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#0B0B0E] border border-white/5 flex justify-between items-baseline text-sm font-bold">
                    <span>{lang === 'ar' ? 'الإجمالي المطلوب:' : 'Total Amount:'}</span>
                    <span className="font-mono-tabular text-lg text-[#C6A365]">
                      {formatCurrency(selectedOrder.total_amount, lang)}
                    </span>
                  </div>
                </div>

                {/* Uploaded Payment Receipt (Authenticated View) */}
                <div className="space-y-3 p-4 bg-[#0B0B0E] border border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#F4F1EA] uppercase">
                      {lang === 'ar' ? 'إيصال تحويل فودافون كاش' : 'Vodafone Cash Receipt Screenshot'}
                    </h4>
                    {selectedOrder.payment_verified_by && (
                      <span className="text-[11px] text-emerald-400">
                        تم التحقق بواسطة {selectedOrder.payment_verified_by} في {new Date(selectedOrder.payment_verified_at || '').toLocaleString()}
                      </span>
                    )}
                  </div>

                  {receiptUrl ? (
                    <div className="space-y-3">
                      <div className="max-h-72 overflow-hidden border border-white/10 flex items-center justify-center bg-black">
                        <img src={receiptUrl} alt="Receipt" className="max-h-72 object-contain" />
                      </div>

                      {/* Verification Controls */}
                      {selectedOrder.payment_status !== 'paid' && (
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={actionProcessing}
                            onClick={() => handleVerifyPayment(selectedOrder.id)}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{lang === 'ar' ? 'تأكيد صحة الإيصال وتعيينه كمدفوع (Paid)' : 'Confirm & Mark as Paid'}</span>
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={actionProcessing}
                            onClick={() => setIsRejectModalOpen(true)}
                            className="text-red-400 border-red-500/30 hover:border-red-400"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span>{lang === 'ar' ? 'رفض الإيصال وطلب إعادة الرفع' : 'Reject Receipt'}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-[#9E9A90]">
                      <Clock className="w-6 h-6 mx-auto mb-2 opacity-60" />
                      <p>{lang === 'ar' ? 'لم يقم العميل برفع صورة الإيصال بعد' : 'No receipt uploaded yet by customer'}</p>
                    </div>
                  )}
                </div>

                {/* Update Order Status */}
                <div className="p-4 bg-[#0B0B0E] border border-white/5 space-y-3">
                  <h4 className="font-bold text-[#F4F1EA] uppercase">{lang === 'ar' ? 'تحديث حالة الطلب' : 'Update Order Status'}</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {['preparing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={selectedOrder.order_status === st || actionProcessing}
                        onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                        className={`px-3 py-1.5 text-xs border transition-colors cursor-pointer ${
                          selectedOrder.order_status === st
                            ? 'bg-[#C6A365] text-[#0B0B0E] border-[#C6A365] font-bold'
                            : 'bg-[#131318] text-[#9E9A90] border-white/10 hover:text-[#F4F1EA]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Receipt Reason Modal */}
      {isRejectModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0E]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#131318] border border-red-500/30 p-6 space-y-4">
            <h3 className="text-base font-bold text-red-400">
              {lang === 'ar' ? 'سبب رفض الإيصال' : 'Receipt Rejection Reason'}
            </h3>
            <p className="text-xs text-[#9E9A90]">
              {lang === 'ar'
                ? 'سيظهر هذا السبب للعميل في صفحة طلبه لإعادة رفع صورة صالحة.'
                : 'This reason will be visible to the customer on their order page to request a valid replacement.'}
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={lang === 'ar' ? 'مثال: المبلغ المحول غير مطابق، أو الصورة غير واضحة...' : 'e.g. Incomplete transfer or blurred image...'}
              className="w-full p-3 bg-[#0B0B0E] border border-white/15 text-xs text-[#F4F1EA]"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsRejectModalOpen(false)}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRejectReceipt}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                {lang === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
