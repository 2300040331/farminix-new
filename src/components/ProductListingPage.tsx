import React, { useMemo, useEffect } from 'react';
import { ArrowLeft, Heart, ShieldCheck, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

// Normalizer helper: ignores spaces, hyphens, uppercase/lowercase, and simple trailing plurals
export const normalizeSearchText = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[-\s]+/g, '') // remove hyphens and spaces
    .replace(/s$/, '');     // remove trailing 's' to handle simple plurals
};

// Slug helper for product detail links
export const getProductSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const ProductListingPage: React.FC = () => {
  const {
    currentRoute,
    navigate,
    allProducts,
    cart,
    addToCart,
    updateQuantity,
    wishlist,
    toggleWishlist,
    setIsCartOpen,
  } = useApp();
  const { publishedConfig } = useAdminConfig();

  // Read search & category query params
  const searchQuery = currentRoute.searchParams.get('search') || '';
  const categoryQuery = currentRoute.searchParams.get('category') || '';
  const filterQuery = currentRoute.searchParams.get('filter') || '';

  // ── Products list matching search/category/filter query ──
  const filteredProducts = useMemo(() => {
    let list = allProducts;
    if (filterQuery === 'popular') {
      list = allProducts.filter((p) => p.rating >= 4.7);
    }
    if (!searchQuery && !categoryQuery) return list;

    const normalizedQuery = normalizeSearchText(searchQuery);
    return list.filter((product) => {
      if (categoryQuery) {
        const normalizedCat = normalizeSearchText(categoryQuery);
        const normalizedProdCat = normalizeSearchText(product.category);
        if (normalizedCat !== normalizedProdCat) return false;
      }
      if (!searchQuery) return true;
      const name = normalizeSearchText(product.name);
      const brand = normalizeSearchText(product.brand || '');
      const cat = normalizeSearchText(product.category);
      const desc = normalizeSearchText(product.description || '');
      return (
        name.includes(normalizedQuery) ||
        brand.includes(normalizedQuery) ||
        cat.includes(normalizedQuery) ||
        desc.includes(normalizedQuery)
      );
    });
  }, [allProducts, searchQuery, categoryQuery, filterQuery]);

  // Reset scroll to top on mount or when category/search query changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [categoryQuery, searchQuery, filterQuery]);

  // Suggested fallback products if no results are found (for no-search-results state)
  const suggestedFallback = useMemo(() => {
    return allProducts.slice(0, 6);
  }, [allProducts]);

  // Helper to highlight matching query text in product names
  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5 font-extrabold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const hasProducts = filteredProducts.length > 0;

  return (
    <div className="w-full bg-white min-h-[60vh] py-8">
      {/* Breadcrumb & Back navigation (Left side) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow-2xs border border-gray-200/80 hover:bg-emerald-50 text-slate-700 hover:text-[#16A34A] text-xs font-bold transition-all cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {filterQuery === 'popular'
                ? 'Popular Products'
                : searchQuery
                ? `Search Results for "${searchQuery}"`
                : categoryQuery
                ? categoryQuery
                : publishedConfig.shopNowConfig?.pageTitle || 'Browse Products'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {filteredProducts.length} items found
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Case 1: No Products Found */}
        {!hasProducts ? (
          <div className="w-full bg-white rounded-[24px] border border-slate-100 p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-6">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">No products found</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-2 leading-relaxed">
              We couldn't find anything matching your search. Please check your spelling or try searching another keyword.
            </p>

            {/* Suggestions for alternative searches */}
            <div className="mt-6 flex flex-wrap gap-2.5 justify-center">
              {['Rice', 'Farminix', 'Family Choice', '26 Kg'].map((s) => (
                <button
                  key={s}
                  onClick={() => navigate('/products', `search=${encodeURIComponent(s)}`)}
                  className="px-4 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-[#16A34A] border border-slate-200/60 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
                >
                  Search "{s}"
                </button>
              ))}
            </div>

            {/* Recommended Products grid divider */}
            <div className="w-full border-t border-slate-100 mt-12 pt-10">
              <h4 className="text-sm sm:text-base font-extrabold text-slate-800 text-left mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                Recommended for You
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {suggestedFallback.map((product) => {
                  const cartItem = cart.find((item) => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  const isWishlisted = wishlist.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-[16px] border border-gray-100 shadow-[0_4px_18px_rgba(0,0,0,0.06)] flex flex-col justify-between overflow-hidden group hover:-translate-y-1 transition-all duration-200"
                    >
                      <div
                        className="relative w-full aspect-square bg-white cursor-pointer overflow-hidden shrink-0"
                        onClick={() => navigate('/product/' + getProductSlug(product.name))}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-white/70 backdrop-blur-md px-2 py-0.75 rounded-md text-[10px] font-extrabold text-slate-800 flex items-center gap-0.5 shadow-2xs border border-white/40">
                          <span>⭐</span>
                          <span>{product.rating}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/75 backdrop-blur-md shadow-xs border border-white/50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                        >
                          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>

                      <div className="p-3.5 flex flex-col flex-grow text-left justify-between">
                        <div>
                          <h3
                            onClick={() => navigate('/product/' + getProductSlug(product.name))}
                            className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 h-8 cursor-pointer hover:text-[#7C3AED] transition-colors mb-1.5"
                          >
                            {product.name}
                          </h3>
                          <div className="text-[10px] font-semibold text-slate-500 mb-2">
                            {product.brand} • {product.weight}
                          </div>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-sm font-extrabold text-[#7C3AED]">₹{product.price}</span>
                            {product.oldPrice && (
                              <span className="text-xs font-medium text-slate-400 line-through">₹{product.oldPrice}</span>
                            )}
                          </div>
                        </div>

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
            </div>
          </div>
        ) : (
          /* Case 2: Clean Full-Width Product Grid (No filters sidebar) */
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((item) => item.product.id === product.id);
                const qty = cartItem ? cartItem.quantity : 0;
                const isWishlisted = wishlist.includes(product.id);
                const discount = product.oldPrice
                  ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-[16px] border border-gray-100 shadow-[0_4px_18px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden group hover:-translate-y-1 transition-all duration-200"
                  >
                    {/* Product Image */}
                    <div
                      className="relative w-full aspect-square bg-white cursor-pointer overflow-hidden shrink-0"
                      onClick={() => navigate('/product/' + getProductSlug(product.name))}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3 bg-white/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-extrabold text-slate-800 flex items-center gap-0.5 shadow-sm border border-white/40">
                        <span>⭐</span>
                        <span>{product.rating}</span>
                      </div>
                      {/* Wishlist */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/75 backdrop-blur-md shadow-sm border border-white/50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <span className="absolute bottom-2 left-2 bg-[#7C3AED] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-3.5 flex flex-col flex-grow text-left justify-between">
                      <div>
                        <h3
                          onClick={() => navigate('/product/' + getProductSlug(product.name))}
                          className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 h-8 cursor-pointer hover:text-[#7C3AED] transition-colors mb-1.5"
                        >
                          {highlightMatch(product.name, searchQuery)}
                        </h3>
                        <div className="text-[10px] font-semibold text-slate-500 mb-2">
                          {product.brand} • {product.weight}
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-sm font-extrabold text-[#7C3AED]">₹{product.price}</span>
                          {product.oldPrice && (
                            <span className="text-xs font-medium text-slate-400 line-through">₹{product.oldPrice}</span>
                          )}
                        </div>
                      </div>

                      {/* Add / Stepper */}
                      <div className="w-full mt-auto">
                        {qty === 0 ? (
                          <button
                            onClick={() => {
                              addToCart(product);
                              setIsCartOpen(true);
                            }}
                            className="w-full h-9 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 text-white text-xs font-bold rounded-[10px] flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <span>+ Add</span>
                          </button>
                        ) : (
                          <div className="w-full h-9 bg-[#7C3AED] text-white rounded-[10px] flex items-center justify-between px-2 font-bold text-xs shadow-sm">
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
          </div>
        )}
      </div>
    </div>
  );
};
