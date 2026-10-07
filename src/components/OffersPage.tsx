import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Heart, Minus, Plus, SlidersHorizontal, Star,
  ShoppingBag, Tag, Truck, Shield,
  Eye, RotateCcw, ChevronDown, ChevronUp, Clock, Zap, Gift, ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import {
  PriceRangeFilter,
  loadSavedPriceRange,
  savePriceRange,
  clearSavedPriceRange,
} from './PriceRangeFilter';
import type { PriceRange } from './PriceRangeFilter';
import { getProductSlug } from './ProductListingPage';


// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const CONFETTI: { id: number; x: string; color: string; size: number; delay: string; dur: string; round: boolean }[] = [
  { id:  1, x:  '5%', color: '#fde68a', size: 8, delay:  '0s',   dur: '4.0s', round: true  },
  { id:  2, x: '13%', color: '#c4b5fd', size: 6, delay:  '0.4s', dur: '3.5s', round: false },
  { id:  3, x: '21%', color: '#86efac', size: 9, delay:  '0.8s', dur: '5.0s', round: true  },
  { id:  4, x: '29%', color: '#fca5a5', size: 6, delay:  '0.2s', dur: '4.5s', round: false },
  { id:  5, x: '37%', color: '#fde68a', size: 5, delay:  '1.1s', dur: '3.8s', round: true  },
  { id:  6, x: '45%', color: '#a5f3fc', size: 7, delay:  '0.6s', dur: '4.2s', round: false },
  { id:  7, x: '53%', color: '#c4b5fd', size: 5, delay:  '1.4s', dur: '3.6s', round: true  },
  { id:  8, x: '61%', color: '#86efac', size: 8, delay:  '0.1s', dur: '5.1s', round: false },
  { id:  9, x: '69%', color: '#fca5a5', size: 6, delay:  '0.9s', dur: '4.7s', round: true  },
  { id: 10, x: '77%', color: '#fde68a', size: 4, delay:  '1.7s', dur: '3.9s', round: false },
  { id: 11, x: '85%', color: '#a5f3fc', size: 7, delay:  '2.1s', dur: '4.3s', round: true  },
  { id: 12, x: '93%', color: '#c4b5fd', size: 5, delay:  '1.8s', dur: '3.7s', round: false },
  { id: 13, x:  '9%', color: '#86efac', size: 6, delay:  '2.5s', dur: '5.2s', round: true  },
  { id: 14, x: '17%', color: '#fde68a', size: 4, delay:  '2.2s', dur: '4.1s', round: false },
  { id: 15, x: '33%', color: '#fca5a5', size: 8, delay:  '0.7s', dur: '3.4s', round: true  },
  { id: 16, x: '57%', color: '#fde68a', size: 5, delay:  '1.5s', dur: '4.6s', round: false },
  { id: 17, x: '73%', color: '#a5f3fc', size: 6, delay:  '2.8s', dur: '5.3s', round: true  },
  { id: 18, x: '89%', color: '#c4b5fd', size: 4, delay:  '1.2s', dur: '3.8s', round: false },
  { id: 19, x: '41%', color: '#86efac', size: 7, delay:  '2.4s', dur: '4.4s', round: true  },
  { id: 20, x: '97%', color: '#fca5a5', size: 5, delay:  '0.5s', dur: '5.0s', round: false },
];

const OFFER_CHIPS = [
  { id: 'all', label: '🔥 Best Offers',    minDiscount: 0  },
  { id: '10',  label: '10% Off & Above',   minDiscount: 10 },
  { id: '20',  label: '20% Off & Above',   minDiscount: 20 },
  { id: '30',  label: '30% Off & Above',   minDiscount: 30 },
  { id: '40',  label: '40% Off & Above',   minDiscount: 40 },
  { id: '50',  label: '50% Off & Above',   minDiscount: 50 },
];

const SORT_OPTIONS = [
  { id: 'discount', label: '🔥 Best Discount' },
  { id: 'popular',  label: 'Popular' },
  { id: 'price_asc', label: 'Price ↑' },
  { id: 'price_desc', label: 'Price ↓' },
  { id: 'rating',   label: '⭐ Rating' },
] as const;
type SortId = typeof SORT_OPTIONS[number]['id'];

const FEATURE_CARDS = [
  { Icon: Tag,    label: 'Great Discounts',    desc: 'Up to 50% off on top brands', color: '#fde68a' },
  { Icon: Clock,  label: 'Limited-Time Offers', desc: "Deals that won't last long",   color: '#fca5a5' },
  { Icon: Shield, label: 'Top Quality',         desc: '100% authentic products',      color: '#86efac' },
  { Icon: Truck,  label: 'Fast Delivery',       desc: 'Delivered in 10 minutes',      color: '#a5f3fc' },
];

const MEGA_DEALS = [
  { id: 'm1', title: 'Grocery Bonanza',  subtitle: 'Rice, Dal & Atta',   badge: 'MIN 50% OFF', grad: 'from-violet-900 to-violet-700', emoji: '🌾', nav: 'Rice & Grains'       },
  { id: 'm2', title: 'Oil & Ghee Sale',  subtitle: 'Premium Quality',    badge: 'MIN 40% OFF', grad: 'from-amber-800 to-amber-600',  emoji: '🫙', nav: 'Oils & Ghee'         },
  { id: 'm3', title: 'Spice Up Savings', subtitle: 'Masalas & Spices',   badge: 'FLAT 50% OFF',grad: 'from-red-900 to-red-700',     emoji: '🌶️', nav: 'Masala & Spices'      },
  { id: 'm4', title: 'Home Essentials',  subtitle: 'Cleaning & Care',    badge: 'MIN 35% OFF', grad: 'from-teal-800 to-teal-600',   emoji: '🧹', nav: 'Household Essentials' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getTimeLeft(end: Date) {
  const diff = Math.max(0, end.getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}
const pad = (n: number) => String(n).padStart(2, '0');

// ─────────────────────────────────────────────────────────────────────────────
// Filter sidebar — standalone component to avoid React re-mount issue
// ─────────────────────────────────────────────────────────────────────────────
interface FilterProps {
  absoluteMin: number;
  absoluteMax: number;
  priceRange: PriceRange;
  onPriceChange: (r: PriceRange) => void;
  availableCategories: string[];
  selectedCategories: string[];
  onCategoryToggle: (c: string) => void;
  availableBrands: string[];
  selectedBrands: string[];
  onBrandToggle: (b: string) => void;
  minRating: number | null;
  onRatingChange: (r: number | null) => void;
  anyActive: boolean;
  onClearAll: () => void;
}

const FilterSidebar: React.FC<FilterProps> = ({
  absoluteMin, absoluteMax, priceRange, onPriceChange,
  availableCategories, selectedCategories, onCategoryToggle,
  availableBrands, selectedBrands, onBrandToggle,
  minRating, onRatingChange,
  anyActive, onClearAll,
}) => {
  const [open, setOpen] = useState({ price: true, category: true, brand: false, rating: true });
  const toggle = (k: keyof typeof open) => setOpen(o => ({ ...o, [k]: !o[k] }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-black uppercase tracking-widest text-purple-700">Filters</span>
        </div>
        {anyActive && (
          <button onClick={onClearAll} className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer transition-colors">
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="offers-filter-section">
        <button onClick={() => toggle('price')} className="flex items-center justify-between w-full mb-3 cursor-pointer">
          <span className="text-xs font-extrabold text-slate-700">Price Range</span>
          {open.price ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
        {open.price && (
          <PriceRangeFilter
            absoluteMin={absoluteMin}
            absoluteMax={absoluteMax}
            value={priceRange}
            onChange={onPriceChange}
            variant="sidebar"
          />
        )}
      </div>

      {/* Category */}
      <div className="offers-filter-section">
        <button onClick={() => toggle('category')} className="flex items-center justify-between w-full mb-3 cursor-pointer">
          <span className="text-xs font-extrabold text-slate-700">Category</span>
          {open.category ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
        {open.category && (
          <div className="flex flex-col gap-1">
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryToggle(cat)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                  selectedCategories.includes(cat)
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selectedCategories.includes(cat) ? 'bg-purple-600 border-purple-600' : 'border-slate-300'
                }`}>
                  {selectedCategories.includes(cat) && <span className="text-white text-[8px] font-black leading-none">✓</span>}
                </div>
                <span className="truncate">{cat}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="offers-filter-section">
        <button onClick={() => toggle('brand')} className="flex items-center justify-between w-full mb-3 cursor-pointer">
          <span className="text-xs font-extrabold text-slate-700">Brand</span>
          {open.brand ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
        {open.brand && (
          <div className="flex flex-wrap gap-1.5">
            {availableBrands.map(brand => (
              <button
                key={brand}
                onClick={() => onBrandToggle(brand)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                  selectedBrands.includes(brand)
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-400 hover:text-purple-600'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="offers-filter-section">
        <button onClick={() => toggle('rating')} className="flex items-center justify-between w-full mb-3 cursor-pointer">
          <span className="text-xs font-extrabold text-slate-700">Rating</span>
          {open.rating ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
        {open.rating && (
          <div className="flex flex-col gap-1">
            {[4.5, 4, 3.5].map(r => (
              <button
                key={r}
                onClick={() => onRatingChange(minRating === r ? null : r)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  minRating === r
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3 h-3 ${s <= Math.floor(r) ? 'fill-amber-400 text-amber-400' : s === Math.ceil(r) && r % 1 !== 0 ? 'fill-amber-200 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                  ))}
                </div>
                <span>{r}★ & above</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main OffersPage
// ─────────────────────────────────────────────────────────────────────────────
export const OffersPage: React.FC = () => {
  const {
    allProducts, navigate,
    cart, addToCart, updateQuantity,
    wishlist, toggleWishlist,
    setSelectedProduct, setIsCartOpen,
  } = useApp();
  const { publishedConfig } = useAdminConfig();

  // ── Discounted products pool ──────────────────────────────────────────────
  const discountedProducts = useMemo(
    () => allProducts.filter(p => p.oldPrice && p.oldPrice > p.price),
    [allProducts]
  );

  const availableBrands = useMemo(
    () => [...new Set(discountedProducts.map(p => p.brand))].sort(),
    [discountedProducts]
  );
  const availableCategories = useMemo(
    () => [...new Set(discountedProducts.map(p => p.category))].sort(),
    [discountedProducts]
  );
  const absoluteMin = useMemo(() =>
    discountedProducts.length ? Math.floor(Math.min(...discountedProducts.map(p => p.price))) : 0,
    [discountedProducts]
  );
  const absoluteMax = useMemo(() =>
    discountedProducts.length ? Math.ceil(Math.max(...discountedProducts.map(p => p.price))) : 1000,
    [discountedProducts]
  );

  // ── Filter state ──────────────────────────────────────────────────────────
  const [activeChip,          setActiveChip]          = useState('all');
  const [priceRange,          setPriceRange]          = useState<PriceRange>(() => loadSavedPriceRange(0, 99999));
  const [selectedCategories,  setSelectedCategories]  = useState<string[]>([]);
  const [selectedBrands,      setSelectedBrands]      = useState<string[]>([]);
  const [minRating,           setMinRating]           = useState<number | null>(null);
  const [sortBy,              setSortBy]              = useState<SortId>('discount');
  const [drawerOpen,          setDrawerOpen]          = useState(false);
  const [heartAnimIds,        setHeartAnimIds]        = useState<Set<string>>(new Set());

  // Mega deals carousel (stationary grid — no ref needed)
  const endDateRef = useRef<Date>(new Date(Date.now() + (publishedConfig.offersPage?.countdownHours || 18) * 60 * 60 * 1000));
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endDateRef.current));

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const id = setInterval(() => setTimeLeft(getTimeLeft(endDateRef.current)), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Sync price range with product bounds ─────────────────────────────────
  useEffect(() => {
    setPriceRange(loadSavedPriceRange(absoluteMin, absoluteMax));
  }, [absoluteMin, absoluteMax]);

  // ── Heart animation ───────────────────────────────────────────────────────
  const triggerHeart = useCallback((id: string) => {
    setHeartAnimIds(s => new Set([...s, id]));
    setTimeout(() => setHeartAnimIds(s => { const n = new Set(s); n.delete(id); return n; }), 500);
  }, []);

  // ── Handler helpers ───────────────────────────────────────────────────────
  const handlePriceChange = useCallback((r: PriceRange) => { setPriceRange(r); savePriceRange(r); }, []);
  const handleCategoryToggle = useCallback((c: string) => {
    setSelectedCategories(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  }, []);
  const handleBrandToggle = useCallback((b: string) => {
    setSelectedBrands(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);
  }, []);

  const clearAll = useCallback(() => {
    setActiveChip('all');
    setPriceRange({ min: absoluteMin, max: absoluteMax });
    clearSavedPriceRange();
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinRating(null);
    setSortBy('discount');
  }, [absoluteMin, absoluteMax]);

  const anyActive = activeChip !== 'all' ||
    priceRange.min > absoluteMin || priceRange.max < absoluteMax ||
    selectedCategories.length > 0 || selectedBrands.length > 0 || minRating !== null;

  // ── Filtered + sorted products ────────────────────────────────────────────
  const chipMin = OFFER_CHIPS.find(c => c.id === activeChip)?.minDiscount ?? 0;

  const filteredProducts = useMemo(() => {
    let list = discountedProducts;
    if (chipMin > 0) {
      list = list.filter(p => {
        const pct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        return pct >= chipMin;
      });
    }
    list = list.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    if (selectedCategories.length) list = list.filter(p => selectedCategories.includes(p.category));
    if (selectedBrands.length)    list = list.filter(p => selectedBrands.includes(p.brand));
    if (minRating)                list = list.filter(p => p.rating >= minRating);

    return [...list].sort((a, b) => {
      const da = Math.round(((a.oldPrice - a.price) / a.oldPrice) * 100);
      const db = Math.round(((b.oldPrice - b.price) / b.oldPrice) * 100);
      if (sortBy === 'discount')   return db - da;
      if (sortBy === 'price_asc')  return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating')     return b.rating - a.rating;
      return b.reviewsCount - a.reviewsCount;
    });
  }, [discountedProducts, chipMin, priceRange, selectedCategories, selectedBrands, minRating, sortBy]);

  // ── Trending products (top 9 by discount %) ───────────────────────────────
  const trendingProducts = useMemo(() => {
    return [...discountedProducts]
      .sort((a, b) => {
        const da = Math.round(((a.oldPrice - a.price) / a.oldPrice) * 100);
        const db = Math.round(((b.oldPrice - b.price) / b.oldPrice) * 100);
        return db - da;
      })
      .slice(0, 9);
  }, [discountedProducts]);

  const filterProps: FilterProps = {
    absoluteMin, absoluteMax, priceRange, onPriceChange: handlePriceChange,
    availableCategories, selectedCategories, onCategoryToggle: handleCategoryToggle,
    availableBrands, selectedBrands, onBrandToggle: handleBrandToggle,
    minRating, onRatingChange: setMinRating,
    anyActive, onClearAll: clearAll,
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white">

      {/* Top Back Navigation Bar (Left side) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow-2xs border border-gray-200/80 hover:bg-purple-50 text-slate-700 hover:text-[#7C3AED] text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* HERO */}
      <div className="offers-hero w-full px-4 sm:px-8 pt-16 pb-10 sm:pt-24 sm:pb-16 flex flex-col items-center text-center relative">
        {/* Confetti */}
        {CONFETTI.map(p => (
          <div
            key={p.id}
            className="offers-confetti-particle"
            style={{
              left: p.x,
              width:  p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.round ? '50%' : '2px',
              animationDuration: p.dur,
              animationDelay:    p.delay,
            }}
          />
        ))}

        {/* Floating decorations */}
        <span className="absolute top-7  left-8  text-3xl offers-float-emoji" style={{animationDuration:'4.2s'}}>🛒</span>
        <span className="absolute top-10 right-10 text-2xl offers-float-emoji" style={{animationDuration:'5.1s',animationDelay:'1s'}}>🎁</span>
        <span className="absolute bottom-12 left-14 text-2xl offers-float-emoji hidden sm:block" style={{animationDuration:'3.6s',animationDelay:'0.5s'}}>💰</span>
        <span className="absolute bottom-10 right-14 text-3xl offers-float-emoji hidden sm:block" style={{animationDuration:'4.8s',animationDelay:'1.5s'}}>✨</span>
        <span className="absolute top-1/2 left-4   text-xl  offers-float-emoji hidden lg:block" style={{animationDuration:'6s',  animationDelay:'0.8s'}}>🏷️</span>
        <span className="absolute top-1/3 right-5  text-xl  offers-float-emoji hidden lg:block" style={{animationDuration:'4s',  animationDelay:'2s'}}>🎉</span>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div className="offers-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-yellow-300 text-xs font-bold mb-6 tracking-widest">
            <Zap className="w-3.5 h-3.5" />
            {publishedConfig.offersPage?.heroBadge || 'EXCLUSIVE DEALS · LIMITED TIME ONLY'}
            <Zap className="w-3.5 h-3.5" />
          </div>

          {/* Headline */}
          <h1 className="offers-gradient-text offers-fade-up offers-delay-1 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
            {publishedConfig.offersPage?.heroTitle || '🔥 Best Deals You Can\'t Miss!'}
          </h1>

          {/* Subtitle */}
          <p className="offers-fade-up offers-delay-2 text-white/75 text-sm sm:text-lg font-medium mb-10 max-w-xl mx-auto leading-relaxed">
            {publishedConfig.offersPage?.heroSubtitle || 'Exclusive savings on groceries, oils, dals, spices & more. Shop smarter — save bigger every single day!'}
          </p>

          {/* 3D Badge */}
          <div className="offers-fade-up offers-delay-3 inline-block">
            <div className="offers-badge-3d rounded-2xl px-10 py-5 inline-flex flex-col items-center gap-1">
              <div className="text-xs font-extrabold text-amber-900 uppercase tracking-widest">Promo Code</div>
              <div className="text-3xl sm:text-4xl font-black text-white leading-none" style={{textShadow:'0 3px 6px rgba(0,0,0,0.4)'}}>
                {publishedConfig.offersPage?.promoCode || 'FARM10'}
              </div>
              <div className="text-xs font-extrabold text-amber-900 uppercase tracking-widest mt-1.5">Use at checkout for discount</div>
            </div>
          </div>

          {/* CTA */}
          <div className="offers-fade-up offers-delay-4 mt-8">
            <button
              onClick={() => document.getElementById('weekly-mega-deals')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 bg-white text-purple-700 rounded-full font-black text-sm hover:bg-yellow-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-purple-900/40 cursor-pointer"
            >
              Explore All Offers ↓
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          FEATURE CARDS (still on hero bg)
          ════════════════════════════════════════════════════════════════════ */}
      <div className="offers-hero px-4 sm:px-8 pb-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 offers-fade-up offers-delay-5">
          {FEATURE_CARDS.map(({ Icon, label, desc, color }) => (
            <div key={label} className="offers-feature-card p-5 flex flex-col items-center text-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${color}20`, border: '1px solid rgba(255,255,255,0.18)' }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div>
                <div className="text-white font-extrabold text-sm leading-tight">{label}</div>
                <div className="text-white/60 text-xs mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          COUNTDOWN TIMER
          ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white px-4 sm:px-8 py-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{background:'linear-gradient(135deg, #1e0a42 0%, #3b1272 40%, #4c1d95 70%, #1a0f3d 100%)'}}>
            {/* Glow blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(250,204,21,0.12) 0%, transparent 70%)', transform:'translate(-30%, -40%)'}} />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', transform:'translate(30%, 40%)'}} />

            {/* Left text */}
            <div className="text-center sm:text-left relative z-10">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1.5">
                <div className="relative w-5 h-5 shrink-0">
                  <div className="offers-pulse-ring" style={{width:'100%',height:'100%'}} />
                  <div className="w-2.5 h-2.5 bg-red-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="text-yellow-300 text-xs font-black uppercase tracking-widest">Live Offer</span>
              </div>
              <h2 className="text-white text-xl sm:text-2xl font-black">Hurry! Offers Ending Soon</h2>
              <p className="text-white/55 text-xs sm:text-sm mt-1">Grab the best deals before time runs out!</p>
            </div>

            {/* Countdown digits */}
            <div className="flex items-center gap-2 sm:gap-3 relative z-10">
              {([
                { value: timeLeft.days,    label: 'Days'  },
                { value: timeLeft.hours,   label: 'Hours' },
                { value: timeLeft.minutes, label: 'Mins'  },
                { value: timeLeft.seconds, label: 'Secs'  },
              ] as const).map(({ value, label }, i) => (
                <React.Fragment key={label}>
                  <div className="offers-cd-unit w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none">{pad(value)}</span>
                    <span className="text-[9px] font-extrabold text-purple-300 uppercase tracking-widest mt-0.5">{label}</span>
                  </div>
                  {i < 3 && <span className="text-yellow-300 text-2xl font-black pb-2 select-none">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          WEEKLY MEGA DEALS
          ════════════════════════════════════════════════════════════════════ */}
      <div id="weekly-mega-deals" className="bg-white px-4 sm:px-8 py-8">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Weekly Mega Deals
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {MEGA_DEALS.map(deal => (
              <button
                key={deal.id}
                onClick={() => navigate('/products', `category=${encodeURIComponent(deal.nav)}`)}
                className={`offers-mega-banner bg-gradient-to-br ${deal.grad} h-36 sm:h-44 p-4 sm:p-5 flex flex-col justify-between text-left w-full cursor-pointer`}
              >
                <div>
                  <div className="text-3xl mb-1.5">{deal.emoji}</div>
                  <div className="text-white font-black text-sm sm:text-base leading-tight">{deal.title}</div>
                  <div className="text-white/65 text-xs mt-0.5">{deal.subtitle}</div>
                </div>
                <span className="inline-block bg-yellow-400 text-yellow-900 text-[10px] font-black px-2.5 py-1 rounded-full self-start shadow-sm">
                  {deal.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TRENDING OFFERS — infinite scroll
          ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-50 py-8 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 mb-4">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Trending Offers
            <span className="text-xs font-semibold text-slate-400 ml-1">— hover to pause</span>
          </h2>
        </div>
        <div className="overflow-hidden">
          <div className="offers-trend-track px-4">
            {[...trendingProducts, ...trendingProducts].map((product, idx) => {
              const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
              return (
                <div
                  key={`${product.id}-${idx}`}
                  onClick={() => setSelectedProduct(product)}
                  className="shrink-0 w-40 sm:w-48 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:-translate-y-2 transition-transform duration-200"
                >
                  <div className="relative w-full aspect-square bg-white overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                      {discount}% OFF
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{product.name}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-purple-700">₹{product.price}</span>
                      <span className="text-[10px] text-slate-400 line-through">₹{product.oldPrice}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN: SIDEBAR + PRODUCT GRID
          ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-50 px-4 sm:px-8 py-8">
        <div className="max-w-[1440px] mx-auto flex gap-6 items-start">

          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 shrink-0 sticky top-24">
            <div className="offers-glass-light rounded-2xl p-4">
              <FilterSidebar {...filterProps} />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">

            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="text-sm font-bold text-slate-700">
                <span className="text-purple-700">{filteredProducts.length}</span>
                {' '}
                <span className="text-slate-500 font-semibold">deals found</span>
                {anyActive && (
                  <button onClick={clearAll} className="ml-3 text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer">
                    × Clear filters
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                      sortBy === opt.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-purple-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-5"
                  style={{background:'linear-gradient(135deg, #ede9fe, #f3e8ff)', border:'1px solid rgba(124,58,237,0.1)'}}>
                  🛒
                </div>
                <h3 className="text-lg font-extrabold text-slate-800">No products in this range</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                  No products found in this price range.
                  <br />
                  Try adjusting your filter or clearing all filters.
                </p>
                <button
                  onClick={clearAll}
                  className="mt-6 flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-full transition-colors cursor-pointer shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product, idx) => {
                  const cartItem    = cart.find(i => i.product.id === product.id);
                  const qty         = cartItem ? cartItem.quantity : 0;
                  const isWishlisted = wishlist.includes(product.id);
                  const discount    = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
                  const stockPct    = Math.min(100, Math.max(8, Math.round((product.stockCount / 80) * 100)));
                  const isLowStock  = product.stockCount < 20;
                  const isAnimating = heartAnimIds.has(product.id);

                  return (
                    <div
                      key={product.id}
                      className="offers-product-card offers-card-enter bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                      style={{ animationDelay: `${(idx % 8) * 0.05}s` }}
                    >
                      {/* Image */}
                      <div
                        className="relative w-full aspect-square bg-white cursor-pointer overflow-hidden shrink-0"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain p-2 transition-transform duration-400 hover:scale-110"
                        />

                        {/* Rating badge */}
                        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-extrabold text-slate-800 flex items-center gap-0.5 shadow-sm border border-white/40">
                          ⭐ {product.rating}
                        </div>

                        {/* Wishlist */}
                        <button
                          onClick={e => { e.stopPropagation(); toggleWishlist(product.id); triggerHeart(product.id); }}
                          className={`absolute top-2 right-2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-white/50 flex items-center justify-center transition-all cursor-pointer z-10 ${isAnimating ? 'offers-heart-pop' : ''}`}
                        >
                          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-400'}`} />
                        </button>

                        {/* Corner ribbon */}
                        <div className="offers-ribbon">{discount}%</div>

                        {/* Quick view */}
                        <div className="offers-quick-view">
                          <button
                            className="w-full flex items-center justify-center gap-1.5 text-white text-[11px] font-bold cursor-pointer"
                            onClick={e => { e.stopPropagation(); navigate('/product/' + getProductSlug(product.name)); }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-3.5 flex flex-col flex-grow">
                        <h3
                          onClick={() => navigate('/product/' + getProductSlug(product.name))}
                          className="text-xs font-bold text-slate-800 line-clamp-2 h-8 cursor-pointer hover:text-purple-700 transition-colors mb-1 leading-snug"
                        >
                          {product.name}
                        </h3>
                        <div className="text-[10px] font-semibold text-slate-400 mb-2.5">
                          {product.brand} · {product.weight}
                        </div>

                        {/* Price row */}
                        <div className="flex items-baseline gap-1.5 mb-2 flex-wrap">
                          <span className="text-sm font-black text-purple-700">₹{product.price}</span>
                          <span className="text-xs text-slate-400 line-through">₹{product.oldPrice}</span>
                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            Save ₹{product.oldPrice - product.price}
                          </span>
                        </div>

                        {/* Stock bar */}
                        <div className="mb-3">
                          <div className="offers-stock-bar">
                            <div
                              className={`${isLowStock ? 'offers-stock-fill-low' : 'offers-stock-fill'}`}
                              style={{ height: '100%', borderRadius: '9999px', width: `${stockPct}%`, background: isLowStock ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#16a34a,#22c55e)' }}
                            />
                          </div>
                          <div className={`text-[9px] font-semibold mt-0.5 ${isLowStock ? 'text-amber-600' : 'text-slate-400'}`}>
                            {isLowStock ? `⚡ Only ${product.stockCount} left!` : 'In Stock'}
                          </div>
                        </div>

                        {/* Add / Stepper */}
                        <div className="w-full mt-auto">
                          {qty === 0 ? (
                            <button
                              onClick={() => { addToCart(product); setIsCartOpen(true); }}
                              className="w-full h-9 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                              style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',transition:'all 0.2s ease'}}
                              onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#6d28d9,#5b21b6)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#7c3aed,#6d28d9)')}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              Add to Cart
                            </button>
                          ) : (
                            <div className="w-full h-9 bg-purple-600 text-white rounded-xl flex items-center justify-between px-2 font-bold text-xs shadow-sm">
                              <button onClick={() => updateQuantity(product.id, -1)} className="w-6 h-6 rounded-full hover:bg-purple-800 flex items-center justify-center transition-colors cursor-pointer">
                                <Minus className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                              <span>{qty}</span>
                              <button onClick={() => updateQuantity(product.id, 1)} className="w-6 h-6 rounded-full hover:bg-purple-800 flex items-center justify-center transition-colors cursor-pointer">
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MOBILE FAB + DRAWER
          ════════════════════════════════════════════════════════════════════ */}
      <button
        className="pf-fab md:hidden"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open filters"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {anyActive && <span className="pf-fab-badge">!</span>}
      </button>

      {drawerOpen && (
        <>
          <div className="pf-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="pf-sheet">
            <div className="pf-sheet-handle" />
            <div className="py-2">
              <FilterSidebar {...filterProps} />
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={clearAll}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-[2] py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl cursor-pointer transition-colors shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
