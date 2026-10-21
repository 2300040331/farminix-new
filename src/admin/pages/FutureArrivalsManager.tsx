import React, { useState } from 'react';
import { Clock, Plus, Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { FutureItemConfig } from '../types';

export const FutureArrivalsManager: React.FC = () => {
  const { config, updateFutureArrivals } = useAdminConfig();
  const [formData, setFormData] = useState(config.futureArrivals);
  const [newItemName, setNewItemName] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemBadge, setNewItemBadge] = useState('Coming Soon');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateField = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateFutureArrivals({ [field]: value });
    notifySaved();
  };

  const handleToggleItem = (id: number) => {
    const currentItems = formData.items || [];
    const updatedItems = currentItems.map((it) => (it.id === id ? { ...it, enabled: !it.enabled } : it));
    handleUpdateField('items', updatedItems);
  };

  const handleDeleteItem = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete upcoming item "${name}"?`)) {
      const currentItems = formData.items || [];
      const updatedItems = currentItems.filter((it) => it.id !== id);
      handleUpdateField('items', updatedItems);
    }
  };

  const handleAddItem = () => {
    const currentItems = formData.items || [];
    const finalName = newItemName.trim() || `New Upcoming Item ${currentItems.length + 1}`;
    const newItem: FutureItemConfig = {
      id: Date.now(),
      name: finalName,
      image: newItemImage.trim(),
      badgeText: newItemBadge.trim() || 'Coming Soon',
      enabled: true,
      order: currentItems.length + 1,
    };
    const updatedItems = [...currentItems, newItem];
    handleUpdateField('items', updatedItems);
    setNewItemName('');
    setNewItemImage('');
    setNewItemBadge('Coming Soon');
  };

  const handleEditItem = (id: number, field: keyof FutureItemConfig, value: any) => {
    const updatedItems = formData.items.map((it) => (it.id === id ? { ...it, [field]: value } : it));
    handleUpdateField('items', updatedItems);
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
            <Clock className="w-4 h-4" />
            <span>Upcoming Lineup</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Future Arrivals Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage upcoming categories and future grocery arrivals in the infinite slider.
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
            <span>{formData.enabled ? 'Section Visible' : 'Section Hidden'}</span>
          </button>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Live Saved</span>
            </span>
          )}
        </div>
      </div>

      {/* Copy Settings */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Section Header Copy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Section Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleUpdateField('title', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => handleUpdateField('subtitle', e.target.value)}
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Add New Future Item */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          2. Add Upcoming Item
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Item Name</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="E.g., Artisanal Breads"
                className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <AdminImageUpload
              value={newItemImage}
              onChange={setNewItemImage}
              label="Item Thumbnail Image"
              aspectRatio="square"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Badge Text</label>
            <input
              type="text"
              value={newItemBadge}
              onChange={(e) => setNewItemBadge(e.target.value)}
              placeholder="E.g., Coming Soon, Fresh Arrival..."
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 mb-3"
            />

            <button
              onClick={handleAddItem}
              className="w-full h-10 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          3. Upcoming Items in Carousel ({(formData.items || []).length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(formData.items || []).map((item) => (
            <div
              key={item.id}
              className={`admin-panel p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                item.enabled ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200/50 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <AdminImageUpload
                  value={item.image}
                  onChange={(val) => handleEditItem(item.id, 'image', val)}
                  label="Thumbnail Image"
                  aspectRatio="square"
                />

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Item Name</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleEditItem(item.id, 'name', e.target.value)}
                    className="w-full h-8 px-2.5 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Badge Label</label>
                  <input
                    type="text"
                    value={item.badgeText}
                    onChange={(e) => handleEditItem(item.id, 'badgeText', e.target.value)}
                    className="w-full h-8 px-2.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <button
                  onClick={() => handleToggleItem(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    item.enabled
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-250'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-350'
                  }`}
                >
                  {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{item.enabled ? 'Visible' : 'Hidden'}</span>
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id, item.name)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
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
