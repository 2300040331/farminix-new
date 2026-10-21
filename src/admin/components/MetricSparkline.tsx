import { useId } from 'react';

export function MetricSparkline({ values, label }: { values: number[]; label: string }) {
  const gradientId = useId();
  const samples = values.length > 1 ? values : [values[0] || 0, values[0] || 0];
  const maximum = Math.max(...samples, 1);
  const points = samples.map((value, index) => `${4 + index * 100 / (samples.length - 1)},${42 - value / maximum * 32}`).join(' ');
  return <svg className="admin-sparkline" viewBox="0 0 108 48" role="img" aria-label={label}>
    <title>{label}</title>
    <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".2"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs>
    <polygon points={`4,47 ${points} 104,47`} fill={`url(#${gradientId})`}/>
    <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="104" cy={42 - samples[samples.length - 1] / maximum * 32} r="2.5" fill="currentColor"/>
  </svg>;
}
