import type { ComponentType } from 'react';
import { Heart, Leaf, Package, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react';

export const featureIconOptions = [
  { value: 'leaf', label: 'Leaf' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'package', label: 'Package' },
  { value: 'zap', label: 'Lightning' },
  { value: 'shield', label: 'Shield' },
  { value: 'heart', label: 'Heart' },
  { value: 'star', label: 'Star' },
] as const;

export type FeatureIconName = (typeof featureIconOptions)[number]['value'];

const legacyIconNames: Record<string, FeatureIconName> = {
  '🌾': 'leaf', '✨': 'sparkles', '📦': 'package', '⚡': 'zap', '🛡️': 'shield', '❤️': 'heart', '⭐': 'star',
};

export const normalizeFeatureIcon = (value: string | undefined): FeatureIconName => {
  const normalized = (value || '').trim().toLowerCase();
  if (legacyIconNames[value || '']) return legacyIconNames[value || ''];
  if (featureIconOptions.some(option => option.value === normalized)) return normalized as FeatureIconName;
  return 'leaf';
};

const iconMap: Record<FeatureIconName, ComponentType<any>> = {
  leaf: Leaf, sparkles: Sparkles, package: Package, zap: Zap, shield: ShieldCheck, heart: Heart, star: Star,
};

export function ProductFeatureIcon({ name, className = 'h-8 w-8 text-purple-600' }: { name?: string; className?: string }) {
  const Icon = iconMap[normalizeFeatureIcon(name)];
  return <Icon className={className} aria-hidden="true" />;
}
