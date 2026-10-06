import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AdminConfigProvider, useAdminConfig } from './admin/context/AdminConfigContext';
import { MainHeader } from './components/MainHeader';
import { HeroBanner } from './components/HeroBanner';
import { PopularProducts } from './components/PopularProducts';
import { Footer } from './components/Footer';
import { CategoryPage } from './components/CategoryPage';

// Pages
import { ProductListingPage } from './components/ProductListingPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { OffersPage } from './components/OffersPage';
import { AccountDashboard } from './components/AccountDashboard';
import { CheckoutPage } from './components/CheckoutPage';
import { ManufacturerPage } from './components/ManufacturerPage';

// Admin CRM Components
import { AdminLayout } from './admin/AdminLayout';
import { AdminAuth } from './admin/AdminAuth';

// Modals
import { CartDrawer } from './modals/CartDrawer';
import { CheckoutModal } from './modals/CheckoutModal';
import { LocationModal } from './modals/LocationModal';
import { AuthModal } from './modals/AuthModal';
import { ProductModal } from './modals/ProductModal';
import { TrackOrderModal } from './modals/TrackOrderModal';
import { SupportModal } from './modals/SupportModal';
import { IntroVideoOverlay } from './components/IntroVideoOverlay';

export function AppContent() {
  const { currentRoute, navigate } = useApp();
  const { config, isAdminLoggedIn } = useAdminConfig();

  // Detect OS: zoom 125% for Windows, 100% for Mac
  React.useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isWindows = userAgent.indexOf('windows') !== -1;
    const isMac = userAgent.indexOf('macintosh') !== -1 || userAgent.indexOf('mac os') !== -1;
    
    if (isWindows) {
      document.documentElement.style.zoom = '1.25';
    } else if (isMac) {
      document.documentElement.style.zoom = '1.0';
    } else {
      document.documentElement.style.zoom = '1.0';
    }
  }, []);

  // Ensure scroll is at the top on every page/route change
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentRoute.pathname, currentRoute.searchParams.toString()]);

  // Handle Admin CRM Route
  if (currentRoute.pathname === '/admin') {
    if (!isAdminLoggedIn) {
      return <AdminAuth onBackToStore={() => navigate('/')} />;
    }
    return <AdminLayout onReturnToStore={() => navigate('/')} />;
  }

  const renderDynamicHomepageSections = () => {
    const sortedSections = [...config.sectionOrder]
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order);

    const sectionComponentMap: Record<string, React.ReactNode> = {
      hero: <HeroBanner key="hero" />,
      popularProducts: <PopularProducts key="popularProducts" />,
    };

    return (
      <div className="flex flex-col gap-0 pb-8">
        {sortedSections.map((sec) => sectionComponentMap[sec.id] || null)}
      </div>
    );
  };

  const renderMainContent = () => {
    const isSearchPage = currentRoute.pathname === '/products' || currentRoute.searchParams.has('search') || currentRoute.searchParams.has('category');
    const isDetailPage = currentRoute.pathname.startsWith('/product/');
    const isOffersPage = currentRoute.pathname === '/offers';
    const isAccountPage = currentRoute.pathname === '/account';
    const isCheckoutPage = currentRoute.pathname === '/checkout';
    const isManufacturerPage = currentRoute.pathname === '/manufacturer';

    if (isCheckoutPage) {
      return <CheckoutPage />;
    }

    if (isManufacturerPage) {
      return <ManufacturerPage />;
    }

    if (isAccountPage) {
      return <AccountDashboard />;
    }

    if (isOffersPage) {
      return <OffersPage />;
    }

    if (isSearchPage) {
      return <ProductListingPage />;
    }

    if (isDetailPage) {
      return <ProductDetailPage />;
    }

    return renderDynamicHomepageSections();
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans flex flex-col relative">
      {/* MAIN HEADER */}
      <MainHeader />

      {/* MAIN CONTENT BODY */}
      <main className="flex-1 w-full">
        {renderMainContent()}
      </main>

      {/* FOOTER */}
      <Footer />

      {/* MODALS & DRAWERS */}
      <CartDrawer />
      <CheckoutModal />
      <LocationModal />
      <AuthModal />
      <ProductModal />
      <TrackOrderModal />
      <SupportModal />
      <CategoryPage />

      {/* INTRO VIDEO OVERLAY ON SITE OPEN */}
      {currentRoute.pathname === '/' && <IntroVideoOverlay />}
    </div>
  );
}

export default function App() {
  return (
    <AdminConfigProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AdminConfigProvider>
  );
}

