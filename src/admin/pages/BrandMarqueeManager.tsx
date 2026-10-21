import React, { useState } from 'react';
import { Award, Plus, Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { PartnerBrand } from '../types';

export const BrandMarqueeManager: React.FC = () => {
  const { config, updateBrandMarquee } = useAdminConfig();
  const [formData, setFormData] = useState(config.brandMarquee);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateField = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateBrandMarquee({ [field]: value });
    notifySaved();
  };

  const handleToggleBrand = (id: string) => {
    const currentBrands = formData.brands || [];
    const updatedBrands = currentBrands.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b));
    handleUpdateField('brands', updatedBrands);
  };

  const handleDeleteBrand = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete brand partner "${name}"?`)) {
      const currentBrands = formData.brands || [];
      const updatedBrands = currentBrands.filter((b) => b.id !== id);
      handleUpdateField('brands', updatedBrands);
    }
  };

  const handleAddBrand = () => {
    const currentBrands = formData.brands || [];
    const finalName = newBrandName.trim() || `New Brand Partner ${currentBrands.length + 1}`;
    const newBrand: PartnerBrand = {
      id: `b-${Date.now()}`,
      name: finalName,
      logo: newBrandLogo.trim() || '/farminix_logo.png',
      enabled: true,
      order: currentBrands.length + 1,
    };
    const updatedBrands = [...currentBrands, newBrand];
    handleUpdateField('brands', updatedBrands);
    setNewBrandName('');
    setNewBrandLogo('');
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
            <Award className="w-4 h-4" />
            <span>Partnership Showcase</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Brand Partners Marquee
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage the continuous infinite partner brand marquee strip, logos, titles, and partner additions.
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
            <span>{formData.enabled ? 'Marquee Visible' : 'Marquee Hidden'}</span>
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Live Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Section Headings */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Section Titles &amp; Copy
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Top Badge Text</label>
            <input
              type="text"
              value={formData.badgeText}
              onChange={(e) => handleUpdateField('badgeText', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Main Section Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleUpdateField('title', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Subtitle Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleUpdateField('description', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Add New Brand */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          2. Add Partner Brand Logo
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand Name</label>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="E.g., Nestle, Mother Dairy..."
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <AdminImageUpload
              value={newBrandLogo}
              onChange={setNewBrandLogo}
              label="Brand Logo Upload"
              aspectRatio="auto"
            />
            <button
              onClick={handleAddBrand}
              className="w-full h-10 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Brand Partner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Existing Brands Grid */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          3. Existing Brands in Marquee ({(formData.brands || []).length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
          {(formData.brands || []).map((brand) => (
            <div
              key={brand.id}
              className={`admin-panel p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                brand.enabled ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-250 opacity-60'
              }`}
            >
              <AdminImageUpload
                value={brand.logo}
                onChange={(val) => {
                  const updated = formData.brands.map((b) => (b.id === brand.id ? { ...b, logo: val } : b));
                  handleUpdateField('brands', updated);
                }}
                label={`${brand.name} Logo`}
                aspectRatio="auto"
              />

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Partner Name</label>
                <input
                  type="text"
                  value={brand.name}
                  onChange={(e) => {
                    const updated = formData.brands.map((b) => (b.id === brand.id ? { ...b, name: e.target.value } : b));
                    handleUpdateField('brands', updated);
                  }}
                  className="w-full h-8 px-2.5 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleToggleBrand(brand.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    brand.enabled
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {brand.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{brand.enabled ? 'Visible' : 'Hidden'}</span>
                </button>
                <button
                  onClick={() => handleDeleteBrand(brand.id, brand.name)}
                  className="p-1.5 text-slate-450 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
