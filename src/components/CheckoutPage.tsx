import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Truck, Zap,
  Plus, Navigation, Loader2, Check, Phone, ShieldCheck, AlertCircle, Trash2, MapPin,
  ChevronRight, ChevronDown, House, Building2, Pencil, Leaf, LockKeyhole, Tag, CreditCard, Smartphone, Banknote, Landmark, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useAdminConfig } from '../admin/context/AdminConfigContext';
import { defaultCheckoutPaymentConfig, defaultCartConfig } from '../admin/defaultConfig';
import { detectUserLocation, lookupPincode } from '../utils/location';
import { loadRazorpayScript, fetchRazorpayKey, createServerOrder, verifyServerPayment } from '../utils/razorpay';
import type { UserAddress, Order } from '../types';
import type { CartItem } from '../types';
import './CheckoutPage.css';

const formatMoney = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const emptyAddresses: UserAddress[] = [];

const addressDetails = (name: string) => {
  const parts = name.split(/[•·]/);
  const tag = /work/i.test(parts[0]) ? 'Work' : /home/i.test(parts[0]) ? 'Home' : 'Other';
  return { tag, name: parts.length > 1 ? parts.slice(1).join(' · ').trim() : name };
};

interface PendingPayment {
  address: UserAddress;
  items: CartItem[];
  total: number;
  couponCode: string | null;
  response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string };
}

export const CheckoutPage: React.FC = () => {
  const {
    navigate,
    cart,
    cartTotal,
    cartDiscount,
    appliedCoupon,
    applyCoupon,
    user,
    setUser,
    setLocation,
    createOrder,
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  // Document title
  useEffect(() => {
    document.title = 'Secure Checkout — Farminix Fresh Groceries';
    window.scrollTo(0, 0);
  }, []);

  // State management - no hardcoded default addresses
  const addresses: UserAddress[] = user?.addresses || emptyAddresses;

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    return addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || '';
  });

  useEffect(() => {
    if (addresses.length > 0 && (!selectedAddressId || !addresses.some((a) => a.id === selectedAddressId))) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  const [formIsDefault, setFormIsDefault] = useState<boolean>(true);

  const { publishedConfig } = useAdminConfig();
  const checkoutCfg = publishedConfig.checkoutPayment || defaultCheckoutPaymentConfig;
  const cartCfg = publishedConfig.cart || defaultCartConfig;
  const expressLabel = checkoutCfg.expressSlotLabel?.trim() || 'Express Delivery';
  const scheduledLabel = checkoutCfg.scheduledSlotLabel?.trim() || 'Scheduled Delivery';

  const [selectedDelivery, setSelectedDelivery] = useState<'express' | 'scheduled'>('express');
  const selectedSlot = selectedDelivery === 'express' ? expressLabel : scheduledLabel;
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('RAZORPAY');
  const [deliveryNote, setDeliveryNote] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [razorpayPaymentId, setRazorpayPaymentId] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('farminix_pending_payment') || 'null'); } catch { return null; }
  });

  // If cart is empty and no order was placed in this session, redirect back to Home immediately
  useEffect(() => {
    if (cart.length === 0 && !placedOrder && !pendingPayment) {
      navigate('/', undefined, { replace: true });
    }
  }, [cart.length, placedOrder, pendingPayment, navigate]);

  // Address Modal / Form state
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // New Address Form fields - clean and empty by default
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPincode, setFormPincode] = useState('');
  const [formTag, setFormTag] = useState<'Home' | 'Work' | 'Other'>('Home');

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setFormName('');
    setFormPhone('');
    setFormStreet('');
    setFormCity('');
    setFormState('');
    setFormPincode('');
    setFormTag('Home');
    setFormIsDefault(addresses.length === 0);
    setIsAddAddressOpen(true);
  };

  const openEditAddressModal = (address: UserAddress) => {
    const details = addressDetails(address.name);
    setEditingAddressId(address.id);
    setFormName(details.name);
    setFormPhone(address.phone);
    setFormStreet(address.street);
    setFormCity(address.city);
    setFormState(address.state);
    setFormPincode(address.pincode);
    setFormTag(details.tag as 'Home' | 'Work' | 'Other');
    setFormIsDefault(Boolean(address.isDefault));
    setGpsStatus(null);
    setIsAddAddressOpen(true);
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // Auto-fill city/state when pincode changes
  const handlePincodeChange = (pin: string) => {
    const clean = pin.replace(/\D/g, '').slice(0, 6);
    setFormPincode(clean);
    if (clean.length === 6) {
      const resolved = lookupPincode(clean);
      if (resolved.includes(',')) {
        const parts = resolved.split(', ');
        if (parts.length >= 2) {
          setFormCity(parts[0]);
          const statePart = parts[1].split(' - ')[0];
          setFormState(statePart);
        }
      }
    }
  };

  // GPS Precise Location Auto-fill
  const handleDetectGpsForAddress = async () => {
    setIsDetectingGps(true);
    setGpsStatus('Accessing precise GPS coordinates...');
    const res = await detectUserLocation();
    setIsDetectingGps(false);

    if (res.success && res.locationString) {
      setGpsStatus('✓ Location detected accurately!');
      setLocation(res.locationString);

      // Parse fields if available
      if (res.locationString.includes(',')) {
        const parts = res.locationString.split(', ');
        setFormStreet(parts[0] || '');
        if (parts.length >= 2) setFormCity(parts[1]);
        if (parts.length >= 3) {
          const statePin = parts[2].split(' - ');
          setFormState(statePin[0] || '');
          if (statePin[1]) setFormPincode(statePin[1]);
        }
      }
      setTimeout(() => setGpsStatus(null), 2500);
    } else {
      setGpsStatus('Could not access GPS location.');
    }
  };

  // Save new address handler
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formStreet.trim() || !formCity.trim() || !formState.trim() || formPincode.length !== 6 || formPhone.length !== 10) return;

    const isFirst = addresses.length === 0;
    const shouldBeDefault = formIsDefault || isFirst;

    const tagPrefix = formTag === 'Home' ? '🏠 Home' : formTag === 'Work' ? '🏢 Work' : '📍 Other';
    const newAddr: UserAddress = {
      id: editingAddressId || `addr-${Date.now()}`,
      name: `${tagPrefix} • ${formName.trim()}`,
      street: formStreet.trim(),
      city: formCity.trim(),
      state: formState.trim(),
      pincode: formPincode.trim(),
      phone: formPhone.trim(),
      isDefault: shouldBeDefault,
    };

    const normalizedAddresses = addresses.map((address) => shouldBeDefault ? { ...address, isDefault: false } : address);
    const updatedAddresses = editingAddressId
      ? normalizedAddresses.map((address) => address.id === editingAddressId ? newAddr : address)
      : [...normalizedAddresses, newAddr];

    if (user) {
      setUser({ ...user, addresses: updatedAddresses });
    }
    setSelectedAddressId(newAddr.id);
    setLocation(`${newAddr.city}, ${newAddr.state} - ${newAddr.pincode}`);
    setIsAddAddressOpen(false);
    setFormName('');
    setFormPhone('');
    setFormStreet('');
    setFormCity('');
    setFormState('');
    setFormPincode('');
  };

  const handleDeleteAddress = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = addresses.filter((a) => a.id !== idToDelete);
    if (user) {
      setUser({ ...user, addresses: updated });
    }
    if (selectedAddressId === idToDelete) {
      const remainingDef = updated.find((a) => a.isDefault) || updated[0];
      setSelectedAddressId(remainingDef?.id || '');
    }
  };

  const handleSetDefaultAddress = (idToDefault: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === idToDefault,
    }));
    if (user) {
      setUser({ ...user, addresses: updated });
    }
    setSelectedAddressId(idToDefault);
  };

  // Toggle delivery note tag
  const toggleNote = (note: string) => {
    setDeliveryNote((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const handlingFee = cartCfg.handlingFee ?? 3;
  const deliveryFee = (cartCfg.deliveryFee === 0 || cartTotal >= (cartCfg.freeDeliveryThreshold ?? 500)) ? 0 : (cartCfg.deliveryFee ?? 0);
  const grandTotal = cartTotal + handlingFee + deliveryFee;

  // Place Order Handler with Razorpay Integration
  const handlePlaceOrder = async () => {
    if (!selectedAddress && !pendingPayment) {
      openAddAddressModal();
      return;
    }
    setPaymentError(null);
    setIsProcessing(true);

    // Retry the already paid order without opening another payment checkout.
    if (pendingPayment) {
      try {
        const order = await createOrder(pendingPayment.address, 'Razorpay', pendingPayment.items, pendingPayment.total, { ...pendingPayment.response, couponCode: pendingPayment.couponCode });
        setPlacedOrder(order); setPendingPayment(null); sessionStorage.removeItem('farminix_pending_payment');
      } catch (error) {
        setPaymentError(`${error instanceof Error ? error.message : 'Unable to confirm the order.'} Payment reference: ${pendingPayment.response.razorpay_payment_id}. Contact support if retry fails.`);
      } finally { setIsProcessing(false); }
      return;
    }
    if (!selectedAddress) { setIsProcessing(false); return; }

    // If COD, place order immediately
    if (paymentMethod === 'COD') {
      try {
        const newOrd = await createOrder(selectedAddress, 'Cash on Delivery (COD)', [...cart], grandTotal);
        setPlacedOrder(newOrd);

        try {
          window.history.replaceState(null, '', '/');
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.5 },
          });
        } catch {}
      } catch (error) {
        setPaymentError(error instanceof Error ? error.message : 'Unable to confirm your order. Please retry.');
      } finally { setIsProcessing(false); }
      return;
    }

    // Online payment via Razorpay
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setIsProcessing(false);
        setPaymentError('Razorpay SDK failed to load. Please check your internet connection and try again.');
        return;
      }

      // Fetch dynamic key from backend or fall back to admin config
      const serverKey = await fetchRazorpayKey();
      const activeKey = serverKey || checkoutCfg.razorpayKeyId || '';

      if (!activeKey) {
        setIsProcessing(false);
        setPaymentError('Razorpay Key ID is not configured. Please add RAZORPAY_KEY_ID in server/.env or the admin panel.');
        return;
      }

      const merchantTitle = checkoutCfg.razorpayMerchantName || 'Farminix Fresh Groceries';
      const themeColor = checkoutCfg.razorpayThemeColor || '#7C3AED';

      // Create server-side order with sanitized notes (Razorpay requires clean UTF-8 strings without emojis)
      const cleanCustomerName = (selectedAddress.name || user?.name || 'Customer')
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
        .replace(/[^\w\s.-]/g, '')
        .trim() || 'Customer';
      const cleanCustomerPhone = (selectedAddress.phone || user?.phone || '')
        .replace(/[^\d+ -]/g, '')
        .trim();

      const serverOrder = await createServerOrder(grandTotal, {
        customer_name: cleanCustomerName,
        customer_phone: cleanCustomerPhone,
        delivery_slot: selectedSlot || '10-20 Min Express',
      }, cart.map(item => ({ productId: item.product.id, quantity: item.quantity })), appliedCoupon);
      if (!serverOrder?.orderId) throw new Error(serverOrder?.error || 'Unable to validate this order. Please retry.');

      const options = {
        key: activeKey,
        amount: Math.round(grandTotal * 100), // in paise
        currency: 'INR',
        name: merchantTitle,
        description: `Order Payment for ${cart.reduce((s, i) => s + i.quantity, 0)} item(s)`,
        image: publishedConfig.header?.logoUrl || '/farminix_logo.png',
        order_id: serverOrder?.orderId,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) => {
          setIsProcessing(true);
          setRazorpayPaymentId(response.razorpay_payment_id);
          const pending = { address: selectedAddress, items: [...cart], total: grandTotal, couponCode: appliedCoupon, response };
          setPendingPayment(pending);
          try { sessionStorage.setItem('farminix_pending_payment', JSON.stringify(pending)); } catch {}
          try {
          // Verify signature on backend
          await verifyServerPayment(response);

          const methodLabel = paymentMethod === 'RAZORPAY' ? 'Razorpay' : `Razorpay (${paymentMethod})`;
          const newOrd = await createOrder(
            selectedAddress,
            `${methodLabel} • Paid (ID: ${response.razorpay_payment_id})`,
            [...cart],
            grandTotal,
            { ...response, couponCode: appliedCoupon }
          );
          setPlacedOrder(newOrd);
          setPendingPayment(null);
          try { sessionStorage.removeItem('farminix_pending_payment'); } catch {}

          try {
            window.history.replaceState(null, '', '/');
            confetti({
              particleCount: 140,
              spread: 80,
              origin: { y: 0.5 },
            });
          } catch {}
          } catch (error) {
            setPaymentError(`${error instanceof Error ? error.message : 'Unable to save your order.'} Payment reference: ${response.razorpay_payment_id}. Keep this reference and contact support if retry fails.`);
          } finally { setIsProcessing(false); }
        },
        prefill: {
          name: selectedAddress.name || user?.name || '',
          email: user?.email || 'care@farminix.in',
          contact: selectedAddress.phone || user?.phone || '9876543210',
          method: paymentMethod === 'UPI' ? 'upi' : paymentMethod === 'CARD' ? 'card' : paymentMethod === 'NETBANKING' ? 'netbanking' : undefined,
        },
        notes: {
          delivery_address: `${selectedAddress.street}, ${selectedAddress.city} - ${selectedAddress.pincode}`,
          delivery_slot: selectedSlot,
          delivery_notes: deliveryNote.join(', ') || 'None',
        },
        theme: {
          color: themeColor,
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setIsProcessing(false);
        setPaymentError(response.error?.description || 'Payment failed or was cancelled. Please try again.');
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay Error:', err);
      setIsProcessing(false);
      setPaymentError(err.message || 'Unable to initiate Razorpay checkout. Please try again.');
    }
  };

  if (placedOrder) {
    return (
      <div className="store-order-confirmation w-full min-h-[75vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in zoom-in-95 duration-200">
        <div className="max-w-md w-full bg-slate-50/80 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-600/20">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Order Confirmed &amp; Paid
            </span>
            <h1 className="text-2xl font-black text-slate-900 pt-2">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Order ID: <span className="text-[#7C3AED] font-black">{placedOrder.id}</span>
            </p>
            {razorpayPaymentId && (
              <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50 py-1 px-2.5 rounded-lg inline-block mt-1 border border-emerald-200">
                Razorpay Payment ID: <span className="font-mono">{razorpayPaymentId}</span>
              </p>
            )}
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Items:</span>
              <span className="font-bold text-slate-900">{placedOrder.items.length} Item(s)</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Grand Total:</span>
              <span className="font-black text-[#7C3AED] text-sm">₹{placedOrder.finalAmount}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-slate-800 break-words">{placedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-slate-500 shrink-0">Deliver To:</span>
              <span className="font-bold text-slate-800 text-right">
                {placedOrder.deliveryAddress.street}, {placedOrder.deliveryAddress.city}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Truck className="w-4 h-4 text-[#7C3AED]" />
              <span>Arriving In:</span>
            </span>
            <span className="font-black text-[#7C3AED] text-sm">15–20 Mins</span>
          </div>

          <button
            onClick={() => navigate('/', undefined, { replace: true })}
            className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (pendingPayment) {
    return <div className="max-w-xl mx-auto my-12 rounded-3xl border border-purple-100 bg-white p-8 text-center space-y-5"><ShieldCheck className="mx-auto text-purple-600" size={40}/><h1 className="font-bold text-2xl">Confirm your paid order</h1><p className="text-slate-600 text-sm">Your payment reference is <strong className="break-all">{pendingPayment.response.razorpay_payment_id}</strong>. Retry order confirmation using this payment.</p>{paymentError && <p role="alert" className="text-red-700 text-sm">{paymentError}</p>}<button disabled={isProcessing} onClick={() => void handlePlaceOrder()} className="bg-purple-600 text-white px-6 py-3 rounded-xl disabled:opacity-50">{isProcessing ? 'Confirming order…' : 'Retry order confirmation'}</button><p className="text-xs text-slate-500">If confirmation continues to fail, contact Farminix support with this payment reference.</p></div>;
  }

  if (cart.length === 0) {
    return (
      <div className="w-full min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-[#7C3AED] mb-4 text-3xl font-black shadow-xs">
          🛒
        </div>
        <h1 className="text-2xl font-black text-slate-900">Your Cart is Empty</h1>
        <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
          You don't have any items in your shopping cart. Add your daily grocery essentials to proceed to checkout.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-shell">
        <section className="checkout-hero" aria-labelledby="checkout-title">
          <div className="checkout-hero-copy">
            <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
              <button onClick={() => navigate('/')}>Home</button><ChevronRight size={14} /><span aria-current="page">Checkout</span>
            </nav>
            <h1 id="checkout-title">Secure <span>Checkout</span></h1>
            <p>Review your details and complete your order securely</p>
            <div className="checkout-hero-benefits">
              <span><ShieldCheck />Secure payments</span>
              <span><Truck />Fast &amp; reliable delivery</span>
              <span><Leaf />Fresh from our farms</span>
            </div>
          </div>
          <div className="checkout-farm-promise"><Leaf /><span>Good Food<br /><strong>Brighter Tomorrow</strong></span></div>
          <img className="checkout-hero-rice" src="/cat_rice.jpg" alt="" aria-hidden="true" />
        </section>

        <div className="checkout-layout">
          <div className="checkout-steps">
            <section className="checkout-panel" aria-labelledby="address-title">
              <div className="checkout-section-heading">
                <span className="checkout-step-number">1</span>
                <div><h2 id="address-title">Delivery Address</h2><p>Choose where you want your order to be delivered.</p></div>
                <button className="checkout-outline-button" onClick={openAddAddressModal}><Plus size={18} /><span>Add New Address</span></button>
              </div>
              {addresses.length === 0 ? (
                <div className="checkout-empty-address">
                  <MapPin size={28} /><h3>Where should we deliver?</h3>
                  <p>Add your delivery address to continue with your order.</p>
                  <button className="checkout-outline-button" onClick={openAddAddressModal}><Plus size={16} />Add Delivery Address</button>
                </div>
              ) : (
                <div className="checkout-addresses" role="radiogroup" aria-label="Delivery address">
                  {addresses.map((address) => {
                    const details = addressDetails(address.name);
                    const AddressIcon = details.tag === 'Home' ? House : details.tag === 'Work' ? Building2 : MapPin;
                    return (
                      <div key={address.id} className={`checkout-address ${selectedAddressId === address.id ? 'is-selected' : ''}`}>
                        <label className="checkout-address-choice">
                          <input type="radio" name="delivery-address" checked={selectedAddressId === address.id} onChange={() => {
                            setSelectedAddressId(address.id);
                            setLocation(`${address.city}, ${address.state} - ${address.pincode}`);
                          }} />
                          <AddressIcon className="checkout-address-icon" size={24} />
                          <span className="checkout-address-info">
                            <span className="checkout-address-tags"><span>{details.tag}</span>{address.isDefault && <small>Default</small>}</span>
                            <strong>{details.name}</strong>
                            <span className="checkout-address-line">{address.street}, {address.city}, {address.state} - {address.pincode}</span>
                            <span className="checkout-address-phone"><Phone size={16} />{address.phone}</span>
                          </span>
                        </label>
                        <div className="checkout-address-actions">
                          <button onClick={() => openEditAddressModal(address)} aria-label={`Edit address for ${details.name}`}><Pencil size={17} /><span>Edit</span></button>
                          {!address.isDefault && <button className="checkout-default-action" onClick={(e) => handleSetDefaultAddress(address.id, e)}>Make default</button>}
                          <button className="checkout-delete-action" onClick={(e) => handleDeleteAddress(address.id, e)} aria-label={`Delete address for ${details.name}`}><Trash2 size={15} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="checkout-panel" aria-labelledby="delivery-title">
              <div className="checkout-section-heading">
                <span className="checkout-step-number">2</span>
                <div><h2 id="delivery-title">Select Delivery Slot</h2><p>Choose a delivery option that suits you.</p></div>
              </div>
              <div className="checkout-options" role="radiogroup" aria-label="Delivery option">
                <label className={`checkout-option ${selectedDelivery === 'express' ? 'is-selected' : ''}`}>
                  <input type="radio" name="delivery-slot" checked={selectedDelivery === 'express'} onChange={() => setSelectedDelivery('express')} />
                  <span className="checkout-option-icon"><Zap /></span>
                  <span className="checkout-option-copy"><strong>{expressLabel}</strong><span>{checkoutCfg.expressSlotSublabel?.trim() || 'Fast doorstep delivery'}</span></span>
                </label>
                <label className={`checkout-option ${selectedDelivery === 'scheduled' ? 'is-selected' : ''}`}>
                  <input type="radio" name="delivery-slot" checked={selectedDelivery === 'scheduled'} onChange={() => setSelectedDelivery('scheduled')} />
                  <span className="checkout-option-icon"><Truck /></span>
                  <span className="checkout-option-copy"><strong>{scheduledLabel}</strong><span>{checkoutCfg.scheduledSlotSublabel?.trim() || 'Choose a convenient delivery time'}</span></span>
                </label>
              </div>
            </section>

            <section className="checkout-panel" aria-labelledby="payment-title">
              <div className="checkout-section-heading">
                <span className="checkout-step-number">3</span>
                <div><h2 id="payment-title">Payment Method</h2><p>Choose a secure payment method to continue.</p></div>
                <span className="checkout-secured"><LockKeyhole size={15} />Secured by <strong>Razorpay</strong></span>
              </div>
              {paymentError && (
                <div className="checkout-notice" role="alert"><AlertCircle size={20} /><span>{paymentError}</span><button onClick={() => setPaymentError(null)} aria-label="Dismiss payment notice"><X size={17} /></button></div>
              )}
              <div className="checkout-options" role="radiogroup" aria-label="Payment method">
                <label className={`checkout-option ${paymentMethod === 'UPI' ? 'is-selected' : ''}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                  <span className="checkout-option-icon"><Smartphone /></span>
                  <span className="checkout-option-copy"><strong>UPI / QR</strong><span>Google Pay, PhonePe, Paytm &amp; more</span></span>
                </label>
                <label className={`checkout-option ${paymentMethod === 'RAZORPAY' ? 'is-selected' : ''}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'RAZORPAY'} onChange={() => setPaymentMethod('RAZORPAY')} />
                  <span className="checkout-option-icon"><CreditCard /></span>
                  <span className="checkout-option-copy"><strong>Cards, Net Banking &amp; More</strong><span>Cards, bank accounts &amp; wallets via Razorpay</span></span>
                </label>
              </div>
              <details className="checkout-extra-methods">
                <summary>More payment options <ChevronDown size={15} /></summary>
                <div className="checkout-secondary-options" role="radiogroup" aria-label="Additional payment methods">
                  {([
                    { value: 'CARD', label: 'Credit / Debit Card', Icon: CreditCard },
                    { value: 'NETBANKING', label: 'Net Banking', Icon: Landmark },
                    { value: 'COD', label: 'Cash on Delivery', Icon: Banknote },
                  ] as const).map(({ value, label, Icon }) => (
                    <label key={value} className={`checkout-option ${paymentMethod === value ? 'is-selected' : ''}`}>
                      <input type="radio" name="payment" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} /><Icon size={19} /><span>{label}</span>
                    </label>
                  ))}
                </div>
              </details>
              <details className="checkout-delivery-notes">
                <summary>Delivery instructions <span>Optional</span><ChevronDown size={15} /></summary>
                <div className="checkout-note-options">
                  {(checkoutCfg.deliveryInstructions?.some((instruction) => instruction.enabled)
                    ? checkoutCfg.deliveryInstructions.filter((instruction) => instruction.enabled).map((instruction) => `${instruction.icon} ${instruction.label}`)
                    : ['Leave at Door', "Don't Ring Bell", 'Call Before Delivery', 'Hand to Security']
                  ).map((note) => (
                    <button key={note} type="button" aria-pressed={deliveryNote.includes(note)} className={deliveryNote.includes(note) ? 'is-selected' : ''} onClick={() => toggleNote(note)}>{note}</button>
                  ))}
                </div>
              </details>
            </section>
          </div>

          <aside className="checkout-panel checkout-summary" aria-labelledby="summary-title">
            <div className="checkout-summary-heading"><h2 id="summary-title">Order Summary</h2><span>{cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'Item' : 'Items'}</span></div>
            <div className="checkout-items">
              {cart.map((item) => (
                <div className="checkout-item" key={`${item.product.id}-${item.selectedWeight}`}>
                  <img src={item.product.image} alt={item.product.name} />
                  <div><h3>{item.product.name}</h3><p>{item.selectedWeight}<span>•</span>Qty: {item.quantity}</p></div>
                  <strong>{formatMoney(item.product.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            {publishedConfig.cart?.couponsEnabled !== false && (
              <details className="checkout-coupon" open>
                <summary><Tag size={20} /><span>Have a coupon code?</span><ChevronDown size={18} /></summary>
                <form onSubmit={(event) => { event.preventDefault(); setCouponError(applyCoupon(couponCode) ? '' : 'Coupon is unavailable, expired, or does not qualify for this cart.'); }}>
                  <label htmlFor="checkout-coupon" className="sr-only">Coupon code</label>
                  <input id="checkout-coupon" value={couponCode} onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); setCouponError(''); }} placeholder="Enter coupon code" />
                  <button type="submit">Apply</button>
                </form>
                {appliedCoupon && <p className="checkout-coupon-applied">{appliedCoupon} {cartDiscount > 0 ? 'applied' : 'no longer eligible'}<button type="button" onClick={() => { applyCoupon(''); setCouponError(''); }}>Remove</button></p>}
                {couponError && <p role="alert" className="checkout-coupon-error">{couponError}</p>}
              </details>
            )}
            <dl className="checkout-bill">
              <div><dt>Items Subtotal</dt><dd>{formatMoney(cartTotal + cartDiscount)}</dd></div>
              {cartDiscount > 0 && <div className="checkout-discount"><dt>Coupon Discount</dt><dd>−{formatMoney(cartDiscount)}</dd></div>}
              <div><dt>Delivery Fee</dt><dd className={deliveryFee === 0 ? 'checkout-free' : ''}>{deliveryFee === 0 ? 'FREE' : formatMoney(deliveryFee)}</dd></div>
              <div><dt>Handling &amp; Packaging Fee</dt><dd>{formatMoney(handlingFee)}</dd></div>
            </dl>
            <div className="checkout-total"><span>Total Payable</span><strong>{formatMoney(grandTotal)}</strong></div>
            <button onClick={handlePlaceOrder} disabled={isProcessing} className="checkout-pay-button">
              {isProcessing ? <Loader2 className="animate-spin" size={21} /> : <LockKeyhole size={21} />}
              <span>{isProcessing ? 'Processing your order…' : pendingPayment ? 'Retry order confirmation' : !selectedAddress ? 'Add Delivery Address to Proceed' : paymentMethod === 'COD' ? `Place Order (COD) · ${formatMoney(grandTotal)}` : `Pay with Razorpay · ${formatMoney(grandTotal)}`}</span>
              {!isProcessing && <ChevronRight size={22} />}
            </button>
            <p className="checkout-payment-hint" aria-live="polite">{pendingPayment ? 'Your payment was received. Retry to confirm your order.' : paymentMethod === 'COD' ? 'Pay when your order is delivered to your doorstep.' : "You'll review your payment details before confirming."}</p>
            <div className="checkout-trust-strip">
              <span><ShieldCheck /><span>Safe &amp; Secure<br />Payments</span></span>
              <span><Truck /><span>Fast<br />Delivery</span></span>
              <span><Leaf /><span>Fresh &amp;<br />Quality Products</span></span>
            </div>
          </aside>
        </div>
      </div>
      {/* ── ADD NEW ADDRESS MODAL ── */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-start sm:items-center justify-center p-4">
          <div
            onClick={() => setIsAddAddressOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div role="dialog" aria-modal="true" aria-labelledby="checkout-address-modal-title" onKeyDown={(event) => { if (event.key === 'Escape') setIsAddAddressOpen(false); }} className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 border border-slate-100 text-left max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <button type="button" onClick={() => setIsAddAddressOpen(false)} aria-label="Close address form" className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:bg-purple-50 hover:text-purple-700"><X size={18} /></button>
            <h3 id="checkout-address-modal-title" className="text-lg font-semibold text-slate-900 mb-1 pr-7">{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</h3>
            <p className="text-xs text-slate-500 mb-4">Enter details or click below to auto-detect your current GPS location.</p>

            {/* GPS Location Auto-Fill Button */}
            <button
              type="button"
              onClick={handleDetectGpsForAddress}
              disabled={isDetectingGps}
              className="w-full mb-4 py-3 px-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#7C3AED] rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              {isDetectingGps ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
                  <span>Detecting current GPS location...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 fill-[#7C3AED] text-[#7C3AED]" />
                  <span>🎯 Use GPS Location to Auto-Fill Address</span>
                </>
              )}
            </button>

            {gpsStatus && (
              <div className="mb-4 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{gpsStatus}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="checkout-address-name" className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    id="checkout-address-name"
                    autoComplete="name"
                    autoFocus
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter Full Name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-address-phone" className="font-bold text-slate-700 block mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    id="checkout-address-phone"
                    autoComplete="tel-national"
                    pattern="[0-9]{10}"
                    required
                    maxLength={10}
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit Mobile Number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="checkout-address-street" className="font-bold text-slate-700 block mb-1">Flat / House No / Street / Landmark</label>
                <input
                  type="text"
                  id="checkout-address-street"
                  autoComplete="street-address"
                  required
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  placeholder="House / Flat No., Apartment, Street, Landmark"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="checkout-address-pincode" className="font-bold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    id="checkout-address-pincode"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={formPincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="6-digit Pincode"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-address-city" className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    id="checkout-address-city"
                    autoComplete="address-level2"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="City / District"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-address-state" className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    id="checkout-address-state"
                    autoComplete="address-level1"
                    required
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address Tag</label>
                <div className="flex items-center gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormTag(tag)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        formTag === tag
                          ? 'bg-purple-50 text-[#7C3AED] border-[#7C3AED] font-black'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {tag === 'Home' ? '🏠 Home' : tag === 'Work' ? '🏢 Work' : '📍 Other'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] border-slate-300 accent-[#7C3AED]"
                  />
                  <span className="font-bold text-slate-700">Set as my default delivery address</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7C3AED] text-white font-bold rounded-xl hover:bg-[#6D28D9]"
                >
                  Save &amp; Use Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
