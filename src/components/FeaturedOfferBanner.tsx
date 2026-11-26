import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { getProductSlug } from '../utils/catalog';

export const FeaturedOfferBanner: React.FC = () => {
  const { navigate } = useApp();
  const { publishedConfig } = useAdminConfig();
  const offer = publishedConfig.featuredOffer;
  if (!offer?.enabled) return null;
  const product = publishedConfig.products.find((item) => item.id === offer.productId) || publishedConfig.products.find((item) => item.id === 'r1');
  if (!product) return null;
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.oldPrice) > price ? Number(product.oldPrice) : 0;
  const savings = oldPrice ? oldPrice - price : 0;
  const discount = oldPrice ? Math.round((savings / oldPrice) * 100) : 0;
  const image = offer.image || product.image;

  return <section className="home-featured-offer" style={{ '--offer-start': offer.backgroundStart, '--offer-end': offer.backgroundEnd, '--offer-accent': offer.accentColor } as React.CSSProperties} aria-label="Featured Farminix offer">
    <div className="home-featured-offer-glow" aria-hidden="true" />
    <div className="home-featured-offer-copy">
      <span className="home-featured-offer-eyebrow"><Sparkles size={15} />{offer.eyebrow}</span>
      <h2>{offer.title}</h2>
      <p>{offer.description || product.description}</p>
      <div className="home-featured-offer-price">
        {price > 0 && <strong>₹{price.toLocaleString('en-IN')}</strong>}
        {oldPrice > 0 && <del>₹{oldPrice.toLocaleString('en-IN')}</del>}
        {savings > 0 && <span>Save ₹{savings.toLocaleString('en-IN')}</span>}
      </div>
      <button type="button" onClick={() => navigate(`/product/${getProductSlug(product.name)}`)}>{offer.ctaText} <ArrowUpRight size={18} /></button>
      {product.weight && <small>{product.weight} · {product.category}</small>}
    </div>
    <div className="home-featured-offer-product">
      <span className="home-featured-offer-stamp">{discount > 0 ? `${discount}%` : 'FAMILY'}<small>{discount > 0 ? 'SAVING' : 'FAVOURITE'}</small></span>
      <div className="home-featured-offer-orbit" aria-hidden="true" />
      <img src={image} alt={product.name} />
      <span className="home-featured-offer-product-name">{product.name}</span>
    </div>
  </section>;
};
