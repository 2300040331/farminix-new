import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, Boxes, PackagePlus, ClipboardList, Image, LayoutGrid, Leaf, Sprout, Home, MessageCircle, Package, Pencil, Search, ShoppingCart, Tag, Users, IndianRupee, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import { useCommerce } from '../context/CommerceContext';
import type { CustomerEnquiry } from '../types';
import { customerKey, money, orderLabel } from '../commerceUtils';
import { OrderBadge } from '../components/OrderBadge';
import { MetricSparkline } from '../components/MetricSparkline';

export function AdminDashboard({ onNavigate, search = '' }: { onNavigate: (page: string, productId?: string) => void; search?: string }) {
  const { config } = useAdminConfig();
  const { products, orders, loading, error, updatedAt, refresh } = useCommerce();
  const [stockFilter, setStockFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [queryError, setQueryError] = useState('');
  const [queriesLoading, setQueriesLoading] = useState(true);
  useEffect(() => {
    let disposed = false;
    const load = async () => {
      try {
        const response = await fetch('/api/site-config/queries?page=0', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
        const data = await response.json();
        if (!response.ok) throw Error(data.error || 'Unable to load enquiries.');
        if (!disposed) { setEnquiries(data.enquiries.slice(0, 3)); setQueryError(''); }
      } catch { if (!disposed) setQueryError('Enquiries could not be loaded.'); }
      finally { if (!disposed) setQueriesLoading(false); }
    };
    void load(); const timer = window.setInterval(load, 15000);
    return () => { disposed = true; clearInterval(timer); };
  }, []);
  useEffect(() => setPage(0), [query, search, stockFilter]);
  const filtered = useMemo(() => products.filter(p => {
    const matches = `${p.name} ${p.category} ${p.id}`.toLowerCase().includes(`${search} ${query}`.trim().toLowerCase());
    return matches && (stockFilter === 'all' || (stockFilter === 'out' ? p.stockCount <= 0 : p.stockCount > 0 && p.stockCount <= 10));
  }), [products, query, search, stockFilter]);
  const activeOrders = orders.filter(o => o.status !== 'Delivered');
  const recentOrders = orders.filter(o => `${o.id} ${o.deliveryAddress.name} ${o.deliveryAddress.phone}`.toLowerCase().includes(search.toLowerCase())).slice(0, 4);
  const totalStock = products.reduce((sum, p) => sum + p.stockCount, 0);
  const lowStock = products.filter(p => p.stockCount > 0 && p.stockCount <= 10).length;
  const outOfStock = products.filter(p => p.stockCount <= 0).length;
  const customers = new Set(orders.map(o => customerKey(o.deliveryAddress.phone))).size;
  const dailyOrders = Array.from({ length: 7 }, (_, index) => {
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 6 + index);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    return orders.filter(order => Date.parse(order.date) >= start.getTime() && Date.parse(order.date) < end.getTime());
  });
  const metrics = [
    { title: 'Total Products', value: products.length.toLocaleString('en-IN'), note: `${totalStock.toLocaleString('en-IN')} units in stock`, icon: Package, color: 'purple', series: products.slice(0, 12).map(p => p.stockCount), chartLabel: 'Available units for the first twelve catalog products' },
    { title: 'Online Orders', value: updatedAt ? orders.length.toLocaleString('en-IN') : '—', note: `${activeOrders.length} awaiting delivery`, icon: ShoppingCart, color: 'green', series: dailyOrders.map(day => day.length), chartLabel: 'Orders per day over the last seven days' },
    { title: 'Total Customers', value: updatedAt ? customers.toLocaleString('en-IN') : '—', note: 'Customers who placed orders', icon: Users, color: 'blue', series: dailyOrders.map(day => new Set(day.map(o => customerKey(o.deliveryAddress.phone))).size), chartLabel: 'Unique ordering customers per day over the last seven days' },
    { title: 'Total Order Value', value: updatedAt ? money(orders.reduce((sum, o) => sum + o.finalAmount, 0)) : '—', note: 'Online payments + COD orders', icon: IndianRupee, color: 'amber', series: dailyOrders.map(day => day.reduce((sum, o) => sum + o.finalAmount, 0)), chartLabel: 'Order value per day over the last seven days' },
  ];
  const actions = [
    { label: 'Edit Home Page', page: 'home', icon: Home, color: 'purple' },
    { label: 'Add Product', page: 'add-product', icon: PackagePlus, color: 'green' },
    { label: 'Categories', page: 'categories', icon: LayoutGrid, color: 'blue' },
    { label: 'Create Offer', page: 'offers', icon: Tag, color: 'rose' },
    { label: 'Update Banner', page: 'hero', icon: Image, color: 'teal' },
    { label: 'View Orders', page: 'orders', icon: ClipboardList, color: 'purple' },
    { label: 'Enquiries', page: 'queries', icon: MessageCircle, color: 'green' },
    { label: 'Stock Alerts', page: 'stock', icon: BarChart3, color: 'purple' },
  ];
  return <div className="admin-dashboard">
    <section className="admin-welcome">
      <div className="admin-welcome-copy"><p className="admin-eyebrow"><span/> WELCOME BACK, ADMIN</p><h1>Manage Your <span>Farminix</span> Store</h1><p>A little care. A lot of growth. Everything your store needs, in one place.</p><div className="admin-welcome-caption"><Leaf size={14}/> From our farms to your family</div></div>
      <div className="admin-mission"><span className="admin-icon green"><Sprout size={24}/></span><div><strong>Our Mission</strong><p>Pure grains from our farms<br/>to every family in India.</p></div></div>
    </section>
    <div className="admin-sync"><span><i className={updatedAt && !error ? 'connected' : ''}/>{loading ? 'Loading online store…' : error ? 'Connection needs attention' : `Updated ${updatedAt?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · refreshes every 15s`}</span><button onClick={() => void refresh()} disabled={loading}><RefreshCw size={13}/> Refresh data</button></div>
    {error && <div role="alert" className="admin-alert">{error} {updatedAt ? 'Showing the last loaded data.' : 'Showing the cached catalog. Current online stock and order totals are unavailable until the connection succeeds.'}</div>}
    <div className="admin-metrics">{metrics.map(metric => <article className={`admin-card admin-metric admin-metric-${metric.color}`} key={metric.title}><span className={`admin-icon ${metric.color}`}><metric.icon size={25}/></span><div className="admin-metric-content"><p>{metric.title}</p><strong>{metric.value}</strong><small><span/>{metric.note}</small></div><div className={`admin-metric-chart ${metric.color}`}><MetricSparkline values={metric.series} label={metric.chartLabel}/></div></article>)}</div>
    <div className="admin-dashboard-grid"><div className="admin-primary-column">
      <section className="admin-card admin-quick-actions"><div className="admin-section-heading"><div><h2>Quick Actions</h2><p>Your everyday essentials, one click away.</p></div><button onClick={() => onNavigate('home')}>Manage Store <ArrowRight size={14}/></button></div><div className="admin-actions">{actions.map(action => <button key={action.label} className={action.color} onClick={() => { if (action.page === 'stock') { setStockFilter('low'); document.getElementById('admin-inventory')?.scrollIntoView({ behavior: 'smooth' }); } else onNavigate(action.page); }}><span className={`admin-icon ${action.color}`}><action.icon size={23}/></span><span>{action.label}</span></button>)}</div></section>
      <section className="admin-card" id="admin-inventory"><div className="admin-section-heading"><div><h2>Product Inventory</h2><p>All {products.length} products · stock from the published store</p></div><button onClick={() => onNavigate('products')}>Manage Products <ArrowRight size={14}/></button></div>
        <div className="admin-stock-summary"><span><Boxes size={16}/><b>{totalStock}</b> available units</span><button onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}><AlertTriangle size={15}/><b>{lowStock}</b> low stock</button><button onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}><b>{outOfStock}</b> out of stock</button></div>
        <div className="admin-table-tools"><label className="admin-search"><Search size={16}/><input aria-label="Search inventory" placeholder="Search your inventory…" value={query} onChange={e => setQuery(e.target.value)}/></label><select aria-label="Filter stock" value={stockFilter} onChange={e => setStockFilter(e.target.value)}><option value="all">All stock</option><option value="low">Low stock (1–10)</option><option value="out">Out of stock</option></select></div>
        <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>#</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{filtered.slice(page * 6, page * 6 + 6).map((product, index) => <tr key={product.id}><td>{page * 6 + index + 1}</td><td><div className="admin-product-cell">{product.image ? <img src={product.image} alt=""/> : <span className="admin-product-placeholder"><Package size={21}/></span>}<div><strong>{product.name}</strong><small>{product.weight}</small></div></div></td><td>{product.category}</td><td><strong>{money(product.price)}</strong>{product.oldPrice > product.price && <del>{money(product.oldPrice)}</del>}</td><td><span className={`admin-badge ${product.stockCount <= 0 ? 'rose' : product.stockCount <= 10 ? 'amber' : 'green'}`}>{product.stockCount <= 0 ? 'Out of stock' : `${product.stockCount} in stock`}</span></td><td><span className={`admin-badge ${product.enabled === false ? 'slate' : 'purple'}`}>{product.enabled === false ? 'Hidden' : 'Visible'}</span></td><td><button className="admin-edit" onClick={() => onNavigate('products', product.id)}><Pencil size={13}/> Edit</button></td></tr>)}</tbody></table></div>
        {!filtered.length && <div className="admin-empty"><Package size={28}/><strong>No matching products</strong><p>Try another search or stock filter.</p></div>}
        <div className="admin-pagination"><span>{filtered.length ? `${page * 6 + 1}–${Math.min(page * 6 + 6, filtered.length)} of ${filtered.length} products` : '0 products'}</span><div><button disabled={!page} onClick={() => setPage(p => p - 1)}>Previous</button><button disabled={(page + 1) * 6 >= filtered.length} onClick={() => setPage(p => p + 1)}>Next</button></div></div>
      </section>
    </div><div className="admin-secondary-column">
      <section className="admin-card"><div className="admin-section-heading"><div><h2>Recent Orders</h2><p>The latest from your store.</p></div><button onClick={() => onNavigate('orders')}>View All <ArrowRight size={14}/></button></div>{recentOrders.map(order => <button className="admin-recent-order" key={order.id} onClick={() => onNavigate('orders', order.id)}><span className="admin-icon amber"><Package size={18}/></span><div><strong title={order.id}>{orderLabel(order.id)}</strong><small>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items · {order.deliveryAddress.name}</small></div><div className="admin-order-amount"><strong>{money(order.finalAmount)}</strong><OrderBadge status={order.status}/></div></button>)}{!recentOrders.length && <div className="admin-empty"><span className="admin-empty-icon"><ShoppingCart size={28}/></span><strong>{loading ? 'Loading orders…' : error ? 'Orders unavailable' : search ? 'No matching orders' : 'Your next order starts here'}</strong><p>{error ? 'Refresh to try again.' : 'Confirmed website orders will appear here.'}</p></div>}</section>
      <section className="admin-card"><div className="admin-section-heading"><h2>Recent Queries</h2><button onClick={() => onNavigate('queries')}>View All <ArrowRight size={14}/></button></div>{queryError ? <p className="admin-query-error">{queryError}</p> : enquiries.length ? enquiries.map(enquiry => <button className="admin-enquiry" key={enquiry.id} onClick={() => onNavigate('queries')}><span className="admin-avatar">{enquiry.name.charAt(0).toUpperCase()}</span><div><strong>{enquiry.name}</strong><p>{enquiry.message}</p></div><div><small>{new Date(enquiry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</small><span className={`admin-badge ${enquiry.status === 'resolved' ? 'green' : 'purple'}`}>{enquiry.status === 'new' ? 'New' : enquiry.status === 'resolved' ? 'Resolved' : 'In progress'}</span></div></button>) : <div className="admin-empty"><MessageCircle size={26}/><strong>{queriesLoading ? 'Loading enquiries…' : 'No enquiries yet'}</strong><p>Customer messages will appear here.</p></div>}</section>
      <section className="admin-farm-note"><Leaf size={24}/><h3>Good food. Thoughtfully managed.</h3><p>{config.categories.length} categories connecting your farm to their family.</p><button onClick={() => onNavigate('categories')}>Explore categories <ArrowRight size={14}/></button></section>
    </div></div>
  </div>;
}
