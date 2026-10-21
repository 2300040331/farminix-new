import { useId } from 'react';
import type { CSSProperties } from 'react';
import { HARVEST_GRAIN_FALL_SECONDS, HARVEST_INTRO_SECONDS } from './harvestTiming';

type Point = [number, number];
const curve = (a: Point, b: Point, c: Point, t: number): Point => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1],
];

// Shaded vector grains keep the harvest moving on phones without a GPU context.
export default function PaddyHarvestFallback({ once = false, onComplete }: { once?: boolean; onComplete?: () => void }) {
  const id = useId().replace(/:/g, '');
  const heads: [Point, Point, Point][] = [
    [[475, 45], [290, -15], [90, 205]],
    [[505, 180], [335, 95], [155, 335]],
    [[545, 20], [445, -30], [330, 115]],
  ];

  return (
    <svg className="paddy-harvest-vector" viewBox="0 0 640 460" aria-hidden="true" data-once={once}
      style={{ '--grain-cycle': `${HARVEST_GRAIN_FALL_SECONDS}s`, '--harvest-intro-duration': `${HARVEST_INTRO_SECONDS}s` } as CSSProperties}>
      <defs>
        <radialGradient id={`${id}-husk`} cx="30%" cy="25%" r="80%">
          <stop stopColor="#f4edab" /><stop offset=".48" stopColor="#c5b55e" /><stop offset="1" stopColor="#65712d" />
        </radialGradient>
        <radialGradient id={`${id}-rice`} cx="28%" cy="24%" r="85%">
          <stop stopColor="#ffffff" /><stop offset=".5" stopColor="#fff2d0" /><stop offset="1" stopColor="#be985b" />
        </radialGradient>
        <linearGradient id={`${id}-leaf`}><stop stopColor="#334923" /><stop offset=".5" stopColor="#8ba84c" /><stop offset="1" stopColor="#526e2b" /></linearGradient>
      </defs>
      {heads.map(([crown, arch, tip], plant) => (
        <g key={plant} className="paddy-vector-stalk" style={{ '--stalk-delay': `${plant * -.8}s` } as CSSProperties}>
          <path d={`M ${525 + plant * 25} 490 Q ${540 + plant * 15} 260 ${crown.join(' ')} Q ${arch.join(' ')} ${tip.join(' ')}`} fill="none" stroke="#a1a15c" strokeWidth="3" />
          <path d={`M ${525 + plant * 25} 470 Q ${360 + plant * 15} 300 ${390 + plant * 30} 170 Q ${470 + plant * 25} 340 ${525 + plant * 25} 470`} fill={`url(#${id}-leaf)`} />
          <path d={`M ${530 + plant * 25} 440 Q ${585 + plant * 15} 180 ${625 + plant * 5} 85 Q ${630 + plant * 5} 260 ${530 + plant * 25} 440`} fill={`url(#${id}-leaf)`} />
          {Array.from({ length: 12 }, (_, branch) => {
            const t = .12 + branch * .072;
            const anchor = curve(crown, arch, tip, t);
            const end: Point = [anchor[0] - 25, anchor[1] + 34 + branch % 3 * 5];
            return <g key={branch}>
              <path d={`M ${anchor.join(' ')} Q ${anchor[0] - 6} ${anchor[1] + 20} ${end.join(' ')}`} fill="none" stroke="#b7ad64" strokeWidth="1.4" />
              {Array.from({ length: 6 }, (_, slot) => {
                const grain = branch * 6 + slot + plant * 72;
                const x = anchor[0] - slot * 4 + (slot % 2 ? 6 : -5);
                const y = anchor[1] + slot * 6;
                const falls = grain % 9 === 2 || grain % 17 === 4;
                return <g key={slot} transform={`translate(${x} ${y})`}>
                  <g className={falls ? 'paddy-vector-falling' : undefined} style={{ '--fall-delay': `${once ? (grain % 23) / 22 * (HARVEST_INTRO_SECONDS - 2 * HARVEST_GRAIN_FALL_SECONDS) : -(grain % 23) * .31}s`, '--fall-drift': `${Math.sin(grain) * 48}px` } as CSSProperties}>
                    <ellipse rx={falls ? 4.4 : 3.9} ry="10" transform={`rotate(${falls ? 35 : 24 + slot % 2 * -55})`} fill={`url(#${id}-${falls ? 'rice' : 'husk'})`} />
                    {!falls && <path d="M 0 -6 Q 2 0 0 6" fill="none" stroke="#fcf4be" strokeWidth=".6" opacity=".55" />}
                  </g>
                </g>;
              })}
            </g>;
          })}
        </g>
      ))}
      {once && <g className="paddy-vector-completion" onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === 'paddy-harvest-complete') onComplete?.();
      }}><rect width="1" height="1" fill="transparent" /></g>}
    </svg>
  );
}
