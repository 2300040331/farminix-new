import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle2, Truck, Zap,
  Plus, Navigation, Loader2, Check, Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { detectUserLocation, lookupPincode } from '../utils/location';
import type { UserAddress, Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const {
    navigate,
    goBack,
    cart,
    cartTotal,
    cartDiscount,
    user,
    setUser,
    setLocation,
    createOrder,
  } = useApp();

  // Document title
  useEffect(() => {
    document.title = 'Secure Checkout — Farminix Fresh Groceries';
    window.scrollTo(0, 0);
  }, []);

  // State management
  const addresses: UserAddress[] = user?.addresses || [
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
  ];

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || 'addr-1'
  );

  const [selectedSlot, setSelectedSlot] = useState('10 Min Instant Express');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [deliveryNote, setDeliveryNote] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Address Modal / Form state
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // New Address Form fields
  const [formName, setFormName] = useState(user?.name || '');
  const [formPhone, setFormPhone] = useState(user?.phone || '');
  const [formStreet, setFormStreet] = useState('');
  const [formCity, setFormCity] = useState('Guntur');
  const [formState, setFormState] = useState('Andhra Pradesh');
  const [formPincode, setFormPincode] = useState('522034');
  const [formTag, setFormTag] = useState<'Home' | 'Work' | 'Other'>('Home');

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
    if (!formName.trim() || !formStreet.trim() || formPincode.length !== 6) return;

    const newAddr: UserAddress = {
      id: `addr-${Date.now()}`,
      name: formName.trim(),
      street: formStreet.trim(),
      city: formCity.trim(),
      state: formState.trim(),
      pincode: formPincode.trim(),
      phone: formPhone.trim(),
      isDefault: addresses.length === 0,
    };

    const updatedAddresses = [...addresses, newAddr];
    if (user) {
      setUser({ ...user, addresses: updatedAddresses });
    }
    setSelectedAddressId(newAddr.id);
    setLocation(`${newAddr.city}, ${newAddr.state} - ${newAddr.pincode}`);
    setIsAddAddressOpen(false);
    setFormStreet('');
  };

  // Toggle delivery note tag
  const toggleNote = (note: string) => {
    setDeliveryNote((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  // Place Order Handler
  const handlePlaceOrder = () => {
    if (!selectedAddress) return;
    setIsProcessing(true);

    setTimeout(() => {
      const newOrd = createOrder(selectedAddress, paymentMethod);
      setIsProcessing(false);
      setPlacedOrder(newOrd);

      // Trigger Celebration Confetti!
      try {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }
    }, 1000);
  };

  if (placedOrder) {
    return (
      <div className="w-full min-h-[75vh] bg-white flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in zoom-in-95 duration-200">
        <div className="max-w-md w-full bg-slate-50/80 p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-600/20">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Order Placed Successfully!
            </span>
            <h1 className="text-2xl font-black text-slate-900 pt-2">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Order ID: <span className="text-[#7C3AED] font-black">{placedOrder.id}</span>
            </p>
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
              <span className="text-slate-500">Payment:</span>
              <span className="font-bold text-slate-800">{placedOrder.paymentMethod}</span>
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
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
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
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Explore Fresh Groceries
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const grandTotal = cartTotal + 3; // +3 handling/packaging fee

  return (
    <div className="w-full bg-slate-50/50 min-h-screen text-slate-900 font-sans pb-20">
      
      {/* ── BREADCRUMB BAR ── */}
      <div className="border-b border-slate-200/80 bg-white py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#7C3AED] transition-colors cursor-pointer shrink-0 pr-3 border-r border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <button onClick={() => navigate('/')} className="hover:text-[#7C3AED] transition-colors cursor-pointer">Home</button>
              <span>/</span>
              <span className="text-slate-900 font-bold">Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CHECKOUT LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        
        {/* Title */}
        <div className="flex items-center justify-between mb-5 sm:mb-8 text-left">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Secure Checkout
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Steps 1 to 4 (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            
            {/* STEP 1: DELIVERY ADDRESS SELECTION */}
            <div className="p-4 sm:p-6 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                    1
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900">Delivery Address</h2>
                </div>

                {/* Add Address Button */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setIsAddAddressOpen(true)}
                    className="px-2.5 sm:px-3 py-1.5 bg-[#7C3AED] text-white hover:bg-[#6D28D9] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>
              </div>

              {gpsStatus && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{gpsStatus}</span>
                </div>
              )}

              {/* Saved Addresses List */}
              <div className="space-y-2.5 sm:space-y-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setLocation(`${addr.city}, ${addr.state} - ${addr.pincode}`);
                      }}
                      className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex items-start justify-between gap-2.5 sm:gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#7C3AED] bg-purple-50/70 ring-2 ring-purple-200 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-[#7C3AED] bg-[#7C3AED]' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">{addr.name}</span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-black text-[#7C3AED] bg-white px-1.5 py-0.5 rounded-md border border-purple-200">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-normal font-medium break-words">
                            {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <div className="text-[11px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Phone: {addr.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] font-bold text-[#7C3AED] shrink-0">
                        {isSelected ? 'Selected' : 'Select'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: DELIVERY SLOT SELECTION */}
            <div className="p-4 sm:p-6 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">Select Delivery Slot</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSlot('10 Min Instant Express')}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    selectedSlot === '10 Min Instant Express'
                      ? 'border-[#7C3AED] bg-purple-50/80 ring-2 ring-purple-200 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">10-20 Min Express</div>
                    <div className="text-[11px] font-bold text-emerald-600 mt-0.5">Free Instant Doorstep Delivery</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSlot('Scheduled Evening Slot (6 PM - 8 PM)')}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    selectedSlot.includes('Scheduled')
                      ? 'border-[#7C3AED] bg-purple-50/80 ring-2 ring-purple-200 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Scheduled Slot</div>
                    <div className="text-[11px] font-bold text-slate-500 mt-0.5">Today 6:00 PM - 8:00 PM</div>
                  </div>
                </button>
              </div>
            </div>

            {/* STEP 3: PAYMENT METHOD SELECTION */}
            <div className="p-4 sm:p-6 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">Select Payment Method</h2>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {/* 1. UPI */}
                <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                  paymentMethod === 'UPI' ? 'border-[#7C3AED] bg-purple-50/60 ring-2 ring-purple-200' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <span className="text-xl shrink-0">📱</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">Google Pay / PhonePe / Paytm UPI</div>
                        <div className="text-[11px] font-medium text-slate-500 truncate">Pay instantly using any UPI app</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      className="w-4 h-4 text-[#7C3AED] focus:ring-purple-500 shrink-0 ml-2"
                    />
                  </label>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 pt-3 border-t border-purple-200/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                      <input
                        type="text"
                        placeholder="Enter UPI ID (e.g. name@okhdfcbank)"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7C3AED]"
                      />
                      <span className="text-[11px] font-bold text-purple-700 bg-white px-3 py-2 rounded-xl border border-purple-200 text-center">
                        ✓ Instant Auto-Verification
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Credit / Debit Card */}
                <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                  paymentMethod === 'CARD' ? 'border-[#7C3AED] bg-purple-50/60 ring-2 ring-purple-200' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <span className="text-xl shrink-0">💳</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">Credit / Debit Card</div>
                        <div className="text-[11px] font-medium text-slate-500 truncate">Visa, Mastercard, RuPay, Maestro</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      className="w-4 h-4 text-[#7C3AED] focus:ring-purple-500 shrink-0 ml-2"
                    />
                  </label>

                  {paymentMethod === 'CARD' && (
                    <div className="mt-3 pt-3 border-t border-purple-200/60 space-y-2.5">
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="Card Number (16 Digits)"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7C3AED]"
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          placeholder="Expiry (MM/YY)"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7C3AED]"
                        />
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Net Banking */}
                <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                  paymentMethod === 'NETBANKING' ? 'border-[#7C3AED] bg-purple-50/60 ring-2 ring-purple-200' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <span className="text-xl shrink-0">🏦</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">Net Banking</div>
                        <div className="text-[11px] font-medium text-slate-500 truncate">All major Indian banks supported</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'NETBANKING'}
                      onChange={() => setPaymentMethod('NETBANKING')}
                      className="w-4 h-4 text-[#7C3AED] focus:ring-purple-500 shrink-0 ml-2"
                    />
                  </label>

                  {paymentMethod === 'NETBANKING' && (
                    <div className="mt-3 pt-3 border-t border-purple-200/60">
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#7C3AED]"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* 4. Cash on Delivery */}
                <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${
                  paymentMethod === 'COD' ? 'border-[#7C3AED] bg-purple-50/60 ring-2 ring-purple-200' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <span className="text-xl shrink-0">💵</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-900 truncate">Cash on Delivery (COD)</div>
                        <div className="text-[11px] font-medium text-slate-500 truncate">Pay cash or UPI on delivery</div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="w-4 h-4 text-[#7C3AED] focus:ring-purple-500 shrink-0 ml-2"
                    />
                  </label>
                </div>

              </div>
            </div>

            {/* STEP 4: DELIVERY NOTES */}
            <div className="p-4 sm:p-6 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                  4
                </div>
                <h2 className="text-sm sm:text-base font-black text-slate-900">Delivery Instructions (Optional)</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {['🚪 Leave at Door', '🔕 Don\'t Ring Bell', '📞 Call Before Delivery', '🛡️ Hand to Security'].map((note) => {
                  const isSelected = deliveryNote.includes(note);
                  return (
                    <button
                      key={note}
                      type="button"
                      onClick={() => toggleNote(note)}
                      className={`px-3 py-1.5 sm:py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#7C3AED] bg-purple-50 text-[#7C3AED] font-black'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {note}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary & Pay Action (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 lg:sticky lg:top-24">
            
            <div className="p-4 sm:p-6 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-sm text-left space-y-4 sm:space-y-5">
              <h2 className="text-sm sm:text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Order Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="text-xs text-[#7C3AED] font-bold">Farminix Express</span>
              </h2>

              {/* Items List */}
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1 space-y-2">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.selectedWeight}`} className="pt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <img src={item.product.image} alt={item.product.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain bg-white p-1 rounded-xl border border-slate-100 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[200px]">{item.product.name}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{item.selectedWeight} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="text-xs font-black text-slate-900 shrink-0">
                      ₹{item.product.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span>₹{cartTotal + cartDiscount}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-purple-700 font-bold">
                    <span>Coupon Discount (FARM10)</span>
                    <span>-₹{cartDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-extrabold text-emerald-600">FREE</span>
                </div>

                <div className="flex justify-between">
                  <span>Handling &amp; Packaging Fee</span>
                  <span>₹3</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-[#7C3AED] text-lg">₹{grandTotal}</span>
                </div>
              </div>

              {/* Place Order & Pay Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full h-14 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-slate-300 text-white text-base font-black rounded-2xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Order...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Place Order • ₹{grandTotal}</span>
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 border-t border-slate-100">
                <span className="flex items-center gap-1">🔒 100% Safe Payments</span>
                <span className="flex items-center gap-1">⚡ 10-Min Guarantee</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── ADD NEW ADDRESS MODAL ── */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setIsAddAddressOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 border border-slate-100 text-left">
            <h3 className="text-lg font-black text-slate-900 mb-1">Add New Delivery Address</h3>
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
                  <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Recipient Name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Flat / House No / Street / Landmark</label>
                <input
                  type="text"
                  required
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  placeholder="Plot No. 42, Brodipet 4th Line"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={formPincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="522034"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Guntur"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="Andhra Pradesh"
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
