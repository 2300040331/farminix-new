import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

export const MainHeader: React.FC = () => {
  const { cart, setIsCartOpen, navigate, currentRoute } = useApp();
  const { publishedConfig } = useAdminConfig();
  const headerCfg = publishedConfig.header;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentRoute.pathname]);

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
      <div className="max-w-7xl mx-auto h-16 sm:h-20 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Left: Farminix Logo */}
        <div className="flex items-center shrink-0">
          <div onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }} className="flex items-center cursor-pointer group">
            <img
              src={headerCfg.logoUrl || '/farminix_logo.png'}
              alt={headerCfg.logoAlt || 'Farminix Logo'}
              className="h-9 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Center: Navigation Options - Hidden on mobile, visible on desktop */}
        <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-10">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.path)}
              className={`relative text-xs sm:text-sm font-extrabold transition-all py-2 px-1 sm:px-2 whitespace-nowrap cursor-pointer flex flex-col items-center justify-center ${
                link.isActive
                  ? 'text-[#7C3AED]'
                  : 'text-slate-600 hover:text-[#7C3AED]'
              }`}
            >
              <span>{link.label}</span>
              {link.isActive && (
                <span className="absolute bottom-0 w-full max-w-[28px] h-0.5 bg-[#7C3AED] rounded-full animate-in fade-in" />
              )}
            </button>
          ))}
        </nav>

        {/* Right: Cart Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] border border-transparent rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Open Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4 text-white shrink-0" />
            <span className="hidden sm:inline">
              {headerCfg.cartButtonText || 'Cart'}{totalCartItems > 0 ? ` (${totalCartItems})` : ''}
            </span>
            {totalCartItems > 0 && (
              <span className="sm:hidden font-black text-xs">{totalCartItems}</span>
            )}
            {totalCartItems > 0 && (
              <span className="hidden sm:flex absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#EA580C] text-white text-[10px] font-bold rounded-full items-center justify-center border-2 border-white shadow-xs">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* Three-lines Hamburger Menu button (mobile only) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-[#7C3AED] hover:bg-purple-50 rounded-xl transition-colors cursor-pointer border border-slate-200/80 active:scale-95 flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Vertical Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate(link.path);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-extrabold transition-all cursor-pointer ${
                link.isActive
                  ? 'bg-purple-50 text-[#7C3AED]'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-[#7C3AED]'
              }`}
            >
              <span>{link.label}</span>
              {link.isActive && <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
