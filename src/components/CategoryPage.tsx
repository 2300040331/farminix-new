import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Plus, Minus, Heart, SlidersHorizontal, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUB_CATEGORIES, SUBCATEGORY_KEYWORDS } from '../data/products';
import { getProductSlug } from './ProductListingPage';
import {
  PriceRangeFilter,
  ActiveFilterChip,
  PriceEmptyState,
  loadSavedPriceRange,
  savePriceRange,
  clearSavedPriceRange,
} from './PriceRangeFilter';
import type { PriceRange } from './PriceRangeFilter';

const CATEGORY_MAP: Record<string, string> = {
  dals:      'Dals & Pulses',
  rice:      'Rice & Grains',
  atta:      'Atta & Flours',
  oils:      'Oils & Ghee',
  masala:    'Masala & Spices',
  snacks:    'Snacks & Beverages',
  household: 'Household Essentials',
  sugarSalt: 'Sugar & Salt',
};

export const CategoryPage: React.FC = () => {
  const {
    activeCategoryPage,
    setActiveCategoryPage,
    categories,
    allProducts,
    cart,
    addToCart,
    updateQuantity,
    wishlist,
    toggleWishlist,
    setIsCartOpen,
    navigate,
  } = useApp();

  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Animate in and reset subcategory filter
  useEffect(() => {
    if (activeCategoryPage) {
      requestAnimationFrame(() => setVisible(true));
      setSelectedSubCategory(null);
      setSelectedBrand(null);
    } else {
      setVisible(false);
    }
  }, [activeCategoryPage]);

  const categoryName = activeCategoryPage ? CATEGORY_MAP[activeCategoryPage] : '';
  const categoryMeta = categories.find(c => c.id === activeCategoryPage);

  const categoryProducts = allProducts.filter(p => p.category === categoryName);

  // Unique brands in this category
  const brands = [...new Set(categoryProducts.map(p => p.brand))];

  // Absolute price bounds from this category's products
  const absoluteMin = useMemo(() => {
    if (categoryProducts.length === 0) return 0;
    return Math.floor(Math.min(...categoryProducts.map(p => p.price)));
  }, [categoryProducts]);

  const absoluteMax = useMemo(() => {
    if (categoryProducts.length === 0) return 1000;
    return Math.ceil(Math.max(...categoryProducts.map(p => p.price)));
  }, [categoryProducts]);

  // Price range state
  const [priceRange, setPriceRange] = useState<PriceRange>(() =>
    loadSavedPriceRange(0, 99999)
  );

  // Re-sync price range when category changes
  useEffect(() => {
    if (activeCategoryPage) {
      setPriceRange(loadSavedPriceRange(absoluteMin, absoluteMax));
    }
  }, [activeCategoryPage, absoluteMin, absoluteMax]);

  const handlePriceChange = useCallback((range: PriceRange) => {
    setPriceRange(range);
    savePriceRange(range);
  }, []);

  const handleClearPrice = useCallback(() => {
    const full: PriceRange = { min: absoluteMin, max: absoluteMax };
    setPriceRange(full);
    clearSavedPriceRange();
  }, [absoluteMin, absoluteMax]);

  // Brand filter
  let filtered = selectedBrand
    ? categoryProducts.filter(p => p.brand === selectedBrand)
    : categoryProducts;

  // Subcategory filter
  if (selectedSubCategory) {
    const keywords = SUBCATEGORY_KEYWORDS[selectedSubCategory] || [];
    filtered = filtered.filter(p => {
      const nameLower = p.name.toLowerCase();
      const descLower = (p.description || '').toLowerCase();
      return keywords.some(kw => nameLower.includes(kw) || descLower.includes(kw));
    });
  }

  // Price filter
  filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.reviewsCount - a.reviewsCount; // popular
  });

  const isPriceFiltered = priceRange.min > absoluteMin || priceRange.max < absoluteMax;
  const hasBaseProducts = categoryProducts.length > 0;
  const isPriceEmptyState = hasBaseProducts && filtered.length === 0 && isPriceFiltered;

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => setActiveCategoryPage(null), 300);
  };

  if (!activeCategoryPage) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 flex items-center gap-4">
          {/* Back */}
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-emerald-50 flex items-center justify-center text-gray-600 hover:text-[#15803D] transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Category image + name */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {categoryMeta && (
              <img
                src={categoryMeta.image}
                alt={categoryMeta.name}
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-100"
              />
            )}
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-tight">{categoryName}</h1>
              <p className="text-xs text-gray-500">{filtered.length} products</p>
            </div>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#7C3AED] text-xs font-semibold text-gray-700 hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* ── Subcategories Pill Filter Strip ── */}
        {SUB_CATEGORIES[categoryName] && (
          <div className="border-t border-gray-100 bg-white">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              <button
                onClick={() => setSelectedSubCategory(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border shrink-0 cursor-pointer ${
                  selectedSubCategory === null
                    ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                All
              </button>
              {SUB_CATEGORIES[categoryName].map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(selectedSubCategory === sub ? null : sub)}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all border shrink-0 cursor-pointer ${
                    selectedSubCategory === sub
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-2xs'
                      : 'bg-white text-slate-600 border-gray-200 hover:border-[#7C3AED] hover:text-[#7C3AED]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Filter / Sort Bar ─────────────────────────────────── */}
        {showFilters && (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pb-3 pt-1 flex flex-wrap gap-3 items-center border-t border-gray-100 bg-slate-50">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Sort:</span>
              {(['popular', 'price_asc', 'price_desc', 'rating'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                    sortBy === s
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#7C3AED] hover:text-[#7C3AED]'
                  }`}
                >
                  {s === 'popular' ? 'Popular' : s === 'price_asc' ? 'Price ↑' : s === 'price_desc' ? 'Price ↓' : 'Rating'}
                </button>
              ))}
            </div>

            {/* Brand filter */}
            {brands.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-500">Brand:</span>
                {brands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                      selectedBrand === brand
                        ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#7C3AED] hover:text-[#7C3AED]'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
                {selectedBrand && (
                  <button onClick={() => setSelectedBrand(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Product Grid ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6">

          {/* Desktop: price filter sidebar strip above grid */}
          <div className="hidden md:block mb-4">
            <div className="flex gap-4 items-start">
              {/* Sidebar */}
              <div className="w-52 shrink-0">
                <PriceRangeFilter
                  absoluteMin={absoluteMin}
                  absoluteMax={absoluteMax}
                  value={priceRange}
                  onChange={handlePriceChange}
                  variant="sidebar"
                />
              </div>
              {/* Main column: chip + grid */}
              <div className="flex-1 min-w-0">
                <ActiveFilterChip
                  value={priceRange}
                  absoluteMin={absoluteMin}
                  absoluteMax={absoluteMax}
                  onClear={handleClearPrice}
                />
                {isPriceEmptyState ? (
                  <PriceEmptyState onClear={handleClearPrice} />
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <p className="text-lg font-semibold">No products found</p>
                    <p className="text-sm mt-1">Try changing your filters</p>
                  </div>
                ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map((product) => {
                const cartItem = cart.find(item => item.product.id === product.id);
                const qty = cartItem ? cartItem.quantity : 0;
                const isWishlisted = wishlist.includes(product.id);
                const discount = product.oldPrice
                  ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-[16px] border border-gray-100 shadow-[0_4px_18px_rgba(0,0,0,0.06)] flex flex-col justify-between overflow-hidden group hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* Product Image and Overlay Badges */}
                    <div
                      className="relative w-full aspect-square bg-white cursor-pointer overflow-hidden shrink-0"
                      onClick={() => { setActiveCategoryPage(null); navigate('/product/' + getProductSlug(product.name)); }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Rating Badge (top-left) */}
                      <div className="absolute top-3 left-3 bg-white/70 backdrop-blur-md px-2 py-0.75 rounded-md text-[10px] font-extrabold text-slate-800 flex items-center gap-0.5 shadow-2xs border border-white/40">
                        <span>⭐</span>
                        <span>{product.rating}</span>
                      </div>

                      {/* Wishlist Heart Overlay */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/75 backdrop-blur-md shadow-xs border border-white/50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>

                      {/* Discount Tag */}
                      {discount > 0 && (
                        <span className="absolute bottom-2 left-2 bg-[#7C3AED] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-3.5 flex flex-col flex-grow text-left justify-between">
                      <div>
                        {/* Product Name */}
                        <h3
                          onClick={() => { setActiveCategoryPage(null); navigate('/product/' + getProductSlug(product.name)); }}
                          className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 h-8 cursor-pointer hover:text-[#7C3AED] transition-colors mb-1.5"
                        >
                          {product.name}
                        </h3>

                        {/* Brand & Weight Info */}
                        <div className="text-[10px] font-semibold text-slate-500 mb-2">
                          {product.brand} • {product.weight}
                        </div>

                        {/* Price info */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-sm font-extrabold text-[#7C3AED]">
                            ₹{product.price}
                          </span>
                          {product.oldPrice && (
                            <span className="text-xs font-medium text-slate-400 line-through">
                              ₹{product.oldPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add Button */}
                      <div className="w-full mt-auto">
                        {qty === 0 ? (
                          <button
                            onClick={() => {
                              addToCart(product);
                              setIsCartOpen(true);
                            }}
                            className="w-full h-9 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 text-white text-xs font-bold rounded-[10px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <span>+ Add</span>
                          </button>
                        ) : (
                          <div className="w-full h-9 bg-[#7C3AED] text-white rounded-[10px] flex items-center justify-between px-2 font-bold text-xs shadow-xs">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="w-6 h-6 rounded-full hover:bg-purple-800 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <span>{qty}</span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="w-6 h-6 rounded-full hover:bg-purple-800 flex items-center justify-center transition-colors cursor-pointer"
                            >
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

          {/* Mobile: active chip + grid (no sidebar) */}
          <div className="md:hidden">
            <ActiveFilterChip
              value={priceRange}
              absoluteMin={absoluteMin}
              absoluteMax={absoluteMax}
              onClear={handleClearPrice}
            />
            {isPriceEmptyState ? (
              <PriceEmptyState onClear={handleClearPrice} />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <p className="text-lg font-semibold">No products found</p>
                <p className="text-sm mt-1">Try changing your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filtered.map((product) => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  const isWishlisted = wishlist.includes(product.id);
                  const discount = product.oldPrice
                    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                    : 0;
                  return (
                    <div key={product.id} className="bg-white rounded-[16px] border border-gray-100 shadow-[0_4px_18px_rgba(0,0,0,0.06)] flex flex-col justify-between overflow-hidden group hover:-translate-y-1 transition-all duration-200">
                      <div className="relative w-full aspect-square bg-white cursor-pointer overflow-hidden shrink-0" onClick={() => { setActiveCategoryPage(null); navigate('/product/' + getProductSlug(product.name)); }}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-3 left-3 bg-white/70 backdrop-blur-md px-2 py-0.75 rounded-md text-[10px] font-extrabold text-slate-800 flex items-center gap-0.5 shadow-2xs border border-white/40"><span>⭐</span><span>{product.rating}</span></div>
                        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/75 backdrop-blur-md shadow-xs border border-white/50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10">
                          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                        {discount > 0 && <span className="absolute bottom-2 left-2 bg-[#7C3AED] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">{discount}% OFF</span>}
                      </div>
                      <div className="p-3.5 flex flex-col flex-grow text-left justify-between">
                        <div>
                          <h3 onClick={() => { setActiveCategoryPage(null); navigate('/product/' + getProductSlug(product.name)); }} className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 h-8 cursor-pointer hover:text-[#7C3AED] transition-colors mb-1.5">{product.name}</h3>
                          <div className="text-[10px] font-semibold text-slate-500 mb-2">{product.brand} • {product.weight}</div>
                          <div className="flex items-baseline gap-2 mb-3"><span className="text-sm font-extrabold text-[#7C3AED]">₹{product.price}</span>{product.oldPrice && <span className="text-xs font-medium text-slate-400 line-through">₹{product.oldPrice}</span>}</div>
                        </div>
                        <div className="w-full mt-auto">
                          {qty === 0 ? (
                            <button onClick={() => { addToCart(product); setIsCartOpen(true); }} className="w-full h-9 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 text-white text-xs font-bold rounded-[10px] flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"><span>+ Add</span></button>
                          ) : (
                            <div className="w-full h-9 bg-[#7C3AED] text-white rounded-[10px] flex items-center justify-between px-2 font-bold text-xs shadow-xs">
                              <button onClick={() => updateQuantity(product.id, -1)} className="w-6 h-6 rounded-full hover:bg-purple-800 flex items-center justify-center transition-colors cursor-pointer"><Minus className="w-3.5 h-3.5 stroke-[3]" /></button>
                              <span>{qty}</span>
                              <button onClick={() => updateQuantity(product.id, 1)} className="w-6 h-6 rounded-full hover:bg-purple-800 flex items-center justify-center transition-colors cursor-pointer"><Plus className="w-3.5 h-3.5 stroke-[3]" /></button>
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

      {/* ── Mobile: Floating Filter FAB ─────────────────────────────── */}
      {hasBaseProducts && (
        <>
          <button
            className="pf-fab md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open price filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {isPriceFiltered && <span className="pf-fab-badge">1</span>}
          </button>

          {drawerOpen && (
            <>
              <div className="pf-backdrop" onClick={() => setDrawerOpen(false)} />
              <div className="pf-sheet">
                <div className="pf-sheet-handle" />
                <PriceRangeFilter
                  absoluteMin={absoluteMin}
                  absoluteMax={absoluteMax}
                  value={priceRange}
                  onChange={handlePriceChange}
                  variant="drawer"
                  onClose={() => setDrawerOpen(false)}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
