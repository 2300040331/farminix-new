import React, { useState } from 'react';
import { Users, Search, Award, Wallet, MapPin } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';

export const CustomerManager: React.FC = () => {
  const { config, updateUsers } = useAdminConfig();
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdateCustomer = (userId: string, key: 'rewardPoints' | 'walletBalance', val: number) => {
    const updated = (config.users || []).map((u) => (u.id === userId ? { ...u, [key]: val } : u));
    updateUsers(updated);
  };

  const filteredUsers = (config.users || []).filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="admin-page-heading admin-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Store Membership</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View registered shopper profiles, contact information, and saved delivery addresses.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="admin-panel bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, email, or phone..."
            className="w-full h-10 pl-10 pr-4 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="admin-panel bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{user.name}</h3>
                <div className="text-xs text-slate-500 font-medium">{user.email} • {user.phone}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase">
                Gold Member
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/65 border border-amber-200/85 space-y-2 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-700" />
                  <span className="text-[10px] uppercase font-extrabold text-amber-800">Reward Points</span>
                </div>
                <input
                  type="text"
                  value={user.rewardPoints}
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(/\D/g, '')) || 0;
                    handleUpdateCustomer(user.id, 'rewardPoints', val);
                  }}
                  className="w-full h-8 px-2.5 text-xs font-black text-slate-900 bg-white border border-amber-250 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/65 border border-emerald-200/85 space-y-2 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-700" />
                  <span className="text-[10px] uppercase font-extrabold text-emerald-800">Wallet Balance (₹)</span>
                </div>
                <input
                  type="text"
                  value={user.walletBalance}
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                    handleUpdateCustomer(user.id, 'walletBalance', val);
                  }}
                  className="w-full h-8 px-2.5 text-xs font-black text-emerald-700 bg-white border border-emerald-250 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>Saved Addresses ({user.addresses.length})</span>
              </div>
              <div className="space-y-1.5">
                {user.addresses.map((addr) => (
                  <div key={addr.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-bold text-slate-800">{addr.name} ({addr.phone})</div>
                    <div className="text-slate-600 text-[11px]">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
