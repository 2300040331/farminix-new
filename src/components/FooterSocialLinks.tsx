import type { FooterConfig } from '../admin/types';
import { officialSocialLinks } from '../data/socialLinks';
import { WhatsAppIcon } from './WhatsAppButton';

const networks = [
  { key: 'instagram', label: 'Instagram', icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></> },
  { key: 'facebook', label: 'Facebook', icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
  { key: 'twitter', label: 'X', icon: <><path d="M4 3h4l12 18h-4z" /><path d="m4 21 6.7-7.6M14.1 9.5 20 3" /></> },
  { key: 'youtube', label: 'YouTube', icon: <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3z" /></> },
] as const;

export function FooterSocialLinks({ socialLinks, whatsappUrl = '' }: { socialLinks?: Partial<FooterConfig['socialLinks']>; whatsappUrl?: string }) {
  const links = networks.flatMap((network) => {
    const href = socialLinks?.[network.key]?.trim() || officialSocialLinks[network.key];
    if (!href) return [];
    try {
      const url = new URL(href);
      // Empty, placeholder, and non-web URLs do not produce broken public icons.
      if (!['https:', 'http:'].includes(url.protocol) || url.pathname === '/') return [];
      return [{ ...network, href: url.href }];
    } catch { return []; }
  });

  if (!links.length && !whatsappUrl) return null;
  return <div className="store-footer-connect">
    <p className="store-footer-social-label">Connect with Farminix</p>
    <nav className="store-footer-socials" aria-label="Farminix social media">
      {links.map(({ key, label, href, icon }) => <a key={key} data-platform={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={`Farminix on ${label}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
      </a>)}
      {whatsappUrl && <a data-platform="whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="Chat with Farminix on WhatsApp"><WhatsAppIcon /></a>}
    </nav>
  </div>;
}
