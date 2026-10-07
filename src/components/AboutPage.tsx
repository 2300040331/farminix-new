import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { defaultAboutPageConfig } from '../admin/defaultConfig';

export const AboutPage: React.FC = () => {
  const { navigate } = useApp();
  const { publishedConfig } = useAdminConfig();
  const about = publishedConfig.aboutPage || defaultAboutPageConfig;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 3D Parallax tilt handler for the interactive hero section
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div className="w-full bg-[#FAFAFC] text-slate-900 font-sans overflow-hidden">
      
      {/* ── 3D AMBIENT BACKGROUND GLOWS ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-300/25 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-indigo-200/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 left-1/4 w-[28rem] h-[28rem] bg-amber-100/30 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      {/* ── TOP BACK NAVIGATION BAR (LEFT SIDE) ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white shadow-2xs border border-gray-200/80 hover:bg-purple-50 text-slate-700 hover:text-[#7C3AED] text-xs font-bold transition-all cursor-pointer group"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-[#7C3AED] group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-20 sm:space-y-24">

        {/* ══════════════════════════════════════════════════════════════════
            HERO SECTION WITH 3D INTERACTIVE PARALLAX & 3D BAG SHOWCASE
            ══════════════════════════════════════════════════════════════════ */}
        <section
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="perspective-1500 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2 sm:pt-4"
        >
          {/* Left: Open Narrative */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Main 3D Title */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-slate-900">
                {about.headline.includes('.') ? (
                  <>
                    {about.headline.split('.')[0]}.{' '}
                    <span className="block bg-gradient-to-r from-[#7C3AED] via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                      {about.headline.split('.').slice(1).join('.').trim()}
                    </span>
                  </>
                ) : (
                  <span className="block bg-gradient-to-r from-[#7C3AED] via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                    {about.headline}
                  </span>
                )}
              </h1>
              <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl pt-2">
                {about.subheadline}
              </p>
            </div>

            {/* Quick Highlights - Floating Open Tags (No Icons) */}
            <div className="pt-2 flex flex-wrap gap-3 sm:gap-4 text-xs font-bold text-slate-700">
              {about.tags.map((tag, idx) => {
                const tagBg = idx === 0 
                  ? 'bg-purple-50/80 border-purple-100/80' 
                  : idx === 1 
                  ? 'bg-amber-50/80 border-amber-100/80' 
                  : 'bg-emerald-50/80 border-emerald-100/80';
                return (
                  <div key={idx} className={`px-3.5 py-2 rounded-xl border ${tagBg}`}>
                    <span>{tag}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: 3D Interactive Floating Showcase of Farminix 26 Kg Bag */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div
              style={{
                transform: `perspective(1000px) rotateY(${mousePos.x * 16}deg) rotateX(${-mousePos.y * 16}deg) translateZ(10px)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] flex items-center justify-center preserve-3d"
            >
              <div className="absolute inset-4 bg-gradient-to-tr from-purple-200/60 via-purple-100/40 to-indigo-100/60 rounded-3xl blur-2xl -z-10" />
              <div className="relative w-full h-full flex flex-col items-center justify-center animate-float-3d">
                <img
                  src="/farminix_rice_front.png"
                  alt="Farminix Family Choice Rice 26 Kg"
                  className="max-h-[88%] w-auto object-contain drop-shadow-[0_25px_35px_rgba(124,58,237,0.22)] transition-all duration-500 ease-out"
                />
                <div className="w-44 h-5 bg-purple-950/20 rounded-full blur-md animate-float-shadow mt-2" />
              </div>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            HEARTFELT LETTER: "A NOTE FROM THE HEART OF FARMINIX"
            ══════════════════════════════════════════════════════════════════ */}
        <section className="relative max-w-4xl mx-auto">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-200/40 via-amber-100/40 to-purple-200/40 rounded-3xl blur-xl -z-10" />

          <div className="bg-gradient-to-br from-white via-[#FCFCFE] to-purple-50/30 p-8 sm:p-14 rounded-3xl border border-purple-100 shadow-xl space-y-8 text-left relative overflow-hidden">

            {/* Letter Header */}
            <div className="border-b border-purple-100/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#7C3AED]">
                  {about.founderTitle}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  A Note from the Heart of Farminix
                </h2>
              </div>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold w-fit">
                <span>{about.founderSubtitle}</span>
              </div>
            </div>

            {/* Letter Body */}
            <div className="space-y-5 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {about.founderLetter.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className={idx === 0 ? "font-semibold text-slate-900 text-base sm:text-lg" : ""}>
                  {paragraph}
                </p>
              ))}

              {about.founderQuote && (
                <p className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border-l-4 border-[#7C3AED] text-slate-800 font-medium italic">
                  “{about.founderQuote}”
                </p>
              )}

              {about.founderSignoff && (
                <p>{about.founderSignoff}</p>
              )}
            </div>

            {/* Letter Signoff */}
            <div className="pt-6 border-t border-purple-100/80 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-1">
                <div className="text-sm font-black text-slate-900">With endless gratitude &amp; love,</div>
                <div className="text-lg font-black text-[#7C3AED] font-serif italic">The Farminix Team</div>
                <div className="text-xs text-slate-500 font-semibold">
                  {about.companyAddress}
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            THE FARMINIX JOURNEY: OPEN CONNECTED FLOW
            ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-10 text-left">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#7C3AED]">
              From Soil to Dining Table
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How Farminix Reinvents What You Eat
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              We eliminated long godown delays and middle-agent cartels to build a seamless farm-to-table path.
            </p>
          </div>

          {/* Open Connected Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative pt-4">
            {about.processSteps.map((s, idx) => {
              const bgColors = [
                'bg-amber-100 text-amber-700',
                'bg-purple-100 text-[#7C3AED]',
                'bg-indigo-100 text-indigo-700',
                'bg-emerald-100 text-emerald-700',
              ];
              return (
                <div key={idx} className="relative space-y-4 group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md group-hover:scale-110 transition-transform ${bgColors[idx % bgColors.length]}`}>
                    {s.step}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            WHAT WE DO: 3D INTERACTIVE TILT CARDS
            ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-10 text-left">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#7C3AED]">
              Our Operating Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Built on Dignity, Health &amp; Transparency
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.philosophyPillars.map((p, idx) => {
              const tagColors = [
                'text-[#7C3AED]',
                'text-emerald-700',
                'text-amber-700',
                'text-indigo-700',
              ];
              return (
                <div key={idx} className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 preserve-3d flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className={`text-[11px] font-extrabold uppercase tracking-wider ${tagColors[idx % tagColors.length]}`}>
                      {p.tag}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {p.desc}
                    </p>
                  </div>
                  <div className={`pt-4 text-[11px] font-bold ${tagColors[idx % tagColors.length]}`}>
                    <span>{p.guarantee}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            3D FLOATING CALL TO ACTION & DIRECT CONTACT
            ══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8 sm:p-14 text-white text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Taste True Purity in Every Single Grain.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto">
              Upgrade your family’s daily meals with the authentic taste and aroma of Farminix Family Choice Rice. Delivered directly to your door.
            </p>

            {/* Direct Contact Line */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
              <a href={`tel:${about.contactPhone}`} className="hover:text-white transition-colors font-semibold">
                {about.contactPhone}
              </a>
              <span className="text-slate-600">•</span>
              <a href={`mailto:${about.contactEmail}`} className="hover:text-white transition-colors font-semibold">
                {about.contactEmail}
              </a>
              <span className="text-slate-600">•</span>
              <span className="font-semibold">
                {about.contactLocation}
              </span>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
