import React, { useState } from 'react';
import { X, Phone, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WHATSAPP_URL, WhatsAppIcon } from '../components/WhatsAppButton';

export const SupportModal: React.FC = () => {
  const { isSupportOpen, setIsSupportOpen } = useApp();
  const [messages, setMessages] = useState<{ sender: 'agent' | 'user'; text: string }[]>([
    { sender: 'agent', text: 'Hello! Welcome to Farminix 24/7 Support. How can we help you today?' },
  ]);
  const [inputText, setInputText] = useState('');

  if (!isSupportOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Thank you for reaching out! Our support team is checking your request regarding "${userMsg}". We ensure 100% resolution in 2 minutes.`,
        },
      ]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 select-none">
      <div
        onClick={() => setIsSupportOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200 border border-gray-100 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/farminix_logo.png" alt="Farminix Logo" className="h-8 w-auto object-contain" />
            <span className="h-4 w-px bg-gray-200" />
            <div>
              <h2 className="text-base font-bold text-gray-900">24/7 Live Support</h2>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Agent Connected
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsSupportOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => window.open(WHATSAPP_URL, '_blank')}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#15803D] rounded-xl border border-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#15803D]" />
            <span>WhatsApp Support</span>
          </button>

          <button
            onClick={() => alert("Calling Farminix Toll-Free Helpline: 1800-123-FARM...")}
            className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl border border-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call 1800-123-FARM</span>
          </button>
        </div>

        {/* Chat History Box */}
        <div className="mt-4 h-56 bg-slate-50 rounded-2xl p-3 border border-gray-200 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#15803D] text-white rounded-br-none font-medium'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input Form */}
        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 h-10 px-3.5 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#15803D]"
          />
          <button
            type="submit"
            className="w-10 h-10 bg-[#15803D] hover:bg-green-800 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
