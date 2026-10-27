import { useEffect, useId, useRef, useState } from 'react';
import { Leaf } from 'lucide-react';
import { createHarvestRenderer } from './paddyHarvestRenderer';
import type { HarvestRenderer } from './paddyHarvestRenderer';
import { createMobileHarvestRenderer } from './paddyHarvestMobileRenderer';
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
  const mobileCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<HarvestRenderer | null>(null);
  const visibleRef = useRef(false);
  const [isPlaying] = useState(true);
  const [isLightweight] = useState(() => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const onCompleteRef = useRef(onComplete);
  const playingRef = useRef(isPlaying);
  const [renderer, setRenderer] = useState<'pending' | 'webgl2' | 'canvas2d' | 'svg'>('pending');

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (renderer !== 'pending') onReady?.();
  }, [renderer, onReady]);

  useEffect(() => {
    const canvas = canvasRef.current, mobileCanvas = mobileCanvasRef.current, root = rootRef.current;
    if (!canvas || !mobileCanvas || !root) return;
    let initialized = false;
    const sequence = variant === 'intro' ? { once: true, onComplete: () => onCompleteRef.current?.() } : undefined;
    const initializeMobileRenderer = () => {
      try { rendererRef.current = createMobileHarvestRenderer(mobileCanvas, sequence); } catch { rendererRef.current = null; }
      setRenderer(rendererRef.current ? 'canvas2d' : 'svg');
    };
    const update = () => {
      const rect = canvas.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
      visibleRef.current = visible;
      root.dataset.visible = String(visible);
      if (!initialized && visible && !document.hidden && !suspended) {
        initialized = true;
        if (!isLightweight) {
          try { rendererRef.current = createHarvestRenderer(canvas, sequence); } catch { rendererRef.current = null; }
        }
        if (rendererRef.current) setRenderer('webgl2'); else initializeMobileRenderer();
      }
      const running = playingRef.current && visible && !document.hidden && !suspended;
      root.dataset.running = String(running);
      rendererRef.current?.setRunning(running);
    };
    // Measure after the opening dialog is shown, and resume on scroll / returning to the tab.
    const startupFrame = requestAnimationFrame(update);
    const observer = new IntersectionObserver(update, { threshold: 0 });
    observer.observe(canvas);
    const contextLost = (event: Event) => {
      event.preventDefault(); rendererRef.current?.dispose(); rendererRef.current = null; initializeMobileRenderer(); update();
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('pageshow', update);
    document.addEventListener('visibilitychange', update);
    canvas.addEventListener('webglcontextlost', contextLost);
    return () => {
      cancelAnimationFrame(startupFrame);
      observer.disconnect(); document.removeEventListener('visibilitychange', update);
      window.removeEventListener('scroll', update); window.removeEventListener('resize', update);
      window.removeEventListener('pageshow', update);
      canvas.removeEventListener('webglcontextlost', contextLost);
      rendererRef.current?.dispose(); rendererRef.current = null;
    };
  }, [suspended, variant, isLightweight]);

  useEffect(() => {
    playingRef.current = isPlaying;
    const running = isPlaying && visibleRef.current && !document.hidden && !suspended;
    if (rootRef.current) rootRef.current.dataset.running = String(running);
    rendererRef.current?.setRunning(running);
  }, [isPlaying, suspended]);

  return (
    <section ref={rootRef} className={`paddy-harvest-scene paddy-harvest-${variant}`} aria-labelledby={titleId} data-renderer={renderer} data-playing={isPlaying}
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        const rect = event.currentTarget.getBoundingClientRect();
        rendererRef.current?.setPointer((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height * 2 - 1));
      }} onPointerLeave={() => rendererRef.current?.setPointer(0, 0)}>
      {!isLightweight && <img className="paddy-harvest-backdrop" src="/paddy-harvest-reference.png" alt="" aria-hidden="true" loading="lazy" />}
      <div className="paddy-harvest-atmosphere" aria-hidden="true" />
      <canvas ref={canvasRef} className="paddy-harvest-canvas" aria-hidden="true" />
      <canvas ref={mobileCanvasRef} className="paddy-harvest-mobile-canvas" aria-hidden="true" />
      {renderer === 'svg' && <div className="paddy-harvest-fallback" aria-hidden="true"><PaddyHarvestFallback once={variant === 'intro'} onComplete={onComplete} /></div>}
      <figure className="paddy-harvest-product">
        <img src="/farminix_rice_front.png" alt="Farminix Family Choice Rice, 26 kg bag" loading={variant === 'intro' ? 'eager' : 'lazy'} decoding="async" />
        <figcaption><strong>Farminix Family Choice Rice</strong><span>From our fields to your family · 26 kg</span></figcaption>
      </figure>
      <div className="store-container paddy-harvest-content">
        <div className="paddy-harvest-copy">
          <span className="paddy-harvest-eyebrow"><Leaf size={17} />The Farminix harvest</span>
          <h2 id={titleId}>Family Choice<br />Brand</h2>
          <p>A little sunshine. A gentle breeze.<br />And the grain at the heart of every family meal.</p>
          <div className="paddy-harvest-rule" aria-hidden="true" />
          <span className="paddy-harvest-caption">Grain by grain. Field to family.</span>
          <small className="paddy-harvest-hint">Move your cursor to explore the harvest.</small>
        </div>
      </div>
      <span className="paddy-harvest-corner-note" aria-hidden="true">ROOTED IN NATURE</span>
    </section>
  );
}
