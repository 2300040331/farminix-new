import React, { useState } from 'react';
import { Palette, Check, RotateCcw, Sparkles } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { ThemeTokens } from '../types';
import { defaultThemeTokens } from '../defaultConfig';

const PRESET_THEMES: { name: string; desc: string; tokens: Partial<ThemeTokens> }[] = [
  {
    name: 'Farminix Original (Purple & Green)',
    desc: 'Signature Farminix brand identity with deep royal violet and crisp emerald fresh accents.',
    tokens: {
      colorPrimary: '#7C3AED',
      colorPrimaryHover: '#6D28D9',
      colorSecondary: '#15803D',
      colorSecondaryHover: '#166534',
      colorAccent: '#EA580C',
      navbarBackground: '#EDE9FE',
      navbarBorderColor: '#DDD6FE',
      navbarTextColor: '#5B21B6',
      navbarActiveColor: '#6D28D9',
      navbarCategoriesBtnBg: '#DCFCE7',
      navbarCategoriesBtnText: '#15803D',
      btnPrimaryBg: '#7C3AED',
      footerBg: '#0F172A',
    },
  },
  {
    name: 'Fresh Organic Garden (Emerald & Citrus)',
    desc: 'Earthy rich greens with radiant citrus orange for an all-organic supermarket aesthetic.',
    tokens: {
      colorPrimary: '#059669',
      colorPrimaryHover: '#047857',
      colorSecondary: '#D97706',
      colorSecondaryHover: '#B45309',
      colorAccent: '#F59E0B',
      navbarBackground: '#D1FAE5',
      navbarBorderColor: '#A7F3D0',
      navbarTextColor: '#065F46',
      navbarActiveColor: '#047857',
      navbarCategoriesBtnBg: '#FEF3C7',
      navbarCategoriesBtnText: '#B45309',
      btnPrimaryBg: '#059669',
      footerBg: '#064E3B',
    },
  },
  {
    name: 'Royal Midnight Sapphire (Deep Navy & Gold)',
    desc: 'Luxurious ultra-premium grocery store look with navy blue and gold touches.',
    tokens: {
      colorPrimary: '#1E3A8A',
      colorPrimaryHover: '#1E40AF',
      colorSecondary: '#CA8A04',
      colorSecondaryHover: '#A16207',
      colorAccent: '#DC2626',
      navbarBackground: '#DBEAFE',
      navbarBorderColor: '#BFDBFE',
      navbarTextColor: '#1E3A8A',
      navbarActiveColor: '#1D4ED8',
      navbarCategoriesBtnBg: '#FEF9C3',
      navbarCategoriesBtnText: '#854D0E',
      btnPrimaryBg: '#1E3A8A',
      footerBg: '#0F172A',
    },
  },
];

export const ThemeManager: React.FC = () => {
  const { config, updateTheme } = useAdminConfig();
  const [tokens, setTokens] = useState<ThemeTokens>(config.theme);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleColorChange = (key: keyof ThemeTokens, value: string) => {
    const updated = { ...tokens, [key]: value };
    setTokens(updated);
    // Instant live reflection
    updateTheme({ [key]: value });
  };

  const handleApplyPreset = (presetTokens: Partial<ThemeTokens>) => {
    const updated = { ...tokens, ...presetTokens };
    setTokens(updated);
    updateTheme(presetTokens);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetToDefault = () => {
    setTokens(defaultThemeTokens);
    updateTheme(defaultThemeTokens);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const ColorInput: React.FC<{
    label: string;
    tokenKey: keyof ThemeTokens;
    helper?: string;
  }> = ({ label, tokenKey, helper }) => (
    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col justify-between gap-2">
      <div>
        <div className="text-xs font-bold text-slate-800">{label}</div>
        {helper && <div className="text-[10px] text-slate-500">{helper}</div>}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div
          className="w-8 h-8 rounded-lg border border-slate-300 shadow-2xs shrink-0 cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: tokens[tokenKey] }}
        >
          <input
            type="color"
            value={tokens[tokenKey]}
            onChange={(e) => handleColorChange(tokenKey, e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={tokens[tokenKey]}
          onChange={(e) => handleColorChange(tokenKey, e.target.value)}
          className="w-full text-xs font-mono font-bold text-slate-800 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 uppercase"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4" />
            <span>Theme &amp; Design Token Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Color &amp; Appearance Control
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Adjust store brand colors, headers, buttons, hero cards, and footer styles. Every change updates the public website in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetToDefault}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Preset Palettes */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-900">Curated Farminix Theme Presets</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_THEMES.map((preset) => (
            <div
              key={preset.name}
              onClick={() => handleApplyPreset(preset.tokens)}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-purple-50/40 hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                    {preset.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-4 h-4 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: preset.tokens.colorPrimary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: preset.tokens.colorSecondary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: preset.tokens.colorAccent }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">{preset.desc}</p>
              </div>
              <button className="mt-3 w-full py-1.5 bg-white group-hover:bg-purple-600 text-slate-700 group-hover:text-white text-xs font-bold rounded-lg border border-slate-200 group-hover:border-purple-600 transition-all">
                Apply Theme Preset
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Brand & Core Global Colors */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Brand &amp; Accent Colors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorInput label="Primary Brand Color" tokenKey="colorPrimary" helper="Buttons, search highlight, price tags" />
          <ColorInput label="Primary Hover Color" tokenKey="colorPrimaryHover" helper="Hover state for primary buttons" />
          <ColorInput label="Secondary Fresh Color" tokenKey="colorSecondary" helper="Category badges, fresh indicators" />
          <ColorInput label="Accent / Alert Color" tokenKey="colorAccent" helper="HOT offers, discounts, cart badges" />
        </div>
      </div>

      {/* Header & Navigation Colors */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          2. Header &amp; Navigation Bar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorInput label="Header Background" tokenKey="headerBackground" helper="Main sticky top header bar" />
          <ColorInput label="Navbar Strip Background" tokenKey="navbarBackground" helper="Category menu bar background" />
          <ColorInput label="Navbar Text Color" tokenKey="navbarTextColor" helper="Links in navigation bar" />
          <ColorInput label="Navbar Active Link" tokenKey="navbarActiveColor" helper="Active tab underline &amp; text" />
          <ColorInput label="Categories Pill Bg" tokenKey="navbarCategoriesBtnBg" helper="Categories dropdown button" />
          <ColorInput label="Categories Pill Text" tokenKey="navbarCategoriesBtnText" helper="Categories button text color" />
        </div>
      </div>

      {/* Buttons & Cards */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          3. Buttons &amp; Product Cards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorInput label="Primary Button Background" tokenKey="btnPrimaryBg" helper="+ Add to cart, Search buttons" />
          <ColorInput label="Primary Button Text" tokenKey="btnPrimaryText" helper="Text color on primary buttons" />
          <ColorInput label="Card Background" tokenKey="cardBg" helper="Product &amp; category card surface" />
          <ColorInput label="Card Price Highlight" tokenKey="cardPriceColor" helper="Product price text color" />
        </div>
      </div>

      {/* Epic Deals Section & Footer */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          4. Deals Banner &amp; Footer Styling
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ColorInput label="Deals Gradient Start" tokenKey="dealsBannerBgStart" helper="Epic Deals section banner start" />
          <ColorInput label="Deals Gradient Middle" tokenKey="dealsBannerBgMiddle" helper="Epic Deals banner middle" />
          <ColorInput label="Deals Gradient End" tokenKey="dealsBannerBgEnd" helper="Epic Deals banner end" />
          <ColorInput label="Footer Background" tokenKey="footerBg" helper="Global footer background" />
        </div>
      </div>
    </div>
  );
};
