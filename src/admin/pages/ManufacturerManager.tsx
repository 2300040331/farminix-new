import React, { useState } from 'react';
import { Factory, Save, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { defaultManufacturerConfig } from '../defaultConfig';
import type { ManufacturerConfig, ManufacturerContact } from '../types';
import { ManufacturerDetails } from '../../components/ManufacturerDetails';

export const ManufacturerManager: React.FC = () => {
  const { config, updateManufacturer } = useAdminConfig();
  const [formData, setFormData] = useState<ManufacturerConfig>(() => ({
    ...defaultManufacturerConfig,
    ...config.manufacturer,
    manufacturedBy: config.manufacturer?.manufacturedBy || defaultManufacturerConfig.manufacturedBy,
    marketedBy: config.manufacturer?.marketedBy || defaultManufacturerConfig.marketedBy,
    comingSoonMode: false,
  }));
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    updateManufacturer({ ...formData, comingSoonMode: false });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const updateContact = (key: 'manufacturedBy' | 'marketedBy', field: keyof ManufacturerContact, value: string) => {
    setSaveSuccess(false);
    setFormData(previous => ({ ...previous, [key]: { ...previous[key], [field]: value } }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 text-left pb-16">
      <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200">
        <h1 className="flex items-center gap-3 text-xl font-black text-slate-900"><Factory className="w-6 h-6 text-[#7C3AED]" />Manufacturer Management</h1>
        <div className="flex gap-3">
          <a href="/manufacturer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold">Preview Page<ExternalLink className="w-4 h-4" /></a>
          <button type="submit" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer"><Save className="w-4 h-4" />Save Changes</button>
        </div>
      </div>
      {saveSuccess && <p role="status" className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm"><CheckCircle2 className="w-4 h-4" />Manufacturer details saved and published.</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(['manufacturedBy', 'marketedBy'] as const).map(key => (
          <section key={key} className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 space-y-5">
            <h2 className="font-black text-slate-900">{key === 'manufacturedBy' ? 'Manufactured By' : 'Marketed By'}</h2>
            {([
              { field: 'name', label: 'Company Name', type: 'text' },
              { field: 'address', label: 'Address', type: 'text' },
              { field: 'phone', label: 'Customer Care No.', type: 'tel' },
              { field: 'email', label: 'Email', type: 'email' },
            ] as const).map(({ field, label, type }) => (
              <div key={field}>
                <label htmlFor={`${key}-${field}`} className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>
                {field === 'address' ? (
                  <textarea id={`${key}-${field}`} required rows={3} value={formData[key][field]} onChange={event => updateContact(key, field, event.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-purple-500" />
                ) : (
                  <input id={`${key}-${field}`} required type={type} value={formData[key][field]} onChange={event => updateContact(key, field, event.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-purple-500" />
                )}
              </div>
            ))}
          </section>
        ))}
      </div>
      <section className="space-y-4">
        <h2 className="font-black text-slate-900">Customer Preview</h2>
        <ManufacturerDetails manufacturer={formData} />
      </section>
    </form>
  );
};
