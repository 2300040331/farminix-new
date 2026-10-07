import React, { useState } from 'react';
import {
  Factory,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { defaultManufacturerConfig } from '../defaultConfig';
import type { ManufacturerConfig } from '../types';

export const ManufacturerManager: React.FC = () => {
  const { config, updateManufacturer } = useAdminConfig();
  const initialData: ManufacturerConfig = config.manufacturer || defaultManufacturerConfig;

  const [formData, setFormData] = useState<ManufacturerConfig>({
    ...initialData,
    comingSoonMode: true,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    const updated = {
      ...formData,
      comingSoonMode: true,
    };
    updateManufacturer(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 text-left pb-16">
      {/* ── TOP HEADER & SAVE BAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold">
              <Factory className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manufacturer Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure the Coming Soon page displayed to visitors at{' '}
            <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded">/manufacturer</code>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="/manufacturer"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-purple-300 text-xs font-bold text-slate-700 hover:text-[#7C3AED] transition-colors flex items-center gap-1.5 bg-slate-50 hover:bg-white"
          >
            <span>Preview Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            {saveSuccess ? (
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
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Manufacturer Coming Soon settings saved and published live to https://farminix.vercel.app/manufacturer</span>
        </div>
      )}

      {/* ── COMING SOON CONTENT CONFIGURATION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Fields (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <span>Coming Soon Content Details</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase">
                Page Heading Title
              </label>
              <input
                type="text"
                value={formData.comingSoonTitle || 'Manufacturer'}
                onChange={(e) =>
                  setFormData({ ...formData, comingSoonTitle: e.target.value })
                }
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                placeholder="Manufacturer"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase">
                Pill Badge Text
              </label>
              <input
                type="text"
                value={formData.comingSoonBadge || 'Coming Soon'}
                onChange={(e) =>
                  setFormData({ ...formData, comingSoonBadge: e.target.value })
                }
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                placeholder="Coming Soon"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase">
                Description / Message
              </label>
              <textarea
                rows={3}
                value={
                  formData.comingSoonText ||
                  "We're working on something exciting. This page will be available soon with all the details you need."
                }
                onChange={(e) =>
                  setFormData({ ...formData, comingSoonText: e.target.value })
                }
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#7C3AED] focus:bg-white focus:outline-none leading-relaxed"
                placeholder="We're working on something exciting. This page will be available soon with all the details you need."
              />
            </div>
          </div>
        </div>

        {/* Right Preview: Live Visual Display (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-black text-slate-900">Live Customer Preview</h2>
          <p className="text-xs text-slate-500">
            This is exactly how visitors see the Manufacturer page:
          </p>

          <div className="p-6 bg-gradient-to-b from-purple-50/40 to-white rounded-2xl border border-purple-100 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
            {/* Top mini back button */}
            <div className="w-full flex justify-start -mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-2">
              {formData.comingSoonTitle || 'Manufacturer'}
            </h3>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
              <span className="text-xs font-bold text-[#7C3AED] tracking-wide">
                {formData.comingSoonBadge || 'Coming Soon'}
              </span>
            </div>

            {/* Text */}
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
              {formData.comingSoonText ||
                "We're working on something exciting. This page will be available soon with all the details you need."}
            </p>

            {/* Button */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
