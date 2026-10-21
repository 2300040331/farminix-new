import { useEffect, useId, useRef, useState } from 'react';
import { Leaf, Pause, Play } from 'lucide-react';
import { createHarvestRenderer } from './paddyHarvestRenderer';
import type { HarvestRenderer } from './paddyHarvestRenderer';
import PaddyHarvestFallback from './PaddyHarvestFallback';
import './PaddyHarvestScene.css';

interface PaddyHarvestSceneProps {
  variant?: 'section' | 'intro';
  onReady?: () => void;
  onComplete?: () => void;
  suspended?: boolean;
}

export default function PaddyHarvestScene({ variant = 'section', onReady, onComplete, suspended = false }: PaddyHarvestSceneProps) {
  const titleId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<HarvestRenderer | null>(null);
  const visibleRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(() => variant === 'intro' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [isProductReady, setIsProductReady] = useState(false);
  const waitingForProduct = variant === 'intro' && !isProductReady;
  const onCompleteRef = useRef(onComplete);
  const playingRef = useRef(isPlaying);
  const [renderer, setRenderer] = useState<'pending' | 'webgl2' | 'svg'>('pending');

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (renderer !== 'pending') onReady?.();
  }, [renderer, onReady]);

  useEffect(() => {
    const canvas = canvasRef.current, root = rootRef.current;
    if (!canvas || !root) return;
    let initialized = false;
    const update = () => {
      const rect = canvas.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
      visibleRef.current = visible;
      root.dataset.visible = String(visible);
      if (!initialized && visible && !document.hidden && !suspended && !waitingForProduct) {
        initialized = true;
        // Phone playback uses shaded SVG grains, independent of WebGL and video autoplay restrictions.
        const useVector = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!useVector) {
          try { rendererRef.current = createHarvestRenderer(canvas, variant === 'intro' ? { once: true, onComplete: () => onCompleteRef.current?.() } : undefined); } catch { rendererRef.current = null; }
        }
        setRenderer(rendererRef.current ? 'webgl2' : 'svg');
      }
      const running = playingRef.current && visible && !document.hidden && !suspended && !waitingForProduct;
      root.dataset.running = String(running);
      rendererRef.current?.setRunning(running);
    };
    // Measure after the opening dialog is shown, and resume on scroll / returning to the tab.
    const startupFrame = requestAnimationFrame(update);
    const observer = new IntersectionObserver(update, { threshold: 0 });
    observer.observe(canvas);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changePreference = () => { if (variant !== 'intro') setIsPlaying(!preference.matches); };
    const contextLost = (event: Event) => {
      event.preventDefault(); rendererRef.current?.dispose(); rendererRef.current = null; setRenderer('svg'); update();
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('pageshow', update);
    document.addEventListener('visibilitychange', update);
    preference.addEventListener('change', changePreference);
    canvas.addEventListener('webglcontextlost', contextLost);
    return () => {
      cancelAnimationFrame(startupFrame);
      observer.disconnect(); document.removeEventListener('visibilitychange', update);
      window.removeEventListener('scroll', update); window.removeEventListener('resize', update);
      window.removeEventListener('pageshow', update);
      preference.removeEventListener('change', changePreference);
      canvas.removeEventListener('webglcontextlost', contextLost);
      rendererRef.current?.dispose(); rendererRef.current = null;
    };
  }, [suspended, waitingForProduct, variant]);

  useEffect(() => {
    playingRef.current = isPlaying;
    const running = isPlaying && visibleRef.current && !document.hidden && !suspended && !waitingForProduct;
    if (rootRef.current) rootRef.current.dataset.running = String(running);
    rendererRef.current?.setRunning(running);
  }, [isPlaying, suspended, waitingForProduct]);

  return (
    <section ref={rootRef} className={`paddy-harvest-scene paddy-harvest-${variant}`} aria-labelledby={titleId} data-renderer={renderer} data-playing={isPlaying}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        const rect = event.currentTarget.getBoundingClientRect();
        rendererRef.current?.setPointer((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height * 2 - 1));
      }} onPointerLeave={() => rendererRef.current?.setPointer(0, 0)}>
      <img className="paddy-harvest-backdrop" src="/paddy-harvest-reference.png" alt="" aria-hidden="true" loading={variant === 'intro' ? 'eager' : 'lazy'} />
      <div className="paddy-harvest-atmosphere" aria-hidden="true" />
      <canvas ref={canvasRef} className="paddy-harvest-canvas" aria-hidden="true" />
      {renderer !== 'webgl2' && <div className="paddy-harvest-fallback" aria-hidden="true"><PaddyHarvestFallback once={variant === 'intro'} onComplete={onComplete} /></div>}
      <figure className="paddy-harvest-product">
        <img src="/farminix_rice_front.png" alt="Farminix Family Choice Rice, 26 kg bag" loading={variant === 'intro' ? 'eager' : 'lazy'} onLoad={() => setIsProductReady(true)} onError={() => setIsProductReady(true)} />
        <figcaption><strong>Farminix Family Choice Rice</strong><span>From our fields to your family · 26 kg</span></figcaption>
      </figure>
      <div className="store-container paddy-harvest-content">
        <div className="paddy-harvest-copy">
          <span className="paddy-harvest-eyebrow"><Leaf size={17} />The Farminix harvest</span>
          <h2 id={titleId}>Family Choice<br />Brand</h2>
          <p>A little sunshine. A gentle breeze.<br />And the grain at the heart of every family meal.</p>
          <div className="paddy-harvest-rule" aria-hidden="true" />
          <span className="paddy-harvest-caption">Grain by grain. Field to family.</span>
          <button type="button" className="paddy-harvest-control" aria-label={isPlaying ? 'Pause rice animation' : 'Play rice animation'} aria-pressed={!isPlaying} onClick={() => setIsPlaying((previous) => !previous)}>
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}<span>{isPlaying ? 'Pause animation' : 'Play animation'}</span>
          </button>
          {!isPlaying && window.matchMedia('(prefers-reduced-motion: reduce)').matches && <small className="paddy-harvest-motion-note">Reduced motion is on. Tap Play to animate.</small>}
          <small className="paddy-harvest-hint">Move your cursor to explore the harvest.</small>
        </div>
      </div>
      <span className="paddy-harvest-corner-note" aria-hidden="true">ROOTED IN NATURE</span>
    </section>
  );
}
