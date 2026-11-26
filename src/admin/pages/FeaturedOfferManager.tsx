import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { AdminImageUpload } from '../components/AdminImageUpload';
import type { FeaturedOfferConfig } from '../types';

export const FeaturedOfferManager: React.FC = () => {
  const { config, updateFeaturedOffer } = useAdminConfig();
  const [form, setForm] = useState<FeaturedOfferConfig>(config.featuredOffer);
  useEffect(() => setForm(config.featuredOffer), [config.featuredOffer]);
  const patch = (value: Partial<FeaturedOfferConfig>) => {
    const next = { ...form, ...value };
    setForm(next);
    updateFeaturedOffer(value);
  };
  const field = 'w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm';
  const product = config.products.find((item) => item.id === form.productId) || config.products.find((item) => item.id === 'r1');
  return <div className="space-y-6 text-left pb-12">
    <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
      <div><div className="flex items-center gap-2 text-amber-600 font-extrabold text-xs uppercase tracking-wider mb-1"><Sparkles className="w-4 h-4" />Featured product promotion</div><h1 className="text-xl sm:text-2xl font-black text-slate-900">Homepage offer banner</h1><p className="text-xs text-slate-500 mt-1">Edit the image and copy. Price and savings are pulled from the selected product catalog entry.</p></div>
      <button type="button" onClick={() => patch({ enabled: !form.enabled })} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${form.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>{form.enabled ? <Eye size={15} /> : <EyeOff size={15} />}{form.enabled ? 'Banner visible' : 'Banner hidden'}</button>
    </div>
    <div className="grid xl:grid-cols-[1fr_1fr] gap-5">
      <div className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-black text-slate-900">Banner content</h2>
        <label className="block text-xs font-bold text-slate-700">Featured product<select className={`${field} mt-1`} value={form.productId} onChange={(event) => { const selected = config.products.find((item) => item.id === event.target.value); patch({ productId: event.target.value, image: selected?.image || '' }); }}>{config.products.filter((item) => item.enabled !== false).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        {(['eyebrow', 'title', 'description', 'ctaText'] as const).map((key) => <label className="block text-xs font-bold text-slate-700" key={key}>{({ eyebrow: 'Top label', title: 'Headline', description: 'Description', ctaText: 'Button label' })[key]}{key === 'description' ? <textarea className={`${field} mt-1 h-24 py-2`} value={form[key]} onChange={(event) => patch({ [key]: event.target.value })} /> : <input className={`${field} mt-1`} value={form[key]} onChange={(event) => patch({ [key]: event.target.value })} />}</label>)}
        <div className="grid sm:grid-cols-3 gap-3">{(['backgroundStart', 'backgroundEnd', 'accentColor'] as const).map((key) => <label className="text-xs font-bold text-slate-700" key={key}>{({ backgroundStart: 'Background start', backgroundEnd: 'Background end', accentColor: 'Accent' })[key]}<span className="flex gap-2 mt-1"><input className="h-10 w-12 rounded-lg border border-slate-200" type="color" value={form[key]} onChange={(event) => patch({ [key]: event.target.value })} /><input className={`${field} min-w-0`} value={form[key]} onChange={(event) => patch({ [key]: event.target.value })} /></span></label>)}</div>
        <AdminImageUpload value={form.image} onChange={(image) => patch({ image })} label="Offer artwork" aspectRatio="square" />
        <p className="text-[11px] text-slate-500">Click Save Changes in the admin header to publish the banner.</p>
      </div>
      <div className="admin-panel bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3"><h2 className="text-sm font-black text-slate-900">Live preview</h2><div className="min-h-[390px] overflow-hidden rounded-3xl p-6 text-white grid md:grid-cols-2 items-center gap-4" style={{ background: `linear-gradient(125deg, ${form.backgroundStart}, ${form.backgroundEnd})` }}><div><span className="text-xs font-black tracking-widest" style={{ color: form.accentColor }}>{form.eyebrow}</span><h3 className="mt-4 text-3xl font-black leading-tight">{form.title}</h3><p className="mt-3 text-sm text-white/75">{form.description}</p>{product && <div className="mt-5 flex items-baseline gap-3"><strong className="text-2xl">₹{product.price.toLocaleString('en-IN')}</strong>{product.oldPrice > product.price && <del className="text-white/60">₹{product.oldPrice.toLocaleString('en-IN')}</del>}</div>}<span className="inline-block mt-5 rounded-full px-4 py-2 text-sm font-bold text-slate-950" style={{ backgroundColor: form.accentColor }}>{form.ctaText}</span></div><img className="mx-auto max-h-[300px] w-full object-contain drop-shadow-2xl" src={form.image || product?.image} alt={product?.name || 'Featured product'} /></div></div>
    </div>
  </div>;
};
