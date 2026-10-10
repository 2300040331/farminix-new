import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  AdminSiteConfig,
  ThemeTokens,
  TopOfferBarConfig,
  HeaderConfig,
  NavItemConfig,
  HeroConfig,
  BrandMarqueeConfig,
  FeatureStripConfig,
  CategorySectionConfig,
  PopularProductsConfig,
  EpicDealsConfig,
  FutureArrivalsConfig,
  BottomFeatureStripConfig,
  FooterConfig,
  OffersPageConfig,
  SectionOrderItem,
  MediaItem,
  ShopNowPageConfig,
  ManufacturerConfig,
  AboutPageConfig,
  CartConfig,
  CheckoutPaymentConfig,
} from '../types';
import type { Product, Category, Order, User } from '../../types';
import {
  defaultSiteConfig,
  defaultThemeTokens,
  defaultManufacturerConfig,
  defaultAboutPageConfig,
  defaultCartConfig,
  defaultCheckoutPaymentConfig,
} from '../defaultConfig';

interface AdminContextType {
  config: AdminSiteConfig; // Represents draft config in editor
  publishedConfig: AdminSiteConfig; // Represents published config on store
  hasChanges: boolean;
  isAdminLoggedIn: boolean;
  adminLogin: (email: string, pass: string) => boolean;
  adminLogout: () => void;
  publishConfig: () => void;
  discardDraft: () => void;
  updateTheme: (tokens: Partial<ThemeTokens>) => void;
  updateSectionOrder: (newOrder: SectionOrderItem[]) => void;
  toggleSection: (id: string, enabled: boolean) => void;
  updateTopOfferBar: (cfg: Partial<TopOfferBarConfig>) => void;
  updateHeader: (cfg: Partial<HeaderConfig>) => void;
  updateNavItems: (items: NavItemConfig[]) => void;
  updateHero: (cfg: Partial<HeroConfig>) => void;
  updateBrandMarquee: (cfg: Partial<BrandMarqueeConfig>) => void;
  updateFeatureStrip: (cfg: Partial<FeatureStripConfig>) => void;
  updateCategorySection: (cfg: Partial<CategorySectionConfig>) => void;
  updateCategories: (cats: Category[]) => void;
  updatePopularProducts: (cfg: Partial<PopularProductsConfig>) => void;
  updateEpicDeals: (cfg: Partial<EpicDealsConfig>) => void;
  updateFutureArrivals: (cfg: Partial<FutureArrivalsConfig>) => void;
  updateBottomFeatureStrip: (cfg: Partial<BottomFeatureStripConfig>) => void;
  updateFooter: (cfg: Partial<FooterConfig>) => void;
  updateOffersPage: (cfg: Partial<OffersPageConfig>) => void;
  updateShopNowConfig: (cfg: Partial<ShopNowPageConfig>) => void;
  updateManufacturer: (cfg: Partial<ManufacturerConfig>) => void;
  updateAboutPage: (cfg: Partial<AboutPageConfig>) => void;
  updateCartConfig: (cfg: Partial<CartConfig>) => void;
  updateCheckoutPayment: (cfg: Partial<CheckoutPaymentConfig>) => void;
  updateProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateOrders: (orders: Order[]) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  updateUsers: (users: User[]) => void;
  addMedia: (item: MediaItem) => void;
  deleteMedia: (id: string) => void;
  resetToDefaults: () => void;
}

const DRAFT_KEY = 'farminix_admin_draft_config_v5';
const PUBLISHED_KEY = 'farminix_admin_published_config_v5';
const AUTH_KEY = 'farminix_admin_auth_v5';

const sanitizeManufacturer = (raw: any): ManufacturerConfig => {
  const merged = { ...defaultManufacturerConfig, ...(raw || {}) };
  if (
    merged.comingSoonBadge === 'Official Launch' ||
    merged.comingSoonTitle === 'Manufacturer & Milling Center' ||
    merged.comingSoonText?.includes('Farminix bridges generational')
  ) {
    return {
      ...merged,
      comingSoonMode: true,
      comingSoonBadge: 'Coming Soon',
      comingSoonTitle: 'Manufacturer',
      comingSoonText:
        "We're working on something exciting. This page will be available soon with all the details you need.",
    };
  }
  return { ...merged, comingSoonMode: true };
};

const sanitizePaymentConfig = (raw: any): CheckoutPaymentConfig => {
  const merged = { ...defaultCheckoutPaymentConfig, ...(raw || {}) };
  if (merged.razorpayKeyId === 'rzp_test_TkIMPriA788lqz') {
    merged.razorpayKeyId = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || '';
  }
  if (merged.razorpayKeySecret === 'eC5FdAw7dBccrFg0J7qaoO3e') {
    merged.razorpayKeySecret = '';
  }
  return merged;
};

const sanitizeProducts = (products: any[]): Product[] => {
  if (!Array.isArray(products) || products.length === 0) {
    return defaultSiteConfig.products;
  }
  return products.map((prod) => {
    const cleanProd = { ...prod };
    delete cleanProd.storySection;
    if (cleanProd.id === 'r1' || cleanProd.name?.toLowerCase().includes('farminix')) {
      if (!cleanProd.specifications || cleanProd.specifications.length < 5) {
        cleanProd.specifications = defaultSiteConfig.products[0]?.specifications || cleanProd.specifications;
      }
    }
    return cleanProd;
  });
};

const AdminConfigContext = createContext<AdminContextType | undefined>(undefined);

export const AdminConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Published config (loaded by the storefront)
  const [publishedConfig, setPublishedConfig] = useState<AdminSiteConfig>(() => {
    try {
      const saved = localStorage.getItem(PUBLISHED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSiteConfig,
          ...parsed,
          products: sanitizeProducts(parsed.products),
          theme: { ...defaultThemeTokens, ...(parsed.theme || {}) },
          footer: { ...defaultSiteConfig.footer, ...(parsed.footer || {}) },
          header: { ...defaultSiteConfig.header, ...(parsed.header || {}) },
          manufacturer: sanitizeManufacturer(parsed.manufacturer),
          aboutPage: { ...defaultAboutPageConfig, ...(parsed.aboutPage || {}) },
          cart: { ...defaultCartConfig, ...(parsed.cart || {}) },
          checkoutPayment: sanitizePaymentConfig(parsed.checkoutPayment),
          futureArrivals: { ...defaultSiteConfig.futureArrivals, ...(parsed.futureArrivals || {}) },
          categorySection: { ...defaultSiteConfig.categorySection, ...(parsed.categorySection || {}) },
          featureStrip: { ...defaultSiteConfig.featureStrip, ...(parsed.featureStrip || {}) },
          bottomFeatureStrip: { ...defaultSiteConfig.bottomFeatureStrip, ...(parsed.bottomFeatureStrip || {}) },
          navItems: (() => {
            const saved = parsed.navItems || [];
            const savedIds = new Set(saved.map((n: NavItemConfig) => n.id));
            const missing = defaultSiteConfig.navItems.filter((n) => !savedIds.has(n.id));
            return [...saved, ...missing];
          })(),
        };
      }
    } catch (e) {
      console.warn('Failed to parse published admin config, using defaults', e);
    }
    return defaultSiteConfig;
  });

  // Draft config (loaded and modified in the admin crm)
  const [config, setConfig] = useState<AdminSiteConfig>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultSiteConfig,
          ...parsed,
          products: sanitizeProducts(parsed.products),
          theme: { ...defaultThemeTokens, ...(parsed.theme || {}) },
          footer: { ...defaultSiteConfig.footer, ...(parsed.footer || {}) },
          header: { ...defaultSiteConfig.header, ...(parsed.header || {}) },
          manufacturer: sanitizeManufacturer(parsed.manufacturer),
          aboutPage: { ...defaultAboutPageConfig, ...(parsed.aboutPage || {}) },
          cart: { ...defaultCartConfig, ...(parsed.cart || {}) },
          checkoutPayment: sanitizePaymentConfig(parsed.checkoutPayment),
          futureArrivals: { ...defaultSiteConfig.futureArrivals, ...(parsed.futureArrivals || {}) },
          categorySection: { ...defaultSiteConfig.categorySection, ...(parsed.categorySection || {}) },
          featureStrip: { ...defaultSiteConfig.featureStrip, ...(parsed.featureStrip || {}) },
          bottomFeatureStrip: { ...defaultSiteConfig.bottomFeatureStrip, ...(parsed.bottomFeatureStrip || {}) },
          shopNowConfig: { ...defaultSiteConfig.shopNowConfig, ...(parsed.shopNowConfig || {}) },
          navItems: (() => {
            const s = parsed.navItems || [];
            const ids = new Set(s.map((n: NavItemConfig) => n.id));
            const miss = defaultSiteConfig.navItems.filter((n) => !ids.has(n.id));
            return [...s, ...miss];
          })(),
        };
      }
      
      // Fallback to published if no draft exists
      const publishedSaved = localStorage.getItem(PUBLISHED_KEY);
      if (publishedSaved) {
        const parsed = JSON.parse(publishedSaved);
        return {
          ...defaultSiteConfig,
          ...parsed,
          products: sanitizeProducts(parsed.products),
          theme: { ...defaultThemeTokens, ...(parsed.theme || {}) },
          footer: { ...defaultSiteConfig.footer, ...(parsed.footer || {}) },
          header: { ...defaultSiteConfig.header, ...(parsed.header || {}) },
          manufacturer: sanitizeManufacturer(parsed.manufacturer),
          aboutPage: { ...defaultAboutPageConfig, ...(parsed.aboutPage || {}) },
          cart: { ...defaultCartConfig, ...(parsed.cart || {}) },
          checkoutPayment: { ...defaultCheckoutPaymentConfig, ...(parsed.checkoutPayment || {}) },
          futureArrivals: { ...defaultSiteConfig.futureArrivals, ...(parsed.futureArrivals || {}) },
          categorySection: { ...defaultSiteConfig.categorySection, ...(parsed.categorySection || {}) },
          featureStrip: { ...defaultSiteConfig.featureStrip, ...(parsed.featureStrip || {}) },
          bottomFeatureStrip: { ...defaultSiteConfig.bottomFeatureStrip, ...(parsed.bottomFeatureStrip || {}) },
          shopNowConfig: { ...defaultSiteConfig.shopNowConfig, ...(parsed.shopNowConfig || {}) },
          navItems: (() => {
            const s = parsed.navItems || [];
            const ids = new Set(s.map((n: NavItemConfig) => n.id));
            const miss = defaultSiteConfig.navItems.filter((n) => !ids.has(n.id));
            return [...s, ...miss];
          })(),
        };
      }
    } catch (e) {
      console.warn('Failed to parse draft admin config, using defaults', e);
    }
    return defaultSiteConfig;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [hasChanges, setHasChanges] = useState<boolean>(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    const pub = localStorage.getItem(PUBLISHED_KEY);
    if (!draft) return false;
    if (!pub) return true;
    return draft !== pub;
  });

  // Cross-tab real-time synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PUBLISHED_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setPublishedConfig((prev) => ({
            ...prev,
            ...parsed,
          }));
        } catch (err) {
          console.error('Error syncing published config across tabs:', err);
        }
      }
      if (e.key === DRAFT_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setConfig((prev) => ({
            ...prev,
            ...parsed,
          }));
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Apply theme tokens as CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    // Storefront uses theme from publishedConfig
    const t = publishedConfig.theme;
    
    root.style.setProperty('--color-primary', t.colorPrimary);
    root.style.setProperty('--color-primary-hover', t.colorPrimaryHover);
    root.style.setProperty('--color-secondary', t.colorSecondary);
    root.style.setProperty('--color-secondary-hover', t.colorSecondaryHover);
    root.style.setProperty('--color-accent', t.colorAccent);
    root.style.setProperty('--color-bg', t.colorBackground);
    root.style.setProperty('--color-surface', t.colorSurface);
    root.style.setProperty('--color-text-primary', t.colorTextPrimary);
    root.style.setProperty('--color-text-muted', t.colorTextMuted);
    root.style.setProperty('--color-border', t.colorBorder);

    root.style.setProperty('--header-bg', t.headerBackground);
    root.style.setProperty('--header-text', t.headerTextColor);
    root.style.setProperty('--navbar-bg', t.navbarBackground);
    root.style.setProperty('--navbar-text', t.navbarTextColor);
    root.style.setProperty('--navbar-active', t.navbarActiveColor);

    root.style.setProperty('--btn-primary-bg', t.btnPrimaryBg);
    root.style.setProperty('--btn-primary-text', t.btnPrimaryText);
    root.style.setProperty('--card-bg', t.cardBg);
    root.style.setProperty('--card-border', t.cardBorder);
    root.style.setProperty('--footer-bg', t.footerBg);
    root.style.setProperty('--footer-text', t.footerTextColor);
  }, [publishedConfig.theme]);


  // Save changes to draft & immediately publish to live store
  const saveConfig = (newConfig: AdminSiteConfig) => {
    const sanitized = {
      ...newConfig,
      products: sanitizeProducts(newConfig.products),
    };
    setConfig(sanitized);
    setPublishedConfig(sanitized);
    setHasChanges(false);
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(sanitized));
      localStorage.setItem(PUBLISHED_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.error('Failed to save & publish admin config', e);
    }
  };

  const publishConfig = () => {
    const sanitized = {
      ...config,
      products: sanitizeProducts(config.products),
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(sanitized));
      localStorage.setItem(PUBLISHED_KEY, JSON.stringify(sanitized));
      setConfig(sanitized);
      setPublishedConfig(sanitized);
      setHasChanges(false);
    } catch (e) {
      console.error('Failed to publish admin config', e);
    }
  };

  const discardDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(publishedConfig));
      setConfig(publishedConfig);
      setHasChanges(false);
    } catch (e) {
      console.error('Failed to discard draft config', e);
    }
  };

  const adminLogin = (email: string, pass: string): boolean => {
    if ((email.trim().toLowerCase() === 'admin@farminix.com' || email.trim().toLowerCase() === 'admin') && (pass === 'admin123' || pass === 'farminix2026')) {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem(AUTH_KEY, 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {}
  };

  const updateTheme = (tokens: Partial<ThemeTokens>) => {
    saveConfig({
      ...config,
      theme: { ...config.theme, ...tokens },
    });
  };

  const updateSectionOrder = (newOrder: SectionOrderItem[]) => {
    saveConfig({ ...config, sectionOrder: newOrder });
  };

  const toggleSection = (id: string, enabled: boolean) => {
    const updatedOrder = config.sectionOrder.map((s) => (s.id === id ? { ...s, enabled } : s));
    saveConfig({ ...config, sectionOrder: updatedOrder });
  };

  const updateTopOfferBar = (cfg: Partial<TopOfferBarConfig>) => {
    saveConfig({ ...config, topOfferBar: { ...config.topOfferBar, ...cfg } });
  };

  const updateHeader = (cfg: Partial<HeaderConfig>) => {
    saveConfig({ ...config, header: { ...config.header, ...cfg } });
  };

  const updateNavItems = (items: NavItemConfig[]) => {
    saveConfig({ ...config, navItems: items });
  };

  const updateHero = (cfg: Partial<HeroConfig>) => {
    let updatedSectionOrder = config.sectionOrder;
    if (cfg.enabled !== undefined) {
      updatedSectionOrder = config.sectionOrder.map((s) =>
        s.id === 'hero' ? { ...s, enabled: cfg.enabled! } : s
      );
    }
    saveConfig({ ...config, hero: { ...config.hero, ...cfg }, sectionOrder: updatedSectionOrder });
  };

  const updateBrandMarquee = (cfg: Partial<BrandMarqueeConfig>) => {
    saveConfig({ ...config, brandMarquee: { ...config.brandMarquee, ...cfg } });
  };

  const updateFeatureStrip = (cfg: Partial<FeatureStripConfig>) => {
    saveConfig({ ...config, featureStrip: { ...config.featureStrip, ...cfg } });
  };

  const updateCategorySection = (cfg: Partial<CategorySectionConfig>) => {
    let updatedSectionOrder = config.sectionOrder;
    if (cfg.enabled !== undefined) {
      updatedSectionOrder = config.sectionOrder.map((s) =>
        s.id === 'categorySection' ? { ...s, enabled: cfg.enabled! } : s
      );
    }
    saveConfig({ ...config, categorySection: { ...config.categorySection, ...cfg }, sectionOrder: updatedSectionOrder });
  };

  const updateCategories = (cats: Category[]) => {
    saveConfig({ ...config, categories: cats });
  };

  const updatePopularProducts = (cfg: Partial<PopularProductsConfig>) => {
    let updatedSectionOrder = config.sectionOrder;
    if (cfg.enabled !== undefined) {
      updatedSectionOrder = config.sectionOrder.map((s) =>
        s.id === 'popularProducts' ? { ...s, enabled: cfg.enabled! } : s
      );
    }
    saveConfig({ ...config, popularProducts: { ...config.popularProducts, ...cfg }, sectionOrder: updatedSectionOrder });
  };

  const updateEpicDeals = (cfg: Partial<EpicDealsConfig>) => {
    saveConfig({ ...config, epicDeals: { ...config.epicDeals, ...cfg } });
  };

  const updateFutureArrivals = (cfg: Partial<FutureArrivalsConfig>) => {
    saveConfig({ ...config, futureArrivals: { ...config.futureArrivals, ...cfg } });
  };

  const updateBottomFeatureStrip = (cfg: Partial<BottomFeatureStripConfig>) => {
    saveConfig({ ...config, bottomFeatureStrip: { ...config.bottomFeatureStrip, ...cfg } });
  };

  const updateFooter = (cfg: Partial<FooterConfig>) => {
    saveConfig({ ...config, footer: { ...config.footer, ...cfg } });
  };

  const updateOffersPage = (cfg: Partial<OffersPageConfig>) => {
    saveConfig({ ...config, offersPage: { ...config.offersPage, ...cfg } });
  };

  const updateShopNowConfig = (cfg: Partial<ShopNowPageConfig>) => {
    saveConfig({ ...config, shopNowConfig: { ...config.shopNowConfig, ...cfg } });
  };

  const updateManufacturer = (cfg: Partial<ManufacturerConfig>) => {
    const current = config.manufacturer || defaultManufacturerConfig;
    saveConfig({ ...config, manufacturer: { ...current, ...cfg } });
  };

  const updateAboutPage = (cfg: Partial<AboutPageConfig>) => {
    const current = config.aboutPage || defaultAboutPageConfig;
    saveConfig({ ...config, aboutPage: { ...current, ...cfg } });
  };

  const updateCartConfig = (cfg: Partial<CartConfig>) => {
    const current = config.cart || defaultCartConfig;
    saveConfig({ ...config, cart: { ...current, ...cfg } });
  };

  const updateCheckoutPayment = (cfg: Partial<CheckoutPaymentConfig>) => {
    const current = config.checkoutPayment || defaultCheckoutPaymentConfig;
    saveConfig({ ...config, checkoutPayment: { ...current, ...cfg } });
  };

  const updateProducts = (products: Product[]) => {
    saveConfig({ ...config, products });
  };

  const addProduct = (product: Product) => {
    saveConfig({ ...config, products: [product, ...config.products] });
  };

  const editProduct = (product: Product) => {
    const updated = config.products.map((p) => (p.id === product.id ? product : p));
    saveConfig({ ...config, products: updated });
  };

  const deleteProduct = (id: string) => {
    const updated = config.products.filter((p) => p.id !== id);
    saveConfig({ ...config, products: updated });
  };

  const updateOrders = (orders: Order[]) => {
    saveConfig({ ...config, orders });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = config.orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    saveConfig({ ...config, orders: updated });
  };

  const deleteOrder = (orderId: string) => {
    const updated = config.orders.filter((o) => o.id !== orderId);
    saveConfig({ ...config, orders: updated });
  };

  const updateUsers = (users: User[]) => {
    saveConfig({ ...config, users });
  };

  const addMedia = (item: MediaItem) => {
    saveConfig({ ...config, mediaLibrary: [item, ...config.mediaLibrary] });
  };

  const deleteMedia = (id: string) => {
    saveConfig({ ...config, mediaLibrary: config.mediaLibrary.filter((m) => m.id !== id) });
  };

  const resetToDefaults = () => {
    saveConfig(defaultSiteConfig);
  };

  return (
    <AdminConfigContext.Provider
      value={{
        config,
        publishedConfig,
        hasChanges,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        publishConfig,
        discardDraft,
        updateTheme,
        updateSectionOrder,
        toggleSection,
        updateTopOfferBar,
        updateHeader,
        updateNavItems,
        updateHero,
        updateBrandMarquee,
        updateFeatureStrip,
        updateCategorySection,
        updateCategories,
        updatePopularProducts,
        updateEpicDeals,
        updateFutureArrivals,
        updateBottomFeatureStrip,
        updateFooter,
        updateOffersPage,
        updateShopNowConfig,
        updateManufacturer,
        updateAboutPage,
        updateCartConfig,
        updateCheckoutPayment,
        updateProducts,
        addProduct,
        editProduct,
        deleteProduct,
        updateOrders,
        updateOrderStatus,
        deleteOrder,
        updateUsers,
        addMedia,
        deleteMedia,
        resetToDefaults,
      }}
    >
      {children}
    </AdminConfigContext.Provider>
  );
};

export const useAdminConfig = () => {
  const context = useContext(AdminConfigContext);
  if (!context) {
    throw new Error('useAdminConfig must be used within an AdminConfigProvider');
  }
  return context;
};
