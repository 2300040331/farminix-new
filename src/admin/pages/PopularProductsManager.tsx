import React, { useState } from 'react';
import { Zap, Check, Eye, EyeOff, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { PopularProductsConfig } from '../types';

export const PopularProductsManager: React.FC = () => {
  const { config, updatePopularProducts } = useAdminConfig();
  const [formData, setFormData] = useState<PopularProductsConfig>(config.popularProducts);
  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    setFormData(config.popularProducts);
  }, [config.popularProducts]);

  const handleUpdateField = (field: keyof PopularProductsConfig, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updatePopularProducts(updated);
    notifySaved();
  };

  const handleAddProduct = () => {
    if (!selectedToAdd || formData.featuredProductIds.includes(selectedToAdd)) return;
    const updatedIds = [...formData.featuredProductIds, selectedToAdd];
    handleUpdateField('featuredProductIds', updatedIds);
    setSelectedToAdd('');
  };

  const handleRemoveProduct = (id: string) => {
    const updatedIds = formData.featuredProductIds.filter((pId) => pId !== id);
    handleUpdateField('featuredProductIds', updatedIds);
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.featuredProductIds.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...formData.featuredProductIds];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    handleUpdateField('featuredProductIds', copy);
  };

  const notifySaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Homepage Product Showcase</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Popular Today (⚡) Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Select and reorder high-demand featured products displayed on the homepage spotlight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleUpdateField('enabled', !formData.enabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              formData.enabled
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {formData.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{formData.enabled ? 'Section Visible' : 'Section Hidden'}</span>
          </button>
          <button
            onClick={() => {
              updatePopularProducts(formData);
              notifySaved();
            }}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Publish</span>
          </button>
        </div>
      </div>

      {/* Live Saved Notification Banner */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✓ Popular Products Changes Saved &amp; Live on the Main Storefront!</span>
        </div>
      )}

      {/* Copy Settings */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Section Header Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Section Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleUpdateField('title', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">View All Button Text</label>
            <input
              type="text"
              value={formData.viewAllText}
              onChange={(e) => handleUpdateField('viewAllText', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Select Products to Feature */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          2. Add Product to Popular Today Grid
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedToAdd}
            onChange={(e) => setSelectedToAdd(e.target.value)}
            className="flex-1 h-10 px-3 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
          >
            <option value="">-- Choose a product from catalog --</option>
            {config.products.map((p) => (
              <option key={p.id} value={p.id} disabled={formData.featuredProductIds.includes(p.id)}>
                {p.name} — ₹{p.price} ({p.category})
              </option>
            ))}
          </select>
          <button
            onClick={handleAddProduct}
            disabled={!selectedToAdd}
            className="h-10 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Popular</span>
          </button>
        </div>
      </div>

      {/* Featured Products List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          3. Active Featured Items ({formData.featuredProductIds.length})
        </h2>

        <div className="space-y-2.5">
          {formData.featuredProductIds.map((pId, idx) => {
            const product = config.products.find((p) => p.id === pId);
            if (!product) return null;

            return (
              <div
                key={pId}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 text-xs font-black flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{product.name}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      {product.brand} • <span className="text-purple-700 font-bold">₹{product.price}</span> • {product.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveProduct(idx, 'up')}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === formData.featuredProductIds.length - 1}
                    onClick={() => handleMoveProduct(idx, 'down')}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveProduct(pId)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Changes Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Changes saved here are instantly published and visible on the main website homepage.
          </p>
          <button
            onClick={() => {
              updatePopularProducts(formData);
              notifySaved();
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Publish Popular Products</span>
          </button>
        </div>
      </div>
    </div>
  );
};
