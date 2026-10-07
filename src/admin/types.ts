import type { Product, Category, DealCard, User, Order } from '../types';

export interface ThemeTokens {
  // Brand Colors
  colorPrimary: string;
  colorPrimaryHover: string;
  colorSecondary: string;
  colorSecondaryHover: string;
  colorAccent: string;
  colorBackground: string;
  colorSurface: string;
  colorTextPrimary: string;
  colorTextMuted: string;
  colorBorder: string;

  // Header & Navbar
  headerBackground: string;
  headerTextColor: string;
  headerSearchBorder: string;
  headerSearchFocus: string;
  navbarBackground: string;
  navbarBorderColor: string;
  navbarTextColor: string;
  navbarActiveColor: string;
  navbarCategoriesBtnBg: string;
  navbarCategoriesBtnText: string;

  // Hero Section
  heroBackground: string;
  heroBorderColor: string;

  // Buttons
  btnPrimaryBg: string;
  btnPrimaryText: string;
  btnPrimaryHoverBg: string;
  btnSecondaryBg: string;
  btnSecondaryText: string;
  btnAccentBg: string;
  btnAccentText: string;

  // Cards
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  cardPriceColor: string;

  // Deals Section
  dealsBannerBgStart: string;
  dealsBannerBgMiddle: string;
  dealsBannerBgEnd: string;
  dealsNeonBadgeBg: string;
  dealsNeonBadgeBorder: string;
  dealsNeonBadgeText: string;

  // Footer
  footerBg: string;
  footerTextColor: string;
  footerHeadingColor: string;
  footerLinkColor: string;
  footerLinkHover: string;
  footerBorderColor: string;

  // Status Colors
  statusSuccess: string;
  statusWarning: string;
  statusError: string;
  statusInfo: string;
}

export interface TopOfferBarConfig {
  enabled: boolean;
  leftTextPrefix: string;
  discountHighlight: string;
  leftTextSuffix: string;
  promoCode: string;
  downloadAppText: string;
  trackOrderText: string;
  helpText: string;
  appStoreAlertMessage: string;
}

export interface HeaderConfig {
  enabled: boolean;
  logoUrl: string;
  logoAlt: string;
  deliveryLabel: string;
  searchPlaceholders: string[];
  loginButtonText: string;
  cartButtonText: string;
}

export interface NavItemConfig {
  id: string;
  label: string;
  catId: string | null;
  badge?: string;
  enabled: boolean;
  order: number;
}

export interface HeroConfig {
  enabled: boolean;
  bannerImage: string;
  altText: string;
  shopNowUrl: string;
  homeUrl: string;
}

export interface PartnerBrand {
  id: string;
  name: string;
  logo: string;
  enabled: boolean;
  order: number;
}

export interface BrandMarqueeConfig {
  enabled: boolean;
  badgeText: string;
  title: string;
  description: string;
  brands: PartnerBrand[];
}

export interface FeatureCard {
  id: number;
  iconName: 'Zap' | 'ShieldCheck' | 'IndianRupee' | 'Lock' | 'Headset';
  title: string;
  subtitle: string;
  bgColor: string;
  actionType?: 'support' | 'none';
  enabled: boolean;
  order: number;
}

export interface FeatureStripConfig {
  enabled: boolean;
  features: FeatureCard[];
}

export interface CategorySectionConfig {
  enabled: boolean;
  title: string;
  seeAllText: string;
  seeAllUrl: string;
}

export interface PopularProductsConfig {
  enabled: boolean;
  title: string;
  viewAllText: string;
  viewAllUrl: string;
  badgeIcon: string;
  featuredProductIds: string[];
}

export interface EpicDealsConfig {
  enabled: boolean;
  topPillText: string;
  mainTitle: string;
  subTitle: string;
  deals: DealCard[];
}

export interface FutureItemConfig {
  id: number;
  name: string;
  image: string;
  badgeText: string;
  enabled: boolean;
  order: number;
}

export interface FutureArrivalsConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  items: FutureItemConfig[];
}

export interface BottomBoxConfig {
  id: number;
  iconName: 'Package' | 'RefreshCw' | 'Headset' | 'ShieldCheck';
  title: string;
  subtitle: string;
  bgColor: string;
  actionType?: 'support' | 'none';
  enabled: boolean;
  order: number;
}

export interface BottomFeatureStripConfig {
  enabled: boolean;
  boxes: BottomBoxConfig[];
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  actionType?: 'support' | 'url';
}

export interface FooterConfig {
  enabled: boolean;
  logoUrl: string;
  bioText: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
  companyLinks: FooterLink[];
  helpLinks: FooterLink[];
  downloadApp: {
    googlePlayUrl: string;
    appleAppStoreUrl: string;
  };
  legalLinks: FooterLink[];
  copyrightText: string;
}

export interface SectionOrderItem {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface OffersPageConfig {
  enabled: boolean;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  countdownHours: number;
  promoCode: string;
}

export interface ShopNowPageConfig {
  enabled: boolean;
  pageTitle: string;
  minPriceLimit: number;
  maxPriceLimit: number;
  itemsPerPage: number;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  category: 'banner' | 'category' | 'product' | 'brand' | 'other';
  uploadedAt: string;
  size: string;
}

export interface ManufacturerFacility {
  id: string;
  name: string;
  location: string;
  type: string;
  capacity: string;
  status: string;
  fssaiNumber: string;
  image?: string;
  enabled: boolean;
}

export interface ManufacturerProcessStep {
  id: string;
  step: string;
  title: string;
  desc: string;
  enabled: boolean;
}

export interface ManufacturerCertification {
  id: string;
  title: string;
  authority: string;
  number: string;
  status: string;
  enabled: boolean;
}

export interface ManufacturerConfig {
  enabled: boolean;
  comingSoonMode: boolean;
  comingSoonBadge: string;
  comingSoonTitle: string;
  comingSoonText: string;
  companyName: string;
  pageTitle: string;
  tagline: string;
  aboutCorporate: string;
  cinOrRegNumber: string;
  fssaiNumber: string;
  registeredOffice: string;
  facilityHeadline: string;
  facilitySubheadline: string;
  facilities: ManufacturerFacility[];
  processTitle: string;
  processSubtitle: string;
  processSteps: ManufacturerProcessStep[];
  certificationsTitle: string;
  certificationsSubtitle: string;
  certifications: ManufacturerCertification[];
  b2bTitle: string;
  b2bSubtitle: string;
  contactPhone: string;
  contactEmail: string;
  supportHours: string;
}

export interface AboutPageConfig {
  headline: string;
  subheadline: string;
  tags: string[];
  founderTitle: string;
  founderSubtitle: string;
  founderLetter: string;
  founderQuote: string;
  founderSignoff: string;
  companyAddress: string;
  processTitle: string;
  processSubtitle: string;
  processSteps: { step: string; title: string; desc: string }[];
  philosophyTitle: string;
  philosophySubtitle: string;
  philosophyPillars: { tag: string; title: string; desc: string; guarantee: string }[];
  calloutTitle: string;
  calloutDesc: string;
  contactPhone: string;
  contactEmail: string;
  contactLocation: string;
}

export interface CartCoupon {
  code: string;
  discountPercentage: number;
  description: string;
  enabled: boolean;
}

export interface CartConfig {
  deliveryBannerText: string;
  deliveryTimeText: string;
  handlingFee: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  coupons: CartCoupon[];
  emptyCartTitle: string;
  emptyCartSubtitle: string;
  emptyCartButtonText: string;
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  enabled: boolean;
  instruction?: string;
}

export interface CheckoutPaymentConfig {
  expressSlotLabel: string;
  expressSlotSublabel: string;
  scheduledSlotLabel: string;
  scheduledSlotSublabel: string;
  paymentMethods: PaymentMethodItem[];
  upiAutoVerifyText: string;
  deliveryInstructions: { id: string; label: string; icon: string; enabled: boolean }[];
  safePaymentsBadgeText: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayEnabled?: boolean;
  razorpayMerchantName?: string;
  razorpayThemeColor?: string;
}

export interface AdminSiteConfig {
  theme: ThemeTokens;
  sectionOrder: SectionOrderItem[];
  topOfferBar: TopOfferBarConfig;
  header: HeaderConfig;
  navItems: NavItemConfig[];
  hero: HeroConfig;
  brandMarquee: BrandMarqueeConfig;
  featureStrip: FeatureStripConfig;
  categorySection: CategorySectionConfig;
  categories: Category[];
  popularProducts: PopularProductsConfig;
  epicDeals: EpicDealsConfig;
  futureArrivals: FutureArrivalsConfig;
  bottomFeatureStrip: BottomFeatureStripConfig;
  footer: FooterConfig;
  offersPage: OffersPageConfig;
  shopNowConfig: ShopNowPageConfig;
  manufacturer?: ManufacturerConfig;
  aboutPage?: AboutPageConfig;
  cart?: CartConfig;
  checkoutPayment?: CheckoutPaymentConfig;
  products: Product[];
  orders: Order[];
  users: User[];
  mediaLibrary: MediaItem[];
}
