import React, { useState } from 'react';
import {
  Sliders,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { SectionOrderItem } from '../types';

export const SectionOrderingHub: React.FC<{ onNavigateToSection: (id: string) => void }> = ({
  onNavigateToSection,
}) => {
  const { config, updateSectionOrder } = useAdminConfig();
  const [sections, setSections] = useState<SectionOrderItem[]>(config.sectionOrder);
  const [successMsg, setSuccessMsg] = useState('');

  const handleToggle = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSections(updated);
    updateSectionOrder(updated);
    showNotice('Section visibility updated!');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...sections];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const withUpdatedOrder = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setSections(withUpdatedOrder);
    updateSectionOrder(withUpdatedOrder);
    showNotice('Section layout sequence updated!');
  };

  const handleReset = () => {
    const defaultOrder: SectionOrderItem[] = [
      { id: 'hero', name: 'Hero Banner', enabled: true, order: 1 },
      { id: 'brandMarquee', name: 'Trusted Brands Marquee', enabled: false, order: 2 },
      { id: 'featureStrip', name: 'Top 5 Feature Strip', enabled: false, order: 3 },
      { id: 'categorySection', name: 'Shop by Category', enabled: false, order: 4 },
      { id: 'popularProducts', name: 'Popular Today ⚡', enabled: true, order: 5 },
      { id: 'epicDeals', name: 'Epic Deals All Day', enabled: false, order: 6 },
      { id: 'futureArrivals', name: 'Future Arrivals', enabled: false, order: 7 },
      { id: 'bottomFeatureStrip', name: 'Bottom Benefits Strip', enabled: false, order: 8 },
    ];
    setSections(defaultOrder);
    updateSectionOrder(defaultOrder);
    showNotice('Reset to default production layout!');
  };

  const showNotice = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Layout Architecture Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Homepage Section Sequence &amp; Visibility
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Turn sections on or off, and reorder the display sequence on the Farminix main homepage without breaking layout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default Order</span>
          </button>
          {successMsg && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </span>
          )}
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
          <span>Section Sequence</span>
          <span>Controls</span>
        </div>

        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                section.enabled
                  ? 'bg-white border-slate-200 hover:border-purple-300 shadow-2xs'
                  : 'bg-slate-50 border-slate-200/60 opacity-60'
              }`}
            >
              {/* Left: Position & Name */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center shrink-0">
                  #{index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{section.name}</h3>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        section.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {section.enabled ? 'Active on Store' : 'Hidden from Store'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Section ID: <code className="font-mono text-purple-700">{section.id}</code>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                {/* Move Up */}
                <button
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                {/* Move Down */}
                <button
                  disabled={index === sections.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Toggle Visibility */}
                <button
                  onClick={() => handleToggle(section.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    section.enabled
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  {section.enabled ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>

                {/* Direct Edit Button */}
                <button
                  onClick={() => onNavigateToSection(section.id)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Edit Content
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
