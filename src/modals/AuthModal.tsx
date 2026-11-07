import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, LogOut, Package, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomerApiError } from '../utils/customerApi';
import './CustomerAccount.css';

export function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, user, authIntent, signIn, register, signOut, navigate, setIsSupportOpen } = useApp();
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [accountMissing, setAccountMissing] = useState(false);
  useEffect(() => {
    if (!isAuthOpen) return;
    setMode('login'); setPassword(''); setConfirmation(''); setError(''); setAccountMissing(false); setBusy(false);
    const element = dialog.current, overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; element?.showModal();
    return () => { element?.close(); document.body.style.overflow = overflow; };
  }, [isAuthOpen]);
  const switchMode = (next: 'login' | 'register') => { setMode(next); setPassword(''); setConfirmation(''); setError(''); setAccountMissing(false); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setAccountMissing(false);
    if (mode === 'register' && password !== confirmation) { setError('The passwords do not match.'); return; }
    setBusy(true);
    try {
      if (mode === 'register') await register({ name, email, phone, password });
      else await signIn(email, password);
      setPassword(''); setConfirmation('');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to sign in. Please try again.');
      setAccountMissing(failure instanceof CustomerApiError && failure.code === 'ACCOUNT_NOT_FOUND');
    } finally { setBusy(false); }
  };
  if (!isAuthOpen) return null;
  return <dialog ref={dialog} className="customer-auth-dialog" aria-labelledby="customer-auth-title" onCancel={event => { event.preventDefault(); setIsAuthOpen(false); }}>
    <header className="customer-auth-heading"><img src="/farminix_logo.png" alt="Farminix" /><button type="button" aria-label="Close account dialog" onClick={() => setIsAuthOpen(false)}><X size={20} /></button></header>
    {user ? <div className="customer-auth-body">
      <span className="customer-account-eyebrow">Your Farminix account</span><h2 id="customer-auth-title">Hello, {user.name}.</h2>
      <p>{user.email}<br />{user.phone}</p>
      {error && <p role="alert" className="customer-auth-error">{error}</p>}
      <button type="button" className="store-button customer-auth-submit" onClick={() => { setIsAuthOpen(false); navigate('/orders'); }}><Package size={18} />Order History<ArrowRight size={18} /></button>
      <button type="button" className="customer-auth-secondary" onClick={() => { setIsAuthOpen(false); setIsSupportOpen(true); }}>Customer Support</button>
      <button type="button" className="customer-auth-secondary" disabled={busy} onClick={async () => { setBusy(true); try { await signOut(); } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to sign out. Please retry.'); } finally { setBusy(false); } }}><LogOut size={17} />{busy ? 'Signing out…' : 'Sign out'}</button>
    </div> : <div className="customer-auth-body">
      <span className="customer-account-eyebrow">Welcome to Farminix</span><h2 id="customer-auth-title">{mode === 'register' ? 'Create your account' : 'Log in to your account'}</h2>
      <p>{mode === 'register' ? 'Create an account to place orders and keep your order history in one place.' : authIntent === 'checkout' ? 'Log in before placing your order. Your cart will be kept while you sign in.' : authIntent === 'support' ? 'Log in to view your support requests and replies from the team.' : authIntent === 'orders' ? 'Log in to view your previous orders and their latest status.' : 'Sign in with your email and password.'}</p>
      {error && <div className="customer-auth-error" role="alert">{accountMissing && <strong>No account found</strong>}<p>{error}</p>{accountMissing && <button type="button" onClick={() => switchMode('register')}>Create an account<ArrowRight size={16} /></button>}</div>}
      <form onSubmit={submit} className="customer-auth-form">
        {mode === 'register' && <><label>Full name<input autoComplete="name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label><label>Mobile number<input type="tel" inputMode="numeric" autoComplete="tel-national" required pattern="[0-9]{10}" maxLength={10} value={phone} onChange={event => setPhone(event.target.value.replace(/\D/g, ''))} placeholder="10-digit mobile number" /></label></>}
        <label>Email address<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label>Password<input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={mode === 'register' ? 8 : 1} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} />{mode === 'register' && <small>Use at least 8 characters.</small>}</label>
        {mode === 'register' && <label>Confirm password<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label>}
        <button type="submit" disabled={busy} className="store-button customer-auth-submit">{busy ? <><Loader2 className="animate-spin" size={18} />{mode === 'register' ? 'Creating account…' : 'Logging in…'}</> : <>{mode === 'register' ? 'Create account' : 'Log in'}<ArrowRight size={18} /></>}</button>
      </form>
      <p className="customer-auth-switch">{mode === 'register' ? 'Already have an account?' : 'New to Farminix?'} <button type="button" disabled={busy} onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}>{mode === 'register' ? 'Log in' : 'Create an account'}</button></p>
    </div>}
  </dialog>;
}
