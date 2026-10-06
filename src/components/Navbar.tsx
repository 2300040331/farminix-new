import React from 'react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

export const Navbar: React.FC = () => {
  const { categories, selectedCategory, navigate, currentRoute } = useApp();
  const { publishedConfig } = useAdminConfig();

  const activeNavItems = publishedConfig.navItems.filter(
    (i) => i.enabled && i.catId !== 'manufacturer' && i.label.toLowerCase() !== 'manufacturer'
  );
  const activeCategories = categories;

  return (
    <nav className="w-full h-[60px] bg-[#EDE9FE] border-b border-[#DDD6FE]/60 select-none relative z-20 shadow-xs">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center gap-6 w-full">
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
