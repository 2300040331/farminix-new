import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ManufacturerPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-purple-50/40 to-white">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center">
          <Clock className="w-8 h-8 text-[#7C3AED]" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Manufacturer
        </h1>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 border border-purple-200">
          <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
          <span className="text-sm font-bold text-[#7C3AED] tracking-wide">Coming Soon</span>
        </div>

        {/* Description */}
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          We're working on something exciting. This page will be available soon with all the details you need.
        </p>

        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
        >
          <span>Back to Home</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
