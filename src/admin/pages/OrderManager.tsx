import { useEffect, useState } from 'react';
import { Package, RefreshCw, Search, X } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { money } from '../commerceUtils';
import { OrderBadge } from '../components/OrderBadge';
import type { Order } from '../../types';

export function OrderManager({ initialOrderId, search = '' }: { initialOrderId?: string; search?: string }) {
  const { orders, error, loading, refresh, updateStatus } = useCommerce();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(initialOrderId);
  const [saving, setSaving] = useState('');
  const [message, setMessage] = useState('');
  const [updateError, setUpdateError] = useState('');
  useEffect(() => setSelectedId(initialOrderId), [initialOrderId]);
  useEffect(() => setPage(0), [query, search, status]);
  const filtered = orders.filter(o => `${o.id} ${o.deliveryAddress.name} ${o.deliveryAddress.phone}`.toLowerCase().includes(`${search} ${query}`.trim().toLowerCase()) && (status === 'all' || status === o.status));
  const selected = orders.find(o => o.id === selectedId);
  const statuses: Order['status'][] = ['Order Received', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const changeStatus = async (id: string, next: Order['status']) => {
    setSaving(id); setUpdateError(''); setMessage('');
    try { await updateStatus(id, next); setMessage(`Order updated to ${next}.`); }
    catch (e) { setUpdateError(e instanceof Error ? e.message : 'Unable to update order.'); }
    finally { setSaving(''); }
  };
  return <div className="space-y-5"><section className="admin-card"><div className="admin-page-heading-inline admin-section-heading"><div><p className="admin-eyebrow">PAYMENT TO DELIVERY</p><h1 className="text-2xl font-bold mt-2">Online Orders</h1><p>All website orders, including online payments and cash on delivery.</p></div><button onClick={() => void refresh()} disabled={loading}><RefreshCw size={15}/> Refresh</button></div><div className="admin-table-tools"><label className="admin-search"><Search size={16}/><input aria-label="Search online orders" value={query} onChange={e => setQuery(e.target.value)} placeholder="Order ID, customer, or phone…"/></label><select aria-label="Order status filter" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></div>
    {error && <p role="alert" className="admin-alert">{error}</p>}{updateError && <p role="alert" className="admin-alert">{updateError}</p>}{message && <p role="status" className="admin-success">{message}</p>}
    <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Order / Date</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Details</th></tr></thead><tbody>{filtered.slice(page * 15, page * 15 + 15).map(o => <tr key={o.id}><td><strong className="admin-order-id">{o.id}</strong><small>{new Date(o.date).toLocaleString('en-IN')}</small></td><td><strong>{o.deliveryAddress.name}</strong><small>{o.deliveryAddress.phone}</small></td><td>{o.items.reduce((sum, i) => sum + i.quantity, 0)}</td><td><strong>{money(o.finalAmount)}</strong></td><td><span className={`admin-badge ${o.paymentMethod.includes('COD') ? 'amber' : 'green'}`}>{o.paymentMethod.includes('COD') ? 'COD' : 'Paid online'}</span></td><td><select aria-label={`Status for ${o.id}`} disabled={saving === o.id} value={o.status} onChange={e => void changeStatus(o.id, e.target.value as Order['status'])}>{statuses.map(s => <option key={s}>{s}</option>)}</select></td><td><button className="admin-edit" onClick={() => setSelectedId(o.id)}>View</button></td></tr>)}</tbody></table></div>{!filtered.length && <div className="admin-empty"><Package size={30}/><strong>{loading ? 'Loading online orders…' : error ? 'Orders unavailable' : 'No orders found'}</strong><p>New confirmed website orders will appear here automatically.</p></div>}<div className="admin-pagination"><span>{filtered.length} orders</span><div><button disabled={!page} onClick={() => setPage(p => p - 1)}>Previous</button><button disabled={(page + 1) * 15 >= filtered.length} onClick={() => setPage(p => p + 1)}>Next</button></div></div></section>
    {selected && <section className="admin-card"><div className="admin-section-heading"><h2>Order details</h2><button aria-label="Close order details" onClick={() => setSelectedId(undefined)}><X size={18}/></button></div><p className="break-all text-sm font-bold mb-3">{selected.id}</p><OrderBadge status={selected.status}/><div className="grid md:grid-cols-2 gap-6 mt-5"><div><h3 className="font-bold mb-2">Delivery address</h3><p className="text-sm text-slate-600 leading-7">{selected.deliveryAddress.name}<br/>{selected.deliveryAddress.street}<br/>{selected.deliveryAddress.city}, {selected.deliveryAddress.state} – {selected.deliveryAddress.pincode}<br/><a href={`tel:${selected.deliveryAddress.phone}`}>{selected.deliveryAddress.phone}</a></p></div><div><h3 className="font-bold mb-2">Payment</h3><p className="text-sm break-all">{selected.paymentMethod}</p><p className="text-sm mt-2">Subtotal {money(selected.totalAmount)} · Discount {money(selected.discount)} · Delivery {money(selected.deliveryFee)} · Handling {money(selected.handlingFee || 0)}</p><strong className="block mt-3">Order total {money(selected.finalAmount)}</strong></div></div><div className="admin-table-scroll mt-5"><table className="admin-table"><thead><tr><th>Product</th><th>Pack</th><th>Quantity</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{selected.items.map((item, i) => <tr key={i}><td>{item.product.name}</td><td>{item.selectedWeight}</td><td>{item.quantity}</td><td>{money(item.product.price)}</td><td>{money(item.quantity * item.product.price)}</td></tr>)}</tbody></table></div></section>}
  </div>;
}
