import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Category, CartItem, UserAddress, User, Order } from '../types';
import { popularProducts, allProducts as defaultAllProducts, categories as defaultCategories } from '../data/products';
import { detectUserLocation } from '../utils/location';
import { useAdminConfig } from '../admin/context/AdminConfigContext';

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
  setUser: (user: User | null) => void;

  // Orders
  orders: Order[];
  createOrder: (address: UserAddress, paymentMethod: string, customItems?: CartItem[], customTotal?: number) => Order;

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
  const { publishedConfig, updateOrders } = useAdminConfig();
  
  // Filter out products and categories where enabled is explicitly set to false
  const allProducts = (publishedConfig.products && publishedConfig.products.length > 0 
    ? publishedConfig.products 
    : defaultAllProducts).filter(p => p.enabled !== false);
  const products = allProducts;
  
  const categories = (publishedConfig.categories && publishedConfig.categories.length > 0 
    ? publishedConfig.categories 
    : defaultCategories).filter(c => c.enabled !== false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCategoryPage, setActiveCategoryPage] = useState<string | null>(null);

  const [currentRoute, setCurrentRoute] = useState<{ pathname: string; searchParams: URLSearchParams }>(() => ({
    pathname: window.location.pathname,
    searchParams: new URLSearchParams(window.location.search),
  }));

  const [cart, setCart] = useState<CartItem[]>([
    // Default sample item in cart for demonstration
    { product: allProducts[0] || popularProducts[0], quantity: 1, selectedWeight: (allProducts[0] || popularProducts[0]).weight }
  ]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('FARM10');

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
          pathname: window.location.pathname,
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

  const [user, setUser] = useState<User | null>(() => {
    const defaultUser = (publishedConfig.users || []).find((u) => u.id === 'usr-1');
    if (defaultUser) return defaultUser;

    return {
      id: 'usr-1',
      name: 'Hitaishi Devarapalli',
      phone: '+91 98765 43210',
      email: 'hitaishi@example.com',
      rewardPoints: 350,
      walletBalance: 250,
      addresses: [
        {
          id: 'addr-1',
          name: 'Hitaishi Devarapalli',
          street: 'Plot No. 42, Brodipet 4th Line',
          city: 'Guntur',
          state: 'Andhra Pradesh',
          pincode: '522034',
          phone: '+91 98765 43210',
          isDefault: true
        }
      ]
    };
  });

  useEffect(() => {
    const updatedUser = (publishedConfig.users || []).find((u) => u.id === 'usr-1');
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, [publishedConfig.users]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-89241',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: [{ product: popularProducts[0], quantity: 1, selectedWeight: '1 kg' }],
      totalAmount: 209,
      discount: 21,
      deliveryFee: 0,
      finalAmount: 188,
      status: 'Out for Delivery',
      estimatedTime: '8 Mins',
      deliveryAddress: {
        id: 'addr-1',
        name: 'Hitaishi Devarapalli',
        street: 'Plot No. 42, Brodipet 4th Line',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        pincode: '522034',
        phone: '+91 98765 43210',
        isDefault: true
      },
      paymentMethod: 'UPI'
    }
  ]);

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart operations
  const addToCart = (product: Product, selectedWeight?: string) => {
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

  const applyCoupon = (code: string) => {
    const validCodes = [
      'FARM10',
      (publishedConfig.topOfferBar?.promoCode || '').toUpperCase(),
      (publishedConfig.offersPage?.promoCode || '').toUpperCase(),
    ].filter(Boolean);

    if (validCodes.includes(code.toUpperCase())) {
      setAppliedCoupon(code.toUpperCase());
      return true;
    }
    return false;
  };

  const rawTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isCouponApplied = Boolean(appliedCoupon);
  const cartDiscount = isCouponApplied ? Math.round(rawTotal * 0.10) : 0;
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
  const createOrder = (
    address: UserAddress,
    paymentMethod: string,
    customItems?: CartItem[],
    customTotal?: number
  ): Order => {
    const itemsToUse = customItems && customItems.length > 0 ? customItems : [...cart];
    const totalToUse = customTotal !== undefined ? customTotal : cartTotal;
    const newOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: itemsToUse,
      totalAmount: totalToUse,
      discount: cartDiscount,
      deliveryFee: 0,
      finalAmount: totalToUse,
      status: 'Order Received',
      estimatedTime: '15-20 Mins',
      deliveryAddress: address,
      paymentMethod,
    };

    setOrders(prev => [newOrder, ...prev]);
    updateOrders([newOrder, ...publishedConfig.orders]);
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
        setUser,
        orders,
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
