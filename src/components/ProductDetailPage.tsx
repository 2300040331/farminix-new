import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft, Heart, CheckCircle2, Zap,
  Plus, Minus, ChevronDown, ChevronUp, ShoppingBag,
  AlertCircle, Leaf, BarChart3, ClipboardList, ChefHat, Utensils, Microwave
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getProductSlug } from './ProductListingPage';
import { ProductReviews } from './ProductReviews';
import { ProductFeatureIcon } from './ProductFeatureIcon';
import type { Product } from '../types';

const parsePreparationStep = (stepText: string, index: number) => {
  const cleaned = stepText.replace(/^(\d+[.)]\s*)+/, '').trim();
  const colonIndex = cleaned.indexOf(':');
  if (colonIndex > 0 && colonIndex < 35) {
    return {
      stepNum: index + 1,
      title: cleaned.slice(0, colonIndex).trim(),
      desc: cleaned.slice(colonIndex + 1).trim(),
    };
  }
  return {
    stepNum: index + 1,
    title: `Method ${index + 1}`,
    desc: cleaned,
  };
};

export const ProductDetailPage: React.FC = () => {
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

  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);


  // 1. Extract slug or ID from URL (/product/[slug-or-id])
  const productIdentifier = useMemo(() => {
    const parts = currentRoute.pathname.split('/');
    return decodeURIComponent(parts[parts.length - 1] || '');
  }, [currentRoute.pathname]);

  // 2. Find product by slug or id (fallback to single catalog product)
  const product = useMemo(() => {
    if (!productIdentifier) return allProducts[0] || null;
    return (
      allProducts.find((p) => getProductSlug(p.name) === productIdentifier) ||
      allProducts.find((p) => p.id === productIdentifier) ||
      allProducts[0] ||
      null
    );
  }, [allProducts, productIdentifier]);

  // Dynamic document title update
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (product) {
      document.title = `${product.name} — Farminix Fresh Groceries`;
      setSelectedWeight(product.weight);
      setSelectedImage(product.image);
    } else {
      document.title = 'Product Not Found — Farminix';
    }
  }, [product, productIdentifier]);

  // Recently Viewed LocalStorage Persistence
  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem('farminix_recently_viewed');
      let ids: string[] = stored ? JSON.parse(stored) : [];
      ids = [product.id, ...ids.filter((id) => id !== product.id)].slice(0, 8);
      localStorage.setItem('farminix_recently_viewed', JSON.stringify(ids));
    } catch {
      // Ignore localStorage errors
    }
  }, [product]);

  // Recently viewed items calculation
  const recentlyViewedProducts = useMemo(() => {
    if (!product) return [];
    try {
      const stored = localStorage.getItem('farminix_recently_viewed');
      if (!stored) return [];
      const ids: string[] = JSON.parse(stored);
      return ids
        .filter((id) => id !== product.id)
        .map((id) => allProducts.find((p) => p.id === id))
        .filter((p): p is Product => p !== undefined)
        .slice(0, 6);
    } catch {
      return [];
    }
  }, [product, allProducts]);

  if (!product) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-[#7C3AED] mb-4 text-3xl font-black">
          🛒
        </div>
        <h1 className="text-2xl font-black text-slate-900">Product Not Found</h1>
        <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
          The product you are looking for may have been moved, renamed, or is no longer available in our inventory.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Browse All Products
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Weight / Variant calculations
  const currentWeight = selectedWeight || product.weight;
  
  // Calculate price scaling ratio based on variant weight
  const getMultiplier = (w: string) => {
    if (w.includes('5 kg')) return 4.5;
    if (w.includes('10 kg')) return 8.8;
    if (w.includes('2 kg')) return 1.95;
    if (w.includes('500 g')) return 0.55;
    if (w.includes('250 g')) return 0.3;
    return 1;
  };

  const multiplier = getMultiplier(currentWeight);
  const baseMultiplier = getMultiplier(product.weight);
  const scale = multiplier / baseMultiplier;

  const currentPrice = Math.round(product.price * scale * 100) / 100;
  const currentOldPrice = product.oldPrice ? Math.round(product.oldPrice * scale * 100) / 100 : undefined;
  const discountPct = product.discountPercentage !== undefined && product.discountPercentage > 0
    ? product.discountPercentage
    : currentOldPrice && currentOldPrice > currentPrice
      ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
      : 0;
  const discountAmount = currentOldPrice && currentOldPrice > currentPrice ? Math.round((currentOldPrice - currentPrice) * 100) / 100 : 0;

  // Cart state
  const cartItem = cart.find(
    (item) => item.product.id === product.id && item.selectedWeight === currentWeight
  );
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlist.includes(product.id);

  // Gallery Images
  const gallery = [product.image, ...(product.galleryImages || [])];

  // Product sections use only the saved product content.
  const highlights = (product.highlights || []).filter(h => h.title.trim() && h.desc.trim());
  const benefits = (product.benefits || []).filter(b => b.trim());
  const specifications = (product.specifications || []).filter(s => s.label.trim() && s.value.trim());
  const howToUse = (product.howToUse || []).filter(s => s.trim());
  const faqs = (product.faqs || []).filter(f => f.question.trim() && f.answer.trim());

  // Frequently Bought Together Products
  const bundleProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 2);

  const bundleTotal = currentPrice + bundleProducts.reduce((sum, p) => sum + p.price, 0);

  const handleAddBundleToCart = () => {
    addToCart(product, currentWeight);
    bundleProducts.forEach((p) => addToCart(p, p.weight));
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    const inCart = cart.find(
      (item) => item.product.id === product.id && item.selectedWeight === currentWeight
    );
    if (!inCart) {
      addToCart(product, currentWeight);
    }
    navigate('/checkout');
  };

  return (
    <div className="w-full bg-white text-slate-900 font-sans pb-28 md:pb-16">
      
      {/* ── BREADCRUMBS & TOP BAR ── */}
      <div className="border-b border-slate-100 bg-slate-50/60 py-3 sm:py-3.5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-3 sm:gap-4 text-xs">
          
          {/* Back Button (Left side) */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#7C3AED] transition-colors cursor-pointer shrink-0 pr-3 border-r border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {/* Breadcrumb Path */}
          <nav className="flex items-center gap-1.5 sm:gap-2 text-slate-500 font-medium overflow-x-auto no-scrollbar whitespace-nowrap">
            <button onClick={() => navigate('/')} className="hover:text-[#7C3AED] transition-colors cursor-pointer">Home</button>
            <span>/</span>
            <button
              onClick={() => navigate('/products', `category=${encodeURIComponent(product.category)}`)}
              className="hover:text-[#7C3AED] transition-colors cursor-pointer"
            >
              {product.category}
            </button>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-[150px] sm:max-w-[280px]">{product.name}</span>
          </nav>

        </div>
      </div>

      {/* ── MAIN PRODUCT SECTION (2-Column Desktop Grid) ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Gallery & Product Image (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
            
            {/* Main Stage Image Container */}
            <div className="relative w-full aspect-square bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden flex items-center justify-center p-4 sm:p-6 group shadow-xs">
              
              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2 z-10">
                {discountPct > 0 && (
                  <span className="bg-[#EA580C] text-white text-[11px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-sm tracking-wide">
                    ₹{discountAmount.toLocaleString('en-IN')} OFF | {discountPct}% OFF
                  </span>
                )}
                {(product.badges?.includes('Bestseller') || product.id === 'r1') && (
                  <span className="bg-[#7C3AED] text-white text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-sm tracking-wider uppercase">
                    Bestseller
                  </span>
                )}
                <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-sm tracking-wider uppercase">
                  100% Genuine
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              {/* Zoomable Main Image */}
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>

            {/* Thumbnail Gallery Row */}
            <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-1">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 bg-white p-1 transition-all cursor-pointer shrink-0 overflow-hidden ${
                    (selectedImage || product.image) === img
                      ? 'border-[#7C3AED] ring-2 ring-purple-200'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>

          </div>

          {/* RIGHT COLUMN: Product Information & Purchase Area (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col text-left space-y-4 sm:space-y-6">
            
            {/* Category & Brand Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-purple-100/80 border border-purple-200 text-[#7C3AED] text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-lg mb-2">
                <span>{product.brand}</span>
                <span>•</span>
                <span>{product.category}</span>
              </div>
              
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight tracking-tight break-words">
                {product.name}
              </h1>

            </div>

            {/* Price Section */}
            <div className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#7C3AED]">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  {currentOldPrice && currentOldPrice > currentPrice && (
                    <span className="text-base sm:text-lg font-bold text-slate-400 line-through">
                      MRP ₹{currentOldPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span className="bg-orange-100 text-[#C2410C] border border-orange-200 text-xs font-black px-2.5 py-1 rounded-lg">
                      {discountAmount > 0 ? `₹${discountAmount.toLocaleString('en-IN')} OFF | ` : ''}{discountPct}% OFF
                    </span>
                  )}
                </div>
                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1">
                  MRP inclusive of all taxes • Unit Price: ₹{(currentPrice / (currentWeight.toLowerCase().includes('kg') ? parseFloat(currentWeight) * 10 : 1)).toFixed(2)}/100g
                </div>
              </div>

              {/* Stock availability tag */}
              <div>
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>In Stock ({product.stockCount} units)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>Currently Out of Stock</span>
                  </span>
                )}
              </div>
            </div>

            {/* Pack Size / Variant Selector */}
            {product.weightOptions && product.weightOptions.length > 0 && (
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
                  Select Pack Size
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {product.weightOptions.map((w) => {
                    const isActive = currentWeight === w;
                    const wPrice = Math.round(product.price * (getMultiplier(w) / baseMultiplier));
                    return (
                      <button
                        key={w}
                        onClick={() => setSelectedWeight(w)}
                        className={`px-4 py-2.5 text-xs font-black rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                          isActive
                            ? 'border-[#7C3AED] bg-purple-50 text-[#7C3AED] ring-2 ring-purple-200 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{w}</span>
                        <div className="flex items-baseline gap-1 text-[10px] font-bold text-slate-500">
                          <span>₹{wPrice}</span>
                          {product.oldPrice && product.oldPrice > product.price && (
                            <span className="line-through text-slate-400 text-[9px]">
                              ₹{Math.round(product.oldPrice * (getMultiplier(w) / baseMultiplier))}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper + Add to Cart + Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Stepper / Add Button */}
                <div className="w-full sm:flex-1">
                  {!product.inStock ? (
                            <button disabled className="w-full min-h-9 px-2 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold cursor-not-allowed">Out of Stock</button>
                          ) : quantity === 0 ? (
                    <button
                      onClick={() => {
                        addToCart(product, currentWeight);
                        setIsCartOpen(true);
                      }}
                      disabled={!product.inStock}
                      className="w-full h-13 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-slate-300 text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Add to Cart • ₹{currentPrice}</span>
                    </button>
                  ) : (
                    <div className="w-full h-13 bg-[#7C3AED] text-white rounded-2xl flex items-center justify-between px-4 font-extrabold text-sm shadow-md">
                      <span className="text-xs font-bold text-purple-100">Added ({quantity} in cart)</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-8 h-8 rounded-full bg-purple-800 hover:bg-purple-900 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <span className="text-base font-black">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-8 h-8 rounded-full bg-purple-800 hover:bg-purple-900 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy Now Secondary Action */}
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="w-full sm:w-44 h-13 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* About This Product Summary */}
            <div className="pt-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">About This Product</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

          </div>
        </div>

        {/* ── KEY HIGHLIGHTS ("Why You'll Love It") ── */}
        {highlights.length > 0 && <div className="mt-14 pt-10 border-t border-slate-100">
          <div className="text-center mb-8">
            <span className="text-[11px] font-black text-[#7C3AED] uppercase tracking-widest">Premium Features</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Why You'll Love It</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((h, idx) => (
              <div key={idx} className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-start gap-4">
                <ProductFeatureIcon name={h.icon} className="h-8 w-8 shrink-0 text-purple-600" />
                <div className="text-left">
                  <h3 className="text-xs font-black text-slate-900">{h.title}</h3>
                  <p className="text-[11px] font-medium text-slate-600 mt-1 leading-normal">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        }
        {/* ── BENEFITS & ADVANTAGES ── */}
        {benefits.length > 0 && <div className="mt-12 p-6 sm:p-8 bg-slate-50/70 border border-slate-200/70 rounded-3xl">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-4 text-left">
            Benefits &amp; Advantages
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700 text-left font-medium">
            {benefits.map((b, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        }
        {/* ── INGREDIENTS & NUTRITIONAL INFO & SPECIFICATIONS ── */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Ingredients & Nutrition */}
          <div className="space-y-6">
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="p-6 bg-white border border-slate-200/80 rounded-3xl text-left shadow-2xs">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <><Leaf className="w-4 h-4 text-purple-600" /> <span>Ingredients &amp; Composition</span></>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                  {product.ingredients.join(', ')}
                </p>
              </div>
            )}

            {product.nutritionalInfo && Object.values(product.nutritionalInfo).some(Boolean) && (
              <div className="p-6 bg-white border border-slate-200/80 rounded-3xl text-left shadow-2xs">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <><BarChart3 className="w-4 h-4 text-purple-600" /> <span>Nutritional Information{product.nutritionBasis ? ` (${product.nutritionBasis})` : ''}</span></>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(product.nutritionalInfo).filter(([,value]) => value).map(([label,value]) => <div key={label} className="p-3 bg-purple-50 rounded-xl text-center border border-purple-100"><div className="text-[10px] font-bold text-slate-500 uppercase">{label}</div><div className="text-xs sm:text-sm font-black text-purple-700 mt-0.5 break-words">{value}</div></div>)}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Product Specifications Table */}
          {specifications.length > 0 && <div className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl text-left shadow-xs">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
              <><ClipboardList className="w-4 h-4 text-purple-600" /> <span>PRODUCT SPECIFICATIONS</span></>
            </h3>
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              {specifications.map((s, idx) => (
                <div key={idx} className="py-3 sm:py-3.5 grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2 sm:gap-4">
                  <span className="font-bold text-slate-500 break-words">{s.label}</span>
                  <span className="font-extrabold text-slate-900 sm:text-right leading-relaxed break-words">{s.value}</span>
                </div>
              ))}
            </div>
          </div>}

        </div>

        {/* ── HOW TO USE / PREPARATION (Full Space Horizontal Layout) ── */}
        {howToUse && howToUse.length > 0 && (
          <div className="mt-12 p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl text-left shadow-2xs">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
              <ChefHat className="w-5 h-5 text-purple-600" />
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                How to Use / Preparation
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {howToUse.map((step, idx) => {
                const parsed = parsePreparationStep(step, idx);
                const icons = [Utensils, ChefHat, Microwave];
                const MethodIcon = icons[idx % icons.length];

                return (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 bg-slate-50/70 hover:bg-purple-50/30 border border-slate-200/80 hover:border-purple-200 rounded-2xl transition-all duration-200 flex flex-col justify-start space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-[#7C3AED] font-black text-xs tracking-wider">
                        Method 0{parsed.stepNum}
                      </span>
                      <MethodIcon className="w-5 h-5 text-purple-600" />
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-[#7C3AED] transition-colors">
                        {parsed.title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
                        {parsed.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FREQUENTLY BOUGHT TOGETHER ── */}
        {bundleProducts.length > 0 && (
          <div className="mt-14 p-6 sm:p-8 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white rounded-3xl text-left shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div>
                <span className="text-[10px] font-black text-yellow-300 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md">
                  Bundle Deal • Save More
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-2">Frequently Bought Together</h2>
                <p className="text-xs text-purple-200 mt-1">Combine these essential items and complete your order in 1-click.</p>

                {/* Bundle items list */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/20">
                    <img src={product.image} alt={product.name} className="w-10 h-10 object-contain rounded-lg bg-white p-1" />
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{product.name}</span>
                  </div>
                  {bundleProducts.map((bp) => (
                    <React.Fragment key={bp.id}>
                      <span className="text-lg font-black text-yellow-300">+</span>
                      <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/20">
                        <img src={bp.image} alt={bp.name} className="w-10 h-10 object-contain rounded-lg bg-white p-1" />
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">{bp.name}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Bundle Add to Cart Action */}
              <div className="flex flex-col items-center md:items-end gap-2 shrink-0 bg-white/10 p-4 rounded-2xl border border-white/20">
                <div className="text-xs text-purple-200">Combined Total:</div>
                <div className="text-2xl font-black text-yellow-300">₹{bundleTotal}</div>
                <button
                  onClick={handleAddBundleToCart}
                  className="px-6 py-3 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Bundle to Cart</span>
                </button>
              </div>

            </div>
          </div>
        )}



        {/* ── FREQUENTLY ASKED QUESTIONS (Accordion) ── */}
        {faqs.length > 0 && <div className="mt-14 pt-10 border-t border-slate-100 text-left">
          <div className="mb-6">
            <span className="text-[11px] font-black text-[#7C3AED] uppercase tracking-widest">Got Questions?</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3 max-w-4xl">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#7C3AED] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>



        }
        <ProductReviews reviews={product.reviewsList} />

        {/* ── RECENTLY VIEWED PRODUCTS ── */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mt-14 pt-10 border-t border-slate-100 text-left">
            <div className="mb-6">
              <span className="text-[11px] font-black text-[#7C3AED] uppercase tracking-widest">Browsing History</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Recently Viewed</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentlyViewedProducts.map((rv) => (
                <div
                  key={rv.id}
                  onClick={() => navigate('/product/' + getProductSlug(rv.name))}
                  className="bg-white rounded-2xl p-3 border border-slate-200/80 hover:border-purple-300 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 shadow-2xs hover:-translate-y-1"
                >
                  <div className="w-full aspect-square bg-white rounded-xl overflow-hidden p-2">
                    <img src={rv.image} alt={rv.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 text-center line-clamp-1 w-full">{rv.name}</div>
                  <div className="text-xs font-black text-[#7C3AED]">₹{rv.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── STICKY MOBILE PURCHASE BAR ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-lg font-black text-[#7C3AED]">₹{currentPrice}</span>
            {currentOldPrice && currentOldPrice > currentPrice && (
              <span className="text-xs font-semibold text-slate-400 line-through">₹{currentOldPrice}</span>
            )}
            {discountPct > 0 && (
              <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-1 py-0.2 rounded">
                SAVE {discountPct}%
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 max-w-[200px]">
          {!product.inStock ? (
                            <button disabled className="w-full min-h-9 px-2 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold cursor-not-allowed">Out of Stock</button>
                          ) : quantity === 0 ? (
            <button
              onClick={() => { addToCart(product, currentWeight); setIsCartOpen(true); }}
              className="w-full h-11 bg-[#7C3AED] text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="w-full h-11 bg-[#7C3AED] text-white rounded-xl flex items-center justify-between px-3 font-extrabold text-xs">
              <button onClick={() => updateQuantity(product.id, -1)} className="w-6 h-6 rounded-full bg-purple-800 flex items-center justify-center"><Minus className="w-3.5 h-3.5 stroke-[3]" /></button>
              <span>{quantity}</span>
              <button onClick={() => updateQuantity(product.id, 1)} className="w-6 h-6 rounded-full bg-purple-800 flex items-center justify-center"><Plus className="w-3.5 h-3.5 stroke-[3]" /></button>
            </div>
          )}
        </div>
      </div>



    </div>
  );
};
