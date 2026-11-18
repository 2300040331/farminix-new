import { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { SUB_CATEGORIES, SUBCATEGORY_KEYWORDS } from '../data/products';
import { normalizeSearchText } from '../utils/catalog';
import { StorefrontPageHero } from './StorefrontPageHero';
import { StoreProductCard } from './StoreProductCard';
import { PriceRangeFilter } from './PriceRangeFilter';
import type { PriceRange } from './PriceRangeFilter';

export function ProductListingPage() {
  const { currentRoute, navigate, allProducts } = useApp();
  const { publishedConfig } = useAdminConfig();
  const searchQuery = currentRoute.searchParams.get('search') || '';
  const requestedCategory = currentRoute.searchParams.get('category') || '';
  const filterQuery = currentRoute.searchParams.get('filter') || '';
  const [selectedCategory, setSelectedCategory] = useState(requestedCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1 });
  const categoryNames = useMemo(() => [...new Set(allProducts.map((product) => product.category))], [allProducts]);
  const absoluteMin = useMemo(() => allProducts.length ? Math.min(...allProducts.map((product) => product.price)) : 0, [allProducts]);
  const absoluteMax = useMemo(() => allProducts.length ? Math.max(...allProducts.map((product) => product.price)) : 0, [allProducts]);
  const sliderMax = Math.max(absoluteMax, absoluteMin + 1);

  useEffect(() => {
    setSelectedCategory(requestedCategory);
    setSelectedSubCategory('');
  }, [requestedCategory]);
  useEffect(() => {
    setPriceRange({ min: absoluteMin, max: sliderMax });
  }, [absoluteMin, sliderMax]);
  useEffect(() => { document.title = 'Our Collection — Farminix'; }, []);

  const filteredProducts = useMemo(() => allProducts.filter((product) => {
    if (product.enabled === false) return false;
    if (selectedCategory && normalizeSearchText(selectedCategory) !== normalizeSearchText(product.category)) return false;
    if (selectedSubCategory) {
      const terms = SUBCATEGORY_KEYWORDS[selectedSubCategory] || [selectedSubCategory.toLowerCase()];
      if (!terms.some((term) => normalizeSearchText(`${product.name} ${product.description || ''}`).includes(normalizeSearchText(term)))) return false;
    }
    if (product.price < priceRange.min || product.price > priceRange.max) return false;
    if (!searchQuery) return true;
    return [product.name, product.brand, product.category, product.description].some((value) => normalizeSearchText(value || '').includes(normalizeSearchText(searchQuery)));
  }), [allProducts, searchQuery, selectedCategory, selectedSubCategory, priceRange]);
  const subcategories = selectedCategory ? SUB_CATEGORIES[selectedCategory] || [] : [];
  const title = searchQuery ? `Results for “${searchQuery}”` : selectedCategory || (filterQuery === 'popular' ? 'Family favourites.' : publishedConfig.shopNowConfig?.pageTitle || 'Good food. Every day.');
  const highlight = (text: string) => {
    const start = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (!searchQuery || start < 0) return text;
    return <>{text.slice(0, start)}<mark>{text.slice(start, start + searchQuery.length)}</mark>{text.slice(start + searchQuery.length)}</>;
  };

  return (
    <div className="store-catalog-page">
      <StorefrontPageHero eyebrow="Our collection" title={title} description="Thoughtfully sourced pantry staples and everyday favourites. Find something wholesome for your family’s table.">
        <form className="store-search" key={searchQuery} onSubmit={(event) => { event.preventDefault(); const query = String(new FormData(event.currentTarget).get('search') || '').trim(); navigate('/products', query ? `search=${encodeURIComponent(query)}` : undefined); }}>
          <Search size={19} /><label className="sr-only" htmlFor="catalog-search">Search products</label><input id="catalog-search" name="search" defaultValue={searchQuery} placeholder="Search rice, grains and more…" /><button type="submit">Search</button>
        </form>
      </StorefrontPageHero>
      <div className="store-container store-section">
        <div className="catalog-filter-panel">
          <div className="catalog-filter-heading"><span><SlidersHorizontal size={17} /> Shop by category</span><span>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</span></div>
          <div className="catalog-category-pills" role="group" aria-label="Filter by category">
            <button className={!selectedCategory ? 'is-active' : ''} onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); navigate('/products', searchQuery ? `search=${encodeURIComponent(searchQuery)}` : undefined); }}>Everything <small>{allProducts.length}</small></button>
            {categoryNames.map((category) => <button key={category} className={selectedCategory === category ? 'is-active' : ''} onClick={() => { setSelectedCategory(category); setSelectedSubCategory(''); navigate('/products', `category=${encodeURIComponent(category)}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`); }}>{category}<small>{allProducts.filter((product) => product.category === category && product.enabled !== false).length}</small></button>)}
          </div>
          {!!subcategories.length && <div className="catalog-subcategory-pills" role="group" aria-label={`${selectedCategory} subcategories`}><span>Explore</span>{subcategories.map((subcategory) => <button key={subcategory} className={selectedSubCategory === subcategory ? 'is-active' : ''} onClick={() => setSelectedSubCategory(selectedSubCategory === subcategory ? '' : subcategory)}>{subcategory}</button>)}</div>}
          <div className="catalog-price-filter"><PriceRangeFilter absoluteMin={absoluteMin} absoluteMax={sliderMax} value={priceRange} onChange={setPriceRange} variant="sidebar" /></div>
        </div>
        {(searchQuery || selectedCategory || selectedSubCategory) && <button className="store-clear-filter" onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); setPriceRange({ min: absoluteMin, max: sliderMax }); navigate('/products'); }}>Clear filters and view the full collection</button>}
        {filteredProducts.length ? <div className="store-product-grid">{filteredProducts.map((product) => <StoreProductCard key={product.id} product={product} name={highlight(product.name)} />)}</div> : <div className="store-empty-state"><ShoppingBag size={36} /><h2>No products found</h2><p>Try another search or adjust the category and price filters.</p><button className="store-button" onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); setPriceRange({ min: absoluteMin, max: sliderMax }); navigate('/products'); }}>Browse all products</button></div>}
      </div>
    </div>
  );
}
