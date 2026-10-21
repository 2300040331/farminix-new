import React, { useState } from 'react';
import { Package, Check, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { BottomBoxConfig } from '../types';

export const BottomFeatureStripManager: React.FC = () => {
  const { config, updateBottomFeatureStrip } = useAdminConfig();
  const [formData, setFormData] = useState(config.bottomFeatureStrip);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleSection = () => {
    const updated = { ...formData, enabled: !formData.enabled };
    setFormData(updated);
    updateBottomFeatureStrip({ enabled: !formData.enabled });
    notifySaved();
  };

  const handleBoxChange = (id: number, field: keyof BottomBoxConfig, value: any) => {
    const updatedBoxes = formData.boxes.map((b) => (b.id === id ? { ...b, [field]: value } : b));
    const updated = { ...formData, boxes: updatedBoxes };
    setFormData(updated);
    updateBottomFeatureStrip({ boxes: updatedBoxes });
    notifySaved();
  };

  const handleAddBox = () => {
    const newBox: BottomBoxConfig = {
      id: Date.now(),
      iconName: 'Package',
      title: `New Benefit Card ${formData.boxes.length + 1}`,
      subtitle: 'Premium Guarantee',
      bgColor: 'bg-emerald-100',
      enabled: true,
      order: formData.boxes.length + 1,
    };
    const updatedBoxes = [...formData.boxes, newBox];
    const updated = { ...formData, boxes: updatedBoxes };
    setFormData(updated);
    updateBottomFeatureStrip({ boxes: updatedBoxes });
    notifySaved();
  };

  const handleDeleteBox = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete benefit card "${title}"?`)) {
      const updatedBoxes = formData.boxes.filter((b) => b.id !== id);
      const updated = { ...formData, boxes: updatedBoxes };
      setFormData(updated);
      updateBottomFeatureStrip({ boxes: updatedBoxes });
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
            <Package className="w-4 h-4" />
            <span>Storefront Guarantees</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bottom Benefits Strip Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure the 4 customer assurance boxes at the bottom: No Min Order, Easy Returns, 24/7 Support, Quality Assured.
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

      {/* Benefit Cards List Header */}
      <div className="admin-panel flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <h2 className="text-sm font-black text-slate-900">
          Benefit Assurance Cards List ({formData.boxes.length})
        </h2>
        <button
          onClick={handleAddBox}
          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-2xs animate-pulse"
        >
          <Plus className="w-4 h-4" />
          <span>Add Benefit Card</span>
        </button>
      </div>

      {/* Benefit Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {formData.boxes.map((box, idx) => (
          <div
            key={box.id}
            className={`admin-panel bg-white p-5 rounded-3xl border space-y-3 transition-all ${
              box.enabled ? 'border-slate-200 shadow-2xs' : 'border-slate-200/50 bg-slate-50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-purple-700">Benefit #{idx + 1}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleBoxChange(box.id, 'enabled', !box.enabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    box.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-655'
                  }`}
                >
                  {box.enabled ? 'Active' : 'Hidden'}
                </button>
                <button
                  onClick={() => handleDeleteBox(box.id, box.title)}
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
                value={box.title}
                onChange={(e) => handleBoxChange(box.id, 'title', e.target.value)}
                className="w-full h-9 px-3 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={box.subtitle}
                onChange={(e) => handleBoxChange(box.id, 'subtitle', e.target.value)}
                className="w-full h-9 px-3 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Icon Accent BG</label>
              <input
                type="text"
                value={box.bgColor}
                onChange={(e) => handleBoxChange(box.id, 'bgColor', e.target.value)}
                className="w-full h-9 px-3 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
