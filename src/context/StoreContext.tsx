import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Language,
  PageRoute,
  Product,
  REAL_PRODUCTS,
} from '../data/catalog';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedFrame: string;
}

interface StoreSettings {
  shippingFeePerItem: number;
  vodafoneCashNumber: string;
  whatsappNumber: string;
}

export interface AuthUser {
  id?: string;
  email: string;
  role: 'admin' | 'customer';
  name?: string;
  phone?: string;
}

export type AdminUser = AuthUser;

interface StoreContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  isRtl: boolean;
  route: PageRoute;
  navigate: (newRoute: PageRoute) => void;
  products: Product[];
  refreshProducts: () => Promise<void>;
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  shippingFeePerItem: number;
  vodafoneCashNumber: string;
  whatsappNumber: string;
  addToCart: (product: Product, selectedSize?: string, selectedFrame?: string, quantity?: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAccountOpen: boolean;
  setIsAccountOpen: (open: boolean) => void;
  isFaqOpen: boolean;
  setIsFaqOpen: (open: boolean) => void;
  lastAddedNotice: string | null;
  // Unified Authentication
  authToken: string | null;
  authUser: AuthUser | null;
  userRole: 'admin' | 'customer' | null;
  login: (token: string, user: AuthUser, redirectTo?: string) => void;
  logout: () => void;
  // Admin Aliases (for backward compatibility)
  adminToken: string | null;
  adminUser: AdminUser | null;
  loginAdmin: (token: string, user: AdminUser) => void;
  logoutAdmin: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function parsePathToRoute(pathname: string): PageRoute {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean || clean === '') return { page: 'home' };

  const segments = clean.split('/');

  if (segments[0] === 'shop') return { page: 'shop' };
  if (segments[0] === 'cart') return { page: 'cart' };
  if (segments[0] === 'checkout') return { page: 'checkout' };
  if (segments[0] === 'login') return { page: 'login' };
  if (segments[0] === 'account') return { page: 'account' };
  if (segments[0] === 'about') return { page: 'about' };
  if (segments[0] === 'contact') return { page: 'contact' };
  if (segments[0] === 'privacy') return { page: 'privacy' };
  if (segments[0] === 'terms') return { page: 'terms' };
  if (segments[0] === 'shipping') return { page: 'shipping' };

  if (segments[0] === 'product' && segments[1]) {
    return { page: 'product', slug: segments[1] };
  }

  if (segments[0] === 'collection' && segments[1]) {
    return { page: 'collection', slug: segments[1] };
  }

  if ((segments[0] === 'order' || segments[0] === 'order-confirmation') && segments[1]) {
    return { page: 'order-confirmation', orderRef: segments[1] };
  }

  if (segments[0] === 'admin') {
    return { page: 'admin', orderId: segments[2] };
  }

  return { page: 'home' };
}

function routeToPath(route: PageRoute): string {
  switch (route.page) {
    case 'home':
      return '/';
    case 'shop':
      return '/shop';
    case 'collection':
      return `/collection/${route.slug}`;
    case 'product':
      return `/product/${route.slug}`;
    case 'cart':
      return '/cart';
    case 'checkout':
      return '/checkout';
    case 'order-confirmation':
      return `/order/${route.orderRef}`;
    case 'login':
      return '/login';
    case 'account':
      return '/account';
    case 'admin':
      return route.orderId ? `/admin/orders/${route.orderId}` : '/admin';
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    case 'privacy':
      return '/privacy';
    case 'terms':
      return '/terms';
    case 'shipping':
      return '/shipping';
    default:
      return '/';
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ar');
  const [route, setRoute] = useState<PageRoute>(() => parsePathToRoute(window.location.pathname));
  const [products, setProducts] = useState<Product[]>(REAL_PRODUCTS);

  const [settings, setSettings] = useState<StoreSettings>({
    shippingFeePerItem: 25,
    vodafoneCashNumber: '01040283853',
    whatsappNumber: '01285938198',
  });

  // Persistent Cart in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('veltor_cart_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Unified Auth state (supports admin and customers)
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('veltor_auth_token') || localStorage.getItem('veltor_admin_token') || null;
  });
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('veltor_auth_user') || localStorage.getItem('veltor_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const userRole: 'admin' | 'customer' | null = authUser?.role || (authToken && localStorage.getItem('veltor_admin_token') ? 'admin' : null);
  const adminToken = userRole === 'admin' ? authToken : null;
  const adminUser = userRole === 'admin' ? authUser : null;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [lastAddedNotice, setLastAddedNotice] = useState<string | null>(null);

  // Sync lang attribute & direction
  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parsePathToRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('veltor_cart_v2', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Fetch live products from backend
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      }
    } catch {
      // fallback to REAL_PRODUCTS
    }
  }, []);

  // Fetch settings from backend
  useEffect(() => {
    refreshProducts();

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSettings({
            shippingFeePerItem: Number(data.shipping_fee_per_item) || 25,
            vodafoneCashNumber: data.vodafone_cash_number || '01040283853',
            whatsappNumber: data.whatsapp_number || '01285938198',
          });
        }
      })
      .catch(() => {});
  }, [refreshProducts]);

  const setLang = (newLang: Language) => setLangState(newLang);
  const toggleLang = () => setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'));

  const navigate = (newRoute: PageRoute) => {
    setRoute(newRoute);
    setIsSearchOpen(false);
    setIsAccountOpen(false);
    const newPath = routeToPath(newRoute);
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (
    product: Product,
    selectedSize?: string,
    selectedFrame?: string,
    quantity = 1
  ) => {
    const size = selectedSize || product.size_ar || '20×30 سم';
    const frame = selectedFrame || product.frame_ar || 'أسود';

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, quantity, selectedSize: size, selectedFrame: frame }];
    });

    const title = lang === 'ar' ? product.name_ar : product.name_en;
    const msg =
      lang === 'ar'
        ? `تمت إضافة "${title}" إلى حقيبة التسوق`
        : `Added "${title}" to shopping bag`;
    setLastAddedNotice(msg);
    setTimeout(() => {
      setLastAddedNotice((current) => (current === msg ? null : current));
    }, 3200);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((Boolean as unknown) as (item: CartItem | null) => item is CartItem)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Accurately calculated quantities and pricing:
  // Subtotal = sum of product prices × their quantities.
  // Shipping = shipping_fee_per_item × total item quantity.
  // Total = subtotal + shipping.
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = settings.shippingFeePerItem * cartCount;
  const totalAmount = subtotal + shippingFee;

  // Verify token on mount to handle session expiration gracefully
  useEffect(() => {
    if (!authToken) return;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          // Token expired or invalid
          setAuthToken(null);
          setAuthUser(null);
          localStorage.removeItem('veltor_auth_token');
          localStorage.removeItem('veltor_auth_user');
          localStorage.removeItem('veltor_admin_token');
          localStorage.removeItem('veltor_admin_user');
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data && data.user) {
          setAuthUser(data.user);
          localStorage.setItem('veltor_auth_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {});
  }, [authToken]);

  const login = (token: string, user: AuthUser, redirectTo?: string) => {
    setAuthToken(token);
    setAuthUser(user);
    localStorage.setItem('veltor_auth_token', token);
    localStorage.setItem('veltor_auth_user', JSON.stringify(user));
    if (user.role === 'admin') {
      localStorage.setItem('veltor_admin_token', token);
      localStorage.setItem('veltor_admin_user', JSON.stringify(user));
    }

    if (redirectTo) {
      if (redirectTo === '/admin') {
        navigate({ page: 'admin' });
      } else if (redirectTo === '/account') {
        navigate({ page: 'account' });
      } else {
        navigate({ page: 'home' });
      }
    } else if (user.role === 'admin') {
      navigate({ page: 'admin' });
    } else {
      navigate({ page: 'account' });
    }
  };

  const logout = () => {
    if (authToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    setAuthToken(null);
    setAuthUser(null);
    localStorage.removeItem('veltor_auth_token');
    localStorage.removeItem('veltor_auth_user');
    localStorage.removeItem('veltor_admin_token');
    localStorage.removeItem('veltor_admin_user');
    navigate({ page: 'home' });
  };

  // Aliases for backward compatibility
  const loginAdmin = (token: string, user: AdminUser) => {
    login(token, { ...user, role: 'admin' }, '/admin');
  };

  const logoutAdmin = () => {
    logout();
  };

  return (
    <StoreContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        isRtl: lang === 'ar',
        route,
        navigate,
        products,
        refreshProducts,
        cart,
        cartCount,
        subtotal,
        shippingFee,
        totalAmount,
        shippingFeePerItem: settings.shippingFeePerItem,
        vodafoneCashNumber: settings.vodafoneCashNumber,
        whatsappNumber: settings.whatsappNumber,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isSearchOpen,
        setIsSearchOpen,
        isAccountOpen,
        setIsAccountOpen,
        isFaqOpen,
        setIsFaqOpen,
        lastAddedNotice,
        authToken,
        authUser,
        userRole,
        login,
        logout,
        adminToken,
        adminUser,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};
