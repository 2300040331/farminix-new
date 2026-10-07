import React from 'react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

export const Footer: React.FC = () => {
  const { setIsSupportOpen } = useApp();
  const { publishedConfig } = useAdminConfig();
  const footerConfig = publishedConfig.footer;

  if (!footerConfig.enabled) return null;

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Socials (2 cols on lg) */}
          <div className="lg:col-span-2 text-left">
            <a href="/" className="inline-block mb-3 group select-none">
              <img
                src={footerConfig.logoUrl || '/farminix_logo.png'}
                alt="Farminix Logo"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105 brightness-110"
              />
            </a>
            <p className="text-xs text-slate-400 font-normal max-w-sm mb-5 leading-relaxed">
              {footerConfig.bioText}
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

          {/* Col 2: Company */}
          <div className="text-left">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              {footerConfig.companyLinks.map((link) => (
                <li key={link.id}>
                  {link.actionType === 'support' ? (
                    <button onClick={() => setIsSupportOpen(true)} className="hover:text-purple-300 transition-colors cursor-pointer">
                      {link.label}
                    </button>
                  ) : (
                    <a href={link.url} className="hover:text-purple-300 transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Help */}
          <div className="text-left">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Help
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              {footerConfig.helpLinks.map((link) => (
                <li key={link.id}>
                  {link.actionType === 'support' ? (
                    <button onClick={() => setIsSupportOpen(true)} className="hover:text-purple-300 transition-colors cursor-pointer">
                      {link.label}
                    </button>
                  ) : (
                    <a href={link.url} className="hover:text-purple-300 transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {footerConfig.legalLinks.map((l, i) => (
              <React.Fragment key={l.id}>
                <a href={l.url} className="hover:text-white transition-colors">
                  {l.label}
                </a>
                {i < footerConfig.legalLinks.length - 1 && <span>•</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="text-center sm:text-right font-medium">
            {footerConfig.copyrightText}
          </div>
        </div>

      </div>
    </footer>
  );
};

