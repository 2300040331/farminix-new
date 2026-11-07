import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Loader2, Mail, Phone, Send, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WhatsAppIcon } from '../components/WhatsAppButton';
import { SupportRequests } from '../components/SupportRequests';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { sendSupportRequest, supportContacts } from '../utils/support';
import type { SupportSubmission } from '../utils/support';
import './SupportModal.css';

export function SupportModal() {
  const { publishedConfig } = useAdminConfig();
  const { isSupportOpen, setIsSupportOpen, user, orders, requestLogin } = useApp();
  const owner = user?.id || 'guest';
  const initialForm = useCallback(() => ({ name: user?.name || '', mobile: user?.phone || '', email: user?.email || '', message: '', kind: 'complaint' as SupportSubmission['kind'], website: '', orderId: '' }), [user]);
  const [form, setForm] = useState(initialForm), [draftOwner, setDraftOwner] = useState(owner);
  const [tab, setTab] = useState<'new' | 'requests'>('new');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [expired, setExpired] = useState(false), [reference, setReference] = useState('');
  const dialog = useRef<HTMLDialogElement>(null), sending = useRef(false);
  const currentOwner = useRef(owner), pending = useRef<{ fingerprint: string; id: string } | null>(null);
  useEffect(() => { currentOwner.current = owner; }, [owner]);
  useEffect(() => {
    if (!isSupportOpen) return;
    if (owner !== draftOwner) { setForm(initialForm()); setReference(''); setError(''); setExpired(false); setDraftOwner(owner); pending.current = null; }
  }, [isSupportOpen, owner, draftOwner, initialForm]);
  useEffect(() => {
    if (!isSupportOpen) return;
    const element = dialog.current, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; element?.showModal();
    return () => { element?.close(); document.body.style.overflow = overflow; };
  }, [isSupportOpen]);
  if (!isSupportOpen) return null;
  const requestsEnabled = publishedConfig.queriesPage?.enabled !== false;
  const contacts = supportContacts(publishedConfig, draftOwner !== owner ? undefined : reference ? `Hello Farminix, I need help with support request ${reference}.` : form.message.trim() ? `Hello Farminix, I need help: ${form.message.trim()}` : undefined);
  const login = (force = false) => { setIsSupportOpen(false); requestLogin('support', force); };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (sending.current || owner !== draftOwner) return;
    sending.current = true; setBusy(true); setError(''); setExpired(false);
    const ownerAtSend = owner;
    const payload: SupportSubmission = { name: form.name, mobile: form.mobile, email: form.email, message: form.message, kind: form.kind, website: form.website, source: 'support', ...(form.orderId.trim() ? { orderId: form.orderId.trim() } : {}) };
    const fingerprint = JSON.stringify({ owner, payload });
    if (pending.current?.fingerprint !== fingerprint) pending.current = { fingerprint, id: crypto.randomUUID() };
    try {
      const id = await sendSupportRequest(payload, pending.current.id);
      if (currentOwner.current === ownerAtSend) { setReference(id); setForm(previous => ({ ...previous, message: '', orderId: '' })); pending.current = null; }
    } catch (failure) {
      if (currentOwner.current === ownerAtSend) { setError(failure instanceof Error ? failure.message : 'Unable to send your request. Please retry.'); setExpired((failure as { status?: number }).status === 401); }
    } finally { sending.current = false; setBusy(false); }
  };
  const update = (key: keyof typeof form, value: string) => setForm(previous => ({ ...previous, [key]: value }));
  return <dialog ref={dialog} className="support-dialog" aria-labelledby="support-dialog-title" onCancel={event => { event.preventDefault(); setIsSupportOpen(false); }}>
    <header className="support-heading"><img src={contacts.logo} alt="Farminix" /><button aria-label="Close support" type="button" onClick={() => setIsSupportOpen(false)}><X size={21} /></button></header>
    <div className="support-body"><h2 id="support-dialog-title">Farminix Support</h2><p className="support-intro">Tell us about an order, payment, delivery or any other issue. Your request goes to the Farminix team.</p>
      {contacts.hours && <p className="support-hours">Support hours: {contacts.hours}</p>}
      <div className="support-contact-links">{contacts.whatsappUrl && <a href={contacts.whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="w-5 h-5" /><span>WhatsApp</span></a>}{contacts.callUrl && <a href={contacts.callUrl}><Phone size={18} /><span>Call us<small>{contacts.phone}</small></span></a>}{contacts.emailUrl && <a href={contacts.emailUrl}><Mail size={18} /><span>Email us</span></a>}</div>
      <div className="support-tabs" role="tablist" aria-label="Support options" onKeyDown={event => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 'new' : event.key === 'End' ? 'requests' : tab === 'new' ? 'requests' : 'new'; setTab(next); document.getElementById(next === 'new' ? 'support-new-tab' : 'support-history-tab')?.focus(); }}><button role="tab" id="support-new-tab" tabIndex={tab === 'new' ? 0 : -1} aria-selected={tab === 'new'} aria-controls="support-new-panel" onClick={() => setTab('new')}>New request</button><button role="tab" id="support-history-tab" tabIndex={tab === 'requests' ? 0 : -1} aria-selected={tab === 'requests'} aria-controls="support-history-panel" onClick={() => setTab('requests')}>My requests</button></div>
      {draftOwner !== owner ? <p role="status">Loading your support details…</p> : tab === 'requests' ? <div role="tabpanel" id="support-history-panel" aria-labelledby="support-history-tab">{user ? <SupportRequests key={user.id} customerId={user.id} onLogin={() => login(true)} /> : <div className="support-empty"><h3>Keep track of your requests</h3><p>Log in to view requests sent from your account and replies from the team.</p><button className="store-button" onClick={() => login()}>Log in / Create account</button></div>}</div> : <div role="tabpanel" id="support-new-panel" aria-labelledby="support-new-tab">
        {reference ? <div className="support-received" role="status"><CheckCircle2 size={35} /><h3>Request received</h3><p>Your issue has been saved for the Farminix team. Keep this reference for follow-up.</p><strong className="support-reference">{reference}</strong><p>{user ? 'Check My requests for status updates and a reply from the team.' : 'The team can follow up using the mobile number or email you provided.'}</p><button className="store-button" onClick={() => { setReference(''); setError(''); }}>Report another issue</button>{user && <button className="support-text-button" onClick={() => setTab('requests')}>View my requests</button>}</div> : !requestsEnabled ? <div className="support-empty"><h3>Support requests are currently unavailable</h3><p>Please use the listed contact options to reach the team.</p></div> : <form onSubmit={submit}>
          <fieldset disabled={busy} className="support-form"><div className="support-fields-row"><label>Your name<input autoComplete="name" required minLength={2} maxLength={120} value={form.name} onChange={event => update('name', event.target.value)} /></label><label>Mobile number<input type="tel" autoComplete="tel" required minLength={10} maxLength={24} value={form.mobile} onChange={event => update('mobile', event.target.value)} /></label></div>
          <label>Email <small>(optional)</small><input type="email" autoComplete="email" maxLength={254} value={form.email} onChange={event => update('email', event.target.value)} /></label>
          <label>What do you need help with?<select value={form.kind} onChange={event => update('kind', event.target.value)}><option value="complaint">Order, payment, delivery or product issue</option><option value="query">General question</option><option value="compliance">Compliance concern</option></select></label>
          {user && <label>Order reference <small>(optional)</small><input list="support-own-orders" maxLength={100} value={form.orderId} onChange={event => update('orderId', event.target.value)} placeholder="Choose or paste your order ID" /><datalist id="support-own-orders">{orders.map(order => <option key={order.id} value={order.id}>{order.status}</option>)}</datalist></label>}
          <label>Describe the issue<textarea required minLength={5} maxLength={5000} rows={4} value={form.message} onChange={event => update('message', event.target.value)} placeholder="Tell us what happened. Include your order or payment reference if relevant." /><small>{form.message.length}/5,000 characters. Please do not share passwords, OTPs or card details.</small></label>
          <div hidden aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={event => update('website', event.target.value)} /></label></div>
          {error && <div className="support-error" role="alert">{error}{expired && <button type="button" onClick={() => login(true)}>Log in again</button>}</div>}
          <button className="store-button support-submit" type="submit" disabled={busy}>{busy ? <><Loader2 size={17} className="animate-spin" />Sending request…</> : <><Send size={17} />Send support request</>}</button>
          <p className="support-form-note">A reference appears after your request is saved. {user ? 'You can view team replies in My requests.' : 'You can report an issue without creating an account.'}</p></fieldset>
        </form>}
      </div>}
    </div>
  </dialog>;
}
