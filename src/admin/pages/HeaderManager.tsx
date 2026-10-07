import React, { useState, useEffect } from 'react';
import { Check, Compass } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { HeaderConfig } from '../types';

export const HeaderManager: React.FC = () => {
  const { config, updateHeader } = useAdminConfig();
  const [formData, setFormData] = useState<HeaderConfig>(config.header);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(config.header);
  }, [config.header]);

  const notifySaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleChange = (field: keyof HeaderConfig, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateHeader(updated);
    notifySaved();
  };

  const handleSaveAllChanges = () => {
    updateHeader(formData);
    notifySaved();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Store Navigation Header</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Main Header &amp; Brand Logo Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Customize the storefront brand logo, logo alt text, and cart button label.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAllChanges}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Publish</span>
          </button>
        </div>
      </div>

      {/* Recommended Logo Dimensions Box */}
      <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-black text-purple-900 flex items-center gap-1.5 flex-wrap">
            <span>📐 Recommended Header Logo Dimensions:</span>
            <span className="bg-purple-200 text-purple-950 px-2.5 py-0.5 rounded-md font-black">
              300 × 80 px
            </span>
            <span className="text-purple-700 font-bold">(Transparent PNG / SVG preferred)</span>
          </div>
          <p className="text-purple-700 font-medium">
            Use a transparent background logo (horizontal orientation) so it blends seamlessly with the white navbar across mobile and desktop.
          </p>
        </div>
        <div className="shrink-0 bg-white border border-purple-200 px-3 py-1.5 rounded-xl font-bold text-slate-700 shadow-2xs">
          PNG / WebP / SVG (Max 1MB)
        </div>
      </div>

      {/* Live Saved Notification Banner */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✓ Main Header Changes Saved &amp; Live on the Main Storefront!</span>
        </div>
      )}

      {/* Brand Logo & Header Buttons Configuration */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Brand Logo &amp; Button Text
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <AdminImageUpload
              value={formData.logoUrl}
              onChange={(val) => handleChange('logoUrl', val)}
              label="Storefront Brand Logo"
              aspectRatio="auto"
              recommendedDimensions="300 × 80 px (Transparent PNG)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Logo Alt Description</label>
            <input
              type="text"
              value={formData.logoAlt}
              onChange={(e) => handleChange('logoAlt', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Cart Button Text</label>
            <input
              type="text"
              value={formData.cartButtonText || 'Cart'}
              onChange={(e) => handleChange('cartButtonText', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Save Changes Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Changes saved here update the main storefront navigation and logo in real-time.
          </p>
          <button
            onClick={handleSaveAllChanges}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Publish Header Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
