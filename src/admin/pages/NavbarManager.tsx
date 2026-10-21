import React, { useState } from 'react';
import { Menu, Plus, Trash2, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { NavItemConfig } from '../types';

export const NavbarManager: React.FC = () => {
  const { config, updateNavItems } = useAdminConfig();
  const [navItems, setNavItems] = useState<NavItemConfig[]>(config.navItems);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newBadge, setNewBadge] = useState('');

  const handleToggle = (id: string) => {
    const updated = navItems.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item));
    setNavItems(updated);
    updateNavItems(updated);
    notifySaved();
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === navItems.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...navItems];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const withOrder = copy.map((it, idx) => ({ ...it, order: idx + 1 }));
    setNavItems(withOrder);
    updateNavItems(withOrder);
    notifySaved();
  };

  const handleRemove = (id: string, label: string) => {
    if (confirm(`Are you sure you want to delete navigation link "${label}"?`)) {
      const updated = navItems.filter((i) => i.id !== id);
      setNavItems(updated);
      updateNavItems(updated);
      notifySaved();
    }
  };

  const handleAdd = () => {
    const finalLabel = newLabel.trim() || `New Tab ${navItems.length + 1}`;
    const newItem: NavItemConfig = {
      id: `nav-${Date.now()}`,
      label: finalLabel,
      catId: newCatId.trim() || null,
      badge: newBadge.trim() || undefined,
      enabled: true,
      order: navItems.length + 1,
    };
    const updated = [...navItems, newItem];
    setNavItems(updated);
    updateNavItems(updated);
    setNewLabel('');
    setNewCatId('');
    setNewBadge('');
    notifySaved();
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
            <Menu className="w-4 h-4" />
            <span>Navigation Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Navigation Bar Menu Links
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Control main navigation tabs, custom category links, hot badges, and tab ordering.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <Check className="w-4 h-4" />
            <span>Live Saved</span>
          </span>
        )}
      </div>

      {/* Add New Nav Item Card */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Add Navigation Menu Item
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tab Label</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="E.g., Organic Pulses"
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Category ID / Route</label>
            <input
              type="text"
              value={newCatId}
              onChange={(e) => setNewCatId(e.target.value)}
              placeholder="dals, rice, offers, or leave blank for Home"
              className="w-full h-10 px-3.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Optional Badge Text</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value.toUpperCase())}
                placeholder="HOT, NEW, 50% OFF"
                className="w-full h-10 px-3.5 text-xs font-bold text-orange-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 uppercase"
              />
              <button
                onClick={handleAdd}
                className="h-10 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items List */}
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Existing Navigation Items ({navItems.length})
        </h2>

        <div className="space-y-2.5">
          {navItems.map((item, idx) => (
            <div
              key={item.id}
              className={`admin-panel flex items-center justify-between p-3 rounded-2xl border transition-all ${
                item.enabled ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 text-xs font-extrabold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-900">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[9px] font-extrabold uppercase">
                    {item.badge}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.catId ? `(${item.catId})` : '(Home / All)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={idx === navItems.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggle(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    item.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.enabled ? 'Visible' : 'Hidden'}
                </button>
                <button
                  onClick={() => handleRemove(item.id, item.label)}
                  className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
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
