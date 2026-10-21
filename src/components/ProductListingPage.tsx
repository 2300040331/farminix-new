import { useEffect, useMemo } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { normalizeSearchText } from '../utils/catalog';
import { StorefrontPageHero } from './StorefrontPageHero';
import { StoreProductCard } from './StoreProductCard';

export function ProductListingPage() {
  const { currentRoute, navigate, allProducts } = useApp();
  const { publishedConfig } = useAdminConfig();
  const searchQuery = currentRoute.searchParams.get('search') || '';
  const categoryQuery = currentRoute.searchParams.get('category') || '';
  const filterQuery = currentRoute.searchParams.get('filter') || '';
  const filteredProducts = useMemo(() => allProducts.filter((product) => {
    if (categoryQuery && normalizeSearchText(categoryQuery) !== normalizeSearchText(product.category)) return false;
    if (!searchQuery) return true;
    return [product.name, product.brand, product.category, product.description].some((value) => normalizeSearchText(value || '').includes(normalizeSearchText(searchQuery)));
  }), [allProducts, searchQuery, categoryQuery]);
  useEffect(() => { document.title = 'Our Collection — Farminix'; }, []);
  const title = searchQuery ? `Results for “${searchQuery}”` : categoryQuery || (filterQuery === 'popular' ? 'Family favourites.' : publishedConfig.shopNowConfig?.pageTitle || 'Good food. Every day.');
  const highlight = (text: string) => {
    const start = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (!searchQuery || start < 0) return text;
    return <>{text.slice(0, start)}<mark>{text.slice(start, start + searchQuery.length)}</mark>{text.slice(start + searchQuery.length)}</>;
  };
  return (
    <div className="store-catalog-page">
      <StorefrontPageHero eyebrow="Our collection" title={title} description="Thoughtfully sourced staples. Carefully packed goodness. Find something wholesome for your family's table.">
        <form className="store-search" key={searchQuery} onSubmit={(event) => { event.preventDefault(); const query = String(new FormData(event.currentTarget).get('search') || '').trim(); navigate('/products', query ? `search=${encodeURIComponent(query)}` : undefined); }}>
          <Search size={19} /><label className="sr-only" htmlFor="catalog-search">Search products</label><input id="catalog-search" name="search" defaultValue={searchQuery} placeholder="Search rice, grains and more…" /><button type="submit">Search</button>
        </form>
      </StorefrontPageHero>
      <div className="store-container store-section">
        <div className="store-collection-toolbar"><div><span className="store-eyebrow">Made for your everyday</span><h2>{categoryQuery || 'The Farminix collection'}</h2></div><span>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</span></div>
        {(searchQuery || categoryQuery) && <button className="store-clear-filter" onClick={() => navigate('/products')}>View the full collection</button>}
        {filteredProducts.length ? <div className="store-product-grid">{filteredProducts.map((product) => <StoreProductCard key={product.id} product={product} name={highlight(product.name)} />)}</div> : <div className="store-empty-state"><ShoppingBag size={36} /><h2>No products found</h2><p>Try another search or browse our full collection.</p><button className="store-button" onClick={() => navigate('/products')}>Browse all products</button></div>}
        {!filteredProducts.length && allProducts.length > 0 && <section className="store-recommendations"><h2>You might also like</h2><div className="store-product-grid">{allProducts.slice(0, 6).map((product) => <StoreProductCard key={product.id} product={product} />)}</div></section>}
      </div>
    </div>
  );
}
