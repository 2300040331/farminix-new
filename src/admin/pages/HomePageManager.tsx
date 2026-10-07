import React, { useState } from 'react';
import {
  Compass,
  Image,
  Grid,
  Zap,
  Home,
  ExternalLink,
} from 'lucide-react';
import { HeaderManager } from './HeaderManager';
import { HeroManager } from './HeroManager';
import { CategoryManager } from './CategoryManager';
import { PopularProductsManager } from './PopularProductsManager';

type HomeTab = 'header' | 'hero' | 'categories' | 'popular';

export const HomePageManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HomeTab>('header');

  const tabs: { id: HomeTab; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'header',
      label: 'Main Header & Logo',
      icon: <Compass className="w-4 h-4" />,
      desc: 'Farminix logo, search placeholders & delivery pin',
    },
    {
      id: 'hero',
      label: 'Hero Banner',
      icon: <Image className="w-4 h-4" />,
      desc: '16:9 banner image & homepage billboard',
    },
    {
      id: 'categories',
      label: 'Categories Catalog',
      icon: <Grid className="w-4 h-4" />,
      desc: 'Add, hide, edit & delete categories',
    },
    {
      id: 'popular',
      label: 'Popular Today',
      icon: <Zap className="w-4 h-4" />,
      desc: 'Top trending rice & staples cards',
    },
  ];

  return (
    <div className="space-y-6 text-left pb-16">
      {/* ── TOP BANNER ── */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-purple-800/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-200 text-xs font-bold uppercase tracking-wider mb-3">
            <Home className="w-3.5 h-3.5 text-purple-300" />
            <span>Storefront Frontpage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Home Page Management
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
            Customize everything displayed on the main home page — brand logo, search bar, billboard hero banner, categories catalog, and popular featured products.
          </p>
          <div className="mt-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-colors"
            >
              <span>View Live Home Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ── SUB-TABS NAVIGATION ── */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── ACTIVE TAB CONTENT ── */}
      <div>
        {activeTab === 'header' && <HeaderManager />}
        {activeTab === 'hero' && <HeroManager />}
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'popular' && <PopularProductsManager />}
      </div>
    </div>
  );
};
