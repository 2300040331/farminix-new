import React, { useState } from 'react';
import {
  Compass,
  Image,
  Grid,
  Zap,
  Home,
  ExternalLink,
  Eye,
  Sparkles,
  Star,
} from 'lucide-react';
import { HeaderManager } from './HeaderManager';
import { HeroManager } from './HeroManager';
import { CategoryManager } from './CategoryManager';
import { PopularProductsManager } from './PopularProductsManager';
import { SocialBlogManager } from './SocialBlogManager';
import { SectionOrderingHub } from './SectionOrderingHub';
import { useAdminConfig } from '../context/AdminConfigContext';
import { FeaturedOfferManager } from './FeaturedOfferManager';
import { RiceReviewsManager } from './RiceReviewsManager';

type HomeTab = 'header' | 'hero' | 'categories' | 'popular' | 'socialBlog' | 'visibility' | 'offer' | 'reviews';

const storePages = [
  ['home', 'Home page'], ['products', 'Product listing'], ['productDetail', 'Product details'], ['offers', 'Offers'],
  ['about', 'About Farminix'], ['reachOut', 'Reach Out'], ['queries', 'Queries & Support'], ['careers', 'Careers'],
  ['manufacturer', 'Manufacturer'], ['checkout', 'Checkout'], ['orders', 'Order history'], ['legal', 'Policies & legal pages'],
] as const;

const VisibilityManager: React.FC = () => {
  const { config, updatePageVisibility } = useAdminConfig();
  return <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
    <div><h2 className="text-lg font-black text-slate-900">Store page visibility</h2><p className="mt-1 text-xs text-slate-500">Hide a page from customers. Hidden pages show the unavailable page notice when opened directly.</p></div>
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">{storePages.map(([id, label]) => {
      const visible = config.pageVisibility?.[id] !== false;
      return <label key={id} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 cursor-pointer ${visible ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
        <span className="flex items-center gap-2 text-sm font-bold text-slate-800"><Eye size={16} className={visible ? 'text-emerald-600' : 'text-slate-400'} />{label}</span>
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-500"><input type="checkbox" checked={visible} onChange={(event) => updatePageVisibility({ [id]: event.target.checked })} />{visible ? 'Visible' : 'Hidden'}</span>
      </label>;
    })}</div>
    <p className="text-[11px] text-slate-400">Use Save Changes in the admin header to publish visibility updates.</p>
  </div>;
};

export const HomePageManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HomeTab>('header');

  const tabs: { id: HomeTab; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'header',
      label: 'Main Header & Logo',
      icon: <Compass className="w-4 h-4" />,
      desc: 'Farminix logo, alt description & cart label',
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
    {
      id: 'socialBlog',
      label: 'Instagram & Videos',
      icon: <Image className="w-4 h-4" />,
      desc: 'Publish real Instagram posts or video links below Popular Today',
    },
    { id: 'visibility', label: 'Pages & Sections', icon: <Eye className="w-4 h-4" />, desc: 'Hide pages and control homepage section visibility' },
    { id: 'offer', label: 'Rice Offer Banner', icon: <Sparkles className="w-4 h-4" />, desc: 'Edit the featured rice offer image and copy' },
    { id: 'reviews', label: 'Rice Reviews', icon: <Star className="w-4 h-4" />, desc: 'Edit the rice bag review carousel' },
  ];

  return (
    <div className="space-y-6 text-left pb-16">
      {/* ── TOP BANNER ── */}
      <div className="admin-page-heading bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-purple-800/40">
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
      <div className="admin-panel admin-tabs flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
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
        {activeTab === 'socialBlog' && <SocialBlogManager />}
        {activeTab === 'offer' && <FeaturedOfferManager />}
        {activeTab === 'reviews' && <RiceReviewsManager />}
        {activeTab === 'visibility' && <><SectionOrderingHub onNavigateToSection={(id) => {
          const tab: HomeTab | undefined = id === 'hero' ? 'hero' : id === 'categorySection' ? 'categories' : id === 'popularProducts' ? 'popular' : id === 'socialBlog' ? 'socialBlog' : id === 'featuredOffer' ? 'offer' : id === 'riceReviews' ? 'reviews' : undefined;
          if (tab) setActiveTab(tab);
        }} /><VisibilityManager /></>}
      </div>
    </div>
  );
};
