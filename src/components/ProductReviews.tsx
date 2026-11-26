import type { Review } from '../types';

export function ProductReviews({ reviews, title = 'Customer reviews', compact = false }: { reviews?: Review[]; title?: string; compact?: boolean }) {
  const visible = (reviews || []).filter(r => r.source === 'admin' && r.enabled !== false && r.userName.trim() && r.comment.trim());
  if (!visible.length) return null;
  const hasSamples = visible.some((review) => review.isSample);
  const cards = (duplicate = false) => <div className="review-marquee-group" aria-hidden={duplicate || undefined}>{visible.map(r => <article key={r.id} className="w-[min(370px,82vw)] shrink-0 rounded-[26px] border border-[#eadfce] bg-[#fffdf8] p-6 sm:p-7 text-left shadow-[0_12px_40px_rgba(69,43,30,.06)]">
    {r.isSample && <span className="review-sample-chip">SAMPLE PREVIEW</span>}
    <div className="text-amber-500" aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(Math.min(5,Math.max(0,Math.round(r.rating))))}</div>
    <p className="mt-3 text-[15px] leading-relaxed text-[#392c23] whitespace-pre-wrap break-words">“{r.comment}”</p>
    <p className="mt-5 font-bold text-slate-900">{r.userName}</p>
    {r.date && <time dateTime={r.date} className="text-xs text-slate-500">{r.date}</time>}
  </article>)}</div>;
  return <section className={`${compact ? '' : 'mt-12'} home-review-carousel`} aria-label={title}>
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5"><div><h2 className="text-2xl sm:text-3xl font-semibold text-[#392c23]">{title}</h2>{hasSamples && <p className="review-sample-disclaimer">Sample previews only · Replace with real customer feedback in Admin</p>}</div><span className="review-count-label">{visible.length} {visible.length === 1 ? 'NOTE' : 'NOTES'} FROM THE KITCHEN</span></div>
    <div className="review-marquee" tabIndex={0} aria-label={`${title}. Hover or focus to pause scrolling.`}><div className="review-marquee-track" style={{animationDuration:`${Math.max(24,visible.length*9)}s`}}>{cards()}{cards(true)}</div></div>
  </section>;
}
