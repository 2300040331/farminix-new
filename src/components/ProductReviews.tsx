import type { Review } from '../types';

export function ProductReviews({ reviews }: { reviews?: Review[] }) {
  const visible = (reviews || []).filter(r => r.source === 'admin' && r.enabled !== false && r.userName.trim() && r.comment.trim());
  if (!visible.length) return null;
  const cards = (duplicate = false) => <div className="review-marquee-group" aria-hidden={duplicate || undefined}>{visible.map(r => <article key={r.id} className="w-[min(320px,80vw)] shrink-0 rounded-2xl border border-purple-100 bg-white p-6 text-left">
    <div className="text-amber-500" aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(Math.min(5,Math.max(0,Math.round(r.rating))))}</div>
    <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap break-words">{r.comment}</p>
    <p className="mt-4 font-bold text-slate-900">{r.userName}</p>
    {r.date && <time dateTime={r.date} className="text-xs text-slate-500">{r.date}</time>}
  </article>)}</div>;
  return <section className="mt-12" aria-label="Product reviews"><h2 className="text-xl font-bold text-slate-900 mb-6">Customer reviews</h2><div className="review-marquee overflow-hidden rounded-2xl bg-purple-50/40 py-4" tabIndex={0} aria-label="Customer reviews. Focus or hover to pause scrolling."><div className="review-marquee-track" style={{animationDuration:`${Math.max(20,visible.length*8)}s`}}>{cards()}{cards(true)}</div></div></section>;
}
