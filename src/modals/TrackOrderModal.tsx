import React from 'react';
import { X, CheckCircle2, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TrackOrderModal: React.FC = () => {
  const { isTrackOrderOpen, setIsTrackOrderOpen, orders } = useApp();

  if (!isTrackOrderOpen) return null;

  const currentOrder = orders[0] || {
    id: 'ORD-89241',
    date: 'Today',
    status: 'Out for Delivery',
    estimatedTime: '8 Mins',
    totalAmount: 209,
    finalAmount: 188,
    paymentMethod: 'UPI',
    items: [],
  };

  const steps = [
    { label: 'Order Received', done: true, time: '10:10 AM' },
    { label: 'Packed & Verified', done: true, time: '10:12 AM' },
    { label: 'Out for Delivery', done: true, time: '10:14 AM' },
    { label: 'Delivered to Doorstep', done: false, time: 'Est. 10:22 AM' },
  ];

  return (
    <div className="store-modal-layer fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 select-none">
      <div
        onClick={() => setIsTrackOrderOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="store-modal-surface relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 border border-gray-100 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/farminix_logo.png" alt="Farminix Logo" className="h-8 w-auto object-contain" />
            <span className="h-4 w-px bg-gray-200" />
            <div>
              <h2 className="text-base font-bold text-gray-900">Track Live Order</h2>
              <div className="text-[11px] text-gray-500 font-mono">ID: {currentOrder.id}</div>
            </div>
          </div>
          <button
            onClick={() => setIsTrackOrderOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Estimated Time Card */}
        <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#15803D] text-white flex items-center justify-center font-bold text-lg animate-pulse">
              ⚡
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">Arriving in Express</div>
              <div className="text-lg font-black text-[#15803D]">{currentOrder.estimatedTime}</div>
            </div>
          </div>
          <span className="bg-white text-[#15803D] text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
            {currentOrder.status}
          </span>
        </div>

        {/* Timeline */}
        <div className="mt-6 space-y-4 px-2">
          {steps.map((s, idx) => (
            <div key={s.label} className="relative flex items-center gap-4">
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-[13px] top-6 w-[2px] h-8 ${
                    s.done ? 'bg-[#15803D]' : 'bg-gray-200'
                  }`}
                />
              )}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                  s.done ? 'bg-[#15803D] text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 flex justify-between items-center text-xs">
                <span className={`font-bold ${s.done ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                <span className="text-[10px] text-gray-400 font-mono">{s.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Agent Card */}
        <div className="mt-6 p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-900 font-bold flex items-center justify-center text-sm">
              RK
            </div>
            <div>
              <div className="text-xs font-bold text-purple-950">Ramesh Kumar</div>
              <div className="text-[10px] text-purple-700">Farminix Delivery Executive</div>
            </div>
          </div>

          <button
            onClick={() => alert("Calling Delivery Agent Ramesh Kumar (+91 98765 00112)...")}
            className="w-9 h-9 rounded-full bg-[#5B21B6] hover:bg-purple-900 text-white flex items-center justify-center transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
