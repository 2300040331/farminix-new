import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Image,
  ShoppingBag,
  Package,
  Layers,
  ExternalLink,
  LogOut,
  RefreshCw,
  X,
  Zap,
  Menu as MenuIcon,
} from 'lucide-react';
import { useAdminConfig } from './context/AdminConfigContext';

// Pages present on main web
import { AdminDashboard } from './pages/AdminDashboard';
import { HeroManager } from './pages/HeroManager';
import { PopularProductsManager } from './pages/PopularProductsManager';
import { FooterManager } from './pages/FooterManager';
import { ProductManager } from './pages/ProductManager';
import { OrderManager } from './pages/OrderManager';

interface NavSection {
  title: string;
  items: { id: string; label: string; icon: React.ReactNode; badge?: string }[];
}

export const AdminLayout: React.FC<{ onReturnToStore: () => void }> = ({ onReturnToStore }) => {
  const { adminLogout, resetToDefaults, hasChanges, publishConfig, discardDraft } = useAdminConfig();
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activePage]);

  const navigationSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Store Content',
      items: [
        { id: 'hero', label: 'Hero Banner', icon: <Image className="w-4 h-4" /> },
        { id: 'popularProducts', label: 'Popular Today', icon: <Zap className="w-4 h-4" /> },
        { id: 'footer', label: 'Store Footer', icon: <Layers className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Store Operations',
      items: [
        { id: 'products', label: 'Product Inventory', icon: <Package className="w-4 h-4" /> },
        { id: 'orders', label: 'Orders & Fulfillment', icon: <ShoppingBag className="w-4 h-4" /> },
      ],
    },
  ];

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={(p) => setActivePage(p)} />;
      case 'hero':
        return <HeroManager />;
      case 'popularProducts':
        return <PopularProductsManager />;
      case 'footer':
        return <FooterManager />;
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManager />;
      default:
        return <AdminDashboard onNavigate={(p) => setActivePage(p)} />;
    }
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-800 border-r border-purple-100">
      {/* Admin Header / Logo */}
      <div className="p-5 border-b border-purple-50 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <img src="/farminix_logo.png" alt="Farminix" className="h-8 w-auto object-contain" />
          <div>
            <div className="text-xs font-black text-purple-950 tracking-wide">FARMINIX CRM</div>
            <div className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Control Panel</div>
          </div>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-left">
        {navigationSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider px-3 mb-1">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${
                      isActive 
                        ? 'bg-white/20 text-white border-white/30' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile & Actions Footer */}
      <div className="p-4 border-t border-purple-50 bg-purple-50/10 shrink-0">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
              A
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 leading-none">Admin Storekeeper</div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">admin@farminix.com</div>
            </div>
          </div>
          <button
            onClick={adminLogout}
            className="text-slate-500 hover:text-red-650 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-slate-100 flex font-sans select-none antialiased text-slate-900 overflow-x-hidden">
      {/* ── Desktop Fixed Sidebar ── */}
      <aside className="hidden lg:flex w-72 bg-white text-slate-700 flex-col justify-between shrink-0 border-r border-purple-100 h-screen sticky top-0 overflow-hidden">
        {renderSidebarContent()}
      </aside>

      {/* ── Mobile Sidebar Drawer & Backdrop ── */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        />
      )}
      <aside
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-slate-700 flex flex-col justify-between border-r border-purple-100 transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebarContent()}
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 min-h-screen">
        {/* ── Top Publish Notice Banner ── */}
        {hasChanges && (
          <div className="bg-amber-500 text-slate-950 text-xs font-bold px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs shrink-0 select-none border-b border-amber-600/30 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-650 animate-ping shrink-0" />
              <span>You have pending draft customizations! Publish them to update the public storefront in real-time.</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={discardDraft}
                className="px-3 py-1 bg-amber-600/15 hover:bg-amber-600/30 border border-amber-600/35 text-slate-950 rounded-xl transition-colors cursor-pointer text-[11px] font-extrabold"
              >
                Discard Draft
              </button>
              <button
                onClick={publishConfig}
                className="px-4 py-1 bg-slate-950 hover:bg-slate-900 text-white rounded-xl transition-colors cursor-pointer text-[11px] font-black shadow-sm"
              >
                Publish Changes
              </button>
            </div>
          </div>
        )}

        {/* Top Floating App Bar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Live Store Synchronization Active
              </span>
            </div>
          </div>

          {/* Quick External Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToStore}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Storefront</span>
              <span className="sm:hidden">Store</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset all site customizations to original production defaults?')) {
                  resetToDefaults();
                }
              }}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reset System Config"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

