import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

const palettes = [
  { tone: 'saffron', mark: '✦' },
  { tone: 'berry', mark: '✳' },
  { tone: 'leaf', mark: '✿' },
  { tone: 'blue', mark: '✧' },
  { tone: 'plum', mark: '✺' },
];

export const CategorySection: React.FC = () => {
  const { navigate } = useApp();
  const { publishedConfig } = useAdminConfig();
  const catSection = publishedConfig.categorySection;
  const categories = (publishedConfig.categories || []).filter((category) => category.enabled !== false);

  if (!catSection.enabled) return null;

  return (
    <section className="store-category-section" aria-labelledby="category-section-title">
      <div className="category-showcase-wrap">
        <div className="category-showcase-heading">
          <div>
            <span className="category-showcase-kicker"><Sparkles size={14} /> GOOD THINGS FOR YOUR KITCHEN</span>
            <h2 id="category-section-title">{catSection.title}</h2>
            <p>Little essentials, lots of everyday flavour.</p>
          </div>
          <button type="button" className="category-showcase-link" onClick={() => navigate(catSection.seeAllUrl || '/products')}>
            {catSection.seeAllText || 'Explore the store'} <ArrowUpRight size={18} />
          </button>
        </div>

        <div className="category-showcase-grid">
          {categories.map((category, index) => {
            const palette = palettes[index % palettes.length];
            return (
              <article className={`category-showcase-card ${palette.tone}`} key={category.id} style={{ animationDelay: `${index * 90}ms` }}>
                <span className="category-showcase-orbit" aria-hidden="true" />
                <span className="category-showcase-mark" aria-hidden="true">{palette.mark}</span>
                <div className="category-showcase-title-row">
                  <h3>{category.name}</h3>
                  <span className="category-showcase-count">COLLECTION</span>
                </div>
                <ul>
                  {(category.items || []).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
