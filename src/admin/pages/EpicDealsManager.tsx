import React, { useState } from 'react';
import { Sparkles, Check, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { DealCard } from '../../types';

export const EpicDealsManager: React.FC = () => {
  const { config, updateEpicDeals } = useAdminConfig();
  const [formData, setFormData] = useState(config.epicDeals);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateField = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateEpicDeals({ [field]: value });
    notifySaved();
  };

  const handleUpdateDeal = (id: string, field: keyof DealCard, value: any) => {
    const updatedDeals = formData.deals.map((d) => (d.id === id ? { ...d, [field]: value } : d));
    handleUpdateField('deals', updatedDeals);
  };

  const handleAddDeal = () => {
    const newDeal: DealCard & { enabled?: boolean } = {
      id: `d-${Date.now()}`,
      categoryName: 'New Department Deal',
      discountBadge: 'MIN. 30% OFF',
      image: '/cat_dals.jpg',
      brands: [
        { name: 'Fortune', logo: '/logo_fortune.png' },
        { name: 'Amul', logo: '/logo_amul.png' }
      ],
      enabled: true,
    };
    const updatedDeals = [...formData.deals, newDeal];
    handleUpdateField('deals', updatedDeals);
  };

  const handleDeleteDeal = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the deal card for "${name}"?`)) {
      const updatedDeals = formData.deals.filter((d) => d.id !== id);
      handleUpdateField('deals', updatedDeals);
    }
  };

  const notifySaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>High-Converting Promotional Banner</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Epic Deals All Day Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure the 3D Zero-Gravity glowing neon header, category deal cards, discount badges, and partner brand logos.
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
            <span>{formData.enabled ? 'Deals Active' : 'Deals Hidden'}</span>
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Live Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* 3D Header Customizer */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. 3D Floating Header &amp; Badge Copy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Top Pill Badge Text</label>
            <input
              type="text"
              value={formData.topPillText}
              onChange={(e) => handleUpdateField('topPillText', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-bold text-purple-700 bg-purple-50/60 border border-purple-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Main Epic Deals Title</label>
            <input
              type="text"
              value={formData.mainTitle}
              onChange={(e) => handleUpdateField('mainTitle', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Yellow Accent Subtitle</label>
            <input
              type="text"
              value={formData.subTitle}
              onChange={(e) => handleUpdateField('subTitle', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-extrabold text-amber-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 uppercase"
            />
          </div>
        </div>
      </div>

      {/* Deal Cards List */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            2. Category Deal Cards ({formData.deals.length})
          </h2>
          <button
            onClick={handleAddDeal}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Deal Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formData.deals.map((deal) => {
            const isEnabled = (deal as any).enabled !== false;
            return (
              <div
                key={deal.id}
                className={`admin-panel p-4 rounded-2xl border bg-white shadow-2xs space-y-3 flex flex-col justify-between transition-all ${
                  isEnabled ? 'border-slate-200' : 'border-slate-200/50 opacity-60 bg-slate-50'
                }`}
              >
                <div className="space-y-3">
                  <AdminImageUpload
                    value={deal.image}
                    onChange={(val) => handleUpdateDeal(deal.id, 'image', val)}
                    label="Deal Banner Image"
                    aspectRatio="video"
                  />

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Category Title</label>
                    <input
                      type="text"
                      value={deal.categoryName}
                      onChange={(e) => handleUpdateDeal(deal.id, 'categoryName', e.target.value)}
                      className="w-full h-8 px-2.5 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Discount Badge Text</label>
                    <input
                      type="text"
                      value={deal.discountBadge}
                      onChange={(e) => handleUpdateDeal(deal.id, 'discountBadge', e.target.value)}
                      className="w-full h-8 px-2.5 text-xs font-bold text-yellow-600 bg-yellow-50/50 border border-yellow-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => handleUpdateDeal(deal.id, 'enabled', !isEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isEnabled
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isEnabled ? 'Visible' : 'Hidden'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteDeal(deal.id, deal.categoryName)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
