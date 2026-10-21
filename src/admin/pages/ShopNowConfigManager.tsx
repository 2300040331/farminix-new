import React, { useState } from 'react';
import { Sliders, Check, Eye, EyeOff } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { ShopNowPageConfig } from '../types';

export const ShopNowConfigManager: React.FC = () => {
  const { config, updateShopNowConfig } = useAdminConfig();
  const [formData, setFormData] = useState<ShopNowPageConfig>(
    config.shopNowConfig || {
      enabled: true,
      pageTitle: 'Browse Products',
      minPriceLimit: 10,
      maxPriceLimit: 320,
      itemsPerPage: 12,
    }
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateField = (field: keyof ShopNowPageConfig, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateShopNowConfig({ [field]: value });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleNumericTextChange = (field: 'minPriceLimit' | 'maxPriceLimit' | 'itemsPerPage', textVal: string) => {
    // Only allow numbers
    const cleaned = textVal.replace(/\D/g, '');
    const numValue = cleaned === '' ? 0 : Number(cleaned);
    
    const updated = { ...formData, [field]: numValue };
    setFormData(updated);
    updateShopNowConfig({ [field]: numValue });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Storefront Settings</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Browse Products Config
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure the Shop Now browse page filters, default price limits, items per page, and header titles.
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
            <span>{formData.enabled ? 'Page Enabled' : 'Page Disabled'}</span>
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Live Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Form Settings */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          General Page Layout &amp; Filter Bounds
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Page Title Header</label>
            <input
              type="text"
              value={formData.pageTitle}
              onChange={(e) => handleUpdateField('pageTitle', e.target.value)}
              placeholder="e.g. Browse Products"
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Items Per Page</label>
            <input
              type="text"
              value={formData.itemsPerPage || ''}
              onChange={(e) => handleNumericTextChange('itemsPerPage', e.target.value)}
              placeholder="e.g. 12"
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Price Filter Limit (₹)</label>
            <input
              type="text"
              value={formData.minPriceLimit || ''}
              onChange={(e) => handleNumericTextChange('minPriceLimit', e.target.value)}
              placeholder="e.g. 10"
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Maximum Price Filter Limit (₹)</label>
            <input
              type="text"
              value={formData.maxPriceLimit || ''}
              onChange={(e) => handleNumericTextChange('maxPriceLimit', e.target.value)}
              placeholder="e.g. 320"
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
