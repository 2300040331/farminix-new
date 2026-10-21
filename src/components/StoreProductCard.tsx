import type { ReactNode } from 'react';
import { ArrowUpRight, Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getProductSlug } from '../utils/catalog';
import type { Product } from '../types';

export function StoreProductCard({ product, name }: { product: Product; name?: ReactNode }) {
  const { navigate, cart, addToCart, updateQuantity, wishlist, toggleWishlist, setIsCartOpen } = useApp();
  const quantity = cart.filter((item) => item.product.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
  const isWishlisted = wishlist.includes(product.id);
  const hasSavings = product.oldPrice > product.price;
  const discount = hasSavings ? Math.round((product.oldPrice - product.price) / product.oldPrice * 100) : 0;
  const available = product.inStock && product.stockCount > 0;
  const openProduct = () => navigate(`/product/${getProductSlug(product.name)}`);
  return (
    <article className="store-product-card">
      <div className="store-product-visual">
        {discount > 0 && <span className="store-product-discount">Save {discount}%</span>}
        <button className="store-product-wishlist" aria-label={`${isWishlisted ? 'Remove' : 'Save'} ${product.name} ${isWishlisted ? 'from' : 'to'} wishlist`} aria-pressed={isWishlisted} onClick={() => toggleWishlist(product.id)}><Heart size={19} fill={isWishlisted ? 'currentColor' : 'none'} /></button>
        <button className="store-product-image-button" onClick={openProduct} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name} loading="lazy" /></button>
        <span className="store-product-category">{product.category}</span>
      </div>
      <div className="store-product-content">
        <p className="store-product-meta">{product.brand}<span>•</span>{product.weight}</p>
        <h3><button onClick={openProduct}>{name || product.name}<ArrowUpRight size={18} /></button></h3>
        <div className="store-product-prices"><strong>₹{product.price.toLocaleString('en-IN')}</strong>{hasSavings && <del>₹{product.oldPrice.toLocaleString('en-IN')}</del>}</div>
        {hasSavings && <p className="store-product-savings">You save ₹{(product.oldPrice - product.price).toLocaleString('en-IN')}</p>}
        {!available ? <button className="store-button store-product-add" disabled>Out of stock</button> : quantity === 0 ? (
          <button className="store-button store-product-add" onClick={() => { addToCart(product); setIsCartOpen(true); }}><ShoppingBag size={17} />Add to cart<Plus size={18} /></button>
        ) : (
          <div className="store-product-stepper" aria-label={`Quantity for ${product.name}`}><button aria-label={`Decrease ${product.name} quantity`} onClick={() => updateQuantity(product.id, -1)}><Minus size={18} /></button><span aria-live="polite">{quantity} in cart</span><button aria-label={`Increase ${product.name} quantity`} disabled={quantity >= product.stockCount} onClick={() => updateQuantity(product.id, 1)}><Plus size={18} /></button></div>
        )}
      </div>
    </article>
  );
}
