import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Leaf, BriefcaseBusiness, ExternalLink, Factory, Heart, Home, Image, LayoutDashboard, Layers, LogOut, MapPin, Menu, MessageCircle, Package, Save, Search, Settings, ShoppingCart, Tag, Users, X, CreditCard, Camera } from 'lucide-react';
import { useAdminConfig } from './context/AdminConfigContext';
import { CommerceProvider, useCommerce } from './context/CommerceContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { HomePageManager } from './pages/HomePageManager';
import { ProductManager } from './pages/ProductManager';
import { ProductsPaymentManager } from './pages/ProductsPaymentManager';
import { OrderManager } from './pages/OrderManager';
import { OnlineCustomers } from './pages/OnlineCustomers';
import { CategoryManager } from './pages/CategoryManager';
import { OffersManager } from './pages/OffersManager';
import { HeroManager } from './pages/HeroManager';
import { SocialBlogManager } from './pages/SocialBlogManager';
import { AboutFarminixManager } from './pages/AboutFarminixManager';
import { ManufacturerManager } from './pages/ManufacturerManager';
import { CartManager } from './pages/CartManager';
import { FooterManager } from './pages/FooterManager';
import { SettingsManager } from './pages/SettingsManager';
import { ReachOutManager } from './pages/ReachOutManager';
import { QueriesManager } from './pages/QueriesManager';
import { CareersManager } from './pages/CareersManager';
import './admin.css';
import './admin-editors.css';

export function AdminLayout({ onReturnToStore }: { onReturnToStore: () => void }) {
  return <CommerceProvider><AdminShell onReturnToStore={onReturnToStore}/></CommerceProvider>;
}
function AdminShell({ onReturnToStore }: { onReturnToStore: () => void }) {
  const { adminLogout, hasChanges, publishConfig, discardDraft, isSaving, saveError, saveSuccess } = useAdminConfig();
  const { orders, updatedAt } = useCommerce();
  const pendingOrders = orders.filter(order => order.status !== 'Delivered').length;
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedId, setSelectedId] = useState<string>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const go = (page: string, id?: string) => { setActivePage(page); setSelectedId(id); setMobileOpen(false); };
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [activePage]);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === 'Escape') { setMobileOpen(false); menuRef.current?.focus(); }
    };
    window.addEventListener('keydown', handle); return () => window.removeEventListener('keydown', handle);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const buttons = drawerRef.current?.querySelectorAll<HTMLButtonElement>('button');
      if (!buttons?.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', trap);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', trap); };
  }, [mobileOpen]);
  const sections = [
    { label: 'Store Management', items: [
      { id: 'home', label: 'Home Page', icon: Home }, { id: 'products', label: 'Products', icon: Package },
      { id: 'categories', label: 'Categories', icon: Layers }, { id: 'offers', label: 'Offers & Banners', icon: Tag },
      { id: 'orders', label: 'Orders', icon: ShoppingCart }, { id: 'customers', label: 'Customers', icon: Users },
    ] },
    { label: 'Content Management', items: [
      { id: 'about', label: 'About Farminix', icon: Heart }, { id: 'reach-out', label: 'Reach Out Page', icon: MapPin },
      { id: 'queries', label: 'Queries & Compliance', icon: MessageCircle }, { id: 'careers', label: 'Careers Page', icon: BriefcaseBusiness },
      { id: 'manufacturer', label: 'Manufacturer', icon: Factory }, { id: 'social', label: 'Blog / Instagram', icon: Camera }, { id: 'footer', label: 'Store Footer', icon: Layers },
    ] },
    { label: 'Settings', items: [
      { id: 'settings', label: 'General Settings', icon: Settings }, { id: 'checkout', label: 'Payments & Delivery', icon: CreditCard },
      { id: 'cart', label: 'Cart & Coupons', icon: ShoppingCart }, { id: 'hero', label: 'Homepage Banners', icon: Image },
    ] },
  ];
  const sidebar = <><div className="admin-brand"><img src="/farminix_logo.png" alt="Farminix — from farms to your family"/><span className="admin-brand-tagline">From farms to your family</span><button aria-label="Close navigation" className="admin-mobile-only" onClick={() => { setMobileOpen(false); menuRef.current?.focus(); }}><X size={22}/></button></div><nav aria-label="Admin navigation"><button className={`admin-nav-item ${activePage === 'dashboard' ? 'active' : ''}`} aria-current={activePage === 'dashboard' ? 'page' : undefined} onClick={() => go('dashboard')}><LayoutDashboard size={19}/>Dashboard</button>{sections.map(section => <div className="admin-nav-section" key={section.label}><p>{section.label}</p>{section.items.map(item => <button className={`admin-nav-item ${activePage === item.id || (item.id === 'products' && activePage === 'add-product') ? 'active' : ''}`} aria-current={activePage === item.id ? 'page' : undefined} key={item.id} onClick={() => go(item.id)}><item.icon size={18}/>{item.label}</button>)}</div>)}</nav><div className="admin-sidebar-bottom"><span><LeafMark/> From farms to your family</span><button onClick={adminLogout}><LogOut size={18}/> Logout</button></div></>;
  const content = () => {
    switch (activePage) {
      case 'dashboard': return <AdminDashboard onNavigate={go} search={search}/>;
      case 'home': return <HomePageManager/>;
      case 'products': case 'add-product': return <ProductManager key={`${activePage}-${selectedId || ''}`} initialProductId={selectedId} startAdding={activePage === 'add-product'}/>;
      case 'orders': return <OrderManager initialOrderId={selectedId} search={search}/>;
      case 'customers': return <OnlineCustomers search={search}/>;
      case 'categories': return <CategoryManager/>;
      case 'offers': return <OffersManager/>;
      case 'hero': return <HeroManager/>;
      case 'social': return <SocialBlogManager/>;
      case 'about': return <AboutFarminixManager/>;
      case 'reach-out': return <ReachOutManager/>;
      case 'queries': return <QueriesManager/>;
      case 'careers': return <CareersManager/>;
      case 'manufacturer': return <ManufacturerManager/>;
      case 'cart': return <CartManager/>;
      case 'footer': return <FooterManager/>;
      case 'checkout': return <ProductsPaymentManager initialTab="checkout"/>;
      default: return <SettingsManager/>;
    }
  };
  return <div className="admin-shell"><aside className="admin-sidebar admin-desktop-sidebar">{sidebar}</aside>{mobileOpen && <><div className="admin-backdrop" onClick={() => setMobileOpen(false)}/><aside ref={drawerRef} role="dialog" aria-modal="true" aria-label="Store navigation" className="admin-sidebar admin-drawer">{sidebar}</aside></>}
    <div className="admin-workspace"><header className="admin-topbar"><button ref={menuRef} className="admin-mobile-only" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={23}/></button><label className="admin-search admin-global-search"><Search size={19}/><input ref={searchRef} aria-label="Search products, orders and customers" placeholder="Search products, orders, customers…" value={search} onChange={e => { setSearch(e.target.value); if (!['dashboard', 'orders', 'customers'].includes(activePage)) go('dashboard'); }}/>{search ? <button aria-label="Clear search" onClick={() => setSearch('')}><X size={15}/></button> : <kbd>Ctrl + K</kbd>}</label><div className="admin-topbar-actions"><button className="admin-view-store" onClick={onReturnToStore}>View Store <ExternalLink size={15}/></button><button className="admin-save" title="Save changes to the live store" aria-label="Save changes to the live store" onClick={() => void publishConfig()} disabled={isSaving || !hasChanges}><Save size={16}/><span>{isSaving ? 'Saving…' : 'Save Changes'}</span></button><button className="admin-notifications" title="View orders awaiting delivery" aria-label="View orders awaiting delivery" onClick={() => go('orders')}><Bell size={19}/>{updatedAt && pendingOrders > 0 && <span>{pendingOrders > 99 ? '99+' : pendingOrders}</span>}</button><button className="admin-profile" title="Open store settings" onClick={() => go('settings')}><span className="admin-avatar">A</span><div><strong>Farminix Admin</strong><small>Store administrator</small></div><ChevronDown size={15}/></button></div></header>
      {hasChanges && <div className="admin-draft-notice"><span>You have unpublished changes to your store.</span><button onClick={discardDraft} disabled={isSaving}>Discard draft</button></div>}
      <main className="admin-main">{saveError && <div role="alert" className="admin-alert">{saveError}</div>}{saveSuccess && <div role="status" className="admin-success">Changes saved to the live store.</div>}<div className={activePage === 'dashboard' ? 'admin-dashboard-view' : 'admin-editor'}>{content()}</div></main>
      <footer className="admin-page-footer"><span>© {new Date().getFullYear()} Farminix</span><span>Grown with care. Managed with purpose.</span></footer>
    </div></div>;
}
function LeafMark() { return <Leaf size={14}/>; }
