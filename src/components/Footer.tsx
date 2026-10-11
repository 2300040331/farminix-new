import React from 'react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

export const Footer: React.FC = () => {
  const { navigate, setIsSupportOpen } = useApp();
  const { publishedConfig } = useAdminConfig();
  const footerConfig = publishedConfig.footer;

  if (!footerConfig.enabled) return null;

  const defaultCompanyLinks = [
    { id: 'c1', label: 'Home', url: '/' },
    { id: 'c2', label: 'Products', url: '/products' },
    { id: 'c3', label: 'About Farminix', url: '/about' },
    { id: 'c4', label: 'Manufacturer', url: '/manufacturer' },
    { id: 'c5', label: 'Special Offers', url: '/offers' },
  ];

  const companyLinks =
    footerConfig.companyLinks &&
    footerConfig.companyLinks.length > 0 &&
    !footerConfig.companyLinks.some((l) => l.label === 'Career' || l.label === 'Blog')
      ? footerConfig.companyLinks
      : defaultCompanyLinks;

  const handleLinkClick = (item: { label: string; url?: string; actionType?: string }) => {
    const label = item.label.toLowerCase();
    const url = item.url || '';

    if (
      item.actionType === 'support' ||
      label.includes('support') ||
      label.includes('faq') ||
      label.includes('contact')
    ) {
      setIsSupportOpen(true);
      return;
    }

    if (url === '/' || label === 'home') {
      navigate('/');
      return;
    }

    if (url === '/products' || label.includes('product') || label.includes('shop')) {
      navigate('/products');
      return;
    }

    if (url === '/about' || label.includes('about')) {
      navigate('/about');
      return;
    }

    if (url === '/manufacturer' || label.includes('manufacturer')) {
      navigate('/manufacturer');
      return;
    }

    if (url === '/offers' || label.includes('offer') || label.includes('deal')) {
      navigate('/offers');
      return;
    }

    if (url && url !== '#' && !url.startsWith('#')) {
      if (url.startsWith('/')) {
        navigate(url);
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      setIsSupportOpen(true);
    }
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Layout */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          
          {/* Brand & Socials */}
          <div className="text-left max-w-md">
            <div onClick={() => navigate('/')} className="inline-block mb-3.5 group select-none cursor-pointer">
              <div className="inline-flex items-center bg-white px-3.5 py-1.5 rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-105">
                <img
                  src={footerConfig.logoUrl ? footerConfig.logoUrl : '/farminix_logo.png?v=2'}
                  alt="Farminix Logo"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-normal max-w-sm mb-5 leading-relaxed">
              {footerConfig.bioText || 'Your trusted partner for premium staples and authentic grains. Pure quality, farm-direct freshness, and reliable doorstep delivery.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href={footerConfig.socialLinks?.instagram && footerConfig.socialLinks.instagram !== '#' ? footerConfig.socialLinks.instagram : 'https://www.instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 hover:bg-[#7C3AED] text-slate-350 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              {/* Facebook */}
              <a
                href={footerConfig.socialLinks?.facebook && footerConfig.socialLinks.facebook !== '#' ? footerConfig.socialLinks.facebook : 'https://www.facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 hover:bg-[#7C3AED] text-slate-350 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              {/* Twitter */}
              <a
                href={footerConfig.socialLinks?.twitter && footerConfig.socialLinks.twitter !== '#' ? footerConfig.socialLinks.twitter : 'https://twitter.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 hover:bg-[#7C3AED] text-slate-350 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              {/* YouTube */}
              <a
                href={footerConfig.socialLinks?.youtube && footerConfig.socialLinks.youtube !== '#' ? footerConfig.socialLinks.youtube : 'https://www.youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 hover:bg-[#7C3AED] text-slate-350 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="text-left min-w-[160px]">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              {companyLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="hover:text-purple-300 transition-colors cursor-pointer text-left block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </footer>
  );
};
