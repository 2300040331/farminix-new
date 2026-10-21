import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Order, Product } from '../../types';
import { useAdminConfig } from './AdminConfigContext';

interface CommerceState {
  orders: Order[];
  products: Product[];
  loading: boolean;
  error: string;
  updatedAt: Date | null;
  refresh: () => Promise<void>;
  updateStatus: (id: string, status: Order['status']) => Promise<void>;
}
const CommerceContext = createContext<CommerceState | null>(null);
export function CommerceProvider({ children }: { children: ReactNode }) {
  const { publishedConfig } = useAdminConfig();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(publishedConfig.products);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const busy = useRef(false);
  const revision = useRef(0);
  useEffect(() => { if (!updatedAt) setProducts(publishedConfig.products); }, [publishedConfig.products, updatedAt]);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const version = revision.current;
    try {
      const response = await fetch('/api/site-config/orders', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(20000) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Unable to load online orders.');
      if (version !== revision.current) return;
      setOrders(data.orders); setProducts(data.products); setUpdatedAt(new Date()); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load online orders.'); }
    finally { busy.current = false; setLoading(false); }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [refresh]);
  const updateStatus = async (id: string, status: Order['status']) => {
    revision.current++;
    const response = await fetch('/api/site-config/orders', { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Unable to update order.');
    setOrders(previous => previous.map(order => order.id === id ? data.order : order));
    setUpdatedAt(new Date());
  };
  return <CommerceContext.Provider value={{ orders, products, loading, error, updatedAt, refresh, updateStatus }}>{children}</CommerceContext.Provider>;
}
export function useCommerce() {
  const value = useContext(CommerceContext);
  if (!value) throw Error('Commerce provider is required.');
  return value;
}
