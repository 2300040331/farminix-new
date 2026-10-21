import React, { useState } from 'react';
import { X, MapPin, Check, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectUserLocation, lookupPincode } from '../utils/location';

export const LocationModal: React.FC = () => {
  const { isLocationOpen, setIsLocationOpen, location, setLocation } = useApp();
  const [pincodeInput, setPincodeInput] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);
  const [detectError, setDetectError] = useState<string | null>(null);

  if (!isLocationOpen) return null;

  const popularLocations = [
    'Guntur, Andhra Pradesh - 522034',
    'Vijayawada, Andhra Pradesh - 520001',
    'Visakhapatnam, Andhra Pradesh - 530001',
    'Hyderabad, Telangana - 500001',
    'Bengaluru, Karnataka - 560001',
  ];

  const handleSelect = (loc: string) => {
    setLocation(loc);
    setIsLocationOpen(false);
  };

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    setDetectStatus('Accessing GPS location...');
    setDetectError(null);

    const res = await detectUserLocation();
    setIsDetecting(false);

    if (res.success && res.locationString) {
      setLocation(res.locationString);
      setDetectStatus('✓ Location detected accurately!');
      setTimeout(() => {
        setIsLocationOpen(false);
        setDetectStatus(null);
      }, 1000);
    } else {
      setDetectStatus(null);
      setDetectError(res.error || 'Could not detect location automatically.');
    }
  };

  const handleCustomPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.length === 6) {
      const resolved = lookupPincode(pincodeInput);
      setLocation(resolved);
      setIsLocationOpen(false);
    }
  };

  return (
    <div className="store-modal-layer fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 select-none">
      <div
        onClick={() => setIsLocationOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="store-modal-surface relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 border border-slate-100 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img src="/farminix_logo.png" alt="Farminix Logo" className="h-7 w-auto object-contain" />
            <span className="h-4 w-px bg-slate-200" />
            <h2 className="text-base font-black text-slate-900">Select Location</h2>
          </div>
          <button
            onClick={() => setIsLocationOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Auto-Detect Button */}
        <div className="mt-5">
          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full py-3.5 px-4 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-purple-300 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer active:scale-98"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Detecting your accurate location...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 fill-white text-white" />
                <span>🎯 Detect My Current Location</span>
              </>
            )}
          </button>

          {/* Status Message */}
          {detectStatus && (
            <div className="mt-2 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{detectStatus}</span>
            </div>
          )}

          {/* Error Message */}
          {detectError && (
            <div className="mt-2 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl flex items-start gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <span>{detectError}</span>
            </div>
          )}
        </div>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">or enter pincode</span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Enter Pincode Form */}
        <form onSubmit={handleCustomPincode}>
          <label className="text-xs font-black text-slate-700 mb-1.5 block">Enter 6-Digit Pincode</label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 522034"
              className="flex-1 h-11 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7C3AED] font-bold"
            />
            <button
              type="submit"
              disabled={pincodeInput.length !== 6}
              className="px-5 h-11 bg-[#7C3AED] disabled:bg-slate-300 hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              Check
            </button>
          </div>
          {pincodeInput.length === 6 && (
            <div className="mt-1.5 text-[11px] font-extrabold text-[#7C3AED]">
              Resolves to: {lookupPincode(pincodeInput)}
            </div>
          )}
        </form>

        {/* Popular Cities List */}
        <div className="mt-5 text-left">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Popular Delivery Cities</div>
          <div className="space-y-2">
            {popularLocations.map((loc) => {
              const isSelected = location === loc;
              return (
                <button
                  key={loc}
                  onClick={() => handleSelect(loc)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#7C3AED] bg-purple-50 text-[#7C3AED] font-black shadow-xs'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#7C3AED]' : 'text-slate-400'}`} />
                    <span className="text-xs">{loc}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#7C3AED]" />}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
