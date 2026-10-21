import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Leaf, LoaderCircle, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { useAdminConfig } from './context/AdminConfigContext';
import './admin.css';
import './admin-editors.css';

export function AdminAuth({ onBackToStore }: { onBackToStore: () => void }) {
  const { adminLogin } = useAdminConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const submit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setIsLoading(true);
    try { await adminLogin(email, password); }
    catch (error) { setError(error instanceof Error ? error.message : 'Unable to sign in. Please retry.'); }
    finally { setIsLoading(false); }
  };

  return <div className="admin-auth">
    <aside className="admin-auth-story">
      <div className="admin-auth-brand"><img src="/farminix_logo.png" alt="Farminix"/><span>FROM FARMS TO YOUR FAMILY</span></div>
      <div className="admin-auth-story-copy"><span><Leaf size={18}/> Grown with care</span><h2>A good harvest.<br/>A thoughtfully<br/>managed store.</h2><p>Every product, every order, every family.<br/>Bring it all together with Farminix.</p></div>
      <p className="admin-auth-story-footer">Rooted in quality. Growing together.</p>
    </aside>
    <main className="admin-auth-main">
      <button className="admin-auth-back" type="button" onClick={onBackToStore}><ArrowLeft size={16}/> Back to store</button>
      <div className="admin-auth-card">
        <span className="admin-auth-lock"><ShieldCheck size={26}/></span>
        <p className="admin-eyebrow">FARMINIX ADMINISTRATION</p>
        <h1>Welcome back.</h1>
        <p className="admin-auth-description">Sign in to take care of your store.</p>
        <form onSubmit={event => void submit(event)}>
          <label htmlFor="admin-email">Email or username</label>
          <div className="admin-auth-field"><UserRound size={18}/><input id="admin-email" name="username" autoComplete="username" placeholder="Enter your admin email" required value={email} onChange={event => setEmail(event.target.value)}/></div>
          <label htmlFor="admin-password">Password</label>
          <div className="admin-auth-field"><LockKeyhole size={18}/><input id="admin-password" name="password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" required value={password} onChange={event => setPassword(event.target.value)}/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
          {error && <p role="alert" className="admin-alert">{error}</p>}
          <button type="submit" disabled={isLoading} className="admin-auth-submit">{isLoading ? <><LoaderCircle size={18} className="animate-spin"/> Signing in…</> : <>Sign in to your store <ArrowRight size={17}/></>}</button>
        </form>
        <div className="admin-auth-secure"><LockKeyhole size={13}/> Secure access for authorized administrators</div>
      </div>
      <footer>© {new Date().getFullYear()} Farminix · From farm to family.</footer>
    </main>
  </div>;
}
