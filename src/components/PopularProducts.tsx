import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { StoreProductCard } from './StoreProductCard';

export function PopularProducts() {
  const { products, navigate } = useApp();
  const { publishedConfig } = useAdminConfig();
  const config = publishedConfig.popularProducts;
  if (!config.enabled) return null;
  const catalog = publishedConfig.products?.length ? publishedConfig.products : products;
  const displayedProducts = config.featuredProductIds?.length ? config.featuredProductIds.map((id) => catalog.find((product) => product.id === id)).filter((product): product is (typeof catalog)[number] => Boolean(product && product.enabled !== false)) : catalog.filter((product) => product.enabled !== false);
  return <section className="store-home-collection store-section"><div className="store-container"><div className="store-collection-toolbar"><div><span className="store-eyebrow">From our farms, for your home</span><h2>{config.title || 'Family favourites.'}</h2><p>Explore our Family Choice rice, selected for your home.</p></div><button className="store-text-link" onClick={() => navigate('/products')}>{config.viewAllText || 'Explore collection'}<ArrowRight size={18} /></button></div><div className={`store-product-grid${displayedProducts.length === 1 ? ' store-home-single-product' : ''}`}>{displayedProducts.map((product) => <StoreProductCard key={product.id} product={product} />)}</div></div></section>;
}
