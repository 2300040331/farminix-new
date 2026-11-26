import { footerPolicyLinks } from '../data/policies';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { buildWhatsAppUrl } from './WhatsAppButton';
import { FooterSocialLinks } from './FooterSocialLinks';

export const Footer: React.FC = () => {
  const { navigate, setIsSupportOpen, setIsCartOpen } = useApp();
  const { publishedConfig } = useAdminConfig();
  const footerConfig = publishedConfig.footer;
  const pageVisibility = publishedConfig.pageVisibility || {};

  if (!footerConfig.enabled) return null;

  const isPageVisible = (url: string) => {
    if (url === '/') return pageVisibility.home !== false;
    if (url.startsWith('/product/')) return pageVisibility.productDetail !== false;
    if (url.startsWith('/products')) return pageVisibility.products !== false;
    if (url.startsWith('/offers')) return pageVisibility.offers !== false;
    if (url.startsWith('/about')) return pageVisibility.about !== false;
    if (url.startsWith('/reach-out')) return pageVisibility.reachOut !== false;
    if (['/queries', '/contact', '/compliance'].some((path) => url.startsWith(path))) return pageVisibility.queries !== false;
    if (url.startsWith('/careers')) return pageVisibility.careers !== false;
    if (url.startsWith('/manufacturer')) return pageVisibility.manufacturer !== false;
    if (url.startsWith('/checkout')) return pageVisibility.checkout !== false;
    if (url.startsWith('/orders')) return pageVisibility.orders !== false;
    return true;
  };
  const companyLinks = (footerConfig.companyLinks || []).filter((link) => link.enabled !== false && link.label.trim() && isPageVisible(link.url));
  const helpLinks = (footerConfig.helpLinks || []).filter((link) => link.enabled !== false && link.label.trim() && isPageVisible(link.url));
  if (pageVisibility.orders !== false && !helpLinks.some(link => link.url === '/orders')) helpLinks.push({ id: 'customer-order-history', label: 'Order History', url: '/orders', enabled: true, actionType: 'url' });
  if (!helpLinks.some(link => link.actionType === 'support')) helpLinks.push({ id: 'customer-support', label: 'Customer Support', url: '#', enabled: true, actionType: 'support' });
  const legalLinks = pageVisibility.legal === false ? [] : footerPolicyLinks(footerConfig.legalLinks).filter(link => link.enabled !== false);
  const whatsappUrl = buildWhatsAppUrl(footerConfig.whatsappPhone, footerConfig.whatsappMessage);

  const handleLinkClick = (item: { label: string; url?: string; actionType?: string }) => {
    const label = item.label.toLowerCase();
    const url = item.url || '';

    if (item.actionType === 'track') { navigate('/orders'); return; }

    if (item.actionType === 'whatsapp') {
      if (whatsappUrl) window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (
      item.actionType === 'support' ||
      label.includes('support') ||
      label.includes('faq') ||
      label.includes('contact')
    ) {
      setIsSupportOpen(true);
      return;
    }

    if (item.actionType === 'cart') {
      setIsCartOpen(true);
      return;
    }

    if (url === '/' || label === 'home') {
      navigate('/');
      return;
    }

    if (url === '/products' || label.includes('product') || label.includes('shop')) {
      navigate('/products');
      return;
    }

    if (url === '/about' || label.includes('about')) {
      navigate('/about');
      return;
    }

    if (url === '/manufacturer' || label.includes('manufacturer')) {
      navigate('/manufacturer');
      return;
    }

    if (url === '/offers' || label.includes('offer') || label.includes('deal')) {
      navigate('/offers');
      return;
    }

    if (url && url !== '#' && !url.startsWith('#')) {
      if (url.startsWith('/')) {
        navigate(url);
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } else {
      setIsSupportOpen(true);
    }
  };

  return (
    <footer className="store-footer w-full select-none">
      <div className="store-container store-footer-body">
        
        {/* Main Footer Layout */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          
          {/* Brand & Socials */}
          <div className="store-footer-brand text-left max-w-md">
            <button type="button" onClick={() => navigate('/')} className="store-footer-logo" aria-label="Farminix home">
              <img
                src={footerConfig.logoUrl ? footerConfig.logoUrl : '/farminix_logo.png?v=2'}
                alt="Farminix Logo"
              />
            </button>
            <p className="text-xs text-slate-400 font-normal max-w-sm mb-5 leading-relaxed">
              {footerConfig.bioText || 'Your trusted partner for premium staples and authentic grains. Pure quality, farm-direct freshness, and reliable doorstep delivery.'}
            </p>

            <FooterSocialLinks socialLinks={footerConfig.socialLinks} whatsappUrl={whatsappUrl} />
          </div>

          {/* Company Links */}
          <div className="text-left min-w-[160px]">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              {companyLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="hover:text-purple-300 transition-colors cursor-pointer text-left block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          {helpLinks.length > 0 && (
            <div className="text-left min-w-[160px]">
              <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Help</h3>
              <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                {helpLinks.map((link) => (
                  <li key={link.id}>
                    <button onClick={() => handleLinkClick(link)} className="hover:text-purple-300 transition-colors cursor-pointer text-left block">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        <div className="store-footer-bottom"><p>{footerConfig.copyrightText || `© ${new Date().getFullYear()} Farminix. From farm to family.`}</p><nav aria-label="Legal information">{legalLinks.map(link => <a key={link.id} href={link.url} onClick={event => { if (!link.url.startsWith('/') || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(link.url); }}>{link.label}</a>)}</nav></div>
      </div>
    </footer>
  );
};
