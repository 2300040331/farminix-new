import React from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { defaultSiteConfig } from '../admin/defaultConfig';

const fallbackImages: Record<string, string> = {
  powders: '/cat_masala.jpg', spices: '/cat_masala.jpg', 'dry-fruits': '/cat_snacks.jpg', grocery: '/cat_dals.jpg', oils: '/cat_oils.jpg',
  rice: '/cat_rice.jpg', 'rice-grains': '/cat_rice.jpg', dals: '/cat_dals.jpg', atta: '/cat_atta.jpg', household: '/cat_household.jpg', snacks: '/cat_snacks.jpg', masala: '/cat_masala.jpg',
};

export const CategorySection: React.FC = () => {
  const { navigate, allProducts } = useApp();
  const { publishedConfig } = useAdminConfig();
  const catSection = publishedConfig.categorySection || defaultSiteConfig.categorySection;
  const configured = (publishedConfig.categories || []).filter((category) => category.enabled !== false);
  const categories = configured.length ? configured : defaultSiteConfig.categories;
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const pointerStart = React.useRef<number | null>(null);
  const lastMotion = React.useRef(0);

  React.useEffect(() => { setActive((current) => categories.length ? current % categories.length : 0); }, [categories.length]);
  React.useEffect(() => {
    if (paused || categories.length < 2) return;
    const timer = window.setInterval(() => {
      if (Date.now() - lastMotion.current > 1700) setActive((index) => (index + 1) % categories.length);
    }, 4400);
    return () => window.clearInterval(timer);
  }, [paused, categories.length]);

  if (catSection?.enabled === false) return null;
  const move = (amount: number) => { lastMotion.current = Date.now(); setActive((index) => (index + amount + categories.length) % categories.length); };
  const selected = categories[active];
  const selectedCount = selected ? allProducts.filter((product) => `${product.category} ${product.name}`.toLowerCase().includes(selected.name.toLowerCase().replace(/&/g, ' ')) || product.category.toLowerCase().includes(selected.id.replace(/-/g, ' '))).length : 0;

  return (
    <section className="store-category-section category-wheel-section" aria-labelledby="category-section-title">
      <div className="category-showcase-wrap">
        <div className="category-showcase-heading">
          <div>
            <span className="category-showcase-kicker"><Sparkles size={14} /> GOOD THINGS FOR YOUR KITCHEN</span>
            <h2 id="category-section-title">{catSection.title || 'Everything Your Kitchen Loves'}</h2>
            <p>From the everyday to the extraordinary, find your next favourite.</p>
          </div>
          <button type="button" className="category-showcase-link" onClick={() => navigate(catSection.seeAllUrl || '/products')}>
            {catSection.seeAllText || 'Explore the store'} <ArrowUpRight size={18} />
          </button>
        </div>

        <div className="category-wheel" onPointerEnter={() => setPaused(true)} onPointerLeave={() => { setPaused(false); pointerStart.current = null; }} onPointerDown={(event) => { pointerStart.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={(event) => { if (pointerStart.current !== null) { const delta = event.clientX - pointerStart.current; if (Math.abs(delta) > 35) move(delta < 0 ? 1 : -1); pointerStart.current = null; } }} onPointerMove={(event) => { if (pointerStart.current !== null && Math.abs(event.clientX - pointerStart.current) > 35) { move(event.clientX < pointerStart.current ? 1 : -1); pointerStart.current = event.clientX; } }} onWheel={(event) => { if (Math.abs(event.deltaX) + Math.abs(event.deltaY) > 16) move(event.deltaX + event.deltaY > 0 ? 1 : -1); }}>
          <div className="category-wheel-halo" aria-hidden="true" />
          <div className="category-wheel-track" aria-hidden="true" />
          {categories.map((category, index) => {
            const count = categories.length;
            const distance = (index - active + count) % count;
            const angle = (distance / count) * Math.PI * 2;
            const depth = Math.cos(angle);
            const x = Math.sin(angle) * Math.min(410, 34 * count + 240);
            const y = (1 - depth) * 40;
            const scale = 0.78 + Math.max(0, depth) * 0.22;
            const image = category.image || fallbackImages[category.id] || '/cat_rice.jpg';
            return <button type="button" key={category.id} className={`category-wheel-card ${index === active ? 'is-active' : ''}`} style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`, zIndex: Math.round((depth + 1) * 10), opacity: 0.56 + Math.max(0, depth) * 0.44 }} onClick={() => { lastMotion.current = Date.now(); setActive(index); }} onFocus={() => setPaused(true)} aria-pressed={index === active} aria-label={`Show ${category.name}`}>
              <span className="category-wheel-image-wrap"><img src={image} alt={category.name} loading="lazy" /><span className="category-wheel-image-glow" /></span>
              <span className="category-wheel-card-copy"><span className="category-wheel-eyebrow">FARMINIX COLLECTION</span><strong>{category.name}</strong><span className="category-wheel-items">{category.items?.slice(0, 3).join(' · ') || 'Good things for your kitchen'}</span></span>
            </button>;
          })}
          <button className="category-wheel-arrow previous" type="button" aria-label="Previous category" onClick={() => move(-1)}><ChevronLeft /></button>
          <button className="category-wheel-arrow next" type="button" aria-label="Next category" onClick={() => move(1)}><ChevronRight /></button>
          {selected && <div className="category-wheel-detail" key={selected.id}><span>SELECTED FOR YOU</span><h3>{selected.name}</h3><p>{selected.items?.slice(0, 4).join(' · ') || 'Discover everyday essentials and pantry favourites.'}</p><button onClick={() => navigate(`/products?category=${encodeURIComponent(selected.name)}`)}>Explore {selected.name} <ArrowUpRight size={16} /></button>{selectedCount > 0 && <small>{selectedCount} products to discover</small>}</div>}
        </div>
        <div className="category-wheel-pagination" aria-label="Choose a category">{categories.map((category, index) => <button key={category.id} type="button" aria-label={`Select ${category.name}`} aria-current={index === active ? 'true' : undefined} onClick={() => { lastMotion.current = Date.now(); setActive(index); }} />)}</div>
      </div>
    </section>
  );
};
