import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { goBack } = useApp();
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
          onClick={goBack}
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
          {/* Left: Open Narrative (NO BOX) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            


            {/* Main 3D Title */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-slate-900">
                Pure Grains.{' '}
                <span className="block bg-gradient-to-r from-[#7C3AED] via-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                  Direct From Soil to Soul.
                </span>
              </h1>
              <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl pt-2">
                Farminix bridges generational Andhra paddy farmers and your dining table. Zero middlemen, zero chemical polishing, and zero stale godowns — just honest, farm-fresh rice delivered in minutes.
              </p>
            </div>

            {/* Quick Highlights - Floating Open Tags (No Icons) */}
            <div className="pt-2 flex flex-wrap gap-3 sm:gap-4 text-xs font-bold text-slate-700">
              <div className="px-3.5 py-2 rounded-xl bg-purple-50/80 border border-purple-100/80">
                <span>100% Single-Origin Paddy</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-amber-50/80 border border-amber-100/80">
                <span>Naturally Aged for Fluffy Cook</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50/80 border border-emerald-100/80">
                <span>FSSAI Lic. 20126142000933</span>
              </div>
            </div>
          </div>

          {/* Right: 3D Interactive Floating Showcase of Farminix 26 Kg Bag */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Interactive 3D Perspective Container */}
            <div
              style={{
                transform: `perspective(1000px) rotateY(${mousePos.x * 16}deg) rotateX(${-mousePos.y * 16}deg) translateZ(10px)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[4/5] flex items-center justify-center preserve-3d"
            >
              {/* Radial Backdrop Glow */}
              <div className="absolute inset-4 bg-gradient-to-tr from-purple-200/60 via-purple-100/40 to-indigo-100/60 rounded-3xl blur-2xl -z-10" />

              {/* 3D Floating Rice Bag */}
              <div className="relative w-full h-full flex flex-col items-center justify-center animate-float-3d">
                <img
                  src="/farminix_rice_front.png"
                  alt="Farminix Family Choice Rice 26 Kg"
                  className="max-h-[88%] w-auto object-contain drop-shadow-[0_25px_35px_rgba(124,58,237,0.22)] transition-all duration-500 ease-out"
                />

                {/* Dynamic 3D Ground Shadow */}
                <div className="w-44 h-5 bg-purple-950/20 rounded-full blur-md animate-float-shadow mt-2" />
              </div>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            HEARTFELT LETTER: "A NOTE FROM THE HEART OF FARMINIX"
            ══════════════════════════════════════════════════════════════════ */}
        <section className="relative max-w-4xl mx-auto">
          {/* Subtle 3D Layered Background Texture */}
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-200/40 via-amber-100/40 to-purple-200/40 rounded-3xl blur-xl -z-10" />

          <div className="bg-gradient-to-br from-white via-[#FCFCFE] to-purple-50/30 p-8 sm:p-14 rounded-3xl border border-purple-100 shadow-xl space-y-8 text-left relative overflow-hidden">

            {/* Letter Header */}
            <div className="border-b border-purple-100/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#7C3AED]">
                  Founder's Reflection
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  A Note from the Heart of Farminix
                </h2>
              </div>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold w-fit">
                <span>With Love to Every Household</span>
              </div>
            </div>

            {/* Letter Body */}
            <div className="space-y-5 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              <p className="font-semibold text-slate-900 text-base sm:text-lg">
                Dear Farminix Family,
              </p>
              
              <p>
                When you gather around the dinner table after a long day, a steaming bowl of rice is never just food. It is the comforting center of every family celebration, your grandmother’s timeless recipes, and the very feeling of coming home.
              </p>

              <p>
                We started Farminix right here in <strong className="text-slate-900">Gorantla, Guntur</strong> with a deeply personal calling. We looked at standard grocery stores and saw rice that had spent 6 to 9 months inside dusty godowns, traded through five layers of commission middlemen, and subjected to harsh chemical polishes just to appear artificially white. Meanwhile, the generational farmers who woke up at dawn to tend the fertile Andhra soils were paid fractions of what families were charged.
              </p>

              <p className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border-l-4 border-[#7C3AED] text-slate-800 font-medium italic">
                “Why should Indian families settle for chemically polished, stale grains when our villages harvest the most fragrant, wholesome paddy in the world?”
              </p>

              <p>
                <strong className="text-slate-900">Farminix is our answer.</strong> We partner directly with verified grower families across Andhra Pradesh, mill through cutting-edge optical Sortex technology, and pack our hallmark 26 Kg Family Choice bags right at the source. No middlemen inflating prices. No artificial bleaching. Just pure, whole, naturally aged grains that cook fluffy, fragrant, and healthy.
              </p>

              <p>
                Every sack that reaches your doorstep carries the blessing of our soil, the dignity of our farmers, and our sacred promise of purity to your family.
              </p>
            </div>

            {/* Letter Signoff */}
            <div className="pt-6 border-t border-purple-100/80 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-1">
                <div className="text-sm font-black text-slate-900">With endless gratitude & love,</div>
                <div className="text-lg font-black text-[#7C3AED] font-serif italic">The Farminix Team</div>
                <div className="text-xs text-slate-500 font-semibold">
                  Farminix Private Limited • Flat No 302, Srinivasa Towers, Gorantla, Guntur – 522034, AP
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            THE FARMINIX JOURNEY: OPEN CONNECTED FLOW (NO BOXES, NO ICONS)
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

          {/* Open Connected Flow (No Boxed Grid, No Icons) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative pt-4">
            
            {/* Step 1 */}
            <div className="relative space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-110 transition-transform">
                01
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Sown in Guntur
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Cultivated by trusted generational farming families in the nutrient-dense Krishna-Godavari river basin.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-black text-xl shadow-md group-hover:scale-110 transition-transform">
                02
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Sortex Cleaned
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Optical sensor cameras screen each grain, separating dust, stones, and broken pieces without chemical polish.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-110 transition-transform">
                03
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Naturally Aged
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Controlled resting optimizes starch retrogradation for maximum fluffiness and zero stickiness when boiled.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-110 transition-transform">
                04
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Delivered Direct
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Sealed in heavy-duty 26 Kg moisture-lock sacks and delivered directly to your doorstep by express logistics.
                </p>
              </div>
            </div>

          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            WHAT WE DO: 3D INTERACTIVE TILT CARDS (NO ICONS)
            ══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-10 text-left">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#7C3AED]">
              Our Operating Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Built on Dignity, Health & Transparency
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 3D Card 1 */}
            <div className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 preserve-3d flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#7C3AED]">
                  Ethical Sourcing
                </div>
                <h3 className="text-base font-bold text-slate-900">Direct Farmer Dignity</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  By cutting out commission agents, we pay farmers fair, upfront prices for their harvest, strengthening rural livelihoods.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-[#7C3AED]">
                <span>Fair Trade Guarantee</span>
              </div>
            </div>

            {/* 3D Card 2 */}
            <div className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 preserve-3d flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                  Pure Health
                </div>
                <h3 className="text-base font-bold text-slate-900">Zero Synthetic Polish</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  We refuse chemical bleaches, powders, and adulterants. You receive the honest, natural nutrient richness of each grain.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-emerald-700">
                <span>100% Unadulterated</span>
              </div>
            </div>

            {/* 3D Card 3 */}
            <div className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 preserve-3d flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                  Durable Packaging
                </div>
                <h3 className="text-base font-bold text-slate-900">26 Kg Moisture-Lock Bags</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Heavy-duty multi-layer sacks engineered to seal in farm freshness and resist external humidity, pests, and transit damage.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-amber-700">
                <span>Certified Net Weight</span>
              </div>
            </div>

            {/* 3D Card 4 */}
            <div className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 preserve-3d flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                  Transparent Value
                </div>
                <h3 className="text-base font-bold text-slate-900">Direct-to-Home Pricing</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Premium quality at ₹1399 for 26 Kg (₹53.8/Kg) — passing wholesale supply-chain efficiencies straight to your household.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-indigo-700">
                <span>Honest Value</span>
              </div>
            </div>

          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            3D FLOATING CALL TO ACTION & DIRECT CONTACT (NO ICONS)
            ══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8 sm:p-14 text-white text-center shadow-2xl">
          {/* Subtle Ambient Star/Glow Overlay */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Taste True Purity in Every Single Grain.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto">
              Upgrade your family’s daily meals with the authentic taste and aroma of Farminix Family Choice Rice. Delivered directly to your door.
            </p>

            {/* Direct Contact Line (No Icons) */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
              <a href="tel:+917989743595" className="hover:text-white transition-colors font-semibold">
                +91 7989743595
              </a>
              <span className="text-slate-600">•</span>
              <a href="mailto:info@farminix.in" className="hover:text-white transition-colors font-semibold">
                info@farminix.in
              </a>
              <span className="text-slate-600">•</span>
              <span className="font-semibold">
                Gorantla, Guntur – 522034, AP
              </span>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
