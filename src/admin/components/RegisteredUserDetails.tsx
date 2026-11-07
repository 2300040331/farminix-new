import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { customerApi } from '../../utils/customerApi';
import { money } from '../commerceUtils';
import { OrderBadge } from './OrderBadge';
import type { AdminUserDetails } from '../customerTypes';

const dateLabel = (date: string | null) => date ? new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not available';

export function RegisteredUserDetailsView({ details }: { details: AdminUserDetails }) {
  const { user, orders } = details;
  return <>
    <div className="admin-user-profile">
      <div><h3>{user.name}</h3><p className="admin-user-id">{user.id}</p><dl className="admin-user-facts">
        <div><dt>Email</dt><dd><a href={`mailto:${user.email}`}>{user.email}</a></dd></div>
        <div><dt>Mobile</dt><dd><a href={`tel:${user.phone}`}>{user.phone}</a></dd></div>
        <div><dt>Registered</dt><dd>{dateLabel(user.createdAt)}</dd></div>
        <div><dt>Last order</dt><dd>{user.lastOrderAt ? dateLabel(user.lastOrderAt) : 'No orders yet'}</dd></div>
        <div><dt>Total orders</dt><dd>{user.orderCount}</dd></div>
        <div><dt>Order value</dt><dd>{money(user.orderValue)}</dd></div>
        <div><dt>Reward points</dt><dd>{user.rewardPoints}</dd></div>
        <div><dt>Wallet balance</dt><dd>{money(user.walletBalance)}</dd></div>
      </dl></div>
      <div><h3>Saved addresses ({user.addresses.length})</h3>{!user.addresses.length && <p className="admin-user-muted">No saved delivery addresses.</p>}
        <div className="admin-user-addresses">{user.addresses.map(address => <address key={address.id}><strong>{address.name}{address.isDefault ? ' · Default' : ''}</strong><p>{address.street}<br />{address.city}, {address.state} – {address.pincode}<br /><a href={`tel:${address.phone}`}>{address.phone}</a></p></address>)}</div>
      </div>
    </div>
    <div className="admin-user-history-heading"><h3>Order history</h3><span className="admin-badge purple">{user.orderCount} orders</span></div>
    {!orders.length && <div className="admin-empty"><strong>No orders yet</strong><p>This user has registered but has not placed an order.</p></div>}
    <div className="admin-user-history">{orders.map(order => <details key={order.id} className="admin-user-order">
      <summary><div><strong>{order.id}</strong><small>{dateLabel(order.date)}</small></div><OrderBadge status={order.status} /><strong>{money(order.finalAmount)}</strong><span className="admin-user-order-toggle">Details</span></summary>
      <div className="admin-user-order-body">
        <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Product</th><th>Pack</th><th>Quantity</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{order.items.map((item, index) => <tr key={index}><td>{item.product.name}</td><td>{item.selectedWeight || item.product.weight}</td><td>{item.quantity}</td><td>{money(item.product.price)}</td><td>{money(item.quantity * item.product.price)}</td></tr>)}</tbody></table></div>
        <div className="admin-user-order-meta"><div><h4>Delivery address</h4><address>{order.deliveryAddress.name}<br />{order.deliveryAddress.street}<br />{order.deliveryAddress.city}, {order.deliveryAddress.state} – {order.deliveryAddress.pincode}<br />{order.deliveryAddress.phone}</address>{order.deliveryAddress.deliveryLocation && <p><a className="underline" href={`https://www.openstreetmap.org/?mlat=${order.deliveryAddress.deliveryLocation.lat}&mlon=${order.deliveryAddress.deliveryLocation.lng}`} target="_blank" rel="noopener noreferrer">View delivery pin</a></p>}<h4>Payment</h4><p>{order.paymentMethod}</p></div>
          <dl className="admin-user-totals"><div><dt>Items subtotal</dt><dd>{money(order.totalAmount)}</dd></div><div><dt>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt><dd>−{money(order.discount)}</dd></div><div><dt>Delivery</dt><dd>{money(order.deliveryFee)}</dd></div><div><dt>Handling & packaging</dt><dd>{money(order.handlingFee || 0)}</dd></div><div><dt>Total</dt><dd><strong>{money(order.finalAmount)}</strong></dd></div></dl>
        </div>
      </div>
    </details>)}</div>
  </>;
}

export function RegisteredUserDetails({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const [details, setDetails] = useState<AdminUserDetails | null>(null);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    customerApi<AdminUserDetails>(`/api/site-config/users?customerId=${encodeURIComponent(customerId)}&cursor=${cursor}`, { signal: controller.signal })
      .then(data => {
        if (controller.signal.aborted) return;
        setDetails(previous => cursor && previous ? { ...data, orders: [...previous.orders, ...data.orders.filter(order => !previous.orders.some(existing => existing.id === order.id))] } : data);
      }).catch(failure => {
        if (controller.signal.aborted) return;
        if (failure.status === 401 || failure.status === 403) setDetails(null);
        setError(failure instanceof Error ? failure.message : 'Unable to load user details.');
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [customerId, cursor, retry]);
  return <section className="admin-card" aria-label="User details and order history">
    <div className="admin-section-heading"><h2>User details</h2><button aria-label="Close user details" onClick={onClose}><X size={18} /></button></div>
    {error && <div className="admin-alert" role="alert">{error}<button className="admin-edit" onClick={() => setRetry(value => value + 1)}>Retry</button></div>}
    {loading && <p className="admin-user-loading" role="status"><Loader2 size={17} className="animate-spin" />Loading user history…</p>}
    {details && <RegisteredUserDetailsView details={details} />}
    {details?.nextCursor !== null && details?.nextCursor !== undefined && <div className="admin-pagination"><span>Showing {details.orders.length} of {details.user.orderCount} orders</span><button className="admin-edit" disabled={loading} onClick={() => setCursor(details.nextCursor!)}>Load older orders</button></div>}
  </section>;
}
