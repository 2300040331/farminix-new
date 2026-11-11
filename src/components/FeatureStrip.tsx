import React from 'react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

export const FeatureStrip: React.FC = () => {
  const { setIsSupportOpen } = useApp();
  const { publishedConfig } = useAdminConfig();
  const strip = publishedConfig.featureStrip;

  if (!strip.enabled) return null;
  const allItems = strip.features.filter((feature) => feature.enabled).sort((a, b) => a.order - b.order);
  const items = allItems.filter((feature) => feature.actionType !== 'support');
  if (!allItems.length) return null;
  const repeated = [...items, ...items];

  return (
    <section className="home-benefit-marquee" aria-label="Farminix highlights" style={{ '--benefit-loop': `${Math.max(12, strip.speedSeconds || 18)}s`, '--benefit-accent': publishedConfig.theme.colorPrimary || '#6d28d9' } as React.CSSProperties}>
      {items.length > 0 && <div className="home-benefit-track" aria-hidden="true">
        {repeated.map((item, index) => (
          <span className="home-benefit-item" key={`${item.id}-${index}`}>
            <strong>{item.title}</strong><span>{item.subtitle}</span><i aria-hidden="true">✦</i>
          </span>
        ))}
      </div>}
      <div className="sr-only">{allItems.map((item) => `${item.title}: ${item.subtitle}`).join('. ')}</div>
      <div className="home-benefit-actions">
        {allItems.filter((item) => item.actionType === 'support').map((item) => <button key={item.id} type="button" onClick={() => setIsSupportOpen(true)}>{item.title}</button>)}
      </div>
    </section>
  );
};
