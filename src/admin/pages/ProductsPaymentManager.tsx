import React, { useState } from 'react';
import {
  Package,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  Save,
  Clock,
} from 'lucide-react';
import { ProductManager } from './ProductManager';
import { OrderManager } from './OrderManager';
import { useAdminConfig } from '../context/AdminConfigContext';
import { defaultCheckoutPaymentConfig } from '../defaultConfig';
import type { CheckoutPaymentConfig } from '../types';

type ProductTab = 'catalog' | 'checkout' | 'orders';

export const ProductsPaymentManager: React.FC = () => {
  const { config, updateCheckoutPayment } = useAdminConfig();
  const [activeTab, setActiveTab] = useState<ProductTab>('catalog');

  const [checkoutData, setCheckoutData] = useState<CheckoutPaymentConfig>(
    config.checkoutPayment || defaultCheckoutPaymentConfig
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveCheckout = () => {
    updateCheckoutPayment(checkoutData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTogglePaymentMethod = (id: string) => {
    const updated = checkoutData.paymentMethods.map((pm) =>
      pm.id === id ? { ...pm, enabled: !pm.enabled } : pm
    );
    const newCfg = { ...checkoutData, paymentMethods: updated };
    setCheckoutData(newCfg);
    updateCheckoutPayment(newCfg);
  };

  const handleToggleInstruction = (id: string) => {
    const updated = checkoutData.deliveryInstructions.map((inst) =>
      inst.id === id ? { ...inst, enabled: !inst.enabled } : inst
    );
    const newCfg = { ...checkoutData, deliveryInstructions: updated };
    setCheckoutData(newCfg);
    updateCheckoutPayment(newCfg);
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* ── TOP HEADER ── */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-200 text-xs font-bold uppercase tracking-wider mb-3">
            <Package className="w-3.5 h-3.5 text-emerald-300" />
            <span>End-to-End Commerce Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Products (Payment to Delivery)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage your complete product lifecycle: inventory catalog &amp; story narrative, checkout payment gateways (UPI, Cards, COD), and customer orders fulfillment.
          </p>
        </div>
      </div>

      {/* ── SUB-TABS ── */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-[#7C3AED] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Inventory &amp; Detail Story</span>
        </button>

        <button
          onClick={() => setActiveTab('checkout')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'checkout'
              ? 'bg-[#7C3AED] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Methods &amp; Checkout</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#7C3AED] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders &amp; Delivery Fulfillment</span>
        </button>
      </div>

      {/* ── ACTIVE TAB CONTENT ── */}
      <div>
        {activeTab === 'catalog' && <ProductManager />}

        {activeTab === 'checkout' && (
          <div className="space-y-6">
            {/* Header & Save Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Checkout &amp; Payment Gateway Settings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure delivery slots, active payment methods (UPI, Card, Net Banking, COD), and delivery preferences.
                </p>
              </div>

              <button
                onClick={handleSaveCheckout}
                className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Saved &amp; Published!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

            {/* Delivery Slots Configuration */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7C3AED]" />
                <span>Delivery Slots Offered to Customers</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                  <span className="text-[10px] font-bold text-purple-700 uppercase">Slot 1: Instant Express</span>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Slot Title</label>
                    <input
                      type="text"
                      value={checkoutData.expressSlotLabel}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, expressSlotLabel: e.target.value })
                      }
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Sub-description</label>
                    <input
                      type="text"
                      value={checkoutData.expressSlotSublabel}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, expressSlotSublabel: e.target.value })
                      }
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-700 uppercase">Slot 2: Scheduled Delivery</span>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Slot Title</label>
                    <input
                      type="text"
                      value={checkoutData.scheduledSlotLabel}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, scheduledSlotLabel: e.target.value })
                      }
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">Sub-description</label>
                    <input
                      type="text"
                      value={checkoutData.scheduledSlotSublabel}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, scheduledSlotSublabel: e.target.value })
                      }
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Razorpay Gateway Configuration */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-black">
                    ₹
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Razorpay Payment Gateway Integration</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Direct live checkout with UPI, Cards, NetBanking, and Wallets</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  Test / Live Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Razorpay Key ID
                  </label>
                  <input
                    type="text"
                    value={checkoutData.razorpayKeyId || 'rzp_test_TkIMPriA788lqz'}
                    onChange={(e) =>
                      setCheckoutData({ ...checkoutData, razorpayKeyId: e.target.value })
                    }
                    placeholder="rzp_test_..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:border-[#7C3AED] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Public key used on frontend checkout</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Razorpay Key Secret
                  </label>
                  <input
                    type="password"
                    value={checkoutData.razorpayKeySecret || 'eC5FdAw7dBccrFg0J7qaoO3e'}
                    onChange={(e) =>
                      setCheckoutData({ ...checkoutData, razorpayKeySecret: e.target.value })
                    }
                    placeholder="••••••••••••••••••••"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:border-[#7C3AED] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Private key secret for verification</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Merchant / Brand Name on Razorpay Modal
                  </label>
                  <input
                    type="text"
                    value={checkoutData.razorpayMerchantName || 'Farminix Fresh Groceries'}
                    onChange={(e) =>
                      setCheckoutData({ ...checkoutData, razorpayMerchantName: e.target.value })
                    }
                    placeholder="Farminix Fresh Groceries"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Modal Theme Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={checkoutData.razorpayThemeColor || '#7C3AED'}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, razorpayThemeColor: e.target.value })
                      }
                      className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={checkoutData.razorpayThemeColor || '#7C3AED'}
                      onChange={(e) =>
                        setCheckoutData({ ...checkoutData, razorpayThemeColor: e.target.value })
                      }
                      className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Gateways Config */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment Gateways &amp; Options</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checkoutData.paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      pm.enabled ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pm.icon}</span>
                      <div>
                        <div className="text-xs font-black text-slate-900">{pm.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{pm.subtitle}</div>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pm.enabled}
                        onChange={() => handleTogglePaymentMethod(pm.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Instructions Options */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>🚪 Delivery Instructions Chips</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {checkoutData.deliveryInstructions.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => handleToggleInstruction(inst.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      inst.enabled
                        ? 'bg-purple-50 border-purple-200 text-[#7C3AED] font-extrabold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
                    }`}
                  >
                    <span className="text-xl">{inst.icon}</span>
                    <span className="text-xs">{inst.label}</span>
                    <span className="text-[9px] uppercase tracking-wider mt-1 font-bold">
                      {inst.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && <OrderManager />}
      </div>
    </div>
  );
};
