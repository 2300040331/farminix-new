import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

export const MainHeader: React.FC = () => {
  const { cart, setIsCartOpen, navigate, currentRoute } = useApp();
  const { publishedConfig } = useAdminConfig();
  const headerCfg = publishedConfig.header;

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isHomeActive = currentRoute.pathname === '/' || currentRoute.pathname === '';
  const isProductsActive =
    currentRoute.pathname === '/products' ||
    currentRoute.searchParams.has('search') ||
    currentRoute.searchParams.has('category');
  const isAboutActive = currentRoute.pathname === '/about';
  const isManufacturerActive = currentRoute.pathname === '/manufacturer';

  const navLinks = [
    { label: 'Home', path: '/', isActive: isHomeActive },
    { label: 'Products', path: '/products', isActive: isProductsActive },
    { label: 'About Farminix', path: '/about', isActive: isAboutActive },
    { label: 'Manufacturer', path: '/manufacturer', isActive: isManufacturerActive },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-30 select-none shadow-xs">
      <div className="max-w-7xl mx-auto h-16 sm:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 w-full">
        {/* Left: Farminix Logo */}
        <div className="flex items-center shrink-0">
          <div onClick={() => navigate('/')} className="flex items-center cursor-pointer group">
            <img
              src={headerCfg.logoUrl || '/farminix_logo.png'}
              alt={headerCfg.logoAlt || 'Farminix Logo'}
              className="h-10 sm:h-14 md:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Center: Navigation Options - Equal spacing across all options */}
        <nav className="flex items-center justify-center gap-5 sm:gap-8 md:gap-10">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className={`text-xs sm:text-sm font-extrabold transition-all py-2 px-1 sm:px-2 whitespace-nowrap cursor-pointer ${
                link.isActive
                  ? 'text-[#7C3AED]'
                  : 'text-slate-600 hover:text-[#7C3AED]'
              }`}
            >
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        {/* Right: Cart Button */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] border border-transparent rounded-xl sm:rounded-[10px] transition-all shadow-2xs cursor-pointer"
            title="Open Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4 text-white shrink-0" />
            <span className="hidden sm:inline">{headerCfg.cartButtonText || 'Cart'} ({totalCartItems})</span>
            <span className="inline sm:hidden font-black text-xs">{totalCartItems}</span>
            {totalCartItems > 0 && (
              <span className="hidden sm:flex absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#EA580C] text-white text-[10px] font-bold rounded-full items-center justify-center border-2 border-white shadow-xs">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
