import React, { useState } from 'react';
import { Image, Check, Eye, EyeOff } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { HeroConfig } from '../types';

export const HeroManager: React.FC = () => {
  const { config, updateHero } = useAdminConfig();
  const [formData, setFormData] = useState<HeroConfig>(config.hero);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof HeroConfig, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateHero({ [field]: value });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Image className="w-4 h-4" />
            <span>Homepage Focal Banner</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Hero Banner Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Replace the primary storefront hero artwork, clickable action hotspots, and banner alt texts.
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
            <span>{formData.enabled ? 'Hero Banner Active' : 'Hero Banner Hidden'}</span>
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Live Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Live Visual Preview */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Banner Preview</div>
        <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group bg-slate-950">
          <img
            src={formData.bannerImage}
            alt={formData.altText}
            className="w-full h-auto object-cover max-h-[360px]"
          />
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[11px] font-bold">
            Target URL: {formData.shopNowUrl}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Banner Settings &amp; Navigation Targets
        </h2>

        <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mb-4">
          <div className="space-y-1">
            <div className="font-black text-purple-900 flex items-center gap-1.5 flex-wrap">
              <span>📐 Recommended Banner Dimensions:</span>
              <span className="bg-purple-200 text-purple-950 px-2 py-0.5 rounded-md font-black">1920 × 1080 px</span>
              <span className="text-purple-700 font-bold">(16:9 Widescreen Ratio)</span>
            </div>
            <p className="text-purple-700 font-medium">
              Use a 16:9 ratio image (1920 × 1080px or minimum 1280 × 720px) so the banner occupies the full width and height with zero white margins.
            </p>
          </div>
          <div className="shrink-0 bg-white border border-purple-200 px-3 py-1.5 rounded-xl font-bold text-slate-700 shadow-2xs">
            JPG / PNG / WebP (Max 2MB)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <AdminImageUpload
              value={formData.bannerImage}
              onChange={(val) => handleChange('bannerImage', val)}
              label="Hero Banner Image"
              aspectRatio="video"
              recommendedDimensions="1920 × 1080 px (16:9 ratio)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Banner Alt Description</label>
            <input
              type="text"
              value={formData.altText}
              onChange={(e) => handleChange('altText', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Shop Now CTA Destination Link</label>
            <input
              type="text"
              value={formData.shopNowUrl}
              onChange={(e) => handleChange('shopNowUrl', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Home Logo Hotspot Destination Link</label>
            <input
              type="text"
              value={formData.homeUrl}
              onChange={(e) => handleChange('homeUrl', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Changes saved here are instantly published and visible on the main website.
          </p>
          <button
            onClick={() => {
              updateHero(formData);
              setSavedSuccess(true);
              setTimeout(() => setSavedSuccess(false), 2500);
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Publish Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
