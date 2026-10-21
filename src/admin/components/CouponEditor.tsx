import { useState } from 'react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { CartCoupon } from '../types';

export function CouponEditor({ productId }: { productId?: string }) {
  const { config, updateCartConfig, publishConfig, isSaving, saveError } = useAdminConfig();
  const blank = (): CartCoupon => ({ code: '', description: '', enabled: true, discountPercentage: 0, productIds: productId ? [productId] : [] });
  const [form, setForm] = useState<CartCoupon>(blank);
  const [scope, setScope] = useState<'all' | 'selected'>(productId ? 'selected' : 'all');
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const coupons = config.cart?.coupons || [];
  const input = 'w-full rounded-xl border border-slate-300 p-3 bg-white text-sm';
  const save = () => {
    const code = form.code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return setError('Use 3–40 letters, numbers, hyphens or underscores.');
    if (!Number.isFinite(form.discountPercentage) || form.discountPercentage <= 0 || form.discountPercentage > 100) return setError('Discount must be above 0 and at most 100%.');
    if (coupons.some(c => c.code !== editing && c.code.toUpperCase() === code)) return setError('This code already exists.');
    if (scope === 'selected' && !form.productIds?.length) return setError('Select at least one product.');
    updateCartConfig({ coupons: [...coupons.filter(c => c.code !== editing), { ...form, code }] });
    setForm(blank()); setEditing(null); setError('');
  };
  return <section className="admin-panel bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-lg">Coupons {productId ? 'for this product' : '& promotions'}</h2>
      <label className="flex items-center gap-2"><input type="checkbox" checked={config.cart?.couponsEnabled !== false} onChange={e => updateCartConfig({ couponsEnabled: e.target.checked })}/>Enable coupons across the store</label></div>
    <p className="text-sm text-slate-500">Changes are drafts until Save Changes publishes them. Selected-product discounts apply only to eligible items.</p>
    <div className="space-y-2">{coupons.filter(c => !productId || !c.productIds?.length || c.productIds.includes(productId)).map(c => <div key={c.code} className="flex flex-wrap items-center gap-3 border rounded-xl p-3">
      <strong>{c.code}</strong><span>{c.discountPercentage}% · {c.productIds?.length ? `${c.productIds.length} selected products` : 'All products'} · {c.enabled ? 'Enabled' : 'Disabled'}</span>
      <button type="button" onClick={() => {setForm({...c}); setScope(c.productIds?.length ? 'selected' : 'all'); setEditing(c.code);}}>Edit</button>
      <button type="button" onClick={() => updateCartConfig({coupons: coupons.map(x => x.code === c.code ? {...x, enabled: !x.enabled} : x)})}>{c.enabled ? 'Disable' : 'Enable'}</button>
      <button type="button" onClick={() => updateCartConfig({coupons: coupons.filter(x => x.code !== c.code)})}>Delete</button>
    </div>)}{!coupons.length && <p className="text-slate-500">No coupons created.</p>}</div>
    <h3 className="font-bold">{editing ? 'Edit coupon' : 'Add coupon'}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label>Coupon code<div className="flex gap-2"><input className={input} value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}/><button type="button" onClick={() => setForm({...form, code: 'FM-' + crypto.randomUUID().replaceAll('-', '').slice(0,10).toUpperCase()})}>Generate</button></div></label>
      <label>Discount (%)<input className={input} type="number" min="0.01" max="100" step="0.01" value={form.discountPercentage} onChange={e => setForm({...form, discountPercentage: Number(e.target.value)})}/></label>
      <label>Description<input className={input} value={form.description} onChange={e => setForm({...form, description: e.target.value})}/></label>
      <label>Minimum eligible subtotal (₹)<input className={input} type="number" min="0" value={form.minimumSpend || 0} onChange={e => setForm({...form, minimumSpend: Math.max(0, Number(e.target.value))})}/></label>
      <label>Expiry (optional)<input className={input} type="datetime-local" value={form.expiresAt?.slice(0,16) || ''} onChange={e => setForm({...form, expiresAt: e.target.value})}/></label>
      <label>Applies to<select className={input} value={scope} onChange={e => { setScope(e.target.value as 'all' | 'selected'); setForm({...form, productIds: e.target.value === 'all' ? [] : [productId || config.products[0]?.id].filter(Boolean)}); }}><option value="all">All products</option><option value="selected">Selected products</option></select></label>
    </div>
    {scope === 'selected' && <div className="grid sm:grid-cols-2 gap-2">{config.products.map(p => <label key={p.id} className="flex gap-2"><input type="checkbox" checked={form.productIds!.includes(p.id)} onChange={e => { const ids = e.target.checked ? [...form.productIds!, p.id] : form.productIds!.filter(id => id !== p.id); setForm({...form, productIds: ids}); }}/>{p.name}</label>)}</div>}
    <label className="flex gap-2"><input type="checkbox" checked={form.enabled} onChange={e => setForm({...form, enabled: e.target.checked})}/>Coupon enabled</label>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <div className="flex gap-3"><button type="button" className="bg-purple-600 text-white rounded-xl px-4 py-2" onClick={save}>{editing ? 'Update coupon draft' : 'Add coupon to draft'}</button><button type="button" disabled={isSaving} onClick={() => void publishConfig()}>Save Changes</button>{editing && <button type="button" onClick={() => {setForm(blank()); setEditing(null);}}>Cancel edit</button>}</div>
    {saveError && <p role="alert" className="text-red-600">{saveError}</p>}
  </section>;
}
