import React from 'react';
import { Zap, Plus, Minus, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { getProductSlug } from './ProductListingPage';

export const PopularProducts: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    updateQuantity,
    wishlist,
    toggleWishlist,
    setIsCartOpen,
    navigate,
  } = useApp();
  const { publishedConfig } = useAdminConfig();
  const popularConfig = publishedConfig.popularProducts;

  if (!popularConfig.enabled) return null;

  // Catalog contains only Farminix Family Choice Rice
  const displayedProducts = (publishedConfig.products && publishedConfig.products.length > 0
    ? publishedConfig.products
    : products);

  return (
    <section className="w-full py-8 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {popularConfig.title || 'Popular Today'}
          </h2>
          <Zap className="w-5 h-5 text-amber-500 fill-amber-400 animate-bounce" />
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayedProducts.map((product) => {
          const cartItem = cart.find((item) => item.product.id === product.id);
          const quantity = cartItem ? cartItem.quantity : 0;
          const isWishlisted = wishlist.includes(product.id);


          return (
            <div
              key={product.id}
              className="bg-white rounded-[16px] custom-card-shadow border border-gray-100/90 flex flex-col justify-between relative group hover:-translate-y-1 transition-all duration-200 overflow-hidden"
            >
              {/* Product Image and Overlay Badges */}
              <div
                onClick={() => navigate('/product/' + getProductSlug(product.name))}
                className="relative w-full aspect-square bg-white cursor-pointer overflow-hidden shrink-0"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />

                {/* Rating Badge (top-left, 12px margins) */}
                <div className="absolute top-3 left-3 bg-white/70 backdrop-blur-md px-2 py-0.75 rounded-md text-[10px] font-extrabold text-slate-800 flex items-center gap-0.5 shadow-2xs border border-white/40">
                  <span>⭐</span>
                  <span>{product.rating}</span>
                </div>

                {/* Wishlist Heart Icon Overlay (top-right, 40px x 40px circular glassmorphism) */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/75 backdrop-blur-md shadow-xs border border-white/50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                >
                  <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>

              {/* Product Details (below image) */}
              <div className="p-3.5 flex flex-col flex-grow text-left justify-between">
                <div>
                  {/* Product Name */}
                  <h3
                    onClick={() => navigate('/product/' + getProductSlug(product.name))}
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

                {/* Add / Quantity Stepper Button */}
                <div className="w-full mt-auto">
                  {quantity === 0 ? (
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
                      <span>{quantity}</span>
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
  </section>
  );
};
