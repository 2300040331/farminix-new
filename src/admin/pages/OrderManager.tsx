import React, { useState } from 'react';
import { ShoppingBag, Search, Trash2, Check, CheckCircle2, Clock, Truck, Package, X } from 'lucide-react';
import { useAdminConfig } from '../context/AdminConfigContext';
import type { Order } from '../../types';

export const OrderManager: React.FC = () => {
  const { config, updateOrderStatus, deleteOrder } = useAdminConfig();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const statuses: Order['status'][] = [
    'Order Received',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const notifyFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    notifyFeedback(`Order #${orderId} marked as "${newStatus}"`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`Are you sure you want to delete order #${orderId}? This cannot be undone.`)) {
      deleteOrder(orderId);
      notifyFeedback(`Order #${orderId} deleted successfully`);
    }
  };

  const filteredOrders = config.orders.filter((order) => {
    const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryAddress.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryAddress.phone.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Fulfillment Pipeline</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Customer Orders &amp; Dispatch Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Advance order status (Received, Packed, Shipped, Delivered) or delete orders directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl border border-purple-200">
            Total Orders: {config.orders.length}
          </span>
        </div>
      </div>

      {/* Live Feedback Toast */}
      {feedbackMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, customer name, phone number..."
            className="w-full h-10 pl-10 pr-4 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Statuses ({config.orders.length})</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200/80">
                <th className="py-3 px-4">Order ID &amp; Date</th>
                <th className="py-3 px-4">Customer &amp; Phone</th>
                <th className="py-3 px-4">Delivery Address</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Quick Status Actions &amp; Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">No orders found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-purple-700">{order.id}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{order.date}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{order.deliveryAddress.name}</div>
                      <div className="text-[11px] text-slate-500">{order.deliveryAddress.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-[180px] truncate">
                      <div className="text-slate-800 font-medium truncate">{order.deliveryAddress.street}</div>
                      <div className="text-[10px] text-slate-400">{order.deliveryAddress.city}, {order.deliveryAddress.pincode}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-slate-900">₹{order.finalAmount}</span>
                      {order.discount > 0 && (
                        <span className="text-[10px] text-emerald-600 block">(-₹{order.discount} off)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-700">
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Out for Delivery'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Packed'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
                        {order.status === 'Order Received' && <Clock className="w-3 h-3" />}
                        {order.status === 'Packed' && <Package className="w-3 h-3" />}
                        {(order.status === 'Shipped' || order.status === 'Out for Delivery') && <Truck className="w-3 h-3" />}
                        <span>{order.status}</span>
                      </span>
                    </td>

                    {/* Quick Status Options Beside Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Quick Option: Received */}
                        <button
                          onClick={() => handleStatusChange(order.id, 'Order Received')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                            order.status === 'Order Received'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                          }`}
                          title="Mark as Order Received"
                        >
                          Received
                        </button>

                        {/* Quick Option: Packed */}
                        <button
                          onClick={() => handleStatusChange(order.id, 'Packed')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                            order.status === 'Packed'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
                          }`}
                          title="Mark as Packed"
                        >
                          Packed
                        </button>

                        {/* Quick Option: Shipped */}
                        <button
                          onClick={() => handleStatusChange(order.id, 'Shipped')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                            order.status === 'Shipped'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                          }`}
                          title="Mark as Shipped"
                        >
                          Shipped
                        </button>

                        {/* Quick Option: Delivered */}
                        <button
                          onClick={() => handleStatusChange(order.id, 'Delivered')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                          title="Mark as Delivered"
                        >
                          Delivered
                        </button>

                        {/* More Statuses Dropdown */}
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                          className="h-6 px-1.5 text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200 rounded-md focus:outline-none cursor-pointer"
                          title="Select exact status"
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>

                        {/* Delete Order Option Beside Status Options */}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200 ml-1"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
