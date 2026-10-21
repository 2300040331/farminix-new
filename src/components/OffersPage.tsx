import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Clock, RotateCcw, SlidersHorizontal, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { StorefrontPageHero } from './StorefrontPageHero';
import { StoreProductCard } from './StoreProductCard';
import { PriceRangeFilter, loadSavedPriceRange, savePriceRange, clearSavedPriceRange } from './PriceRangeFilter';
import type { PriceRange } from './PriceRangeFilter';

export function OffersPage() {
  const { allProducts } = useApp();
  const { publishedConfig } = useAdminConfig();
  const config = publishedConfig.offersPage;
  const discounted = useMemo(() => allProducts.filter((product) => product.oldPrice > product.price), [allProducts]);
  const categories = [...new Set(discounted.map((product) => product.category))].sort();
  const brands = [...new Set(discounted.map((product) => product.brand))].sort();
  const absoluteMin = discounted.length ? Math.floor(Math.min(...discounted.map((product) => product.price))) : 0;
  const absoluteMax = discounted.length ? Math.ceil(Math.max(...discounted.map((product) => product.price))) : 1000;
  const [priceRange, setPriceRange] = useState<PriceRange>(() => loadSavedPriceRange(absoluteMin, absoluteMax));
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minimumDiscount, setMinimumDiscount] = useState(0);
  const [sort, setSort] = useState('discount');
  const campaignHours = Math.max(0, config?.countdownHours || 0);
  const [campaignRemaining, setCampaignRemaining] = useState(campaignHours * 3600);
  useEffect(() => { document.title = 'Offers — Farminix'; }, []);
  useEffect(() => {
    const endsAt = Date.now() + campaignHours * 3600000;
    const update = () => setCampaignRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    update();
    if (!campaignHours) return;
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [campaignHours]);
  useEffect(() => { setPriceRange(loadSavedPriceRange(absoluteMin, absoluteMax)); }, [absoluteMin, absoluteMax]);
  const reset = () => { setSelectedCategories([]); setSelectedBrands([]); setMinimumDiscount(0); setPriceRange({ min: absoluteMin, max: absoluteMax }); setSort('discount'); clearSavedPriceRange(); };
  const toggle = (values: string[], value: string) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  const filtered = discounted.filter((product) => product.price >= priceRange.min && product.price <= priceRange.max && (!selectedCategories.length || selectedCategories.includes(product.category)) && (!selectedBrands.length || selectedBrands.includes(product.brand)) && Math.round((product.oldPrice - product.price) / product.oldPrice * 100) >= minimumDiscount).sort((a, b) => sort === 'price_asc' ? a.price - b.price : sort === 'price_desc' ? b.price - a.price : sort === 'popular' ? b.stockCount - a.stockCount : (b.oldPrice - b.price) / b.oldPrice - (a.oldPrice - a.price) / a.oldPrice);
  if (config?.enabled === false) return <StorefrontPageHero eyebrow="Offers" title="More goodness, coming soon." description="Our offers page is currently unavailable. You can still explore the Farminix collection." />;
  const campaignTime = [Math.floor(campaignRemaining / 3600), Math.floor(campaignRemaining % 3600 / 60), campaignRemaining % 60].map((value) => String(value).padStart(2, '0')).join(':');
  return <div className="store-offers-page"><StorefrontPageHero eyebrow={config?.heroBadge || 'A little more goodness'} title={config?.heroTitle?.replace(/[🔥🎉]/gu, '').trim() || 'Good food. Better value.'} description={config?.heroSubtitle || 'Discover current savings on carefully selected everyday essentials.'} />
    <div className="store-container store-section">
      {(config?.promoCode || campaignHours > 0) && <section className="store-offers-campaign" aria-label="Current campaign">{config?.promoCode && <div><Tag size={22} /><span><span>Campaign promo code</span><strong>{config.promoCode}</strong><small>Use at checkout</small></span></div>}{campaignHours > 0 && <div><Clock size={21} /><span><span>Campaign time remaining</span><time dateTime={`PT${campaignRemaining}S`}>{campaignTime}</time></span></div>}</section>}
      <div className="store-discount-chips" role="group" aria-label="Minimum discount">{[0, 10, 20, 30, 40, 50].map((discount) => <button key={discount} aria-pressed={minimumDiscount === discount} onClick={() => setMinimumDiscount(discount)}>{discount ? `${discount}% off & above` : 'All offers'}</button>)}</div>
      <div className="store-offers-layout"><details className="store-offer-filters" open><summary><SlidersHorizontal size={17} />Refine your collection<ChevronDown size={16} /></summary><div><button className="store-clear-filter" onClick={reset}><RotateCcw size={14} />Reset filters</button>
        {absoluteMax > absoluteMin ? <PriceRangeFilter absoluteMin={absoluteMin} absoluteMax={absoluteMax} value={priceRange} onChange={(value) => { setPriceRange(value); savePriceRange(value); }} /> : <p className="store-filter-price">Price: ₹{absoluteMin.toLocaleString('en-IN')}</p>}
        <fieldset><legend>Categories</legend>{categories.map((category) => <label key={category}><input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => setSelectedCategories(toggle(selectedCategories, category))} />{category}</label>)}</fieldset>
        <fieldset><legend>Brands</legend>{brands.map((brand) => <label key={brand}><input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => setSelectedBrands(toggle(selectedBrands, brand))} />{brand}</label>)}</fieldset>
      </div></details>
      <div><div className="store-results-toolbar"><p>{filtered.length} {filtered.length === 1 ? 'offer' : 'offers'} to explore</p><label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="discount">Biggest savings</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="popular">Availability</option></select></label></div>{filtered.length ? <div className="store-product-grid">{filtered.map((product) => <StoreProductCard key={product.id} product={product} />)}</div> : <div className="store-empty-state"><Tag size={32} /><h2>No matching offers</h2><p>Try a different filter to see more of the collection.</p><button className="store-button" onClick={reset}>Reset filters</button></div>}</div></div>
    </div></div>;
}
