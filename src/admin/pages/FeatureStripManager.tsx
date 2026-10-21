import React, { useState } from 'react';
import { Zap, Check, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { FeatureCard } from '../types';

export const FeatureStripManager: React.FC = () => {
  const { config, updateFeatureStrip } = useAdminConfig();
  const [formData, setFormData] = useState(config.featureStrip);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleSection = () => {
    const updated = { ...formData, enabled: !formData.enabled };
    setFormData(updated);
    updateFeatureStrip({ enabled: !formData.enabled });
    notifySaved();
  };

  const handleCardChange = (id: number, field: keyof FeatureCard, value: any) => {
    const updatedFeatures = formData.features.map((f) => (f.id === id ? { ...f, [field]: value } : f));
    const updated = { ...formData, features: updatedFeatures };
    setFormData(updated);
    updateFeatureStrip({ features: updatedFeatures });
    notifySaved();
  };

  const handleAddFeature = () => {
    const newFeature: FeatureCard = {
      id: Date.now(),
      iconName: 'Zap',
      title: `New Feature Card ${formData.features.length + 1}`,
      subtitle: 'Premium Choice',
      bgColor: 'bg-purple-100',
      enabled: true,
      order: formData.features.length + 1,
    };
    const updatedFeatures = [...formData.features, newFeature];
    const updated = { ...formData, features: updatedFeatures };
    setFormData(updated);
    updateFeatureStrip({ features: updatedFeatures });
    notifySaved();
  };

  const handleDeleteFeature = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete feature card "${title}"?`)) {
      const updatedFeatures = formData.features.filter((f) => f.id !== id);
      const updated = { ...formData, features: updatedFeatures };
      setFormData(updated);
      updateFeatureStrip({ features: updatedFeatures });
      notifySaved();
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
            <Zap className="w-4 h-4" />
            <span>Trust Badges</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Top 5 Feature Strip Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Customize the 5 benefit cards: 10 Min Delivery, Quality Assured, Best Prices, Safe &amp; Secure, and 24/7 Support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSection}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              formData.enabled
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {formData.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{formData.enabled ? 'Strip Visible' : 'Strip Hidden'}</span>
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Live Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Cards List Header */}
      <div className="admin-panel flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <h2 className="text-sm font-black text-slate-900">
          Feature Cards List ({formData.features.length})
        </h2>
        <button
          onClick={handleAddFeature}
          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-2xs animate-pulse"
        >
          <Plus className="w-4 h-4" />
          <span>Add Feature Card</span>
        </button>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formData.features.map((feature, idx) => (
          <div
            key={feature.id}
            className={`admin-panel bg-white p-5 rounded-3xl border space-y-3 transition-all ${
              feature.enabled ? 'border-slate-200 shadow-2xs' : 'border-slate-200/50 bg-slate-50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-purple-700">Card #{idx + 1}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCardChange(feature.id, 'enabled', !feature.enabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    feature.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {feature.enabled ? 'Active' : 'Hidden'}
                </button>
                <button
                  onClick={() => handleDeleteFeature(feature.id, feature.title)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={feature.title}
                onChange={(e) => handleCardChange(feature.id, 'title', e.target.value)}
                className="w-full h-9 px-3 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={feature.subtitle}
                onChange={(e) => handleCardChange(feature.id, 'subtitle', e.target.value)}
                className="w-full h-9 px-3 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Icon Accent BG</label>
              <input
                type="text"
                value={feature.bgColor}
                onChange={(e) => handleCardChange(feature.id, 'bgColor', e.target.value)}
                placeholder="bg-purple-100, bg-emerald-100..."
                className="w-full h-9 px-3 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
