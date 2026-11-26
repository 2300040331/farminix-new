import React from 'react';
import { Plus, Trash2, Star } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { Review } from '../../types';

export const RiceReviewsManager: React.FC = () => {
  const { config, updateProducts } = useAdminConfig();
  const rice = config.products.find((product) => product.id === 'r1');
  if (!rice) return <p className="text-sm text-slate-500">The Family Choice Rice product is not in the catalog.</p>;
  const reviews = rice.reviewsList || [];
  const write = (next: Review[]) => updateProducts(config.products.map((product) => product.id === rice.id ? { ...product, reviewsList: next } : product));
  const add = () => write([...reviews, { id: `rice-review-${Date.now()}`, userName: '', rating: 5, date: '', verified: false, comment: '', helpfulCount: 0, source: 'admin', enabled: true, isSample: true }]);
  const patch = (id: string, value: Partial<Review>) => write(reviews.map((review) => review.id === id ? { ...review, ...value, source: 'admin' } : review));
  return <div className="space-y-5 text-left pb-12">
    <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs"><div><div className="flex items-center gap-2 text-amber-600 text-xs font-extrabold uppercase tracking-wider"><Star className="w-4 h-4" />Homepage &amp; product reviews</div><h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900">Family Choice Rice reviews</h1><p className="mt-1 text-xs text-slate-500">Edit the carousel shown below the blog and on the rice product page. Sample previews are labeled in the storefront.</p></div><button type="button" onClick={add} className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white"><Plus size={16} />Add review</button></div>
    {reviews.map((review, index) => <article key={review.id} className="admin-panel space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between"><h2 className="text-sm font-black text-slate-900">Review {index + 1}</h2><button type="button" onClick={() => write(reviews.filter((item) => item.id !== review.id))} className="inline-flex items-center gap-1 text-xs font-bold text-rose-600"><Trash2 size={14} />Delete</button></div>
      <div className="grid sm:grid-cols-3 gap-4"><label className="text-xs font-bold text-slate-700">Display name<input className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal" value={review.userName} onChange={(event) => patch(review.id, { userName: event.target.value })} /></label><label className="text-xs font-bold text-slate-700">Rating<select className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal" value={review.rating} onChange={(event) => patch(review.id, { rating: Number(event.target.value) })}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></label><label className="text-xs font-bold text-slate-700">Review date (optional)<input type="date" className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal" value={review.date} onChange={(event) => patch(review.id, { date: event.target.value })} /></label></div>
      <label className="block text-xs font-bold text-slate-700">Review text<textarea rows={3} className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal" value={review.comment} onChange={(event) => patch(review.id, { comment: event.target.value })} /></label>
      <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-600"><label className="flex items-center gap-2"><input type="checkbox" checked={review.enabled !== false} onChange={(event) => patch(review.id, { enabled: event.target.checked })} />Show on storefront</label><label className="flex items-center gap-2"><input type="checkbox" checked={review.isSample === true} onChange={(event) => patch(review.id, { isSample: event.target.checked })} />Sample preview (clearly labeled)</label></div>
    </article>)}
    <p className="text-[11px] text-slate-500">Use Save Changes in the admin header to publish. Keep sample preview enabled until you replace the text with real customer feedback.</p>
  </div>;
};
