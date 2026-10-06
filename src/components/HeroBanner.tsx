import React from 'react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

export const HeroBanner: React.FC = () => {
  const { navigate } = useApp();
  const { publishedConfig } = useAdminConfig();
  const hero = publishedConfig.hero;

  if (!hero.enabled) return null;

  return (
    <section className="w-full relative select-none bg-gradient-to-b from-[#F3E8FF]/40 to-white border-b border-purple-100/60">
      {/* ── Full-Width Hero Image Container ── */}
      <div className="relative w-full overflow-hidden group">
        <img 
          src={hero.bannerImage ? (hero.bannerImage.includes('?') ? hero.bannerImage : `${hero.bannerImage}?v=3`) : '/hero_banner_original.jpg?v=3'} 
          alt={hero.altText || 'Farminix Fresh Groceries'} 
          className="w-full h-auto block" 
          draggable="false"
        />

        {/* Real interactive HTML SHOP NOW button aligned just below feature text */}
        <div 
          className="absolute flex items-center justify-center z-10"
          style={{
            left: '4.1%',
            top: '75.5%',
            width: '15.8%',
            height: '8.6%',
          }}
        >
          <button
            onClick={() => navigate(hero.shopNowUrl || '/products')}
            className="w-full h-full bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-black tracking-wider text-[1.05vw] uppercase rounded-full shadow-lg flex items-center justify-center gap-1.5 md:gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] border-0 focus:outline-hidden"
          >
            <span>SHOP NOW</span>
            <svg className="w-[1.2vw] h-[1.2vw] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        {/* Transparent absolute overlay for logo home navigation */}
        <button
          onClick={() => navigate(hero.homeUrl || '/')}
          className="absolute left-[4.5%] top-[5%] w-[13.5%] h-[10%] cursor-pointer bg-transparent border-0 focus:outline-hidden"
          title="Home"
        />
      </div>
    </section>
  );
};


