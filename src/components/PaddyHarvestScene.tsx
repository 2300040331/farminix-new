import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Leaf, Pause, Play } from 'lucide-react';
import { createHarvestRenderer } from './paddyHarvestRenderer';
import type { HarvestRenderer } from './paddyHarvestRenderer';
import './PaddyHarvestScene.css';

interface PaddyHarvestSceneProps {
  variant?: 'section' | 'intro';
  onReady?: () => void;
}

export default function PaddyHarvestScene({ variant = 'section', onReady }: PaddyHarvestSceneProps) {
  const titleId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<HarvestRenderer | null>(null);
  const visibleRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const playingRef = useRef(isPlaying);
  const [renderer, setRenderer] = useState<'pending' | 'webgl2' | 'css'>('pending');

  useEffect(() => {
    if (renderer !== 'pending') onReady?.();
  }, [renderer, onReady]);

  useEffect(() => {
    const canvas = canvasRef.current, root = rootRef.current;
    if (!canvas || !root) return;
    try {
      rendererRef.current = createHarvestRenderer(canvas);
      setRenderer(rendererRef.current ? 'webgl2' : 'css');
    } catch {
      setRenderer('css');
    }
    const update = () => rendererRef.current?.setRunning(playingRef.current && visibleRef.current && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      root.dataset.visible = String(entry.isIntersecting);
      update();
    }, { threshold: 0.06 });
    observer.observe(root);
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changePreference = () => setIsPlaying(!preference.matches);
    const contextLost = (event: Event) => {
      event.preventDefault(); rendererRef.current?.dispose(); rendererRef.current = null; setRenderer('css');
    };
    document.addEventListener('visibilitychange', update);
    preference.addEventListener('change', changePreference);
    canvas.addEventListener('webglcontextlost', contextLost);
    return () => {
      observer.disconnect(); document.removeEventListener('visibilitychange', update);
      preference.removeEventListener('change', changePreference);
      canvas.removeEventListener('webglcontextlost', contextLost);
      rendererRef.current?.dispose(); rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    playingRef.current = isPlaying;
    rendererRef.current?.setRunning(isPlaying && visibleRef.current && !document.hidden);
  }, [isPlaying]);

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
      {renderer === 'css' && <div className="paddy-harvest-fallback" aria-hidden="true">{Array.from({ length: 22 }, (_, index) => (
        <span key={index} style={{ '--grain-x': `${38 + index * 17 % 51}%`, '--grain-y': `${16 + index * 11 % 29}%`, '--grain-delay': `${-index * 0.47}s`, '--grain-drift': `${Math.sin(index) * 65}px`, '--grain-turn': `${160 + index * 43}deg` } as CSSProperties} />
      ))}</div>}
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
          <small className="paddy-harvest-hint">Move your cursor to explore the harvest.</small>
        </div>
      </div>
      <span className="paddy-harvest-corner-note" aria-hidden="true">ROOTED IN NATURE</span>
    </section>
  );
}
