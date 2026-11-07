import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, RefreshCw, Search, ShoppingBag, UserCheck, Users } from 'lucide-react';
import { customerApi } from '../../utils/customerApi';
import { money } from '../commerceUtils';
import { RegisteredUserDetails } from '../components/RegisteredUserDetails';
import type { AdminUserDirectory } from '../customerTypes';
import './RegisteredUsers.css';

export function RegisteredUserDirectoryView({ directory, onSelect }: { directory: AdminUserDirectory; onSelect: (id: string) => void }) {
  return <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>User</th><th>Mobile number</th><th>Registered</th><th>Orders</th><th>Order value</th><th>Details</th></tr></thead>
    <tbody>{directory.users.map(user => <tr key={user.id}><td><strong>{user.name}</strong><small>{user.email}</small></td><td><a href={`tel:${user.phone}`}>{user.phone}</a></td><td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'Not available'}</td><td>{user.orderCount}</td><td><strong>{money(user.orderValue)}</strong></td><td><button className="admin-edit admin-user-view" onClick={() => onSelect(user.id)} aria-label={`View details and orders for ${user.name}`}>View user <ArrowRight size={13} /></button></td></tr>)}</tbody>
  </table></div>;
}

export function OnlineCustomers({ search = '' }: { search?: string }) {
  const [directory, setDirectory] = useState<AdminUserDirectory | null>(null);
  const [query, setQuery] = useState('');
  const [pagination, setPagination] = useState({ search: '', page: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const details = useRef<HTMLDivElement>(null);
  const combinedSearch = `${search} ${query}`.trim();
  const page = pagination.search === combinedSearch ? pagination.page : 0;
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setDirectory(null);
    const timer = window.setTimeout(() => {
      customerApi<AdminUserDirectory>(`/api/site-config/users?search=${encodeURIComponent(combinedSearch)}&page=${page}`, { signal: controller.signal })
        .then(data => { if (!controller.signal.aborted) setDirectory(data); })
        .catch(failure => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Unable to load registered users.'); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 200);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [combinedSearch, page, revision]);
  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);
  useEffect(() => {
    if (selectedId) { details.current?.scrollIntoView({ block: 'start' }); details.current?.focus({ preventScroll: true }); }
  }, [selectedId]);
  const metrics = [
    { label: 'Total registered users', value: directory?.totalUsers, Icon: Users, color: 'purple' },
    { label: 'Users with orders', value: directory?.usersWithOrders, Icon: UserCheck, color: 'green' },
    { label: 'Registered user orders', value: directory?.totalOrders, Icon: ShoppingBag, color: 'blue' },
  ];
  return <div className="admin-users space-y-5">
    <section className="admin-card"><div className="admin-page-heading-inline admin-section-heading"><div><p className="admin-eyebrow">REGISTERED CUSTOMER ACCOUNTS</p><h1 className="text-2xl font-bold mt-2">Users</h1><p>Every registered user, their contact details, saved addresses and complete order history.</p></div><button onClick={() => setRevision(value => value + 1)} disabled={loading}><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Refresh</button></div>
      <div className="admin-user-metrics">{metrics.map(({ label, value, Icon, color }) => <div key={label}><span className={`admin-icon ${color}`}><Icon size={21} /></span><div><p>{label}</p><strong>{value === undefined ? '—' : value.toLocaleString('en-IN')}</strong></div></div>)}</div>
      <div className="admin-table-tools"><label className="admin-search"><Search size={16} /><input aria-label="Search registered users" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, email, mobile or user ID…" /></label></div>
      {error && <div className="admin-alert" role="alert">{error}<button className="admin-edit" onClick={() => setRevision(value => value + 1)}>Retry</button></div>}
      {loading && <div className="admin-empty" role="status"><Loader2 className="animate-spin" size={25} /><strong>Loading registered users…</strong></div>}
      {directory && <RegisteredUserDirectoryView directory={directory} onSelect={setSelectedId} />}
      {directory && !directory.users.length && <div className="admin-empty"><Users size={30} /><strong>{directory.totalUsers ? 'No matching users' : 'No registered users yet'}</strong><p>{directory.totalUsers ? 'Try a different name, email or mobile number.' : 'Users appear here as soon as they create an account, even before their first order.'}</p></div>}
      {directory && <div className="admin-pagination"><span>{directory.matchedUsers} matching users · {directory.totalUsers} registered in total</span><div><button disabled={!page || loading} onClick={() => setPagination({ search: combinedSearch, page: page - 1 })}>Previous</button><button disabled={!directory.hasMore || loading} onClick={() => setPagination({ search: combinedSearch, page: page + 1 })}>Next</button></div></div>}
    </section>
    {selectedId && <div ref={details} tabIndex={-1} className="admin-user-detail-anchor"><RegisteredUserDetails key={`${selectedId}-${revision}`} customerId={selectedId} onClose={() => setSelectedId(null)} /></div>}
  </div>;
}
