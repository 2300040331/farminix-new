import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type {
  AdminSiteConfig,
  ThemeTokens,
  TopOfferBarConfig,
  HeaderConfig,
  NavItemConfig,
  HeroConfig,
  QueriesPageConfig,
  ReachOutPageConfig,
  BrandMarqueeConfig,
  FeatureStripConfig,
  CategorySectionConfig,
  PopularProductsConfig,
  SocialBlogConfig,
  EpicDealsConfig,
  FutureArrivalsConfig,
  BottomFeatureStripConfig,
  FooterConfig,
  IntroVideoConfig,
  OffersPageConfig,
  SectionOrderItem,
  MediaItem,
  ShopNowPageConfig,
  ManufacturerConfig,
  AboutPageConfig,
  CartConfig,
  CheckoutPaymentConfig,
  CareersPageConfig,
} from '../types';
import type { Product, Category, Order, User } from '../../types';
import {
  defaultSiteConfig,
  defaultThemeTokens,
  defaultManufacturerConfig,
  defaultAboutPageConfig,
  defaultCartConfig,
  defaultCheckoutPaymentConfig,
  defaultCareersPageConfig,
  defaultIntroVideoConfig,
  defaultSocialBlogConfig,
} from '../defaultConfig';

interface AdminContextType {
  config: AdminSiteConfig; // Represents draft config in editor
  publishedConfig: AdminSiteConfig; // Represents published config on store
  hasChanges: boolean;
  isAdminLoggedIn: boolean;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  isSaving: boolean;
  saveError: string;
  saveSuccess: boolean;
  adminLogout: () => void;
  publishConfig: () => Promise<boolean>;
  discardDraft: () => void;
  updateTheme: (tokens: Partial<ThemeTokens>) => void;
  updateSectionOrder: (newOrder: SectionOrderItem[]) => void;
  toggleSection: (id: string, enabled: boolean) => void;
  updateTopOfferBar: (cfg: Partial<TopOfferBarConfig>) => void;
  updateHeader: (cfg: Partial<HeaderConfig>) => void;
  updateNavItems: (items: NavItemConfig[]) => void;
  updateHero: (cfg: Partial<HeroConfig>) => void;
  updateQueriesPage: (cfg: QueriesPageConfig) => void;
  updateReachOutPage: (cfg: ReachOutPageConfig) => void;
  updateBrandMarquee: (cfg: Partial<BrandMarqueeConfig>) => void;
  updateFeatureStrip: (cfg: Partial<FeatureStripConfig>) => void;
  updateCategorySection: (cfg: Partial<CategorySectionConfig>) => void;
  updateCategories: (cats: Category[]) => void;
  updatePopularProducts: (cfg: Partial<PopularProductsConfig>) => void;
  updateSocialBlog: (cfg: Partial<SocialBlogConfig>) => void;
  updateEpicDeals: (cfg: Partial<EpicDealsConfig>) => void;
  updateFutureArrivals: (cfg: Partial<FutureArrivalsConfig>) => void;
  updateBottomFeatureStrip: (cfg: Partial<BottomFeatureStripConfig>) => void;
  updateFooter: (cfg: Partial<FooterConfig>) => void;
  updateIntroVideo: (cfg: Partial<IntroVideoConfig>) => void;
  updateOffersPage: (cfg: Partial<OffersPageConfig>) => void;
  updateShopNowConfig: (cfg: Partial<ShopNowPageConfig>) => void;
  updateManufacturer: (cfg: Partial<ManufacturerConfig>) => void;
  updateAboutPage: (cfg: Partial<AboutPageConfig>) => void;
  updateCareersPage: (cfg: Partial<CareersPageConfig>) => void;
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
  return {
    ...merged,
    comingSoonMode: false,
    manufacturedBy: { ...defaultManufacturerConfig.manufacturedBy, ...raw?.manufacturedBy },
    marketedBy: { ...defaultManufacturerConfig.marketedBy, ...raw?.marketedBy },
  };
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

const sanitizeAboutPage = (raw: any): AboutPageConfig => {
  const merged = { ...defaultAboutPageConfig, ...(raw || {}) };
  if (
    !merged.headline ||
    merged.headline.includes('Soil to Soul') ||
    merged.subheadline?.includes('bridges generational')
  ) {
    merged.headline = defaultAboutPageConfig.headline;
    merged.subheadline = defaultAboutPageConfig.subheadline;
    merged.tags = defaultAboutPageConfig.tags;
  }
  return merged;
};

const sanitizeProducts = (products: any[]): Product[] => {
  if (!Array.isArray(products)) {
    return defaultSiteConfig.products;
  }
  return products.map((prod) => {
    const cleanProd = { ...prod };
    if (cleanProd.stockCount != null) {
      cleanProd.stockCount = Math.max(0, Math.floor(Number(cleanProd.stockCount) || 0));
      cleanProd.inStock = cleanProd.stockCount > 0;
    }
    delete cleanProd.storySection;
    delete cleanProd.rating;
    delete cleanProd.reviewsCount;
    cleanProd.reviewsList = (cleanProd.reviewsList || []).filter((review: any) => review.source === 'admin');
    if (cleanProd.discountPercentage !== undefined) {
      cleanProd.discountPercentage = Number(cleanProd.discountPercentage);
    } else if (cleanProd.oldPrice && cleanProd.price && cleanProd.oldPrice > cleanProd.price) {
      cleanProd.discountPercentage = Math.round(((cleanProd.oldPrice - cleanProd.price) / cleanProd.oldPrice) * 100);
    }

    return cleanProd;
  });
};

const sanitizeFooter = (raw: any): FooterConfig => {
  const merged = { ...defaultSiteConfig.footer, ...(raw || {}) };
  const placeholderSocials = new Set(['https://www.instagram.com', 'https://www.facebook.com', 'https://twitter.com', 'https://www.youtube.com']);
  const socialLinks = { ...defaultSiteConfig.footer.socialLinks, ...(raw?.socialLinks || {}) };
  for (const key of Object.keys(socialLinks) as Array<keyof typeof socialLinks>) {
    if (placeholderSocials.has(socialLinks[key])) socialLinks[key] = '';
  }
  const cleanLinks = (links: any, fallback: any[]) => Array.isArray(links)
    ? links.filter((link) => link && String(link.label || '').trim()).map((link) => ({ ...link, enabled: link.enabled !== false }))
    : fallback;
  const rawHelpLinks = cleanLinks(raw?.helpLinks, defaultSiteConfig.footer.helpLinks);
  const legacyHelp = rawHelpLinks.some((link: any) => ['24/7 Live Support', 'Track Order', 'FAQs & Help', 'Contact Us'].includes(link.label));
  return {
    ...merged,
    socialLinks,
    whatsappPhone: String(raw?.whatsappPhone || merged.whatsappPhone || defaultSiteConfig.footer.whatsappPhone).replace(/\D/g, ''),
    whatsappMessage: String(raw?.whatsappMessage || merged.whatsappMessage || defaultSiteConfig.footer.whatsappMessage),
    companyLinks: cleanLinks(raw?.companyLinks, defaultSiteConfig.footer.companyLinks),
    helpLinks: legacyHelp ? defaultSiteConfig.footer.helpLinks : rawHelpLinks,
    downloadApp: { googlePlayUrl: '', appleAppStoreUrl: '' },
    legalLinks: [],
  };
};

// Remove bundled stock-photo placeholders while retaining uploaded and real product assets.
const removePlaceholderImages = <T,>(value: T): T => JSON.parse(JSON.stringify(value), (_key, item) =>
  typeof item === 'string' && (/^https:\/\/(images\.unsplash\.com|picsum\.photos)\//.test(item) || /^\/prod_(daawat_rice|aashirvaad_atta|fortune_oil|tata_salt)\.jpg$/.test(item)) ? '' : item);

const publicationSnapshot = (config: AdminSiteConfig) => {
  const { razorpayKeySecret: _privateKey, ...payment } = config.checkoutPayment || {};
  return { ...config, orders: [], users: [], checkoutPayment: payment };
};

const AdminConfigContext = createContext<AdminContextType | undefined>(undefined);

export const AdminConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Published config (loaded by the storefront)
  const [publishedConfig, setPublishedConfig] = useState<AdminSiteConfig>(() => {
    try {
      const cached = localStorage.getItem(PUBLISHED_KEY);
      if (cached) return { ...defaultSiteConfig, ...JSON.parse(cached) };
    } catch {}
    return defaultSiteConfig;
  });

  // Draft config (loaded and modified in the admin crm)
  const [config, setConfig] = useState<AdminSiteConfig>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = removePlaceholderImages(JSON.parse(saved));
        return {
          ...defaultSiteConfig,
          ...parsed,
          products: sanitizeProducts(parsed.products),
          theme: { ...defaultThemeTokens, ...(parsed.theme || {}) },
          footer: sanitizeFooter(parsed.footer),
          socialBlog: { ...defaultSocialBlogConfig, ...(parsed.socialBlog || {}), entries: Array.isArray(parsed.socialBlog?.entries) ? parsed.socialBlog.entries : [] },
          introVideo: { ...defaultIntroVideoConfig, ...(parsed.introVideo || {}) },
          header: { ...defaultSiteConfig.header, ...(parsed.header || {}) },
          manufacturer: sanitizeManufacturer(parsed.manufacturer),
          aboutPage: sanitizeAboutPage(parsed.aboutPage),
          careersPage: { ...defaultCareersPageConfig, ...(parsed.careersPage || {}) },
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
        const parsed = removePlaceholderImages(JSON.parse(publishedSaved));
        return {
          ...defaultSiteConfig,
          ...parsed,
          products: sanitizeProducts(parsed.products),
          theme: { ...defaultThemeTokens, ...(parsed.theme || {}) },
          footer: sanitizeFooter(parsed.footer),
          socialBlog: { ...defaultSocialBlogConfig, ...(parsed.socialBlog || {}), entries: Array.isArray(parsed.socialBlog?.entries) ? parsed.socialBlog.entries : [] },
          introVideo: { ...defaultIntroVideoConfig, ...(parsed.introVideo || {}) },
          header: { ...defaultSiteConfig.header, ...(parsed.header || {}) },
          manufacturer: sanitizeManufacturer(parsed.manufacturer),
          aboutPage: sanitizeAboutPage(parsed.aboutPage),
          careersPage: { ...defaultCareersPageConfig, ...(parsed.careersPage || {}) },
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

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  useEffect(() => {
    void fetch('/api/site-config?session=1', { credentials: 'same-origin', cache: 'no-store' })
      .then(response => response.ok ? response.json() : { authenticated: false })
      .then(data => setIsAdminLoggedIn(data.authenticated === true))
      .catch(() => setIsAdminLoggedIn(false));
  }, []);

  const [hasChanges, setHasChanges] = useState<boolean>(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    const pub = localStorage.getItem(PUBLISHED_KEY);
    if (!draft) return false;
    if (!pub) return true;
    try { return JSON.stringify(publicationSnapshot(JSON.parse(draft))) !== JSON.stringify(publicationSnapshot(JSON.parse(pub))); } catch { return true; }
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
          draftRef.current = parsed;
          dirtyRef.current = true;
          setConfig(parsed);
          setHasChanges(true);
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


  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const draftRef = useRef(config);
  const dirtyRef = useRef(hasChanges);
  const savingRef = useRef(false);
  const publishVersion = useRef(0);

  useEffect(() => {
    let disposed = false;
    const refresh = async () => {
      const version = publishVersion.current;
      try {
        const response = await fetch('/api/site-config', { cache: 'no-store' });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load live store.');
        if (disposed || savingRef.current || version !== publishVersion.current) return;
        if (data.config) {
          const liveRaw = removePlaceholderImages(data.config);
          const live = { ...defaultSiteConfig, ...liveRaw, footer: sanitizeFooter(liveRaw.footer), introVideo: { ...defaultIntroVideoConfig, ...(liveRaw.introVideo || {}) }, socialBlog: { ...defaultSocialBlogConfig, ...(liveRaw.socialBlog || {}), entries: Array.isArray(liveRaw.socialBlog?.entries) ? liveRaw.socialBlog.entries : [] }, products: sanitizeProducts(removePlaceholderImages(data.config.products)) };
          setPublishedConfig(live);
          try { localStorage.setItem(PUBLISHED_KEY, JSON.stringify(live)); } catch {}
          if (!dirtyRef.current) {
            draftRef.current = live;
            setConfig(live);
            try { localStorage.setItem(DRAFT_KEY, JSON.stringify(live)); } catch {}
          }
        }
      } catch (error) {
        if (!disposed) setSaveError(error instanceof Error ? error.message : 'Unable to connect to the live store.');
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => { disposed = true; clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);

  // Edits remain drafts until the server confirms publication.
  const saveConfig = (newConfig: AdminSiteConfig) => {
    const sanitized = removePlaceholderImages({ ...newConfig, products: sanitizeProducts(newConfig.products) });
    draftRef.current = sanitized;
    dirtyRef.current = true;
    setConfig(sanitized);
    setHasChanges(true);
    setSaveSuccess(false);
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(sanitized)); } catch {}
  };

  const publishConfig = async () => {
    if (savingRef.current) return false;
    savingRef.current = true;
    publishVersion.current += 1;
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    const snapshot = draftRef.current;
    try {
      const response = await fetch('/api/site-config', {
        method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: publicationSnapshot(snapshot) }),
        signal: AbortSignal.timeout(25000),
      });
      if (response.ok) {
        const data = await response.json();
        setPublishedConfig({ ...defaultSiteConfig, ...data.config, footer: sanitizeFooter(data.config.footer), introVideo: { ...defaultIntroVideoConfig, ...(data.config.introVideo || {}) }, socialBlog: { ...defaultSocialBlogConfig, ...(data.config.socialBlog || {}), entries: Array.isArray(data.config.socialBlog?.entries) ? data.config.socialBlog.entries : [] } });
        try { localStorage.setItem(PUBLISHED_KEY, JSON.stringify(data.config)); } catch {}
      } else {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) setIsAdminLoggedIn(false);
        throw new Error(data.error || 'Changes could not be published. Please retry.');
      }
      const changedDuringSave = draftRef.current !== snapshot;
      dirtyRef.current = changedDuringSave;
      setHasChanges(changedDuringSave);
      setSaveSuccess(true);
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to publish changes.');
      setHasChanges(true);
      return false;
    } finally { savingRef.current = false; setIsSaving(false); }
  };

  const discardDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(publishedConfig));
      draftRef.current = publishedConfig;
      dirtyRef.current = false;
      setConfig(publishedConfig);
      setHasChanges(false);
    } catch (e) {
      console.error('Failed to discard draft config', e);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    const response = await fetch('/api/site-config', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.authenticated) throw new Error(data.error || 'Unable to sign in to the server. Please retry.');
    setIsAdminLoggedIn(true);
    setSaveError('');
    return true;
  };

  const adminLogout = () => {
    void fetch('/api/site-config', { method: 'DELETE' });
    setIsAdminLoggedIn(false);
    try { localStorage.removeItem(AUTH_KEY); } catch {}
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

  const updateReachOutPage = (reachOutPage: ReachOutPageConfig) => saveConfig({ ...draftRef.current, reachOutPage });

  const updateQueriesPage = (queriesPage: QueriesPageConfig) => saveConfig({ ...draftRef.current, queriesPage });

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
  const updateSocialBlog = (cfg: Partial<SocialBlogConfig>) => {
    const next = { ...draftRef.current.socialBlog, ...cfg };
    const enabled = cfg.enabled ?? next.enabled;
    const sectionOrder = draftRef.current.sectionOrder.some((s) => s.id === 'socialBlog')
      ? draftRef.current.sectionOrder.map((s) => s.id === 'socialBlog' ? { ...s, enabled } : s)
      : [...draftRef.current.sectionOrder, { id: 'socialBlog', name: 'Instagram & Blog Videos', enabled, order: draftRef.current.sectionOrder.length + 1 }];
    saveConfig({ ...draftRef.current, socialBlog: next, sectionOrder });
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
    saveConfig({ ...draftRef.current, footer: { ...draftRef.current.footer, ...cfg } });
  };
  const updateIntroVideo = (cfg: Partial<IntroVideoConfig>) => {
    saveConfig({ ...draftRef.current, introVideo: { ...draftRef.current.introVideo, ...cfg } });
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

  const updateCareersPage = (cfg: Partial<CareersPageConfig>) => {
    const current = config.careersPage || defaultCareersPageConfig;
    saveConfig({ ...config, careersPage: { ...current, ...cfg } });
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
        isSaving,
        saveError,
        saveSuccess,
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
        updateQueriesPage,
        updateReachOutPage,
        updateBrandMarquee,
        updateFeatureStrip,
        updateCategorySection,
        updateCategories,
        updatePopularProducts,
        updateSocialBlog,
        updateEpicDeals,
        updateFutureArrivals,
        updateBottomFeatureStrip,
        updateFooter,
        updateIntroVideo,
        updateOffersPage,
        updateShopNowConfig,
        updateManufacturer,
        updateAboutPage,
        updateCareersPage,
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
