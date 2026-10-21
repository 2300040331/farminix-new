import type { HarvestRenderer } from './paddyHarvestRenderer';
import { HARVEST_GRAIN_FALL_SECONDS, HARVEST_INTRO_SECONDS } from './harvestTiming';

type Point = [number, number];
type Grain = { x: number; y: number; rotation: number; drift: number };
const curve = (a: Point, b: Point, c: Point, t: number): Point => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1],
];

// Rasterize the paddy once; each mobile frame draws one cached plant and at most 24 grains.
export function createMobileHarvestRenderer(canvas: HTMLCanvasElement, sequence?: { once: boolean; onComplete: () => void }): HarvestRenderer | null {
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return null;
  const makeCanvas = (width: number, height: number) => {
    const surface = document.createElement('canvas'); surface.width = width; surface.height = height; return surface;
  };
  const plant = makeCanvas(640, 500), plantCtx = plant.getContext('2d');
  if (!plantCtx) return null;
  const sprite = (polished: boolean) => {
    const surface = makeCanvas(36, 70), paint = surface.getContext('2d');
    if (!paint) return surface;
    const light = paint.createRadialGradient(13, 22, 2, 18, 35, 34);
    light.addColorStop(0, polished ? '#ffffff' : '#f4edab');
    light.addColorStop(.48, polished ? '#fff2d0' : '#c5b55e');
    light.addColorStop(1, polished ? '#be985b' : '#65712d');
    paint.fillStyle = light; paint.beginPath(); paint.ellipse(18, 35, 12, 30, 0, 0, Math.PI * 2); paint.fill();
    return surface;
  };
  const husk = sprite(false), rice = sprite(true), grains: Grain[] = [];
  const heads: [Point, Point, Point][] = [
    [[475, 45], [290, -15], [90, 205]],
    [[505, 180], [335, 95], [155, 335]],
    [[545, 20], [445, -30], [330, 115]],
  ];
  const drawGrain = (paint: CanvasRenderingContext2D, image: HTMLCanvasElement, x: number, y: number, rotation: number, width = 9) => {
    paint.save(); paint.translate(x, y); paint.rotate(rotation); paint.drawImage(image, -width / 2, -10, width, 20); paint.restore();
  };
  heads.forEach(([crown, arch, tip], index) => {
    plantCtx.strokeStyle = '#a1a15c'; plantCtx.lineWidth = 3; plantCtx.beginPath();
    plantCtx.moveTo(525 + index * 25, 490); plantCtx.quadraticCurveTo(540 + index * 15, 260, ...crown);
    plantCtx.quadraticCurveTo(...arch, ...tip); plantCtx.stroke();
    const leaf = plantCtx.createLinearGradient(390, 0, 630, 0);
    leaf.addColorStop(0, '#334923'); leaf.addColorStop(.5, '#8ba84c'); leaf.addColorStop(1, '#526e2b'); plantCtx.fillStyle = leaf;
    plantCtx.beginPath(); plantCtx.moveTo(525 + index * 25, 470);
    plantCtx.quadraticCurveTo(360 + index * 15, 300, 390 + index * 30, 170);
    plantCtx.quadraticCurveTo(470 + index * 25, 340, 525 + index * 25, 470); plantCtx.fill();
    plantCtx.beginPath(); plantCtx.moveTo(530 + index * 25, 440);
    plantCtx.quadraticCurveTo(585 + index * 15, 180, 625 + index * 5, 85);
    plantCtx.quadraticCurveTo(630 + index * 5, 260, 530 + index * 25, 440); plantCtx.fill();
    for (let branch = 0; branch < 12; branch++) {
      const anchor = curve(crown, arch, tip, .12 + branch * .072);
      plantCtx.lineWidth = 1.4; plantCtx.strokeStyle = '#b7ad64'; plantCtx.beginPath(); plantCtx.moveTo(...anchor);
      plantCtx.quadraticCurveTo(anchor[0] - 6, anchor[1] + 20, anchor[0] - 25, anchor[1] + 34 + branch % 3 * 5); plantCtx.stroke();
      for (let slot = 0; slot < 6; slot++) {
        const id = branch * 6 + slot + index * 72;
        const grain = { x: anchor[0] - slot * 4 + (slot % 2 ? 6 : -5), y: anchor[1] + slot * 6, rotation: (24 + slot % 2 * -55) * Math.PI / 180, drift: Math.sin(id) * 48 };
        if ((id % 9 === 2 || id % 17 === 4) && grains.length < 24) grains.push(grain);
        else drawGrain(plantCtx, husk, grain.x, grain.y, grain.rotation);
      }
    }
  });

  let running = false, disposed = false, completed = false, frame = 0, lastTick = 0, lastDraw = 0;
  let elapsed = sequence?.once ? 0 : 2.7, width = 1, height = 1, ratio = 1, frames = 0, lastReport = -1;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const render = () => {
    if (disposed) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width / 640, height / 500), x = (width - 640 * scale) / 2, y = (height - 500 * scale) / 2;
    ctx.translate(x, y); ctx.scale(scale, scale);
    // One cached layer sways, instead of repainting hundreds of shaded SVG nodes.
    ctx.translate(540, 490); ctx.rotate(reduced ? 0 : Math.sin(elapsed * .8) * .004); ctx.translate(-540, -490);
    ctx.drawImage(plant, 0, 0);
    let falling = 0;
    grains.forEach((grain, index) => {
      const delay = index / Math.max(1, grains.length - 1) * (HARVEST_INTRO_SECONDS - 2 * HARVEST_GRAIN_FALL_SECONDS);
      const active = sequence?.once ? elapsed - delay : elapsed + index * .31;
      if (sequence?.once && active >= 2 * HARVEST_GRAIN_FALL_SECONDS) return;
      const phase = active < 0 ? 0 : active % HARVEST_GRAIN_FALL_SECONDS;
      const t = Math.max(0, (phase - .75) / (HARVEST_GRAIN_FALL_SECONDS - .75));
      if (t > 0) falling++;
      ctx.globalAlpha = Math.min(1, (1 - t) * 9);
      drawGrain(ctx, t > 0 ? rice : husk, grain.x + grain.drift * t, grain.y + 450 * t * t, grain.rotation + t * 7, 9 * (.65 + .35 * Math.abs(Math.cos(t * 5))));
    });
    ctx.globalAlpha = 1; frames++;
    if (elapsed - lastReport >= .2 || completed || elapsed === HARVEST_INTRO_SECONDS) {
      canvas.dataset.sceneTime = elapsed.toFixed(2); canvas.dataset.renderFrames = String(frames); canvas.dataset.fallingGrains = String(falling); lastReport = elapsed;
    }
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    ratio = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); render();
  };
  const tick = (now: number) => {
    if (!running || disposed) return;
    if (lastTick) elapsed += (now - lastTick) / 1000;
    lastTick = now;
    if (sequence?.once) elapsed = Math.min(elapsed, HARVEST_INTRO_SECONDS);
    if (now - lastDraw >= 1000 / 30 || elapsed === HARVEST_INTRO_SECONDS) { render(); lastDraw = now - (now - lastDraw) % (1000 / 30); }
    if (sequence?.once && elapsed >= HARVEST_INTRO_SECONDS) {
      completed = true; running = false; sequence.onComplete(); return;
    }
    frame = requestAnimationFrame(tick);
  };
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
  return {
    setRunning(value) {
      if (running === value || disposed || completed) return;
      running = value; lastTick = 0;
      if (running) frame = requestAnimationFrame(tick); else cancelAnimationFrame(frame);
    },
    setPointer() {},
    dispose() { disposed = true; running = false; cancelAnimationFrame(frame); observer.disconnect(); },
  };
}
