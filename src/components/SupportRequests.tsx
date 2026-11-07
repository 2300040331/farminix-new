import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { customerApi } from '../utils/customerApi';
import type { SupportRequest } from '../utils/support';
const statusLabel = { new: 'Received', 'in-progress': 'In progress', resolved: 'Resolved' };
export function SupportRequestsView({ requests }: { requests: SupportRequest[] }) {
  return <div className="support-request-list">{!requests.length && <div className="support-empty"><h3>No support requests yet</h3><p>Send an issue using New request. Your saved requests and team replies will appear here.</p></div>}{requests.map(row => <article className="support-request" key={row.id}><header><span data-status={row.status}>{statusLabel[row.status]}</span><time dateTime={row.createdAt}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</time></header><p className="support-reference">Reference: {row.id}</p>{row.orderId && <p className="support-order">Order: {row.orderId}</p>}<p className="support-original-message">{row.message}</p>{row.publicReply ? <div className="support-team-reply"><strong>Farminix response</strong><p>{row.publicReply}</p>{row.repliedAt && <time dateTime={row.repliedAt}>{new Date(row.repliedAt).toLocaleString('en-IN')}</time>}</div> : <p className="support-awaiting">Awaiting a response from the team.</p>}</article>)}</div>;
}
export function SupportRequests({ customerId, onLogin }: { customerId: string; onLogin: () => void }) {
  const [requests, setRequests] = useState<SupportRequest[]>([]), [page, setPage] = useState(0), [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [expired, setExpired] = useState(false), [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    customerApi<{ enquiries: SupportRequest[]; total: number }>(`/api/site-config/queries?mine=1&page=${page}`, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) { setRequests(data.enquiries); setTotal(data.total); setExpired(false); } })
      .catch(failure => { if (!controller.signal.aborted) { if (failure.status === 401) { setRequests([]); setExpired(true); } setError(failure instanceof Error ? failure.message : 'Unable to load requests.'); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [customerId, page, version]);
  useEffect(() => { const refresh = () => setVersion(value => value + 1); window.addEventListener('focus', refresh); return () => window.removeEventListener('focus', refresh); }, []);
  return <div><div className="support-history-heading"><h3>Your requests</h3><button disabled={loading} onClick={() => setVersion(value => value + 1)}><RefreshCw size={14} />Refresh updates</button></div>{error && <div className="support-error" role="alert">{error}{expired && <button onClick={onLogin}>Log in again</button>}</div>}{loading && <p className="support-loading" role="status"><Loader2 className="animate-spin" size={17} />Loading your requests…</p>}{!loading && !error && <SupportRequestsView requests={requests} />}{total > 25 && <div className="support-pagination"><button disabled={!page || loading} onClick={() => setPage(value => value - 1)}>Previous</button><span>{page + 1} / {Math.ceil(total / 25)}</span><button disabled={(page + 1) * 25 >= total || loading} onClick={() => setPage(value => value + 1)}>Next</button></div>}</div>;
}
