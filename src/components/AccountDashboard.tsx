import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, MapPin, Heart, Shield,
  HelpCircle, Lock, Settings as SettingsIcon, LogOut,
  ChevronRight, Plus, Trash2, Edit2, Download,
  Phone, MessageSquare, ChevronDown, ChevronUp, Sun, Moon, Compass, CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { UserAddress, Order } from '../types';

// Toast Notification State
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export const AccountDashboard: React.FC = () => {
  const {
    user,
    setUser,
    navigate,
    orders,
    wishlist,
    toggleWishlist,
    allProducts,
    addToCart,
    setIsCartOpen,
  } = useApp();


  // Active Menu Tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Toast System
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Local Persistent States
  const [userProfile, setUserProfile] = useState({
    name: user?.name || 'Hitaishi Devarapalli',
    email: user?.email || 'hitaishi@example.com',
    phone: user?.phone || '+91 98765 43210',
    memberSince: 'August 2024',
    isGoldMember: true,
  });

  const [addresses, setAddresses] = useState<UserAddress[]>(() => {
    const saved = localStorage.getItem('farminix_addresses');
    if (saved) return JSON.parse(saved);
    return user?.addresses || [
      {
        id: 'addr-1',
        name: 'Hitaishi Devarapalli',
        street: 'Plot No. 42, Brodipet 4th Line',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        pincode: '522034',
        phone: '+91 98765 43210',
        isDefault: true,
      },
      {
        id: 'addr-2',
        name: 'Hitaishi Work',
        street: 'Tech Park Tower B, 3rd Floor',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        pincode: '522002',
        phone: '+91 98765 43210',
        isDefault: false,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('farminix_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name,
        email: user.email,
        phone: user.phone,
        memberSince: 'August 2024',
        isGoldMember: true,
      });
    }
  }, [user]);

  // Settings
  const [settings, setSettings] = useState({
    darkMode: false,
    language: 'English',
    orderUpdatesEmail: true,
    orderUpdatesSms: true,
    orderUpdatesWhatsapp: true,
    promotionalOffers: true,
    shareLocationWithRider: true,
  });

  // Modal States
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('all');

  // Address Form State
  const [newAddressForm, setNewAddressForm] = useState({
    name: '',
    street: '',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    pincode: '522034',
    phone: '',
    isDefault: false,
  });

  // FAQ Accordion State
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);

  // Live Chat Simulator State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi Hitaishi! 👋 How can I help you with your Farminix orders today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Menu items list
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield, badge: null },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, badge: orders.length.toString() },
    { id: 'tracking', label: 'Order Tracking', icon: Compass, badge: 'LIVE' },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, badge: addresses.length.toString() },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length > 0 ? wishlist.length.toString() : null },
    { id: 'support', label: 'Help & Support', icon: HelpCircle, badge: null },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle, badge: null },
    { id: 'privacy', label: 'Account Privacy', icon: Lock, badge: null },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, badge: null },
    { id: 'logout', label: 'Logout', icon: LogOut, badge: null },
  ];

  const handleMenuClick = (id: string) => {
    if (id === 'logout') {
      setIsLogoutConfirmOpen(true);
    } else {
      setActiveTab(id);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const confirmLogout = () => {
    setUser(null);
    showToast('Successfully logged out', 'info');
    setIsLogoutConfirmOpen(false);
    navigate('/');
  };

  // Address Handlers
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.name || !newAddressForm.street || !newAddressForm.phone) {
      showToast('Please fill all address fields', 'warning');
      return;
    }
    const newAddr: UserAddress = {
      id: `addr-${Date.now()}`,
      ...newAddressForm,
    };
    if (newAddr.isDefault) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddr));
    } else {
      setAddresses(prev => [...prev, newAddr]);
    }
    showToast('New address saved successfully!');
    setIsAddAddressOpen(false);
    setNewAddressForm({
      name: '',
      street: '',
      city: 'Guntur',
      state: 'Andhra Pradesh',
      pincode: '522034',
      phone: '',
      isDefault: false,
    });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    showToast('Address deleted', 'info');
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    showToast('Default delivery address updated!');
  };

  // Reorder Handler
  const handleReorder = (order: Order) => {
    order.items.forEach((item) => addToCart(item.product, item.selectedWeight));
    showToast(`Items from Order ${order.id} added to cart!`);
    setIsCartOpen(true);
  };

  // Send Live Chat Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = "I'm checking your account details right now. A support representative will be with you shortly!";
      if (userMsg.toLowerCase().includes('order')) {
        botResponse = "Your latest order #ORD-89241 is currently Out for Delivery with estimated arrival in 8 minutes!";
      } else if (userMsg.toLowerCase().includes('refund') || userMsg.toLowerCase().includes('money')) {
        botResponse = "Refunds are processed to your Farminix Wallet within 15 minutes of item cancellation.";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <div className={`w-full min-h-screen bg-white py-6 font-sans ${settings.darkMode ? 'dark bg-slate-950 text-white' : ''}`}>
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : toast.type === 'warning'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-purple-800 text-white border-purple-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header Mobile Toggle */}
        <div className="md:hidden mb-4 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-sm">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">{userProfile.name}</div>
              <div className="text-[10px] font-semibold text-purple-600">Gold Member</div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="px-3.5 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span>{menuItems.find(m => m.id === activeTab)?.label || 'Menu'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Main Grid Layout: Sidebar (Desktop) + Dynamic Content Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

          {/* Left Navigation Sidebar */}
          <aside className={`md:col-span-4 lg:col-span-3 space-y-4 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/60 to-transparent rounded-full -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-500 text-white flex items-center justify-center text-2xl font-black shadow-md border-4 border-white">
                    {userProfile.name.charAt(0)}
                  </div>
                  {userProfile.isGoldMember && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
                      GOLD
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-tight">{userProfile.name}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{userProfile.phone}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{userProfile.email}</p>
                
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                  <span>Member Since {userProfile.memberSince}</span>
                </div>

                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="mt-4 w-full py-2 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Navigation Menu List */}
            <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                        : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Dynamic Content Panel */}
          <main className="md:col-span-8 lg:col-span-9 bg-white rounded-3xl p-4 sm:p-7 border border-slate-100 shadow-sm min-h-[680px]">
            
            {/* 1. DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-800 text-white shadow-lg">
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-[11px] font-bold mb-3 border border-white/10">
                      <span>👑 Premium Member</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black">Welcome back, {userProfile.name.split(' ')[0]}!</h2>
                    <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-lg">
                      Your groceries are 10 minutes away. Manage your active orders, addresses, rewards & savings right here.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab('tracking')}
                        className="px-4 py-2 bg-white text-purple-900 rounded-xl text-xs font-black hover:bg-yellow-300 transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Track Active Order</span>
                      </button>
                      <button
                        onClick={() => navigate('/products')}
                        className="px-4 py-2 bg-purple-800/80 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors border border-white/20 cursor-pointer"
                      >
                        Start Shopping
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div onClick={() => setActiveTab('orders')} className="p-4 rounded-2xl bg-purple-50 border border-purple-100 hover:border-purple-300 transition-all cursor-pointer group">
                    <div className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wider">Total Orders</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{orders.length}</div>
                    <div className="text-[10px] font-bold text-purple-600 mt-1 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      View all <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                  <div onClick={() => setActiveTab('tracking')} className="p-4 rounded-2xl bg-amber-50 border border-amber-100 hover:border-amber-300 transition-all cursor-pointer group">
                    <div className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">Active Orders</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">1</div>
                    <div className="text-[10px] font-bold text-amber-700 mt-1 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Out for Delivery <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                  <div onClick={() => setActiveTab('addresses')} className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer group">
                    <div className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">Saved Addresses</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{addresses.length}</div>
                    <div className="text-[10px] font-bold text-emerald-700 mt-1 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Manage <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                  <div onClick={() => setActiveTab('wishlist')} className="p-4 rounded-2xl bg-rose-50 border border-rose-100 hover:border-rose-300 transition-all cursor-pointer group">
                    <div className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">Saved Items</div>
                    <div className="text-2xl font-black text-rose-950 mt-1">{wishlist.length}</div>
                    <div className="text-[10px] font-bold text-rose-700 mt-1 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Wishlist <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Quick Action Grid */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button onClick={() => setIsAddAddressOpen(true)} className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left flex flex-col justify-between h-24 cursor-pointer">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-bold text-slate-800">+ Add Address</span>
                    </button>
                    <button onClick={() => setActiveTab('wishlist')} className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left flex flex-col justify-between h-24 cursor-pointer">
                      <Heart className="w-5 h-5 text-rose-500" />
                      <span className="text-xs font-bold text-slate-800">My Wishlist ({wishlist.length})</span>
                    </button>
                    <button onClick={() => setActiveTab('orders')} className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left flex flex-col justify-between h-24 cursor-pointer">
                      <ShoppingBag className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">My Orders ({orders.length})</span>
                    </button>
                    <button onClick={() => setActiveTab('support')} className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left flex flex-col justify-between h-24 cursor-pointer">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">Get Help</span>
                    </button>
                  </div>
                </div>

                {/* Recommended Products Carousel */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Recommended for You</h3>
                    <button onClick={() => navigate('/products')} className="text-xs font-bold text-purple-600 hover:underline">View All</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {allProducts.slice(0, 4).map(product => (
                      <div key={product.id} className="p-3 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between shadow-2xs">
                        <div className="w-full h-24 bg-white rounded-xl mb-2 flex items-center justify-center p-1">
                          <img src={product.image} alt={product.name} className="h-full object-contain" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">{product.weight}</div>
                          <div className="text-xs font-black text-purple-700 mt-1">₹{product.price}</div>
                        </div>
                        <button
                          onClick={() => { addToCart(product); showToast(`Added ${product.name} to cart`); }}
                          className="mt-2 w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">My Orders</h2>
                    <p className="text-xs text-slate-500">Track, download invoices, or reorder your favorite items.</p>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {['all', 'Delivered', 'Out for Delivery', 'Cancelled'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setOrderFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                          orderFilter === f
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f === 'all' ? 'All Orders' : f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {orders
                    .filter((o) => orderFilter === 'all' || o.status === orderFilter)
                    .map((order) => (
                      <div key={order.id} className="p-4 sm:p-5 rounded-3xl border border-slate-200 hover:border-purple-200 transition-all bg-white shadow-xs">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                          <div>
                            <span className="text-xs font-black text-slate-900">{order.id}</span>
                            <span className="text-xs text-slate-400 ml-2">• Placed on {order.date}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Out for Delivery'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            ● {order.status}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="py-3 space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-slate-100" />
                                <div>
                                  <div className="font-bold text-slate-800">{item.product.name}</div>
                                  <div className="text-[10px] text-slate-400">{item.selectedWeight} × {item.quantity}</div>
                                </div>
                              </div>
                              <div className="font-extrabold text-slate-900">₹{item.product.price * item.quantity}</div>
                            </div>
                          ))}
                        </div>

                        {/* Footer & Actions */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs">
                            <span className="text-slate-500 font-semibold">Total Paid: </span>
                            <span className="font-black text-purple-700 text-sm">₹{order.finalAmount}</span>
                            <span className="text-[10px] text-slate-400 ml-1">via {order.paymentMethod}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                showToast(`Invoice for ${order.id} downloaded!`);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Invoice
                            </button>
                            <button
                              onClick={() => handleReorder(order)}
                              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Reorder
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 3. ORDER TRACKING */}
            {activeTab === 'tracking' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Live Order Tracking</h2>
                  <p className="text-xs text-slate-500">Real-time status for your active order #ORD-89241</p>
                </div>

                {/* Status Stepper */}
                <div className="p-5 rounded-3xl bg-purple-900 text-white shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider">Estimated Delivery</div>
                      <div className="text-2xl font-black text-white">8 Minutes (10:42 PM)</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold animate-pulse">
                      ● Live Tracking
                    </span>
                  </div>

                  {/* Stepper Progress */}
                  <div className="grid grid-cols-4 gap-2 text-center pt-3 border-t border-purple-800">
                    {[
                      { title: 'Confirmed', done: true },
                      { title: 'Packed', done: true },
                      { title: 'On The Way', done: true },
                      { title: 'Delivered', done: false },
                    ].map((step, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                          step.done ? 'bg-emerald-400 text-purple-950' : 'bg-purple-800 text-purple-300'
                        }`}>
                          {step.done ? '✓' : idx + 1}
                        </div>
                        <span className="text-[10px] font-bold text-purple-200">{step.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Agent Info */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-200 text-purple-900 font-black flex items-center justify-center text-base">
                      RK
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Ramesh Kumar (Delivery Partner)</div>
                      <div className="text-[10px] font-bold text-slate-500">Electric Scooter • AP 07 AB 4021</div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Calling delivery partner Ramesh Kumar (+91 98765 00112)')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Agent</span>
                  </button>
                </div>

                {/* Map View Placeholder */}
                <div className="relative w-full h-64 rounded-3xl bg-slate-200 overflow-hidden border border-slate-300 flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl text-center shadow-lg border border-white">
                    <Compass className="w-8 h-8 text-purple-600 mx-auto mb-2 animate-spin" />
                    <div className="text-xs font-black text-slate-900">Live GPS Route Active</div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Delivery partner is 1.2 km away from Brodipet 4th Line</div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Saved Addresses</h2>
                    <p className="text-xs text-slate-500">Manage your delivery locations for fast checkout.</p>
                  </div>
                  <button
                    onClick={() => setIsAddAddressOpen(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* Address Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                        addr.isDefault
                          ? 'border-purple-500 bg-purple-50/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-900">{addr.name}</span>
                          {addr.isDefault && (
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{addr.street}</p>
                        <p className="text-xs text-slate-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-xs font-bold text-slate-500 mt-2">Phone: {addr.phone}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs font-bold text-purple-600 hover:underline cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">My Wishlist</h2>
                  <p className="text-xs text-slate-500">
                    {allProducts.filter((p) => wishlist.some(id => String(id) === String(p.id) || String(id) === String(p.name))).length} saved products
                  </p>
                </div>

                {allProducts.filter((p) => wishlist.some(id => String(id) === String(p.id) || String(id) === String(p.name))).length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700">Your wishlist is empty</h3>
                    <p className="text-xs text-slate-400 mt-1">Explore items and click the heart icon to save for later.</p>
                    <button onClick={() => navigate('/products')} className="mt-4 px-5 py-2 bg-purple-600 hover:bg-purple-700 transition-colors text-white rounded-xl text-xs font-bold cursor-pointer">
                      Explore Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {allProducts
                      .filter((p) => wishlist.some(id => String(id) === String(p.id) || String(id) === String(p.name)))
                      .map((product) => (
                        <div key={product.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between hover:shadow-md transition-shadow">
                          <div className="relative mb-2 w-full h-32 bg-white rounded-xl flex items-center justify-center p-1 border border-slate-100">
                            <img src={product.image} alt={product.name} className="h-full object-contain" />
                            <button
                              onClick={() => {
                                toggleWishlist(product.id);
                                showToast(`Removed ${product.name} from wishlist`, 'info');
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-rose-500 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs"
                              title="Remove from wishlist"
                            >
                              <Heart className="w-4 h-4 fill-rose-500" />
                            </button>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">{product.name}</div>
                            <div className="text-[10px] text-slate-500 font-semibold">{product.weight}</div>
                            <div className="text-xs font-black text-purple-700 mt-1">₹{product.price}</div>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(product);
                              showToast(`Added ${product.name} to cart`);
                            }}
                            className="mt-3 w-full py-2 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. PAYMENT METHODS */}
            {activeTab === 'payments' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Help & Support</h2>
                  <p className="text-xs text-slate-500">We're here to help 24/7. Connect via chat or ticket.</p>
                </div>

                {/* Simulated Live Chat Drawer */}
                <div className="p-5 rounded-3xl border border-purple-200 bg-purple-50/30 space-y-3">
                  <h3 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    Farminix Live Assistant
                  </h3>

                  <div className="h-44 overflow-y-auto bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${
                          msg.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendChatMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type your question..."
                      className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600"
                    />
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 13. FAQS */}
            {activeTab === 'faqs' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
                  <p className="text-xs text-slate-500">Find answers to popular questions.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 1, q: 'How fast is delivery?', a: 'Farminix delivers groceries within 10 minutes in enabled pincodes!' },
                    { id: 2, q: 'What is the return policy?', a: 'Returns are accepted within 48 hours for fresh items or unused packaged goods.' },
                    { id: 3, q: 'How do Farminix Reward Points work?', a: 'Earn 1 point for every ₹10 spent. 100 points = ₹50 Wallet Cash.' },
                  ].map((faq) => (
                    <div key={faq.id} className="p-4 rounded-2xl border border-slate-200 bg-white">
                      <button
                        onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-900 text-left cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {openFaqId === faq.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {openFaqId === faq.id && (
                        <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100">{faq.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 14. ACCOUNT PRIVACY */}
            {activeTab === 'privacy' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Account Privacy & Security</h2>
                  <p className="text-xs text-slate-500">Manage password, login sessions, and data settings.</p>
                </div>

                <div className="p-5 rounded-3xl border border-slate-200 bg-white space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</div>
                      <div className="text-[10px] text-slate-400">Add extra security via SMS OTP</div>
                    </div>
                    <button
                      onClick={() => showToast('2FA status updated')}
                      className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer"
                    >
                      Enabled
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Download Account Data</div>
                      <div className="text-[10px] text-slate-400">Export your orders and profile history</div>
                    </div>
                    <button onClick={() => showToast('Downloading account summary CSV...')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 15. SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">App Settings</h2>
                  <p className="text-xs text-slate-500">Customize your app preferences.</p>
                </div>

                <div className="p-5 rounded-3xl border border-slate-200 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Dark Mode</span>
                    <button
                      onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))}
                      className="p-2 rounded-xl bg-slate-100 cursor-pointer"
                    >
                      {settings.darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Edit Account Profile</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (user) {
                setUser({ ...user, name: userProfile.name, email: userProfile.email, phone: userProfile.phone });
              }
              showToast('Profile updated!');
              setIsEditProfileOpen(false);
            }} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Full Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Phone Number</label>
                <input
                  type="text"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile(p => ({ ...p, phone: e.target.value }))}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Email Address</label>
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsEditProfileOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Add Delivery Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newAddressForm.name}
                onChange={(e) => setNewAddressForm(f => ({ ...f, name: e.target.value }))}
                className="w-full h-10 px-3 text-xs border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="Flat / House No. / Street Address"
                value={newAddressForm.street}
                onChange={(e) => setNewAddressForm(f => ({ ...f, street: e.target.value }))}
                className="w-full h-10 px-3 text-xs border border-slate-200 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddressForm.city}
                  onChange={(e) => setNewAddressForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newAddressForm.pincode}
                  onChange={(e) => setNewAddressForm(f => ({ ...f, pincode: e.target.value }))}
                  className="w-full h-10 px-3 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <input
                type="text"
                placeholder="Phone Number"
                value={newAddressForm.phone}
                onChange={(e) => setNewAddressForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full h-10 px-3 text-xs border border-slate-200 rounded-xl"
              />

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsAddAddressOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Are you sure you want to log out?</h3>
            <p className="text-xs text-slate-500">You will need to sign in again to access your orders and rewards.</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsLogoutConfirmOpen(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">Cancel</button>
              <button onClick={confirmLogout} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
