import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { ArrowUpRight, FileText, RefreshCw, Share2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { policyPages } from '../data/policies';
import type { PolicyPageContent } from '../data/policies';
import { sharePolicy } from '../utils/sharePolicy';
import { StorefrontPageHero } from './StorefrontPageHero';
import './PolicyPage.css';

const icons = { refund: RefreshCw, privacy: ShieldCheck, terms: FileText };
export function PolicyPage({ policy }: { policy: PolicyPageContent }) {
  const { navigate, setIsSupportOpen } = useApp();
  const [sharing, setSharing] = useState(false), [feedback, setFeedback] = useState(''), [manualUrl, setManualUrl] = useState('');
  useEffect(() => { document.title = `${policy.title} — Farminix`; setFeedback(''); setManualUrl(''); }, [policy.path, policy.title]);
  const follow = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(path);
  };
  const share = async () => {
    setSharing(true); setFeedback(''); setManualUrl('');
    try {
      const result = await sharePolicy(policy.title, policy.path);
      if (result.status === 'copied') setFeedback('Policy link copied.');
      if (result.status === 'shared') setFeedback('Policy link shared.');
      if (result.status === 'manual') { setManualUrl(result.url); setFeedback('Copy this link to share the policy.'); }
    } finally { setSharing(false); }
  };
  return <div className="store-policy-page">
    <StorefrontPageHero eyebrow="Farminix policies" title={policy.title} description={policy.description} />
    <div className="store-container store-policy-layout">
      <aside className="store-policy-sidebar"><nav aria-label="Policies"><p>Our policies</p>{policyPages.map(page => {
        const Icon = icons[page.id];
        return <a key={page.id} href={page.path} aria-current={page.id === policy.id ? 'page' : undefined} onClick={event => follow(event, page.path)}><Icon size={17} /><span>{page.title}</span><ArrowUpRight size={14} /></a>;
      })}</nav><div className="store-policy-share"><button type="button" disabled={sharing} onClick={() => void share()}><Share2 size={16} />{sharing ? 'Sharing…' : 'Share this policy'}</button>{feedback && <p role="status">{feedback}</p>}{manualUrl && <input aria-label="Policy link to copy" readOnly value={manualUrl} onFocus={event => event.target.select()} />}</div></aside>
      <article className="store-policy-content" aria-label={policy.title}>{policy.sections.map((section, index) => <section key={section.title} aria-labelledby={`policy-${policy.id}-${index}`}><h2 id={`policy-${policy.id}-${index}`}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{section.title}</h2><p>{section.text}</p></section>)}
        <div className="store-policy-help"><div><h2>Questions about this policy?</h2><p>Contact the Farminix team for help.</p></div><button className="store-text-link" type="button" onClick={() => setIsSupportOpen(true)}>Customer Support<ArrowUpRight size={15} /></button></div>
      </article>
    </div>
  </div>;
}
