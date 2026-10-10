import React, { useState } from 'react';
import {
  Heart,
  Save,
  CheckCircle2,
  Quote,
  Plus,
  Trash2,
  ExternalLink,
  Leaf,
} from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { defaultAboutPageConfig } from '../defaultConfig';
import type { AboutPageConfig } from '../types';

export const AboutFarminixManager: React.FC = () => {
  const { config, updateAboutPage } = useAdminConfig();
  const initialData: AboutPageConfig = config.aboutPage || defaultAboutPageConfig;

  const [formData, setFormData] = useState<AboutPageConfig>(initialData);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    updateAboutPage(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTagChange = (index: number, val: string) => {
    const updated = [...formData.tags];
    updated[index] = val;
    setFormData({ ...formData, tags: updated });
  };

  const handleAddTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, 'New Quality Badge'] });
  };

  const handleRemoveTag = (index: number) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
  };

  const handleStepChange = (index: number, field: 'step' | 'title' | 'desc', val: string) => {
    const updated = [...formData.processSteps];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, processSteps: updated });
  };

  const handlePillarChange = (
    index: number,
    field: 'tag' | 'title' | 'desc' | 'guarantee',
    val: string
  ) => {
    const updated = [...formData.philosophyPillars];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, philosophyPillars: updated });
  };

  return (
    <div className="space-y-8 text-left pb-16">
      {/* ── TOP HEADER & SAVE BAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold">
              <Heart className="w-4 h-4 fill-purple-600 text-purple-600" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              About Farminix Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize the brand narrative, founder's reflection letter, farm-to-table steps, and operating philosophy on <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded">/about</code>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <a
            href="/about"
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
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Changes Saved &amp; Live!</span>
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

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>About Farminix content saved! Changes are live on https://farminix.vercel.app/about</span>
        </div>
      )}

      {/* ── 1. MAIN HEADLINE & QUALITY BADGES ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-600" />
          <span>Main Headline &amp; Slogan</span>
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Main Headline</label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
              placeholder="About Farminix. Authentic Everyday Staples."
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Mission Statement / Subheadline</label>
            <textarea
              rows={2}
              value={formData.subheadline}
              onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#7C3AED] focus:bg-white focus:outline-none leading-relaxed"
            />
          </div>

          {/* Quality Badges */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase">Quality Badges</label>
              <button
                type="button"
                onClick={handleAddTag}
                className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Badge</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-xl px-2 py-1">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleTagChange(idx, e.target.value)}
                    className="bg-transparent text-xs font-bold text-purple-900 focus:outline-none w-48"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-purple-400 hover:text-rose-600 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FOUNDER'S REFLECTION LETTER ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Quote className="w-4 h-4 text-amber-600" />
          <span>Founder's Reflection &amp; Authentic Letter</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Section Header</label>
            <input
              type="text"
              value={formData.founderTitle}
              onChange={(e) => setFormData({ ...formData, founderTitle: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Subtitle Banner</label>
            <input
              type="text"
              value={formData.founderSubtitle}
              onChange={(e) => setFormData({ ...formData, founderSubtitle: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase">The Founder's Letter (Body)</label>
            <textarea
              rows={5}
              value={formData.founderLetter}
              onChange={(e) => setFormData({ ...formData, founderLetter: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#7C3AED] focus:bg-white focus:outline-none leading-relaxed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Central Highlight Quote</label>
            <input
              type="text"
              value={formData.founderQuote}
              onChange={(e) => setFormData({ ...formData, founderQuote: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Closing Sign-off Narrative</label>
            <textarea
              rows={4}
              value={formData.founderSignoff}
              onChange={(e) => setFormData({ ...formData, founderSignoff: e.target.value })}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#7C3AED] focus:bg-white focus:outline-none leading-relaxed"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase">Registered Company Address</label>
            <input
              type="text"
              value={formData.companyAddress}
              onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── 3. FROM SOIL TO DINING TABLE (4 STEPS) ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-black text-slate-900">
            🌾 From Soil to Dining Table (4 Process Steps)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            The farm-to-table journey explaining how Farminix eliminates middlemen and godowns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.processSteps.map((step, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={step.step}
                  onChange={(e) => handleStepChange(idx, 'step', e.target.value)}
                  className="w-12 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-center text-[#7C3AED]"
                />
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                  className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900"
                />
              </div>
              <textarea
                rows={2}
                value={step.desc}
                onChange={(e) => handleStepChange(idx, 'desc', e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-[#7C3AED] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. OPERATING PHILOSOPHY (4 PILLARS) ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-black text-slate-900">
            🛡️ Our Operating Philosophy (4 Pillars)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dignity, Health, Durable Packaging, and Direct-to-Home pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.philosophyPillars.map((p, idx) => (
            <div key={idx} className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={p.tag}
                  onChange={(e) => handlePillarChange(idx, 'tag', e.target.value)}
                  className="p-1.5 bg-white border border-emerald-200 rounded-lg text-[11px] font-black text-emerald-800"
                  placeholder="Tag"
                />
                <input
                  type="text"
                  value={p.guarantee}
                  onChange={(e) => handlePillarChange(idx, 'guarantee', e.target.value)}
                  className="p-1.5 bg-white border border-emerald-200 rounded-lg text-[11px] font-extrabold text-slate-700"
                  placeholder="Guarantee"
                />
              </div>
              <input
                type="text"
                value={p.title}
                onChange={(e) => handlePillarChange(idx, 'title', e.target.value)}
                className="w-full p-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-black text-slate-900"
                placeholder="Pillar Title"
              />
              <textarea
                rows={2}
                value={p.desc}
                onChange={(e) => handlePillarChange(idx, 'desc', e.target.value)}
                className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:outline-none"
                placeholder="Pillar Description"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. CONTACT & HELPLINE ── */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-base font-black text-slate-900">
          📞 Customer Support &amp; Origin
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Support Phone</label>
            <input
              type="text"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Support Email</label>
            <input
              type="text"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase">Location</label>
            <input
              type="text"
              value={formData.contactLocation}
              onChange={(e) => setFormData({ ...formData, contactLocation: e.target.value })}
              className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-[#7C3AED] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
