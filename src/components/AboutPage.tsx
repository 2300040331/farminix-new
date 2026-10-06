import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  HeartHandshake,
  ArrowRight,
  Wheat,
  Leaf,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  Scale,
  RotateCw,
  Heart,
  Flame,
  PhoneCall,
  Mail,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { navigate } = useApp();
  const [activeBagView, setActiveBagView] = useState<'front' | 'back'>('front');
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 sm:space-y-28">

        {/* ══════════════════════════════════════════════════════════════════
            HERO SECTION WITH 3D INTERACTIVE PARALLAX & 3D BAG SHOWCASE
            ══════════════════════════════════════════════════════════════════ */}
        <section
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="perspective-1500 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-2 sm:pt-6"
        >
          {/* Left: Open Narrative (NO BOX) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* 3D Floating Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-purple-200/80 shadow-md text-xs font-black tracking-wider uppercase text-[#7C3AED] transform transition-transform duration-300 hover:scale-105">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <Wheat className="w-4 h-4 text-amber-600" />
              <span>Direct From Guntur, Andhra Pradesh</span>
            </div>

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

            {/* Quick Highlights - Floating Open Tags (NOT in boxes) */}
            <div className="pt-2 flex flex-wrap gap-3 sm:gap-4 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50/80 border border-purple-100/80">
                <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                <span>100% Single-Origin Paddy</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50/80 border border-amber-100/80">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Naturally Aged for Fluffy Cook</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/80 border border-emerald-100/80">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>FSSAI Lic. 20126142000933</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/product/farminix-family-choice-rice')}
                className="px-8 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-extrabold rounded-2xl transition-all shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:-translate-y-1 active:translate-y-0 cursor-pointer flex items-center gap-2.5"
              >
                <span>Order Family Choice Rice (26 Kg)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/manufacturer')}
                className="px-6 py-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-2xl transition-all border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
              >
                <span>Manufacturer Portal</span>
              </button>
            </div>
          </div>

          {/* Right: 3D Interactive Floating Showcase of Farminix 26 Kg Bag */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Interactive 3D Perspective Card */}
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
                  src={
                    activeBagView === 'front'
                      ? '/farminix_rice_front.png'
                      : '/farminix_rice_back.png'
                  }
                  alt="Farminix Family Choice Rice 26 Kg"
                  className="max-h-[82%] w-auto object-contain drop-shadow-[0_25px_35px_rgba(124,58,237,0.22)] transition-all duration-500 ease-out"
                />

                {/* Dynamic 3D Ground Shadow */}
                <div className="w-44 h-5 bg-purple-950/20 rounded-full blur-md animate-float-shadow mt-2" />
              </div>

              {/* Floating 3D Depth Badge 1 (Top Right) */}
              <div
                style={{
                  transform: `translateZ(50px) translateY(${mousePos.y * 10}px)`,
                }}
                className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-purple-100 text-[11px] font-black text-slate-800 flex items-center gap-2 transition-transform duration-200"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                <span>26 Kg Family Sized</span>
              </div>

              {/* Floating 3D Depth Badge 2 (Bottom Left) */}
              <div
                style={{
                  transform: `translateZ(45px) translateY(${-mousePos.y * 10}px)`,
                }}
                className="absolute -bottom-3 -left-2 sm:-left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-purple-100 text-[11px] font-black text-slate-800 flex items-center gap-2 transition-transform duration-200"
              >
                <Truck className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>15-20 Min Delivery</span>
              </div>
            </div>

            {/* 3D Interactive Flip Controls */}
            <div className="mt-6 inline-flex p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-purple-200/80 shadow-md gap-1">
              <button
                onClick={() => setActiveBagView('front')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeBagView === 'front'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#7C3AED]'
                }`}
              >
                <span>Front Packaging</span>
              </button>
              <button
                onClick={() => setActiveBagView('back')}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeBagView === 'back'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#7C3AED]'
                }`}
              >
                <RotateCw className="w-3 h-3" />
                <span>Back (Nutrition & FSSAI)</span>
              </button>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            OPEN FLUID STATS COUNTERS (NO BOXES — PURE 3D TYPOGRAPHY)
            ══════════════════════════════════════════════════════════════════ */}
        <section className="py-8 sm:py-12 border-y border-purple-100/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
            
            {/* Stat 1 */}
            <div className="space-y-1 transform hover:-translate-y-1 transition-transform">
              <div className="text-4xl sm:text-6xl font-black bg-gradient-to-br from-[#7C3AED] to-purple-800 bg-clip-text text-transparent">
                26<span className="text-2xl sm:text-3xl font-extrabold text-[#7C3AED]">Kg</span>
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-800">Signature Pack</div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-[180px] mx-auto">
                Full-month staples for Indian joint & nuclear families
              </p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-1 transform hover:-translate-y-1 transition-transform">
              <div className="text-4xl sm:text-6xl font-black bg-gradient-to-br from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                100<span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">%</span>
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-800">Single Origin</div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-[180px] mx-auto">
                Directly from Krishna-Godavari farmer collectives
              </p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-1 transform hover:-translate-y-1 transition-transform">
              <div className="text-4xl sm:text-6xl font-black bg-gradient-to-br from-amber-500 to-orange-600 bg-clip-text text-transparent">
                0<span className="text-2xl sm:text-3xl font-extrabold text-amber-500">%</span>
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-800">Chemical Polish</div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-[180px] mx-auto">
                Zero artificial whitening, synthetic glaze, or talc
              </p>
            </div>

            {/* Stat 4 */}
            <div className="space-y-1 transform hover:-translate-y-1 transition-transform">
              <div className="text-4xl sm:text-6xl font-black bg-gradient-to-br from-indigo-600 to-purple-700 bg-clip-text text-transparent">
                15<span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">Min</span>
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-800">Doorstep Delivery</div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium max-w-[180px] mx-auto">
                Direct hub dispatch straight to your kitchen shelf
              </p>
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
            
            {/* Watermark Emblem */}
            <Wheat className="absolute -bottom-10 -right-10 w-64 h-64 text-purple-100/40 pointer-events-none -rotate-12" />

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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold w-fit">
                <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
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

              {/* FSSAI Badge & Contact */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-slate-900">FSSAI Certified</div>
                  <div className="text-[10px] text-slate-500">Lic: 20126142000933</div>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            THE FARMINIX JOURNEY: OPEN CONNECTED FLOW (NO BOXES)
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

          {/* Open Connected Flow (No Boxed Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative pt-4">
            
            {/* Step 1 */}
            <div className="relative space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-110 transition-transform">
                01
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wheat className="w-4 h-4 text-amber-600" />
                  <span>Sown in Guntur</span>
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
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>Sortex Cleaned</span>
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
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Naturally Aged</span>
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
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Delivered in 15 Mins</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Sealed in heavy-duty 26 Kg moisture-lock sacks and delivered directly to your doorstep by express logistics.
                </p>
              </div>
            </div>

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
              Built on Dignity, Health & Transparency
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 3D Card 1 */}
            <div className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 preserve-3d flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Direct Farmer Dignity</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  By cutting out commission agents, we pay farmers fair, upfront prices for their harvest, strengthening rural livelihoods.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-[#7C3AED] flex items-center gap-1">
                <span>Fair Trade Guarantee</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3D Card 2 */}
            <div className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 preserve-3d flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Zero Synthetic Polish</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  We refuse chemical bleaches, powders, and adulterants. You receive the honest, natural nutrient richness of each grain.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <span>100% Unadulterated</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3D Card 3 */}
            <div className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 preserve-3d flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">26 Kg Moisture-Lock Bags</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Heavy-duty multi-layer sacks engineered to seal in farm freshness and resist external humidity, pests, and transit damage.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-amber-700 flex items-center gap-1">
                <span>Certified Net Weight</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3D Card 4 */}
            <div className="group p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 preserve-3d flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Direct-to-Home Pricing</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Premium quality at ₹1399 for 26 Kg (₹53.8/Kg) — passing wholesale supply-chain efficiencies straight to your household.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                <span>Honest Value</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </section>


        {/* ══════════════════════════════════════════════════════════════════
            3D FLOATING CALL TO ACTION & DIRECT CONTACT
            ══════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8 sm:p-14 text-white text-center shadow-2xl">
          {/* Subtle Ambient Star/Glow Overlay */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-purple-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Experience The Difference</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Taste True Purity in Every Single Grain.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl mx-auto">
              Upgrade your family’s daily meals with the authentic taste and aroma of Farminix Family Choice Rice. Delivered directly to your door.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/product/farminix-family-choice-rice')}
                className="px-8 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-extrabold rounded-2xl transition-all shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Order Family Choice Rice (26 Kg)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/manufacturer')}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 text-sm font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Partner / Manufacturer Portal</span>
              </button>
            </div>

            {/* Quick Contact Line */}
            <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
              <a href="tel:+917989743595" className="flex items-center gap-2 hover:text-white transition-colors">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>+91 7989743595</span>
              </a>
              <a href="mailto:info@farminix.in" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>info@farminix.in</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Gorantla, Guntur – 522034, AP</span>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
