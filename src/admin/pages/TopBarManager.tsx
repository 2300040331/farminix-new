import React, { useState } from 'react';
import { Zap, Check, Eye, EyeOff, Tag, Smartphone, Target, HelpCircle } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { TopOfferBarConfig } from '../types';

export const TopBarManager: React.FC = () => {
  const { config, updateTopOfferBar } = useAdminConfig();
  const [formData, setFormData] = useState<TopOfferBarConfig>(config.topOfferBar);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof TopOfferBarConfig, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateTopOfferBar({ [field]: value });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Header Accessory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Top Offer Bar Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage the top promotional strip, active promo discount code, and quick utility links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleChange('enabled', !formData.enabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              formData.enabled
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {formData.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{formData.enabled ? 'Section Enabled' : 'Section Hidden'}</span>
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Live Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Section Preview</div>
        <div className="w-full h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-between px-4 text-xs font-medium text-slate-700 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>
              <strong className="text-slate-900">{formData.discountHighlight}</strong>
              <span>{formData.leftTextSuffix}</span>{' '}
              <span className="text-[#EA580C] font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                {formData.promoCode}
              </span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-600 text-xs">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              {formData.downloadAppText}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              {formData.trackOrderText}
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              {formData.helpText}
            </span>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Promotional Content &amp; Coupon
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount Highlight Badge</label>
            <input
              type="text"
              value={formData.discountHighlight}
              onChange={(e) => handleChange('discountHighlight', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Offer Message Text</label>
            <input
              type="text"
              value={formData.leftTextSuffix}
              onChange={(e) => handleChange('leftTextSuffix', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Promotional Coupon Code</label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
              <input
                type="text"
                value={formData.promoCode}
                onChange={(e) => handleChange('promoCode', e.target.value.toUpperCase())}
                className="w-full h-10 pl-10 pr-3.5 text-xs font-extrabold font-mono text-orange-600 bg-orange-50/60 border border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile App Alert Text</label>
            <input
              type="text"
              value={formData.appStoreAlertMessage}
              onChange={(e) => handleChange('appStoreAlertMessage', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 pt-3">
          Right Utility Link Labels
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Download App Label</label>
            <input
              type="text"
              value={formData.downloadAppText}
              onChange={(e) => handleChange('downloadAppText', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Track Order Label</label>
            <input
              type="text"
              value={formData.trackOrderText}
              onChange={(e) => handleChange('trackOrderText', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Help &amp; Support Label</label>
            <input
              type="text"
              value={formData.helpText}
              onChange={(e) => handleChange('helpText', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
