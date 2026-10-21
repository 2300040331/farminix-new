import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Play, ShieldCheck, Users, Wheat, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import './HeroBanner.css';

const heroFeatures = [
  { Icon: Leaf, title: '100%', subtitle: 'Natural Grains' },
  { Icon: ShieldCheck, title: 'Carefully', subtitle: 'Processed' },
  { Icon: Wheat, title: 'Naturally', subtitle: 'Wholesome' },
  { Icon: Users, title: 'Perfect', subtitle: 'for Families' },
];
const farmBenefits = [
  { Icon: Leaf, title: 'Farm Fresh', subtitle: 'Sourced from trusted farms' },
  { Icon: ShieldCheck, title: 'Carefully Processed', subtitle: 'Ensuring purity & safety' },
  { Icon: Wheat, title: 'Naturally Wholesome', subtitle: 'Goodness in every grain' },
  { Icon: Users, title: 'Made for Families', subtitle: 'For everyday meals together' },
];

export function HeroBanner() {
  const { navigate } = useApp();
  const { publishedConfig } = useAdminConfig();
  const hero = publishedConfig.hero;
  useEffect(() => { document.title = 'Farminix — From Farm to Family'; }, []);
  const slides = (hero.slides ?? (hero.bannerImage ? [{
    id: 'original-banner', image: hero.bannerImage, altText: hero.altText,
    linkUrl: hero.shopNowUrl, buttonText: 'Shop now', enabled: true, legacyHotspots: true,
  }] : [])).filter((slide) => slide.enabled && slide.image);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const storyDialogRef = useRef<HTMLDivElement>(null);
  const storyButtonRef = useRef<HTMLButtonElement>(null);
  const active = slides.length ? index % slides.length : 0;
  const isFarmSlide = (image: string) => /(?:^|\/)hero_banner_original\.jpg(?:\?|$)/i.test(image);
  const intro = publishedConfig.introVideo;
  const storySource = (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
    ? intro.mobileUrl || intro.desktopUrl : intro.desktopUrl);

  useEffect(() => {
    if (!hero.enabled || slides.length < 2 || isPaused || isHovered || hasFocus || isStoryOpen || hero.autoplay === false || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((previous) => (previous + 1) % slides.length), Math.max(3, hero.intervalSeconds || 5) * 1000);
    return () => window.clearInterval(timer);
  }, [hero.enabled, hero.autoplay, hero.intervalSeconds, slides.length, isPaused, isHovered, hasFocus, isStoryOpen]);

  useEffect(() => {
    if (!isStoryOpen) return;
    const previousOverflow = document.body.style.overflow;
    const returnFocusElement = storyButtonRef.current;
    document.body.style.overflow = 'hidden';
    storyDialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsStoryOpen(false);
      if (event.key === 'Tab') {
        const focusable = storyDialogRef.current?.querySelectorAll<HTMLElement>('button, video[controls]');
        const first = focusable?.[0];
        const last = focusable?.[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === storyDialogRef.current)) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      returnFocusElement?.focus();
    };
  }, [isStoryOpen]);

  if (!hero.enabled || !slides.length) return null;
  const move = (direction: number) => setIndex((previous) => (previous + direction + slides.length) % slides.length);
  const open = (url: string) => {
    if (url.startsWith('/') && !url.startsWith('//')) navigate(url);
    else if (/^https?:\/\//i.test(url)) window.location.assign(url);
  };

  return (
    <section className="home-hero-carousel" aria-label="Farminix home banners" aria-roledescription={slides.length > 1 ? 'carousel' : undefined}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false); }}>
      {slides.map((slide, slideIndex) => (
        <div key={slide.id} hidden={slideIndex !== active} role="group" aria-roledescription={slides.length > 1 ? 'slide' : undefined} aria-label={slides.length > 1 ? `${slideIndex + 1} of ${slides.length}` : undefined}>
          {isFarmSlide(slide.image) ? (
            <div className="farm-hero">
              <div className="farm-hero-stage">
                <img className="farm-hero-scene" src="/home-farm-hero.png" alt="Farminix rice bags with freshly harvested rice, overlooking green fields and mountains" fetchPriority={slideIndex === 0 ? 'high' : 'auto'} loading={slideIndex === 0 ? 'eager' : 'lazy'} />
                <div className="farm-hero-copy">
                  <div className="farm-hero-eyebrow"><Leaf size={21} /><span>From Farm to Family</span></div>
                  <h1>Pure. <span>Natural.<Leaf aria-hidden="true" /></span><br />Healthy.</h1>
                  <p className="farm-hero-tagline">Goodness of Our Farms, On Your Table.</p>
                  <div className="farm-hero-features">
                    {heroFeatures.map(({ Icon, title, subtitle }) => (
                      <div key={subtitle}><span className="farm-feature-icon"><Icon /></span><strong>{title}</strong><span>{subtitle}</span></div>
                    ))}
                  </div>
                  <div className="farm-hero-actions">
                    <button className="farm-shop-button" onClick={() => open(slide.linkUrl || hero.shopNowUrl || '/products')}>{slide.buttonText || 'Shop now'}<ArrowRight size={24} /></button>
                    <button className="farm-story-button" ref={slideIndex === active ? storyButtonRef : undefined} onClick={() => storySource ? setIsStoryOpen(true) : navigate('/about')}><span><Play size={19} fill="currentColor" /></span><span>Watch Our Story</span></button>
                  </div>
                </div>
                <div className="farm-quality-seal" aria-label="Premium quality grains from our farms"><Wheat size={25} /><strong>Premium</strong><span>Quality Grains</span><small>From Our Farms</small><Leaf size={21} /></div>
                <svg className="farm-hero-waves" viewBox="0 0 1600 150" preserveAspectRatio="none" aria-hidden="true"><path d="M0 12C110 33 170 117 290 68S440 31 560 91 790 136 1000 100 1270 142 1600 88V150H0Z" fill="#c69aff" fillOpacity=".75" /><path d="M0 47C140 47 160 139 340 99S470 67 610 121 900 105 1040 102 1310 134 1600 111V150H0Z" fill="#8d31f5" fillOpacity=".85" /><path d="M0 107C170 143 232 112 382 123S603 156 800 124 1140 116 1280 136 1470 105 1600 124V150H0Z" fill="#f5efff" /></svg>
              </div>
              <div className="farm-benefit-strip">
                {farmBenefits.map(({ Icon, title, subtitle }) => (
                  <div className="farm-benefit" key={title}><span className="farm-benefit-icon"><Icon /></span><span><strong>{title}</strong><span>{subtitle}</span></span></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="home-custom-banner">
              <img src={slide.image} alt={slide.altText || 'Farminix banner'} loading={slideIndex === 0 ? 'eager' : 'lazy'} />
              {slide.linkUrl && !slide.buttonText && !slide.legacyHotspots && <button type="button" className="home-banner-hotspot" aria-label={slide.altText || `Open banner ${slideIndex + 1}`} onClick={() => open(slide.linkUrl)} />}
              {slide.linkUrl && (slide.buttonText || slide.legacyHotspots) && <button type="button" className="home-banner-action" onClick={() => open(slide.linkUrl)}>{slide.buttonText || 'Shop now'}<ArrowRight size={20} /></button>}
            </div>
          )}
        </div>
      ))}
      {slides.length > 1 && <div className="home-carousel-controls"><button type="button" aria-label="Previous banner" onClick={() => move(-1)}><ChevronLeft size={19} /></button>{slides.map((slide, slideIndex) => <button key={slide.id} type="button" aria-label={`Show banner ${slideIndex + 1}`} aria-current={slideIndex === active ? 'true' : undefined} className="home-carousel-dot" onClick={() => setIndex(slideIndex)} />)}<button type="button" aria-label="Next banner" onClick={() => move(1)}><ChevronRight size={19} /></button><button type="button" className="home-carousel-pause" onClick={() => setIsPaused((previous) => !previous)}>{isPaused ? 'Play' : 'Pause'}</button></div>}
      {isStoryOpen && createPortal(
        <div className="farm-story-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setIsStoryOpen(false); }}>
          <div ref={storyDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="farm-story-title" className="farm-story-dialog">
            <div><h2 id="farm-story-title">From Farm to Family</h2><button onClick={() => setIsStoryOpen(false)} aria-label="Close our story"><X size={22} /></button></div>
            <video src={storySource} controls tabIndex={0} autoPlay playsInline preload="metadata" aria-label="The Farminix story" />
          </div>
        </div>, document.body,
      )}
    </section>
  );
}
