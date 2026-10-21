import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { StoreProductCard } from './StoreProductCard';
import { getProductSlug } from '../utils/catalog';

export function PopularProducts() {
  const { products, navigate } = useApp();
  const { publishedConfig } = useAdminConfig();
  const config = publishedConfig.popularProducts;
  if (!config.enabled) return null;
  const catalog = publishedConfig.products?.length ? publishedConfig.products : products;
  const displayedProducts = config.featuredProductIds?.length ? config.featuredProductIds.map((id) => catalog.find((product) => product.id === id)).filter((product): product is (typeof catalog)[number] => Boolean(product && product.enabled !== false)) : catalog.filter((product) => product.enabled !== false);
  return <section className="store-home-collection store-section"><div className="store-container"><div className="store-collection-toolbar"><div><span className="store-eyebrow">From our farms, for your home</span><h2>{config.title || 'Family favourites.'}</h2><p>Good ingredients make everyday meals feel special.</p></div><button className="store-text-link" onClick={() => navigate('/products')}>{config.viewAllText || 'Explore collection'}<ArrowRight size={18} /></button></div><div className={displayedProducts.length === 1 ? 'store-home-products-layout' : ''}><div className="store-product-grid">{displayedProducts.map((product) => <StoreProductCard key={product.id} product={product} />)}</div>{displayedProducts.length === 1 && <aside className="store-home-collection-note"><img src="/cat_rice.jpg" alt="A bowl of uncooked rice" loading="lazy" /><div><span className="store-eyebrow">Simple ingredients. Special moments.</span><h3>Everyday meals.<br />Lasting memories.</h3><p>From a quiet weekday lunch to a table full of family, make room for the goodness of carefully selected grains.</p><button className="store-text-link" onClick={() => navigate(`/product/${getProductSlug(displayedProducts[0].name)}`)}>Discover our rice<ArrowRight size={17} /></button></div></aside>}</div></div></section>;
}
