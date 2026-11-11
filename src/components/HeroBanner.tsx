import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import './HeroBanner.css';

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

  useEffect(() => {
    if (!hero.enabled || slides.length < 2 || isPaused || isHovered || hasFocus || hero.autoplay === false || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((previous) => (previous + 1) % slides.length), Math.min(10, Math.max(5, hero.intervalSeconds || 6)) * 1000);
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
          <div className="home-custom-banner" style={{backgroundColor:slide.backgroundColor || '#f5effa', color:slide.textColor || '#21123e', '--banner-accent':slide.accentColor || '#7622b7'} as CSSProperties}>
            <img src={slide.image} alt={slide.altText || 'Farminix banner'} loading={slideIndex === 0 ? 'eager' : 'lazy'} />
            {(slide.eyebrow || slide.title || slide.description) && <div className="home-banner-copy">{slide.eyebrow && <span className="home-banner-eyebrow">{slide.eyebrow}</span>}{slide.title && <h1>{slide.title}</h1>}{slide.description && <p>{slide.description}</p>}{slide.linkUrl && slide.buttonText && <button type="button" className="home-banner-action" onClick={() => open(slide.linkUrl)}>{slide.buttonText}<ArrowRight size={20} /></button>}</div>}
            {slide.linkUrl && !slide.buttonText && <button type="button" className="home-banner-hotspot" aria-label={slide.altText || `Open banner ${slideIndex + 1}`} onClick={() => open(slide.linkUrl)} />}
            {slide.linkUrl && slide.buttonText && !slide.title && <button type="button" className="home-banner-action" onClick={() => open(slide.linkUrl)}>{slide.buttonText}<ArrowRight size={20} /></button>}
          </div>
        </div>
      ))}
      {slides.length > 1 && <div className="home-carousel-controls"><button type="button" aria-label="Previous banner" onClick={() => move(-1)}><ChevronLeft size={19} /></button>{slides.map((slide, slideIndex) => <button key={slide.id} type="button" aria-label={`Show banner ${slideIndex + 1}`} aria-current={slideIndex === active ? 'true' : undefined} className="home-carousel-dot" onClick={() => setIndex(slideIndex)} />)}<button type="button" aria-label="Next banner" onClick={() => move(1)}><ChevronRight size={19} /></button><button type="button" className="home-carousel-pause" onClick={() => setIsPaused((previous) => !previous)}>{isPaused ? 'Play' : 'Pause'}</button></div>}
    </section>
  );
}
