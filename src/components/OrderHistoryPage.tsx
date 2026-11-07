import { useEffect } from 'react';
import { ArrowRight, Loader2, Package, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorefrontPageHero } from './StorefrontPageHero';
import '../modals/CustomerAccount.css';

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
const steps = ['Order Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export function OrderHistoryPage() {
  const { user, authStatus, requestLogin, orders, ordersLoading, ordersError, refreshOrders, loadMoreOrders, hasMoreOrders, navigate } = useApp();
  useEffect(() => { document.title = 'Order History — Farminix'; }, []);
  useEffect(() => { if (authStatus === 'guest') requestLogin('orders'); }, [authStatus, requestLogin]);
  useEffect(() => {
    if (!user) return;
    const refresh = () => { void refreshOrders(); };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [user, refreshOrders]);
  return <div className="customer-orders">
    <StorefrontPageHero eyebrow="Your Farminix account" title="Order History" description="Your family favourites, past orders and the latest delivery status." />
    <div className="store-container" style={{ paddingTop: 30 }}>
      {authStatus === 'loading' ? <p role="status" className="flex items-center gap-3 py-12"><Loader2 className="animate-spin" size={18} />Loading your account…</p>
        : !user ? <div className="store-empty-state"><Package size={36} /><h2>Your orders are waiting for you</h2><p>Log in or create an account to view your order history.</p><button className="store-button" onClick={() => requestLogin('orders')}>Log in / Create account <ArrowRight size={16} /></button></div>
        : <>
          <div className="customer-orders-toolbar"><p>Orders placed with {user.email}</p><button disabled={ordersLoading} onClick={() => void refreshOrders()}><RefreshCw size={14} className={ordersLoading ? 'animate-spin' : ''} />Refresh status</button></div>
          {ordersError && <div className="customer-orders-error" role="alert">{ordersError}<button onClick={() => void refreshOrders()}>Try again</button></div>}
          {ordersLoading && !orders.length && <p role="status" className="flex items-center gap-3 py-10"><Loader2 className="animate-spin" size={18} />Loading your orders…</p>}
          {!ordersLoading && !ordersError && !orders.length && <div className="store-empty-state"><Package size={38} /><h2>No orders yet</h2><p>Your confirmed orders will appear here with their details and delivery status.</p><button className="store-button" onClick={() => navigate('/products')}>Explore the collection <ArrowRight size={16} /></button></div>}
          <div className="customer-order-list">{orders.map(order => {
            const date = new Date(order.date);
            const currentStep = steps.indexOf(order.status);
            return <article className="customer-order" key={order.id}>
              <header className="customer-order-header"><div><h2>Order {order.id}</h2><time dateTime={order.date}>{Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time></div><span className="customer-order-status" data-status={order.status}>{order.status}</span></header>
              <div className="customer-order-items">{order.items.map((item, index) => <div className="customer-order-item" key={`${item.product.id}-${index}`}><img src={item.product.image} alt={item.product.name} loading="lazy" /><div><h3>{item.product.name}</h3><p>{item.selectedWeight || item.product.weight} · Qty: {item.quantity}</p></div><strong>{money(item.product.price * item.quantity)}</strong></div>)}</div>
              {currentStep >= 0 && <ol className="customer-order-progress" aria-label="Order progress">{steps.map((step, index) => <li key={step} data-reached={index <= currentStep} aria-current={index === currentStep ? 'step' : undefined}>{step}</li>)}</ol>}
              <details><summary><span>View order details</span><strong>{money(order.finalAmount)}</strong></summary><div className="customer-order-details"><div><h3>Delivery address</h3><address>{order.deliveryAddress.name}<br />{order.deliveryAddress.street}<br />{order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}<br />{order.deliveryAddress.phone}</address><h3 style={{ marginTop: 18 }}>Payment</h3><p>{order.paymentMethod}</p></div><dl><div><dt>Items subtotal</dt><dd>{money(order.totalAmount)}</dd></div><div><dt>Discount</dt><dd>−{money(order.discount)}</dd></div><div><dt>Delivery</dt><dd>{order.deliveryFee ? money(order.deliveryFee) : 'FREE'}</dd></div><div><dt>Handling & packaging</dt><dd>{money(order.handlingFee || 0)}</dd></div><div><dt>Total</dt><dd><strong>{money(order.finalAmount)}</strong></dd></div></dl></div></details>
            </article>;
          })}</div>
          {hasMoreOrders && <div className="customer-orders-more"><button className="store-button" disabled={ordersLoading} onClick={() => void loadMoreOrders()}>{ordersLoading ? 'Loading…' : 'Load older orders'}</button></div>}
        </>}
    </div>
  </div>;
}
