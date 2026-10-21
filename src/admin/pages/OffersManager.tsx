import React, { useState } from 'react';
import { Tag, Check, Clock } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { OffersPageConfig } from '../types';

export const OffersManager: React.FC = () => {
  const { config, updateOffersPage } = useAdminConfig();
  const [formData, setFormData] = useState<OffersPageConfig>(config.offersPage);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateField = (field: keyof OffersPageConfig, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateOffersPage({ [field]: value });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4 text-orange-500" />
            <span>Campaign Operations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Offers &amp; Deals Page Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure the dedicated /offers page banner, countdown timer, mega deals discount thresholds, and promo code triggers.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Check className="w-4 h-4" />
            <span>Live Saved</span>
          </span>
        )}
      </div>

      {/* Form Settings */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Hero Campaign Banner on Offers Page
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Top Banner Badge</label>
            <input
              type="text"
              value={formData.heroBadge}
              onChange={(e) => handleUpdateField('heroBadge', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-bold text-purple-700 bg-purple-50/60 border border-purple-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Main Hero Title</label>
            <input
              type="text"
              value={formData.heroTitle}
              onChange={(e) => handleUpdateField('heroTitle', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Hero Subtitle</label>
            <input
              type="text"
              value={formData.heroSubtitle}
              onChange={(e) => handleUpdateField('heroSubtitle', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Countdown Clock (Hours)</label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.countdownHours}
                onChange={(e) => handleUpdateField('countdownHours', Number(e.target.value.replace(/\D/g, '')) || 0)}
                className="w-full h-10 pl-10 pr-3.5 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign Coupon Code</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => handleUpdateField('promoCode', e.target.value.toUpperCase())}
                className="w-full h-10 pl-10 pr-3.5 text-xs font-black font-mono text-orange-600 bg-orange-50/50 border border-orange-200 rounded-xl uppercase"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
