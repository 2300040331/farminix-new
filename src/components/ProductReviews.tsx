import type { Review } from '../types';

export function ProductReviews({ reviews, title = 'Customer reviews', compact = false }: { reviews?: Review[]; title?: string; compact?: boolean }) {
  const visible = (reviews || []).filter(r => r.source === 'admin' && r.enabled !== false && r.userName.trim() && r.comment.trim());
  if (!visible.length) return null;
  const cards = (duplicate = false) => <div className="review-marquee-group" aria-hidden={duplicate || undefined}>{visible.map(r => <article key={r.id} className="w-[min(370px,82vw)] shrink-0 rounded-[26px] border border-[#eadfce] bg-[#fffdf8] p-6 sm:p-7 text-left shadow-[0_12px_40px_rgba(69,43,30,.06)]">
    <div className="text-amber-500" aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(Math.min(5,Math.max(0,Math.round(r.rating))))}</div>
    <p className="mt-3 text-[15px] leading-relaxed text-[#392c23] whitespace-pre-wrap break-words">“{r.comment}”</p>
    <p className="mt-5 font-bold text-slate-900">{r.userName}</p>
    {r.date && <time dateTime={r.date} className="text-xs text-slate-500">{r.date}</time>}
  </article>)}</div>;
  return <section className={`${compact ? '' : 'mt-12'} home-review-carousel`} aria-label={title}>
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5"><div><h2 className="text-2xl sm:text-3xl font-semibold text-[#392c23]">{title}</h2></div><span className="review-count-label">{visible.length} {visible.length === 1 ? 'CUSTOMER REVIEW' : 'CUSTOMER REVIEWS'}</span></div>
    <div className="review-marquee" tabIndex={0} aria-label={`${title}. Reviews move automatically. Focus to pause.`}><div className="review-marquee-track" style={{animationDuration:`${Math.max(18,visible.length*5)}s`}}>{cards()}{cards(true)}</div></div>
  </section>;
}
