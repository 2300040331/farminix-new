import React from 'react';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

const LogoCard: React.FC<{ brand: { name: string; logo: string } }> = ({ brand }) => (
  <div
    className="brand-card flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-slate-200/80 mx-3 cursor-default select-none shadow-2xs hover:shadow-xs transition-all duration-200"
    style={{
      width: 140,
      height: 70,
      padding: '8px 14px',
    }}
    title={brand.name}
  >
    <img
      src={brand.logo}
      alt={brand.name}
      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      draggable={false}
    />
  </div>
);

export const BrandMarquee: React.FC = () => {
  const { publishedConfig } = useAdminConfig();
  const marquee = publishedConfig.brandMarquee;

  if (!marquee.enabled) return null;

  const activeBrands = marquee.brands.filter((b) => b.enabled);
  if (!activeBrands.length) return null;

  return (
    <section className="w-full border-b border-slate-100 py-8 select-none overflow-hidden" style={{backgroundColor:marquee.backgroundColor || '#f8fafc', color:marquee.textColor || '#0f172a'}} aria-label="Trusted Brands">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section heading */}
        <div className="mb-6 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[3px] mb-1" style={{color:marquee.accentColor || '#7c3aed'}}>{marquee.badgeText}</p>
          <h2 className="text-xl sm:text-2xl font-black">{marquee.title}</h2>
          <p className="text-xs font-semibold opacity-70 mt-1">
            {marquee.description}
          </p>
        </div>

        {/* Marquee track */}
        <div className="relative w-full overflow-hidden">
          {/* Left gradient fade */}
          <div
            className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: 80,
              background: `linear-gradient(to right, ${marquee.backgroundColor || '#f8fafc'} 0%, transparent 100%)`,
            }}
          />
          {/* Right gradient fade */}
          <div
            className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
            style={{
              width: 80,
              background: `linear-gradient(to left, ${marquee.backgroundColor || '#f8fafc'} 0%, transparent 100%)`,
            }}
          />

          <div className="brand-marquee-track py-2" style={{animationDuration:`${Math.max(10, marquee.speedSeconds || 18)}s`}}>
            {[0, 1].map((group) => <div className="brand-marquee-group" key={group} aria-hidden={group === 1 || undefined}>
              {activeBrands.map((brand) => <LogoCard key={`${brand.id}-${group}`} brand={brand} />)}
            </div>)}
          </div>
        </div>

      </div>
    </section>
  );
};

