import { Factory, Building2, MapPin, Phone, Mail } from 'lucide-react';
import type { ManufacturerConfig } from '../admin/types';

export const ManufacturerDetails = ({ manufacturer }: { manufacturer: ManufacturerConfig }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
    {([
      { key: 'manufacturedBy', label: 'Manufactured By', Icon: Factory },
      { key: 'marketedBy', label: 'Marketed By', Icon: Building2 },
    ] as const).map(({ key, label, Icon }) => {
      const contact = manufacturer[key];
      return (
        <section key={key} className="relative overflow-hidden rounded-3xl border border-purple-100 bg-white p-6 sm:p-9 shadow-[0_12px_40px_-20px_rgba(76,29,149,0.25)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7C3AED] to-purple-200" />
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-[#7C3AED]"><Icon aria-hidden="true" className="h-6 w-6" /></span>
            <h2 className="text-sm font-bold tracking-wide text-[#7C3AED]">{label}</h2>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">{contact.name}</h3>
          <address className="mt-6 space-y-5 text-sm leading-7 text-slate-600 not-italic">
            <div className="flex gap-3"><MapPin aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-purple-400" /><p>{contact.address}</p></div>
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex gap-3"><Phone aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-purple-400" /><p><span className="block text-xs font-semibold text-slate-500">Customer Care No.:</span><a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="font-semibold text-slate-800 hover:text-[#7C3AED]">{contact.phone}</a></p></div>
              <div className="flex gap-3"><Mail aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-purple-400" /><p className="min-w-0"><span className="block text-xs font-semibold text-slate-500">Email:</span><a href={`mailto:${contact.email}`} className="break-words font-medium text-slate-800 hover:text-[#7C3AED]">{contact.email}</a></p></div>
            </div>
          </address>
        </section>
      );
    })}
  </div>
);
