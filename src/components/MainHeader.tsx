import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

export const MainHeader: React.FC = () => {
  const { cart, setIsCartOpen, navigate, currentRoute } = useApp();
  const { publishedConfig } = useAdminConfig();
  const headerCfg = publishedConfig.header;

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isManufacturerActive = currentRoute.pathname === '/manufacturer';

  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-30 select-none shadow-xs">
      <div className="max-w-7xl mx-auto h-16 sm:h-20 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Left: Farminix Logo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
          <div onClick={() => navigate('/')} className="flex items-center cursor-pointer shrink-0 group">
            <img
              src={headerCfg.logoUrl || '/farminix_logo.png'}
              alt={headerCfg.logoAlt || 'Farminix Logo'}
              className="h-10 sm:h-14 md:h-18 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Right: Manufacturer & Cart */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Manufacturer Link */}
          <button
            onClick={() => navigate('/manufacturer')}
            className={`px-3 sm:px-4 py-2 text-xs font-extrabold rounded-xl sm:rounded-[10px] transition-all cursor-pointer ${
              isManufacturerActive
                ? 'bg-purple-100 text-[#6D28D9]'
                : 'text-purple-900 hover:text-[#7C3AED] hover:bg-purple-50'
            }`}
          >
            Manufacturer
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] border border-transparent rounded-xl sm:rounded-[10px] transition-all shadow-2xs cursor-pointer"
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
