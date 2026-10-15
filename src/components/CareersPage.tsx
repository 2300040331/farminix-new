import React, { useEffect, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, MapPin, ShieldCheck, Users } from 'lucide-react';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { defaultCareersPageConfig } from '../admin/defaultConfig';

export interface CareerApplication {
  id: string;
  submittedAt: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  role: string;
  description: string;
}

export const CAREER_APPLICATIONS_KEY = 'farminix_career_applications_v1';

const emptyForm = {
  fullName: '', email: '', phone: '', address: '', experience: '', role: '', description: '',
};

export const CareersPage: React.FC = () => {
  const { publishedConfig } = useAdminConfig();
  const cfg = publishedConfig.careersPage || defaultCareersPageConfig;
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Careers — Farminix';
  }, []);

  if (!cfg.enabled) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4 text-center">
        <div><BriefcaseBusiness className="w-10 h-10 mx-auto text-purple-600 mb-4" /><h1 className="text-2xl font-black">Careers</h1><p className="text-slate-500 mt-2">This page is currently unavailable.</p></div>
      </section>
    );
  }

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const application: CareerApplication = {
      id: `APP-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      ...form,
    };
    try {
      const saved = JSON.parse(localStorage.getItem(CAREER_APPLICATIONS_KEY) || '[]');
      localStorage.setItem(CAREER_APPLICATIONS_KEY, JSON.stringify([application, ...(Array.isArray(saved) ? saved : [])]));
      window.dispatchEvent(new Event('farminix-career-application'));
    } catch {
      // The confirmation is still shown if browser storage is unavailable.
    }
    setForm(emptyForm);
    setSubmitted(true);
  };

  const fieldClass = 'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100';

  return (
    <div className="bg-slate-50 overflow-hidden">
      <section className="relative bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_20%_20%,#7c3aed_0,transparent_35%),radial-gradient(circle_at_80%_70%,#16a34a_0,transparent_30%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-end">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-200"><BriefcaseBusiness className="w-4 h-4" />{cfg.eyebrow}</span>
            <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">{cfg.title}</h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">{cfg.subtitle}</p>
            <a href="#apply" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-black text-slate-950 hover:bg-purple-100 transition">Apply now <ArrowRight className="w-4 h-4" /></a>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['Customers', Users], ['Local work', MapPin], ['Privacy', ShieldCheck]].map(([label, Icon]) => {
              const IconComponent = Icon as React.ComponentType<{ className?: string }>;
              return <div key={label as string} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 text-center"><IconComponent className="w-5 h-5 mx-auto text-emerald-300" /><span className="block mt-2 text-[11px] sm:text-xs font-bold text-slate-200">{label as string}</span></div>;
            })}
          </div>
        </div>
      </section>

      <section id="apply" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid lg:grid-cols-[.75fr_1.25fr] gap-8 lg:gap-14 items-start">
        <div className="lg:sticky lg:top-28 rounded-3xl bg-gradient-to-br from-purple-700 to-purple-950 p-7 sm:p-9 text-white shadow-xl">
          <span className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"><BriefcaseBusiness className="w-6 h-6" /></span>
          <h2 className="mt-6 text-2xl sm:text-3xl font-black tracking-tight">{cfg.valuesTitle}</h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-purple-100">{cfg.valuesDescription}</p>
          <div className="mt-7 pt-7 border-t border-white/15 text-xs leading-relaxed text-purple-100 flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />{cfg.privacyNote}</div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-sm">
          {submitted ? (
            <div className="min-h-[440px] flex flex-col items-center justify-center text-center px-4">
              <span className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"><CheckCircle2 className="w-8 h-8" /></span>
              <h2 className="mt-5 text-2xl font-black text-slate-900">{cfg.successTitle}</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">{cfg.successMessage}</p>
              <button onClick={() => setSubmitted(false)} className="mt-7 text-sm font-black text-purple-700 hover:text-purple-900">Submit another application</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{cfg.formTitle}</h2>
              <p className="mt-2 text-sm text-slate-500">{cfg.formDescription}</p>
              <div className="mt-8 grid sm:grid-cols-2 gap-5">
                <label className="text-xs font-bold text-slate-700">{cfg.fullNameLabel} *<input required autoComplete="name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className={fieldClass} /></label>
                <label className="text-xs font-bold text-slate-700">{cfg.emailLabel} *<input required type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={fieldClass} /></label>
                <label className="text-xs font-bold text-slate-700">{cfg.phoneLabel} *<input required type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className={fieldClass} /></label>
                <label className="text-xs font-bold text-slate-700">{cfg.roleLabel} *<select required value={form.role} onChange={(e) => update('role', e.target.value)} className={fieldClass}><option value="">Select a role</option>{cfg.jobRoles.filter(Boolean).map((role) => <option key={role}>{role}</option>)}</select></label>
                <label className="sm:col-span-2 text-xs font-bold text-slate-700">{cfg.addressLabel} *<textarea required autoComplete="street-address" rows={3} value={form.address} onChange={(e) => update('address', e.target.value)} className={fieldClass} /></label>
                <label className="sm:col-span-2 text-xs font-bold text-slate-700">{cfg.experienceLabel}<textarea rows={4} value={form.experience} onChange={(e) => update('experience', e.target.value)} className={fieldClass} /></label>
                <label className="sm:col-span-2 text-xs font-bold text-slate-700">{cfg.descriptionLabel}<textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} className={fieldClass} /></label>
              </div>
              <button type="submit" className="mt-7 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-700 px-7 py-4 text-sm font-black text-white shadow-lg shadow-purple-200 hover:bg-purple-800 transition">{cfg.submitButtonText}<ArrowRight className="w-4 h-4" /></button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
