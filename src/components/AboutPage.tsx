import React from 'react';
import { Sparkles, ShieldCheck, Truck, HeartHandshake, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="w-full min-h-[75vh] px-4 py-12 sm:py-16 bg-gradient-to-b from-purple-50/50 via-white to-slate-50 flex flex-col items-center">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-[#7C3AED] text-xs font-black tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Story & Mission</span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            About <span className="text-[#7C3AED]">Farminix</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Bridging the gap between premier grocery manufacturers, organic farmers, and your dining table with pure quality and prompt care.
          </p>
        </div>

        {/* Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
          <div className="p-6 bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Direct & Authentic</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every grain, pulse, and household item is sourced directly from certified brands and direct manufacturers.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Fresh & Fast Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Carefully packed in hygiene-sealed parcels and delivered straight to your door with real-time updates.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Customer First</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No hidden fees, simple returns, transparent pricing, and 24/7 dedicated support for complete peace of mind.
            </p>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/manufacturer')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
          >
            <span>Manufacturer Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
