import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, user, setUser } = useApp();
  const [authMode, setAuthMode] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  if (!isAuthOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      setAuthMode('otp');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      id: 'usr-1',
      name: 'Customer',
      phone: `+91 ${phone}`,
      email: '',
      rewardPoints: 100,
      walletBalance: 0,
      addresses: [],
    });
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 select-none">
      <div
        onClick={() => setIsAuthOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 border border-gray-100 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <img src="/farminix_logo.png" alt="Farminix Logo" className="h-8 w-auto object-contain" />
            <span className="h-4 w-px bg-gray-200" />
            <h2 className="text-base font-bold text-gray-900">
              {user ? 'My Account Profile' : 'Login / Register'}
            </h2>
          </div>
          <button
            onClick={() => setIsAuthOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          /* Profile Details */
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#15803D] text-white flex items-center justify-center text-lg font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{user.name}</h3>
                <div className="text-xs text-gray-600">{user.phone}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-center">
                <div className="text-xs font-bold text-purple-900">Farminix Wallet</div>
                <div className="text-lg font-extrabold text-[#5B21B6]">₹{user.walletBalance}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                <div className="text-xs font-bold text-amber-900">Reward Points</div>
                <div className="text-lg font-extrabold text-amber-600">{user.rewardPoints} Pts</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full h-11 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Auth Form */
          <div className="mt-5">
            {authMode === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Enter Mobile Number</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-gray-500">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      className="w-full h-11 pl-12 pr-4 text-xs font-bold bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#15803D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={phone.length !== 10}
                  className="w-full h-11 bg-[#15803D] disabled:bg-gray-300 hover:bg-green-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <span>Get OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <span className="relative bg-white px-2 text-[10px] text-gray-400 font-bold uppercase">OR LOGIN WITH</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPhone('9876543210');
                    setAuthMode('otp');
                  }}
                  className="w-full h-11 border border-gray-200 hover:bg-slate-50 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Continue with Google</span>
                </button>
              </form>
            )}

            {authMode === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-xs text-gray-600">
                  OTP sent to <span className="font-bold text-gray-900">+91 {phone}</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Enter 4-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="1 2 3 4"
                    className="w-full h-11 text-center text-lg font-black tracking-widest bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#15803D]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-[#15803D] hover:bg-green-800 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
                >
                  Verify &amp; Login
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
