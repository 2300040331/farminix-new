import React, { useState } from 'react';
import { Grid, Plus, Trash2, Check, Eye, EyeOff, Layers } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { Category } from '../../types';

export const CategoryManager: React.FC = () => {
  const { config, updateCategories, updateCategorySection } = useAdminConfig();
  const [sectionConfig, setSectionConfig] = useState(config.categorySection);
  const [categoriesList, setCategoriesList] = useState<Category[]>(config.categories);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatItemCount, setNewCatItemCount] = useState(30);

  const notifySaved = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdateSectionTitle = (title: string) => {
    const updated = { ...sectionConfig, title };
    setSectionConfig(updated);
    updateCategorySection(updated);
    notifySaved();
  };

  const handleToggleSection = () => {
    const updated = { ...sectionConfig, enabled: !sectionConfig.enabled };
    setSectionConfig(updated);
    updateCategorySection(updated);
    notifySaved();
  };

  const handleAddCategory = () => {
    const finalName = newCatName.trim() || `New Category ${categoriesList.length + 1}`;
    const newCategory: Category = {
      id: finalName.toLowerCase().replace(/[^a-z0-9]/g, '') || `cat_${Date.now()}`,
      name: finalName,
      image: newCatImage.trim() || '/cat_dals.jpg',
      itemCount: Number(newCatItemCount) || 1,
      enabled: true, // Enabled / Visible by default
    };
    const updated = [...categoriesList, newCategory];
    setCategoriesList(updated);
    updateCategories(updated);
    setNewCatName('');
    setNewCatImage('');
    setNewCatItemCount(30);
    notifySaved();
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"? This will remove it from the store.`)) {
      const updated = categoriesList.filter((c) => c.id !== id);
      setCategoriesList(updated);
      updateCategories(updated);
      notifySaved();
    }
  };

  const handleEditCategory = (id: string, field: keyof Category, value: any) => {
    const updated = categoriesList.map((c) => (c.id === id ? { ...c, [field]: value } : c));
    setCategoriesList(updated);
    updateCategories(updated);
    notifySaved();
  };

  const handleSaveAllChanges = () => {
    updateCategories(categoriesList);
    updateCategorySection(sectionConfig);
    notifySaved();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Grid className="w-4 h-4" />
            <span>Storefront Department Catalog</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Shop by Category Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Add new categories, edit names/counts, change pictures, hide/show on store, or delete categories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSection}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              sectionConfig.enabled
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {sectionConfig.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{sectionConfig.enabled ? 'Section Visible' : 'Section Hidden'}</span>
          </button>

          <button
            onClick={handleSaveAllChanges}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Publish</span>
          </button>
        </div>
      </div>

      {/* Recommended Image Dimensions Notice Box */}
      <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="font-black text-purple-900 flex items-center gap-1.5 flex-wrap">
            <span>📐 Recommended Category Image Dimensions:</span>
            <span className="bg-purple-200 text-purple-950 px-2.5 py-0.5 rounded-md font-black">
              500 × 500 px
            </span>
            <span className="text-purple-700 font-bold">(1:1 Square Ratio)</span>
          </div>
          <p className="text-purple-700 font-medium">
            Use a 1:1 square ratio image (500 × 500 px or minimum 300 × 300 px) with a clean or transparent background so the category card looks crisp and fits uniformly without cropping.
          </p>
        </div>
        <div className="shrink-0 bg-white border border-purple-200 px-3 py-1.5 rounded-xl font-bold text-slate-700 shadow-2xs">
          JPG / PNG / WebP (Max 2MB)
        </div>
      </div>

      {/* Live Saved Notification Banner */}
      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✓ All Category Changes Saved &amp; Live on the Main Storefront!</span>
        </div>
      )}

      {/* Section 1: Title Configuration */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <span>1. Section Header Copy</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Section Title</label>
            <input
              type="text"
              value={sectionConfig.title}
              onChange={(e) => handleUpdateSectionTitle(e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">See All Button Text</label>
            <input
              type="text"
              value={sectionConfig.seeAllText}
              onChange={(e) => {
                const updated = { ...sectionConfig, seeAllText: e.target.value };
                setSectionConfig(updated);
                updateCategorySection(updated);
                notifySaved();
              }}
              className="w-full h-10 px-3.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Add New Category Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-600" />
            <span>2. Add New Category</span>
          </h2>
          <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
            📐 Fit Size: 500 × 500 px
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-4 sm:col-span-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Category Name *</label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="E.g., Organic Honey &amp; Spreads, Dry Fruits..."
                className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <AdminImageUpload
              value={newCatImage}
              onChange={setNewCatImage}
              label="Category Image Artwork"
              aspectRatio="square"
              recommendedDimensions="500 × 500 px (1:1 ratio)"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Estimated Item Count</label>
              <input
                type="text"
                value={newCatItemCount}
                onChange={(e) => setNewCatItemCount(Number(e.target.value.replace(/\D/g, '')) || 0)}
                placeholder="30"
                className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 mb-3"
              />
            </div>

            <button
              onClick={handleAddCategory}
              disabled={!newCatName.trim()}
              className="w-full h-11 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-600/20 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category to Store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Existing Categories List with Add, Delete, Hide/Show, and Edit */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              3. Manage All Categories ({categoriesList.length})
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Every category below has options to <strong>Edit</strong> name/image/count, <strong>Hide/Show</strong> visibility, or <strong>Delete</strong>.
            </p>
          </div>
          <div className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-xl">
            {categoriesList.filter((c) => c.enabled !== false).length} Visible •{' '}
            {categoriesList.filter((c) => c.enabled === false).length} Hidden
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesList.map((cat, index) => {
            const isEnabled = cat.enabled !== false;
            return (
              <div
                key={cat.id}
                className={`p-4 rounded-2xl border bg-white shadow-2xs space-y-3 flex flex-col justify-between transition-all ${
                  isEnabled
                    ? 'border-slate-200 opacity-100 ring-1 ring-slate-100'
                    : 'border-amber-200 bg-amber-50/20 opacity-70'
                }`}
              >
                {/* Category Card Header with Status Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-black text-slate-900 truncate max-w-[130px]">
                      {cat.name}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                      isEnabled
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {isEnabled ? '● Live Visible' : '○ Hidden'}
                  </span>
                </div>

                {/* Edit Fields */}
                <div className="space-y-3">
                  {/* Category Image Upload */}
                  <AdminImageUpload
                    value={cat.image}
                    onChange={(val) => handleEditCategory(cat.id, 'image', val)}
                    label="Category Picture (Edit)"
                    aspectRatio="square"
                    recommendedDimensions="500 × 500 px (1:1 ratio)"
                  />

                  {/* Edit Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      Category Name (Edit)
                    </label>
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleEditCategory(cat.id, 'name', e.target.value)}
                      className="w-full h-9 px-3 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Edit Item Count */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      Estimated Item Count
                    </label>
                    <input
                      type="text"
                      value={cat.itemCount}
                      onChange={(e) =>
                        handleEditCategory(
                          cat.id,
                          'itemCount',
                          Number(e.target.value.replace(/\D/g, '')) || 0
                        )
                      }
                      className="w-full h-9 px-3 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Action Buttons: Hide/Show, Delete, Save */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  {/* Hide / Show Toggle Button */}
                  <button
                    onClick={() => handleEditCategory(cat.id, 'enabled', !isEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isEnabled
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-amber-200 text-amber-950 hover:bg-amber-300'
                    }`}
                    title={isEnabled ? 'Click to Hide from Store' : 'Click to Make Visible on Store'}
                  >
                    {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isEnabled ? 'Hide Category' : 'Unhide Category'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Delete Category Button */}
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Save Changes Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Every edit, add, hide/show, or deletion updates the live storefront instantly.
          </p>
          <button
            onClick={handleSaveAllChanges}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Publish All Category Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
