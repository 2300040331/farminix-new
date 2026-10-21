import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AdminConfigProvider, useAdminConfig } from './admin/context/AdminConfigContext';
import { MainHeader } from './components/MainHeader';
import { HeroBanner } from './components/HeroBanner';
import { PopularProducts } from './components/PopularProducts';
import { SocialBlogSection } from './components/SocialBlogSection';
import { Footer } from './components/Footer';
import { CategorySection } from './components/CategorySection';
import { CategoryPage } from './components/CategoryPage';

// Pages
import { ProductListingPage } from './components/ProductListingPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { OffersPage } from './components/OffersPage';
import { CheckoutPage } from './components/CheckoutPage';
import { ManufacturerPage } from './components/ManufacturerPage';
import { AboutPage } from './components/AboutPage';
import { ReachOutPage } from './components/ReachOutPage';
import { QueriesPage } from './components/QueriesPage';
import { CareersPage } from './components/CareersPage';

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
import { WhatsAppFloatingButton } from './components/WhatsAppButton';
import './storefront.css';
import './admin/admin-premium.css';

const PaddyHarvestScene = React.lazy(() => import('./components/PaddyHarvestScene'));

export function AppContent() {
  const { currentRoute, navigate } = useApp();
  const { publishedConfig, isAdminLoggedIn } = useAdminConfig();
  const [hasFinishedIntro, setHasFinishedIntro] = React.useState(false);
  const finishIntro = React.useCallback(() => setHasFinishedIntro(true), []);
  const isCommercePage = ['/checkout', '/products', '/offers'].includes(currentRoute.pathname) || currentRoute.pathname.startsWith('/product/') || currentRoute.searchParams.has('search') || currentRoute.searchParams.has('category');

  // All pages share the same responsive scale across operating systems.
  React.useEffect(() => {
    document.documentElement.style.zoom = '1';
  }, []);

  // Ensure scroll is at the top on every page/route change
  const routeSearch = currentRoute.searchParams.toString();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentRoute.pathname, routeSearch]);

  // Handle Admin CRM Route
  if (currentRoute.pathname === '/admin') {
    if (!isAdminLoggedIn) {
      return <AdminAuth onBackToStore={() => navigate('/')} />;
    }
    return <AdminLayout onReturnToStore={() => navigate('/')} />;
  }

  const renderDynamicHomepageSections = () => {
    const sortedSections = [...publishedConfig.sectionOrder]
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order);

    const sectionComponentMap: Record<string, React.ReactNode> = {
      hero: publishedConfig.hero.enabled ? <React.Fragment key="hero"><HeroBanner /><React.Suspense fallback={null}><PaddyHarvestScene suspended={!hasFinishedIntro && publishedConfig.introVideo.enabled} /></React.Suspense></React.Fragment> : null,
      popularProducts: <PopularProducts key="popularProducts" />,
      socialBlog: <SocialBlogSection key="socialBlog" />,
      categorySection: <CategorySection key="categorySection" />,
      categories: <CategorySection key="categories" />,
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
    const isCheckoutPage = currentRoute.pathname === '/checkout';
    const isManufacturerPage = currentRoute.pathname === '/manufacturer';
    const isAboutPage = currentRoute.pathname === '/about';
    const isCareersPage = currentRoute.pathname === '/careers';

    if (['/reach-out', '/reach-out-to-us'].includes(currentRoute.pathname)) return <ReachOutPage />;

    if (['/queries', '/compliance', '/contact'].includes(currentRoute.pathname)) return <QueriesPage />;

    if (isCheckoutPage) {
      return <CheckoutPage />;
    }

    if (isManufacturerPage) {
      return <ManufacturerPage />;
    }

    if (isAboutPage) {
      return <AboutPage />;
    }

    if (isCareersPage) {
      return <CareersPage />;
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
    <div className="premium-storefront w-full min-h-screen flex flex-col relative">
      {/* MAIN HEADER */}
      <MainHeader />

      {/* MAIN CONTENT BODY */}
      <main className="storefront-main flex-1 w-full">
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

      {/* BRANDED HARVEST ANIMATION ON SITE OPEN */}
      {currentRoute.pathname === '/' && <IntroVideoOverlay onFinish={finishIntro} />}

      {/* FLOATING WHATSAPP BUTTON */}
      {!isCommercePage && <WhatsAppFloatingButton />}
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
