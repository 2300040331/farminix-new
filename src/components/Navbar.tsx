import React, { useState } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

export const Navbar: React.FC = () => {
  const { categories, selectedCategory, navigate, currentRoute } = useApp();
  const { publishedConfig } = useAdminConfig();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const activeNavItems = publishedConfig.navItems.filter((i) => i.enabled);
  const activeCategories = categories;

  return (
    <nav className="w-full h-[60px] bg-[#EDE9FE] border-b border-[#DDD6FE]/60 select-none relative z-20 shadow-xs">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center gap-6 w-full">
        {/* Categories Dropdown Button */}
        <div className="relative">
        <button
          onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] text-xs font-extrabold rounded-[10px] transition-all shadow-2xs cursor-pointer"
        >
          <Menu className="w-4 h-4 stroke-[2.5]" />
          <span>Categories</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Category Dropdown Modal Menu */}
        {isCategoryMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">All Categories</div>
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  navigate('/products', `category=${encodeURIComponent(cat.name)}`);
                  setIsCategoryMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors text-left ${
                  selectedCategory === cat.id ? 'bg-purple-50 text-[#7C3AED] font-semibold' : 'text-gray-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={cat.image} alt={cat.name} className="w-6 h-6 rounded-full object-cover" />
                  <span>{cat.name}</span>
                </div>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{cat.itemCount}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {activeNavItems.map((item) => {
          const isHomeRoute = currentRoute.pathname === '/' || currentRoute.pathname === '';
          const isActive = 
            (item.catId === null && isHomeRoute && selectedCategory === null) || 
            (item.catId === 'offers' && currentRoute.pathname === '/offers') ||
            (item.catId === 'manufacturer' && currentRoute.pathname === '/manufacturer') ||
            (item.catId !== null && item.catId !== 'offers' && item.catId !== 'manufacturer' && selectedCategory === item.catId);
          return (
            <button
              key={item.id}
              onClick={() => {
              if (item.catId === null) {
                navigate('/');
              } else if (item.catId === 'offers') {
                navigate('/offers');
              } else if (item.catId === 'manufacturer') {
                navigate('/manufacturer');
              } else {
                const catMatch = activeCategories.find((c) => c.id === item.catId || c.name.toLowerCase() === item.label.toLowerCase());
                navigate('/products', `category=${encodeURIComponent(catMatch ? catMatch.name : item.label)}`);
              }
            }}
              className={`relative px-3.5 py-4 text-xs font-extrabold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive ? 'text-[#6D28D9]' : 'text-purple-800/80 hover:text-[#6D28D9]'
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-[#EA580C] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                  {item.badge}
                </span>
              )}

              {/* White Underline indicator for active nav item */}
              {isActive && (
                <span className="absolute bottom-0 left-3.5 right-3.5 h-[3px] bg-[#6D28D9] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </nav>
  );
};

