import { useCommerce } from '../context/CommerceContext';
import { customerKey, money } from '../commerceUtils';

export function OnlineCustomers({ search = '' }: { search?: string }) {
  const { orders, error, loading } = useCommerce();
  const customers = Array.from(new Set(orders.map(o => customerKey(o.deliveryAddress.phone)))).map(key => {
    const purchases = orders.filter(o => customerKey(o.deliveryAddress.phone) === key);
    return { address: purchases[0].deliveryAddress, orders: purchases.length, total: purchases.reduce((sum, o) => sum + o.finalAmount, 0) };
  }).filter(c => `${c.address.name} ${c.address.phone} ${c.address.city}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="admin-card"><div className="admin-page-heading-inline admin-section-heading"><div><h1 className="text-2xl font-bold">Customers</h1><p>Customers who placed online store orders, grouped by phone number.</p></div><span className="admin-badge purple">{customers.length} customers</span></div>{error && <p role="alert" className="admin-alert">{error}</p>}<div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Customer</th><th>Phone</th><th>City</th><th>Orders</th><th>Order value</th></tr></thead><tbody>{customers.map(c => <tr key={customerKey(c.address.phone)}><td><strong>{c.address.name}</strong></td><td><a href={`tel:${c.address.phone}`}>{c.address.phone}</a></td><td>{c.address.city}</td><td>{c.orders}</td><td><strong>{money(c.total)}</strong></td></tr>)}</tbody></table></div>{!customers.length && <div className="admin-empty"><strong>{loading ? 'Loading customers…' : error ? 'Customer data unavailable' : 'No matching customers'}</strong><p>Customers appear here after placing an order.</p></div>}</section>;
}
