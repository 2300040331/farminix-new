import React, { useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Leaf,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { defaultManufacturerConfig } from '../admin/defaultConfig';

export const ManufacturerPage: React.FC = () => {
  const { navigate } = useApp();
  const { publishedConfig } = useAdminConfig();

  const manufacturer = publishedConfig.manufacturer || defaultManufacturerConfig;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.title = `${manufacturer.companyName} — Manufacturer & Processing Hub`;
  }, [manufacturer]);

  // If Coming Soon Mode is active
  if (manufacturer.comingSoonMode) {
    return (
      <div className="w-full min-h-[80vh] px-4 py-8 bg-gradient-to-b from-purple-50/50 via-white to-slate-50">
        {/* Top Back Navigation Bar */}
        <div className="max-w-7xl mx-auto pb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow-2xs border border-gray-200/80 hover:bg-purple-50 text-slate-700 hover:text-[#7C3AED] text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-10 max-w-2xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-100 border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
            <span className="text-xs sm:text-sm font-black text-[#7C3AED] tracking-wide uppercase">
              {manufacturer.comingSoonBadge || 'Coming Soon'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {manufacturer.comingSoonTitle || 'Manufacturer'}
          </h1>

          {/* Description */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-medium">
            {manufacturer.comingSoonText ||
              "We're working on something exciting. This page will be available soon with all the details you need."}
          </p>

          {/* Back to Home CTA */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
          >
            <span>Back to Home</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Transparent Regulatory Dossier Preview */}
          <div className="w-full mt-8 p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-[#7C3AED]" />
              <span>Official Registered Entity</span>
            </div>
            <div className="text-sm font-black text-slate-900">{manufacturer.companyName}</div>
            <div className="text-xs text-slate-600 flex items-start gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{manufacturer.registeredOffice}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs font-bold text-slate-500 gap-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>FSSAI Lic: <strong className="text-slate-800">{manufacturer.fssaiNumber}</strong></span>
              </span>
              <a
                href={`tel:${manufacturer.contactPhone}`}
                className="text-[#7C3AED] hover:underline flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{manufacturer.contactPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Live Official Manufacturer Showcase Mode
  const activeFacilities = (manufacturer.facilities || []).filter((f) => f.enabled !== false);
  const activeSteps = (manufacturer.processSteps || []).filter((s) => s.enabled !== false);
  const activeCertifications = (manufacturer.certifications || []).filter((c) => c.enabled !== false);

  return (
    <div className="w-full min-h-screen px-4 py-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white shadow-2xs border border-gray-200/80 hover:bg-purple-50 text-slate-700 hover:text-[#7C3AED] text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest hidden sm:block">
            Verified Manufacturer Portal
          </div>
        </div>

        {/* ── HERO BANNER: OFFICIAL ENTITY & SLOGAN ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-purple-950 text-white p-6 sm:p-12 shadow-2xl border border-emerald-800/40 text-left">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Govt. FSSAI Lic. {manufacturer.fssaiNumber}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                <Leaf className="w-3.5 h-3.5 text-purple-400" />
                <span>100% Single-Origin Andhra Paddy</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {manufacturer.companyName}
            </h1>
            <p className="text-base sm:text-lg text-emerald-300 font-extrabold">
              {manufacturer.tagline}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {manufacturer.aboutCorporate}
            </p>

            {/* Quick Statutory Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Sortex Capacity</div>
                <div className="text-sm sm:text-base font-black text-emerald-300 mt-0.5">150 MT / Day</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Chemical Polish</div>
                <div className="text-sm sm:text-base font-black text-white mt-0.5">0% (Pure Grains)</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Moisture-Lock</div>
                <div className="text-sm sm:text-base font-black text-purple-300 mt-0.5">26 Kg Sacks</div>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Registered In</div>
                <div className="text-sm sm:text-base font-black text-amber-300 mt-0.5">Gorantla, Guntur</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 1. PROCESSING & MILLING UNITS ── */}
        <div className="text-left space-y-6">
          <div>
            <span className="text-[11px] font-black text-[#7C3AED] uppercase tracking-widest">
              Infrastructure &amp; Plants
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {manufacturer.facilityHeadline || 'Processing & Milling Facilities'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {manufacturer.facilitySubheadline ||
                'Clean room optical Sortex cleaning and packaging centers across Andhra Pradesh'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeFacilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{fac.status}</span>
                    </span>
                    <span className="text-[11px] font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                      {fac.capacity}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {fac.name}
                  </h3>

                  <div className="text-xs text-slate-500 flex items-start gap-1.5 mt-2 font-medium">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{fac.location}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <strong className="text-slate-800">Technology:</strong> {fac.type}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400">Traceability FSSAI:</span>
                  <span className="font-black text-[#7C3AED]">{fac.fssaiNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. FROM SOIL TO SACKS: THE 4 PROCESS STEPS ── */}
        <div className="text-left space-y-6">
          <div>
            <span className="text-[11px] font-black text-[#7C3AED] uppercase tracking-widest">
              {manufacturer.processTitle || 'From Soil to Dining Table'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {manufacturer.processSubtitle || 'How Farminix Reinvents What You Eat'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Zero middlemen delays and zero chemical bleaching — authentic optical Sortex milling at the source.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeSteps.map((step) => (
              <div
                key={step.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-purple-300 hover:shadow-xs transition-all relative group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] border border-purple-100 font-black text-sm flex items-center justify-center mb-3 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                  {step.step}
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. OPERATING PHILOSOPHY & CERTIFICATIONS ── */}
        <div className="text-left space-y-6">
          <div>
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">
              {manufacturer.certificationsTitle || 'Our Operating Philosophy & Standards'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {manufacturer.certificationsSubtitle || 'Built on Dignity, Health, Net Weight & Transparency'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeCertifications.map((cert) => (
              <div
                key={cert.id}
                className="p-5 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    {cert.authority}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-2 mb-1">{cert.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{cert.number}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-100 text-[11px] font-black text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{cert.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. REGISTERED OFFICE & DIRECT CONTACT DOSSIER ── */}
        <div className="p-6 sm:p-10 bg-slate-900 text-white rounded-3xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 text-left">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-black text-yellow-300 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md">
              Statutory Corporate Registry
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {manufacturer.b2bTitle || 'Corporate, Institutional & Wholesale Inquiries'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {manufacturer.b2bSubtitle ||
                'Partner directly with Farminix for bulk grain procurement, institutional pantry supply, or factory audit requests.'}
            </p>
            <div className="text-xs text-slate-300 flex items-start gap-2 pt-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{manufacturer.registeredOffice}</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{manufacturer.supportHours}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
            {manufacturer.contactPhone && (
              <a
                href={`tel:${manufacturer.contactPhone}`}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call {manufacturer.contactPhone}</span>
              </a>
            )}

            {manufacturer.contactEmail && (
              <a
                href={`mailto:${manufacturer.contactEmail}`}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-white/20 transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Email Official Desk</span>
              </a>
            )}

            <button
              onClick={() => navigate('/')}
              className="px-5 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Back to Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
