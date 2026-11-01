import React from 'react';
import { MessageCircle } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LegalPolicyPage } from './pages/LegalPolicyPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';

const MainRouter: React.FC = () => {
  const { route, whatsappNumber, lang } = useStore();

  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'collection':
        return <CollectionDetailPage slug={route.slug} />;
      case 'product':
        return <ProductDetailPage slug={route.slug} />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage orderRef={route.orderRef} />;
      case 'login':
        return <LoginPage />;
      case 'account':
        return <AccountPage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <LegalPolicyPage policyType="privacy" />;
      case 'terms':
        return <LegalPolicyPage policyType="terms" />;
      case 'shipping':
        return <LegalPolicyPage policyType="shipping" />;
      default:
        return <HomePage />;
    }
  };

  const waUrl = `https://wa.me/20${whatsappNumber.replace(/^0+/, '')}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0E] text-[#F4F1EA]">
      <Header />
      <main className="flex-1">{renderPage()}</main>
      <Footer />

      {/* Floating WhatsApp Quick Contact Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={lang === 'ar' ? 'تواصل عبر واتساب' : 'Chat via WhatsApp'}
        className="fixed bottom-6 start-6 z-40 p-3.5 bg-[#121217] hover:bg-[#1a1a22] border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 min-w-[50px] min-h-[50px] flex items-center justify-center group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="sr-only">WhatsApp</span>
      </a>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}
