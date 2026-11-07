import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { Product, Category, CartItem, UserAddress, User, Order } from '../types';
import { allProducts as defaultAllProducts, categories as defaultCategories } from '../data/products';
import { detectUserLocation } from '../utils/location';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { customerApi, CustomerApiError } from '../utils/customerApi';

type AuthIntent = 'account' | 'checkout' | 'orders' | 'support';

interface AppContextType {
  // Products & Search
  products: Product[];
  categories: Category[]; // Expose categories to store
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  activeCategoryPage: string | null;
  setActiveCategoryPage: (cat: string | null) => void;
  allProducts: Product[];
  currentRoute: { pathname: string; searchParams: URLSearchParams };
  navigate: (pathname: string, searchString?: string, options?: { replace?: boolean }) => void;
  goBack: () => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, selectedWeight?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartDiscount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // Location
  location: string;
  setLocation: (loc: string) => void;
  detectAndSetLocation: () => Promise<boolean>;

  // Auth User
  user: User | null;
  authStatus: 'loading' | 'authenticated' | 'guest';
  authIntent: AuthIntent;
  requestLogin: (intent?: AuthIntent, force?: boolean) => void;
  beginCheckout: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  register: (fields: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  saveAddresses: (addresses: UserAddress[]) => Promise<void>;

  // Orders
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string;
  hasMoreOrders: boolean;
  refreshOrders: () => Promise<void>;
  loadMoreOrders: () => Promise<void>;
  createOrder: (address: UserAddress, paymentMethod: string, customItems?: CartItem[], customTotal?: number, payment?: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string; couponCode?: string | null }) => Promise<Order>;

  // Modals
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isLocationOpen: boolean;
  setIsLocationOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackOrderOpen: boolean;
  setIsTrackOrderOpen: (open: boolean) => void;
  isSupportOpen: boolean;
  setIsSupportOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publishedConfig } = useAdminConfig();
  
  // Filter out products and categories where enabled is explicitly set to false
  const allProducts = (publishedConfig.products 
    ? publishedConfig.products 
    : defaultAllProducts).filter(p => p.enabled !== false).map(p => ({ ...p, inStock: p.stockCount != null ? p.stockCount > 0 : p.inStock }));
  const products = allProducts;
  
  const categories = (publishedConfig.categories 
    ? publishedConfig.categories 
    : defaultCategories).filter(c => c.enabled !== false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCategoryPage, setActiveCategoryPage] = useState<string | null>(null);

  const [currentRoute, setCurrentRoute] = useState<{ pathname: string; searchParams: URLSearchParams }>(() => {
    return {
      pathname: window.location.pathname.replace(/\/+$/, '') || '/',
      searchParams: new URLSearchParams(window.location.search),
    };
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('farminix_cart_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('farminix_cart_v3', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Keep saved carts aligned with the latest published inventory.
  useEffect(() => {
    setCart(previous => previous.flatMap(item => {
      const latest = (publishedConfig.products || defaultAllProducts).find(p => p.id === item.product.id);
      if (!latest || latest.enabled === false || latest.stockCount <= 0 || latest.inStock === false) return [];
      return [{ ...item, product: latest }];
    }));
  }, [publishedConfig.products]);

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath === '/checkout' && cart.length === 0) {
        window.history.replaceState(null, '', '/');
        setCurrentRoute({
          pathname: '/',
          searchParams: new URLSearchParams(),
        });
      } else {
        setCurrentRoute({
          pathname: window.location.pathname.replace(/\/+$/, '') || '/',
          searchParams: new URLSearchParams(window.location.search),
        });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [cart.length]);

  const navigate = (pathname: string, searchString?: string, options?: { replace?: boolean }) => {
    const search = searchString ? `?${searchString}` : '';
    const fullUrl = `${pathname}${search}`;
    if (options?.replace) {
      window.history.replaceState(null, '', fullUrl);
    } else {
      window.history.pushState(null, '', fullUrl);
    }
    setCurrentRoute({
      pathname,
      searchParams: new URLSearchParams(search),
    });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const goBack = () => {
    navigate('/');
  };


  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('farminix_user_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [location, setLocationState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('farminix_user_location');
      return saved || 'Guntur, Andhra Pradesh - 522034';
    } catch {
      return 'Guntur, Andhra Pradesh - 522034';
    }
  });

  const setLocation = (loc: string) => {
    const cleanedLoc = loc.trim().replace(/\s*-\s*$/, '').replace(/,\s*$/, '');
    setLocationState(cleanedLoc);
    try {
      localStorage.setItem('farminix_user_location', cleanedLoc);
    } catch {
      // Ignore localStorage errors
    }
  };

  const detectAndSetLocation = async (): Promise<boolean> => {
    const res = await detectUserLocation();
    if (res.success && res.locationString) {
      setLocation(res.locationString);
      return true;
    }
    return false;
  };

  // Attempt automatic location detection on initial app load if no saved location
  useEffect(() => {
    try {
      const saved = localStorage.getItem('farminix_user_location');
      if (!saved && navigator.geolocation) {
        detectAndSetLocation();
      }
    } catch {
      // Ignore
    }
  }, []);

  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'guest'>('loading');
  const [authIntent, setAuthIntent] = useState<AuthIntent>('account');
  const intentRef = useRef<AuthIntent>('account');
  const authRequested = useRef(false);
  const authEpoch = useRef(0);
  const authInFlight = useRef(false);
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const setIsAuthOpen = useCallback((open: boolean) => {
    setAuthOpen(open);
    if (!open) { authRequested.current = false; intentRef.current = 'account'; setAuthIntent('account'); }
  }, []);
  const requestLogin = useCallback((intent: AuthIntent = 'account', force = false) => {
    if (force) { ++authEpoch.current; setUser(null); setAuthStatus('guest'); setOrders([]); }
    intentRef.current = intent; authRequested.current = true; setAuthIntent(intent); setAuthOpen(true);
  }, []);
  const commitSession = useCallback((profile: User | null) => {
    setUser(profile); setAuthStatus(profile ? 'authenticated' : 'guest');
    if (!profile) return;
    const destination = authRequested.current ? intentRef.current : 'account';
    authRequested.current = false; intentRef.current = 'account'; setAuthIntent('account'); setAuthOpen(false);
    if (destination === 'checkout') navigateRef.current('/checkout');
    if (destination === 'orders') navigateRef.current('/orders');
    if (destination === 'support') setIsSupportOpen(true);
  }, []);
  useEffect(() => {
    try {
      for (const key of ['farminix_user_profile', 'farminix_user_profile_v2', 'farminix_user_profile_v3', 'farminix_user_orders']) localStorage.removeItem(key);
    } catch {}
    let cancelled = false; const version = authEpoch.current;
    customerApi<{ user: User | null }>('/api/customer-auth').then(data => {
      if (!cancelled && authEpoch.current === version) commitSession(data.user);
    }).catch(() => { if (!cancelled && authEpoch.current === version) commitSession(null); });
    return () => { cancelled = true; };
  }, [commitSession]);
  const authenticate = async (action: 'login' | 'register', fields: { email: string; password: string; name?: string; phone?: string }) => {
    if (authInFlight.current) throw new Error('Sign-in is already in progress. Please wait.');
    authInFlight.current = true;
    const version = ++authEpoch.current;
    try {
      const data = await customerApi<{ user: User }>('/api/customer-auth', { method: 'POST', body: JSON.stringify({ action, ...fields }) });
      if (version === authEpoch.current) commitSession(data.user);
    } catch (error) { if (version === authEpoch.current && !user) commitSession(null); throw error; }
    finally { authInFlight.current = false; }
  };
  const signIn = (email: string, password: string) => authenticate('login', { email, password });
  const register = (fields: { name: string; email: string; phone: string; password: string }) => authenticate('register', fields);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [ordersCursor, setOrdersCursor] = useState<number | null>(null);
  const orderRequest = useRef(0);
  const fetchOrders = useCallback(async (cursor = 0, append = false) => {
    if (!user?.id) return;
    const version = authEpoch.current, request = ++orderRequest.current;
    setOrdersLoading(true); setOrdersError('');
    try {
      const data = await customerApi<{ orders: Order[]; nextCursor: number | null }>(`/api/customer-orders?cursor=${cursor}`);
      if (version !== authEpoch.current || request !== orderRequest.current) return;
      setOrders(previous => append ? [...previous, ...data.orders.filter(order => !previous.some(existing => existing.id === order.id))] : data.orders);
      setOrdersCursor(data.nextCursor);
    } catch (error) {
      if (version !== authEpoch.current || request !== orderRequest.current) return;
      if (error instanceof CustomerApiError && error.status === 401) { commitSession(null); setOrders([]); }
      setOrdersError(error instanceof Error ? error.message : 'Unable to load your orders. Please retry.');
    } finally { if (version === authEpoch.current && request === orderRequest.current) setOrdersLoading(false); }
  }, [user?.id, commitSession]);
  const refreshOrders = useCallback(() => fetchOrders(), [fetchOrders]);
  const loadMoreOrders = () => ordersCursor !== null ? fetchOrders(ordersCursor, true) : Promise.resolve();
  useEffect(() => {
    setOrders([]); setOrdersCursor(null); setOrdersError(''); setOrdersLoading(false);
    if (user?.id) void fetchOrders();
  }, [user?.id, fetchOrders]);
  const signOut = async () => {
    ++authEpoch.current; setOrders([]); setOrdersCursor(null); setOrdersError(''); setOrdersLoading(false);
    await customerApi('/api/customer-auth', { method: 'DELETE' });
    commitSession(null); setIsAuthOpen(false); navigate('/');
    try { sessionStorage.removeItem('farminix_pending_order'); } catch {}
  };
  const saveAddresses = async (addresses: UserAddress[]) => {
    try {
      const version = authEpoch.current;
      const data = await customerApi<{ user: User }>('/api/customer-auth', { method: 'PUT', body: JSON.stringify({ addresses }) });
      if (version === authEpoch.current) setUser(data.user);
    } catch (error) {
      if (error instanceof CustomerApiError && error.status === 401) { commitSession(null); requestLogin('checkout'); }
      throw error;
    }
  };
  const beginCheckout = () => {
    if (authStatus !== 'authenticated' || !user) { requestLogin('checkout'); return; }
    navigate('/checkout');
  };
  const pendingOrder = useRef<{ fingerprint: string; id: string } | null>((() => {
    try { return JSON.parse(sessionStorage.getItem('farminix_pending_order') || 'null'); } catch { return null; }
  })());

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart operations
  const addToCart = (product: Product, selectedWeight?: string) => {
    const currentProduct = products.find(p => p.id === product.id);
    if (!currentProduct?.inStock) return;
    const weight = selectedWeight || product.weight;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedWeight === weight);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.selectedWeight === weight
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedWeight: weight }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const currentProduct = products.find(p => p.id === productId);
    if (delta > 0 && !currentProduct?.inStock) return;
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const eligibleSubtotal = (coupon: import('../admin/types').CartCoupon) => cart.reduce((sum, item) =>
    sum + ((!coupon.productIds?.length || coupon.productIds.includes(item.product.id)) ? item.product.price * item.quantity : 0), 0);
  const validCoupon = (coupon: import('../admin/types').CartCoupon) => publishedConfig.cart?.couponsEnabled !== false && coupon.enabled &&
    (!coupon.expiresAt || new Date(coupon.expiresAt).getTime() > Date.now()) &&
    eligibleSubtotal(coupon) > 0 && eligibleSubtotal(coupon) >= (coupon.minimumSpend || 0);
  const applyCoupon = (code: string) => {
    if (!code) { setAppliedCoupon(null); return true; }
    const coupon = publishedConfig.cart?.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && validCoupon(c));
    if (!coupon) return false;
    setAppliedCoupon(coupon.code.toUpperCase());
    return true;
  };
  const rawTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const matchedCoupon = publishedConfig.cart?.coupons.find(c => c.code.toUpperCase() === appliedCoupon?.toUpperCase() && validCoupon(c));
  const cartDiscount = matchedCoupon ? Math.round(eligibleSubtotal(matchedCoupon) * Math.min(100, Math.max(0, matchedCoupon.discountPercentage)) / 100) : 0;
  const cartTotal = Math.max(0, rawTotal - cartDiscount);

  // Wishlist toggle
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('farminix_user_wishlist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Order creation
  const createOrder = async (
    address: UserAddress,
    paymentMethod: string,
    customItems?: CartItem[],
    customTotal?: number,
    payment?: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string; couponCode?: string | null }
  ): Promise<Order> => {
    if (!user || authStatus !== 'authenticated') { requestLogin('checkout'); throw new Error('Please log in before placing your order.'); }
    const owner = user.id, version = authEpoch.current;
    const itemsToUse = customItems && customItems.length > 0 ? customItems : [...cart];
    const totalToUse = customTotal !== undefined ? customTotal : cartTotal;
    const items = itemsToUse.map(item => ({ productId: item.product.id, quantity: item.quantity, selectedWeight: item.selectedWeight }));
    const fingerprint = JSON.stringify({ owner, items, address, paymentMethod, totalToUse, appliedCoupon });
    if (pendingOrder.current?.fingerprint !== fingerprint) pendingOrder.current = { fingerprint, id: crypto.randomUUID() };
    try { sessionStorage.setItem('farminix_pending_order', JSON.stringify(pendingOrder.current)); } catch {}
    const response = await fetch('/api/site-config/orders', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: pendingOrder.current.id, items, address, expectedAmount: totalToUse, couponCode: payment && payment.couponCode !== undefined ? payment.couponCode : appliedCoupon, payment: payment ? { method: 'RAZORPAY', ...payment } : { method: 'COD' } }),
    });
    const data = await response.json();
    if (version !== authEpoch.current) throw new Error('Your account changed. Log back in to check this order in Order History.');
    if (!response.ok) {
      if (response.status === 401) { commitSession(null); setOrders([]); requestLogin('checkout'); }
      throw Error(data.error || 'Unable to confirm your order. Please retry.');
    }
    const newOrder: Order = data.order;
    setOrders(prev => {
      const next = [newOrder, ...prev.filter(order => order.id !== newOrder.id)];
      return next;
    });
    pendingOrder.current = null;
    try { sessionStorage.removeItem('farminix_pending_order'); } catch {}
    clearCart();
    return newOrder;
  };

  return (
    <AppContext.Provider
      value={{
        products,
        categories,
        allProducts,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        activeCategoryPage,
        setActiveCategoryPage,
        currentRoute,
        navigate,
        goBack,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartDiscount,
        appliedCoupon,
        applyCoupon,
        wishlist,
        toggleWishlist,
        location,
        setLocation,
        detectAndSetLocation,
        user,
        authStatus,
        authIntent,
        requestLogin,
        beginCheckout,
        signIn,
        register,
        signOut,
        saveAddresses,
        orders,
        ordersLoading,
        ordersError,
        hasMoreOrders: ordersCursor !== null,
        refreshOrders,
        loadMoreOrders,
        createOrder,
        isCartOpen,
        setIsCartOpen,
        isAuthOpen,
        setIsAuthOpen,
        isLocationOpen,
        setIsLocationOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackOrderOpen,
        setIsTrackOrderOpen,
        isSupportOpen,
        setIsSupportOpen,
        selectedProduct,
        setSelectedProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
