import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, ShieldCheck, Users, Wheat } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import './HeroBanner.css';

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
  const active = slides.length ? index % slides.length : 0;
  const isFarmSlide = (image: string) => /(?:^|\/)hero_banner_original\.jpg(?:\?|$)/i.test(image);

  useEffect(() => {
    if (!hero.enabled || slides.length < 2 || isPaused || isHovered || hasFocus || hero.autoplay === false || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((previous) => (previous + 1) % slides.length), Math.max(3, hero.intervalSeconds || 5) * 1000);
    return () => window.clearInterval(timer);
  }, [hero.enabled, hero.autoplay, hero.intervalSeconds, slides.length, isPaused, isHovered, hasFocus]);

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
                <div className="farm-hero-copy">
                  <div className="farm-hero-eyebrow"><Leaf size={17} /><span>Farminix · Family Choice</span></div>
                  <h1>Good rice.<br /><span>Great family meals.</span></h1>
                  <p className="farm-hero-tagline">Carefully selected rice for everyday cooking and the meals your family shares.</p>
                  <div className="farm-hero-actions">
                    <button className="farm-shop-button" onClick={() => open(slide.linkUrl || hero.shopNowUrl || '/products')}>{slide.buttonText || 'Shop now'}<ArrowRight size={19} /></button>
                  </div>
                </div>
                <figure className="farm-hero-product">
                  <div className="farm-product-halo" aria-hidden="true" />
                  <img className="farm-hero-pack" src="/farminix_rice_front.png" alt="Farminix Family Choice Rice, 26 kg bag" fetchPriority={slideIndex === 0 ? 'high' : 'auto'} loading={slideIndex === 0 ? 'eager' : 'lazy'} decoding="async" />
                  <figcaption className="farm-pack-label"><Wheat size={18} aria-hidden="true" /><span><strong>Family Choice Rice</strong><span>26 kg family pack</span></span></figcaption>
                </figure>
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
    </section>
  );
}
