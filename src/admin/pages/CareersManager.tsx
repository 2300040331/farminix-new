import React, { useEffect, useState } from 'react';
import { BriefcaseBusiness, CheckCircle2, ExternalLink, Plus, Save, Trash2, Users } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { defaultCareersPageConfig } from '../defaultConfig';
import { CAREER_APPLICATIONS_KEY, type CareerApplication } from '../../components/CareersPage';
import type { CareersPageConfig } from '../types';

const textFields: { key: keyof CareersPageConfig; label: string; multiline?: boolean }[] = [
  { key: 'eyebrow', label: 'Hero Eyebrow' }, { key: 'title', label: 'Hero Title' },
  { key: 'subtitle', label: 'Hero Subtitle', multiline: true }, { key: 'valuesTitle', label: 'Introduction Title' },
  { key: 'valuesDescription', label: 'Introduction Description', multiline: true }, { key: 'formTitle', label: 'Form Title' },
  { key: 'formDescription', label: 'Form Description', multiline: true }, { key: 'privacyNote', label: 'Privacy Note', multiline: true },
  { key: 'submitButtonText', label: 'Submit Button Text' }, { key: 'successTitle', label: 'Success Title' },
  { key: 'successMessage', label: 'Success Message', multiline: true },
];

const labelFields: { key: keyof CareersPageConfig; label: string }[] = [
  { key: 'fullNameLabel', label: 'Full Name' }, { key: 'emailLabel', label: 'Email Address' },
  { key: 'phoneLabel', label: 'Phone Number' }, { key: 'addressLabel', label: 'Full Address' },
  { key: 'experienceLabel', label: 'Work Experience' }, { key: 'roleLabel', label: 'Job Role' },
  { key: 'descriptionLabel', label: 'Additional Information' },
];

export const CareersManager: React.FC = () => {
  const { config, updateCareersPage } = useAdminConfig();
  const [form, setForm] = useState<CareersPageConfig>(config.careersPage || defaultCareersPageConfig);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [saved, setSaved] = useState(false);

  const loadApplications = () => {
    try { const data = JSON.parse(localStorage.getItem(CAREER_APPLICATIONS_KEY) || '[]'); setApplications(Array.isArray(data) ? data : []); } catch { setApplications([]); }
  };
  useEffect(() => { loadApplications(); window.addEventListener('farminix-career-application', loadApplications); return () => window.removeEventListener('farminix-career-application', loadApplications); }, []);

  const setText = (key: keyof CareersPageConfig, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = () => { updateCareersPage(form); setSaved(true); setTimeout(() => setSaved(false), 2200); };
  const removeApplication = (id: string) => {
    if (!confirm('Delete this application permanently?')) return;
    const next = applications.filter((item) => item.id !== id); setApplications(next); localStorage.setItem(CAREER_APPLICATIONS_KEY, JSON.stringify(next));
  };

  return (
    <div className="space-y-6 text-left pb-16">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-white p-6 rounded-3xl border border-slate-200">
        <div><div className="flex items-center gap-2"><BriefcaseBusiness className="w-5 h-5 text-purple-600" /><h1 className="text-2xl font-black">Careers Page</h1></div><p className="text-xs text-slate-500 mt-1">Edit the Careers page and review genuine applications submitted through the website.</p></div>
        <div className="flex gap-2"><a href="/careers" target="_blank" rel="noreferrer" className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-2">Preview <ExternalLink className="w-3.5 h-3.5" /></a><button onClick={save} className="px-5 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-black flex items-center gap-2">{saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}{saved ? 'Saved & Live' : 'Save Changes'}</button></div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
        <label className="flex items-center justify-between gap-4"><span><strong className="text-sm">Page visibility</strong><span className="block text-xs text-slate-500">Show Careers in the website navigation.</span></span><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="w-5 h-5 accent-purple-700" /></label>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200">
        <h2 className="font-black mb-5">Page content</h2><div className="grid sm:grid-cols-2 gap-4">{textFields.map(({ key, label, multiline }) => <label key={key} className={`text-xs font-bold text-slate-600 ${multiline ? 'sm:col-span-2' : ''}`}>{label}{multiline ? <textarea rows={3} value={String(form[key])} onChange={(e) => setText(key, e.target.value)} className="mt-1.5 w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-purple-500" /> : <input value={String(form[key])} onChange={(e) => setText(key, e.target.value)} className="mt-1.5 w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-purple-500" />}</label>)}</div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200">
        <h2 className="font-black mb-1">Application field labels</h2><p className="text-xs text-slate-500 mb-5">Required-field rules stay protected while the visible labels remain editable.</p><div className="grid sm:grid-cols-2 gap-4">{labelFields.map(({ key, label }) => <label key={key} className="text-xs font-bold text-slate-600">{label}<input value={String(form[key])} onChange={(e) => setText(key, e.target.value)} className="mt-1.5 w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-purple-500" /></label>)}</div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200">
        <div className="flex items-center justify-between mb-4"><div><h2 className="font-black">Job role options</h2><p className="text-xs text-slate-500">These populate the required dropdown.</p></div><button onClick={() => setForm({ ...form, jobRoles: [...form.jobRoles, ''] })} className="text-xs font-black text-purple-700 flex gap-1"><Plus className="w-4 h-4" />Add role</button></div>
        <div className="space-y-2">{form.jobRoles.map((role, index) => <div key={index} className="flex gap-2"><input value={role} onChange={(e) => { const roles = [...form.jobRoles]; roles[index] = e.target.value; setForm({ ...form, jobRoles: roles }); }} className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm" /><button onClick={() => setForm({ ...form, jobRoles: form.jobRoles.filter((_, i) => i !== index) })} className="p-3 text-rose-600 bg-rose-50 rounded-xl"><Trash2 className="w-4 h-4" /></button></div>)}</div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200">
        <div className="flex items-center gap-2 mb-5"><Users className="w-5 h-5 text-emerald-600" /><h2 className="font-black">Submitted applications ({applications.length})</h2></div>
        {applications.length === 0 ? <div className="py-10 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-2xl">No applications have been submitted yet.</div> : <div className="space-y-3">{applications.map((app) => <article key={app.id} className="p-4 rounded-2xl border border-slate-200"><div className="flex items-start justify-between gap-4"><div><h3 className="font-black text-sm">{app.fullName}</h3><p className="text-xs text-purple-700 font-bold mt-0.5">{app.role}</p><p className="text-xs text-slate-500 mt-2">{app.email} · {app.phone}</p><p className="text-xs text-slate-600 mt-2">{app.address}</p>{app.experience && <p className="text-xs text-slate-600 mt-2"><strong>Experience:</strong> {app.experience}</p>}{app.description && <p className="text-xs text-slate-600 mt-2"><strong>Additional information:</strong> {app.description}</p>}<time className="block text-[10px] text-slate-400 mt-3">{new Date(app.submittedAt).toLocaleString('en-IN')}</time></div><button onClick={() => removeApplication(app.id)} className="p-2 text-rose-600 bg-rose-50 rounded-lg" title="Delete application"><Trash2 className="w-4 h-4" /></button></div></article>)}</div>}
      </div>
    </div>
  );
};
