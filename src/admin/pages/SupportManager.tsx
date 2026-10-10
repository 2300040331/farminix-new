import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

interface Ticket {
  id: string;
  userName: string;
  userPhone: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  replies: { sender: 'agent' | 'user'; text: string; time: string }[];
}

export const SupportManager: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TCK-1092',
      userName: 'Customer',
      userPhone: '+91 98000 00000',
      subject: 'Order Tracking Query for ORD-89241',
      message: 'When will the 10 min express delivery arrive?',
      status: 'OPEN',
      createdAt: 'Today, 2:15 PM',
      replies: [
        { sender: 'user', text: 'When will the 10 min express delivery arrive?', time: '2:15 PM' },
        { sender: 'agent', text: 'Your delivery executive is 4 minutes away from your location.', time: '2:16 PM' },
      ],
    },
    {
      id: 'TCK-1088',
      userName: 'Rajesh Kumar',
      userPhone: '+91 98111 22334',
      subject: 'Discount code FARM10 validation',
      message: 'How to apply 10% coupon on bulk Basmati Rice purchase?',
      status: 'RESOLVED',
      createdAt: 'Yesterday, 5:40 PM',
      replies: [
        { sender: 'user', text: 'How to apply 10% coupon on bulk Basmati Rice purchase?', time: '5:40 PM' },
        { sender: 'agent', text: 'Apply code FARM10 at checkout on cart total above ₹500 for instant discount.', time: '5:42 PM' },
      ],
    },
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const newReply = {
      sender: 'agent' as const,
      text: replyText.trim(),
      time: 'Just now',
    };

    const updated = tickets.map((t) =>
      t.id === selectedTicketId
        ? { ...t, replies: [...t.replies, newReply], status: 'RESOLVED' as const }
        : t
    );

    setTickets(updated);
    setReplyText('');
  };

  const handleStatusChange = (id: string, status: 'OPEN' | 'RESOLVED' | 'CLOSED') => {
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Customer Care Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Support Desk &amp; Chat Inquiries
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Resolve live chat tickets, delivery tracking inquiries, and customer help requests.
          </p>
        </div>
      </div>

      {/* Split Ticket View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
            Inbox ({tickets.length})
          </div>

          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedTicketId === ticket.id
                    ? 'bg-purple-50/70 border-purple-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">{ticket.userName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      ticket.status === 'OPEN'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700 truncate">{ticket.subject}</div>
                <div className="text-[10px] text-slate-400 mt-1">{ticket.createdAt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Chat & Reply Box */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          {selectedTicket ? (
            <>
              {/* Ticket Top bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">{selectedTicket.subject}</h2>
                    <span className="text-xs font-mono text-purple-700 font-bold">({selectedTicket.id})</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Customer: <strong>{selectedTicket.userName}</strong> ({selectedTicket.userPhone})
                  </div>
                </div>

                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as any)}
                  className="h-8 px-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                >
                  <option value="OPEN">Status: OPEN</option>
                  <option value="RESOLVED">Status: RESOLVED</option>
                  <option value="CLOSED">Status: CLOSED</option>
                </select>
              </div>

              {/* Chat Thread */}
              <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {selectedTicket.replies.map((reply, idx) => (
                  <div
                    key={idx}
                    className={`flex ${reply.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                        reply.sender === 'agent'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      <div className="font-semibold">{reply.text}</div>
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          reply.sender === 'agent' ? 'text-purple-200' : 'text-slate-400'
                        }`}
                      >
                        {reply.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type support reply to customer..."
                  className="flex-1 h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">Select a ticket to view conversation</div>
          )}
        </div>
      </div>
    </div>
  );
};
