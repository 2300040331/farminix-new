import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { defaultCartConfig } from '../admin/defaultConfig';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartDiscount,
    appliedCoupon,
    applyCoupon,
    navigate,
  } = useApp();

  const { publishedConfig } = useAdminConfig();
  const cartCfg = publishedConfig.cart || defaultCartConfig;

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isCartOpen) return null;

  const rawTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) return;
    const success = applyCoupon(cleanCode);
    if (success) {
      const match = (cartCfg.coupons || []).find((c) => c.enabled && c.code.toUpperCase() === cleanCode);
      const discount = match ? match.discountPercentage : 10;
      setCouponMsg({ text: `Coupon ${cleanCode} applied! ${discount}% discount added.`, isError: false });
    } else {
      const sampleCodes = (cartCfg.coupons || []).filter(c => c.enabled).map(c => c.code).join(' or ') || 'FARM10';
      setCouponMsg({ text: `Invalid coupon code. Try ${sampleCodes}`, isError: true });
    }
  };

  const activeCouponObj = (cartCfg.coupons || []).find(
    (c) => c.enabled && c.code.toUpperCase() === appliedCoupon?.toUpperCase()
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <img src="/farminix_logo.png" alt="Farminix Logo" className="h-6 sm:h-7 w-auto object-contain" />
              <span className="h-4 w-px bg-gray-300" />
              <h2 className="text-sm sm:text-base font-bold text-gray-900">Your Cart</h2>
              <span className="bg-emerald-100 text-[#15803D] text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} Items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-24 h-24 rounded-3xl bg-purple-50 flex items-center justify-center p-4 mb-4 border border-purple-100 shadow-xs">
                  <img src="/farminix_logo.png" alt="Farminix" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-base font-bold text-gray-900">{cartCfg.emptyCartTitle}</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  {cartCfg.emptyCartSubtitle}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-6 py-2.5 bg-[#15803D] text-white text-xs font-bold rounded-xl shadow-md hover:bg-green-800 transition-colors"
                >
                  {cartCfg.emptyCartButtonText}
                </button>
              </div>
            ) : (
              <>
                {/* Delivery Announcement Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="text-lg">⚡</div>
                  <div className="text-xs">
                    <span className="font-bold text-amber-900">{cartCfg.deliveryBannerText || 'Superfast Delivery!'} </span>
                    <span className="text-amber-800">Your order will reach in {cartCfg.deliveryTimeText || '10 Mins'}.</span>
                  </div>
                </div>

                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedWeight}`}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-2xl border border-gray-100"
                  >
                    {/* Item Image */}
                    <div className="w-14 h-14 bg-white rounded-xl p-1 border border-gray-100 flex items-center justify-center shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.name}</h4>
                      <div className="text-[11px] text-gray-500 mt-0.5">{item.selectedWeight}</div>
                      <div className="text-xs font-extrabold text-[#7C3AED] mt-1">
                        ₹{item.product.price * item.quantity}
                        {item.product.oldPrice && (
                          <span className="text-[10px] text-gray-400 font-normal line-through ml-1.5">
                            ₹{item.product.oldPrice * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="bg-[#7C3AED] text-white rounded-lg flex items-center gap-1 px-1.5 sm:px-2 py-1 font-bold text-xs">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="hover:text-purple-200 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3 stroke-[3]" />
                        </button>
                        <span className="w-3.5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="hover:text-purple-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Coupon Code Section */}
                <div className="pt-2">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1 min-w-0">
                      <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder={`Try code: ${(cartCfg.coupons || []).find(c => c.enabled)?.code || 'FARM10'}`}
                        className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-gray-200 rounded-xl uppercase font-semibold focus:outline-none focus:border-[#7C3AED]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 h-10 bg-[#5B21B6] hover:bg-purple-900 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                  {couponMsg && (
                    <div className={`text-[11px] font-semibold mt-1.5 ${couponMsg.isError ? 'text-red-600' : 'text-purple-700'}`}>
                      {couponMsg.text}
                    </div>
                  )}
                  {appliedCoupon && !couponMsg && (
                    <div className="text-[11px] font-semibold text-purple-700 mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Coupon {appliedCoupon} active ({activeCouponObj ? `${activeCouponObj.discountPercentage}% OFF` : '10% OFF'})
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer Bill Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{rawTotal}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between items-center text-purple-700 font-semibold">
                    <span>Coupon Discount ({appliedCoupon || 'FARM10'})</span>
                    <span>-₹{cartDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-[#7C3AED]">
                    {cartCfg.deliveryFee === 0 || rawTotal >= (cartCfg.freeDeliveryThreshold || 500) ? 'FREE' : `₹${cartCfg.deliveryFee}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-extrabold text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-[#7C3AED]">₹{cartTotal}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full h-12 bg-[#7C3AED] hover:bg-purple-800 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
