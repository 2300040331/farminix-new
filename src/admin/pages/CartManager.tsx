import React, { useState } from 'react';
import {
  ShoppingCart,
  Save,
  CheckCircle2,
  Tag,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  IndianRupee,
  Eye,
  EyeOff,
  Edit2,
  X,
} from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { defaultCartConfig } from '../defaultConfig';
import type { CartConfig, CartCoupon } from '../types';

export const CartManager: React.FC = () => {
  const { config, updateCartConfig } = useAdminConfig();
  const initialData: CartConfig = config.cart || defaultCartConfig;

  const [formData, setFormData] = useState<CartConfig>(initialData);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modal for add/edit coupon
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCouponIndex, setEditingCouponIndex] = useState<number | null>(null);
  const [couponForm, setCouponForm] = useState<CartCoupon>({
    code: '',
    discountPercentage: 10,
    description: '',
    enabled: true,
  });

  const handleSave = (dataToSave = formData) => {
    updateCartConfig(dataToSave);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleOpenAddCoupon = () => {
    setEditingCouponIndex(null);
    setCouponForm({
      code: '',
      discountPercentage: 10,
      description: 'Coupon active (10% OFF)',
      enabled: true,
    });
    setCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (index: number) => {
    setEditingCouponIndex(index);
    setCouponForm({ ...formData.coupons[index] });
    setCouponModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponForm.code.trim().toUpperCase();
    if (!cleanCode) return;

    let updatedCoupons: CartCoupon[];
    if (editingCouponIndex !== null) {
      updatedCoupons = formData.coupons.map((c, i) =>
        i === editingCouponIndex ? { ...couponForm, code: cleanCode } : c
      );
    } else {
      updatedCoupons = [...formData.coupons, { ...couponForm, code: cleanCode }];
    }

    const updated = { ...formData, coupons: updatedCoupons };
    setFormData(updated);
    handleSave(updated);
    setCouponModalOpen(false);
  };

  const handleDeleteCoupon = (index: number) => {
    if (window.confirm('Delete this coupon code?')) {
      const updatedCoupons = formData.coupons.filter((_, i) => i !== index);
      const updated = { ...formData, coupons: updatedCoupons };
      setFormData(updated);
      handleSave(updated);
    }
  };

  const handleToggleCoupon = (index: number) => {
    const updatedCoupons = formData.coupons.map((c, i) =>
      i === index ? { ...c, enabled: !c.enabled } : c
    );
    const updated = { ...formData, coupons: updatedCoupons };
    setFormData(updated);
    handleSave(updated);
  };

  return (
    <div className="space-y-8 text-left pb-16">
      {/* ── TOP HEADER & SAVE BAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cart Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure superfast delivery announcement banner, promo codes, handling fees, and empty cart screen.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Changes Saved &amp; Live!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Cart configuration successfully saved and published!</span>
        </div>
      )}

      {/* ── 1. SUPERFAST DELIVERY BANNER ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Superfast Delivery Banner in Cart</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Banner Announcement Text</label>
            <input
              type="text"
              value={formData.deliveryBannerText}
              onChange={(e) => setFormData({ ...formData, deliveryBannerText: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
              placeholder="Superfast Delivery! Your order will reach in 10 Mins."
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Delivery Time Highlight</label>
            <input
              type="text"
              value={formData.deliveryTimeText}
              onChange={(e) => setFormData({ ...formData, deliveryTimeText: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
              placeholder="10 Mins"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <div className="text-xs">
            <span className="font-extrabold text-amber-950">Superfast Delivery! </span>
            <span className="text-amber-800 font-medium">Your order will reach in {formData.deliveryTimeText}.</span>
          </div>
        </div>
      </div>

      {/* ── 2. COUPON & PROMO CODES ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>Promo &amp; Coupon Codes ({formData.coupons.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customers can enter these codes inside the cart drawer for instant discounts.
            </p>
          </div>

          <button
            onClick={handleOpenAddCoupon}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Coupon</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formData.coupons.map((c, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                c.enabled ? 'bg-purple-50/50 border-purple-100' : 'bg-slate-100 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#7C3AED] text-white font-black text-xs rounded-lg uppercase tracking-wider">
                    {c.code}
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    {c.discountPercentage}% OFF
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{c.description}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleCoupon(idx)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title={c.enabled ? 'Hide / Disable' : 'Show / Enable'}
                >
                  {c.enabled ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                </button>
                <button
                  onClick={() => handleOpenEditCoupon(idx)}
                  className="p-1.5 text-slate-500 hover:text-[#7C3AED] transition-colors cursor-pointer"
                  title="Edit Coupon"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCoupon(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. FEES & DELIVERY CHARGES ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          <span>Fees &amp; Delivery Charges</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Handling &amp; Packaging Fee (₹)</label>
            <input
              type="number"
              min="0"
              value={formData.handlingFee}
              onChange={(e) => setFormData({ ...formData, handlingFee: Number(e.target.value) || 0 })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Delivery Fee (₹) [0 for Free]</label>
            <input
              type="number"
              min="0"
              value={formData.deliveryFee}
              onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) || 0 })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Free Delivery Above (₹)</label>
            <input
              type="number"
              min="0"
              value={formData.freeDeliveryThreshold}
              onChange={(e) =>
                setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) || 0 })
              }
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── 4. EMPTY CART SCREEN ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Empty Cart Screen Customization</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Empty Title</label>
            <input
              type="text"
              value={formData.emptyCartTitle}
              onChange={(e) => setFormData({ ...formData, emptyCartTitle: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Empty Subtitle</label>
            <input
              type="text"
              value={formData.emptyCartSubtitle}
              onChange={(e) => setFormData({ ...formData, emptyCartSubtitle: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Button Text</label>
            <input
              type="text"
              value={formData.emptyCartButtonText}
              onChange={(e) => setFormData({ ...formData, emptyCartButtonText: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── COUPON MODAL ── */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingCouponIndex !== null ? 'Edit Coupon Code' : 'Add New Coupon Code'}
              </h3>
              <button
                onClick={() => setCouponModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700">Promo Code Name</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                  }
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider focus:border-[#7C3AED] focus:outline-none"
                  placeholder="e.g. FARM10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={couponForm.discountPercentage}
                  onChange={(e) =>
                    setCouponForm({
                      ...couponForm,
                      discountPercentage: Number(e.target.value) || 10,
                    })
                  }
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:outline-none"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Customer Success Description</label>
                <input
                  type="text"
                  required
                  value={couponForm.description}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, description: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#7C3AED] focus:outline-none"
                  placeholder="e.g. Coupon FARM10 active (10% OFF)"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
