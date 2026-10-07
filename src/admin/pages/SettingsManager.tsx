import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  ShieldCheck,
  Palette,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { ThemeTokens } from '../types';

export const SettingsManager: React.FC = () => {
  const { config, updateTheme, resetToDefaults } = useAdminConfig();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [themeTokens, setThemeTokens] = useState<ThemeTokens>(config.theme);
  const [fssaiNum, setFssaiNum] = useState('20126142000933');
  const [address, setAddress] = useState(
    'Flat No 302, Srinivasa Towers, Gorantla, Guntur – 522034, Andhra Pradesh'
  );
  const [phone, setPhone] = useState('+91 7989743595');
  const [email, setEmail] = useState('info@farminix.in');

  const handleSave = () => {
    updateTheme(themeTokens);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'WARNING: This will reset all store configurations back to default factory settings. Are you sure?'
      )
    ) {
      resetToDefaults();
      alert('All configurations have been reset to factory defaults.');
    }
  };

  return (
    <div className="space-y-8 text-left pb-16">
      {/* ── TOP HEADER & SAVE BAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Settings &amp; Store Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure primary brand theme colors, statutory FSSAI licensing, contact coordinates, and system preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
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

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved! Brand styling and coordinates updated across the platform.</span>
        </div>
      )}

      {/* ── 1. BRAND THEME COLORS ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#7C3AED]" />
          <span>Brand Theme Colors</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Primary Purple</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeTokens.colorPrimary}
                onChange={(e) =>
                  setThemeTokens({ ...themeTokens, colorPrimary: e.target.value })
                }
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
              />
              <input
                type="text"
                value={themeTokens.colorPrimary}
                onChange={(e) =>
                  setThemeTokens({ ...themeTokens, colorPrimary: e.target.value })
                }
                className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Secondary Green</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeTokens.colorSecondary}
                onChange={(e) =>
                  setThemeTokens({ ...themeTokens, colorSecondary: e.target.value })
                }
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
              />
              <input
                type="text"
                value={themeTokens.colorSecondary}
                onChange={(e) =>
                  setThemeTokens({ ...themeTokens, colorSecondary: e.target.value })
                }
                className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Accent Orange</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeTokens.colorAccent}
                onChange={(e) =>
                  setThemeTokens({ ...themeTokens, colorAccent: e.target.value })
                }
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
              />
              <input
                type="text"
                value={themeTokens.colorAccent}
                onChange={(e) =>
                  setThemeTokens({ ...themeTokens, colorAccent: e.target.value })
                }
                className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. STATUTORY & REGULATORY CREDENTIALS ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Statutory &amp; Regulatory Credentials</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Central FSSAI License Number</label>
            <input
              type="text"
              value={fssaiNum}
              onChange={(e) => setFssaiNum(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#7C3AED] focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Customer Support Helpline</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Official Support Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Registered Corporate Office</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── 3. DANGER ZONE ── */}
      <div className="bg-rose-50/60 p-6 sm:p-7 rounded-3xl border border-rose-200 shadow-2xs space-y-3">
        <h2 className="text-base font-black text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Danger Zone: Factory Reset</span>
        </h2>
        <p className="text-xs text-rose-700 leading-relaxed">
          Restore all site configurations, products, navigation items, and theme tokens back to original factory defaults.
        </p>
        <button
          onClick={handleResetDefaults}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Store Settings to Defaults</span>
        </button>
      </div>
    </div>
  );
};
