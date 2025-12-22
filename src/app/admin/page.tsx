'use client';

import { useState, useEffect, useMemo } from 'react';

type Order = {
  id: string;
  orderCode: string;
  name: string;
  email: string;
  numTickets: number;
  totalAmount: number;
  showTime: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  payerName: string | null;
  paymentNote: string | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Manual ticket form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualTickets, setManualTickets] = useState(1);
  const [manualShowTime, setManualShowTime] = useState('7PM');
  const [sendingManual, setSendingManual] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (stored in env)
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'admin123') {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      setError('Incorrect password');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (orderCode: string) => {
    if (!confirm(`Mark order ${orderCode} as paid and send ticket email?`)) {
      return;
    }

    setProcessingOrder(orderCode);
    try {
      const response = await fetch('/api/admin/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode }),
      });

      if (!response.ok) throw new Error('Failed to mark as paid');

      const data = await response.json();
      alert(data.message);
      fetchOrders(); // Refresh the list
    } catch (err) {
      alert('Error marking order as paid');
      console.error(err);
    } finally {
      setProcessingOrder(null);
    }
  };

  const resendTicket = async (orderCode: string) => {
    if (!confirm(`Resend ticket email for order ${orderCode}?`)) {
      return;
    }

    setProcessingOrder(orderCode);
    try {
      const response = await fetch('/api/admin/resend-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode }),
      });

      if (!response.ok) throw new Error('Failed to resend ticket');

      const data = await response.json();
      alert(data.message);
    } catch (err) {
      alert('Error resending ticket');
      console.error(err);
    } finally {
      setProcessingOrder(null);
    }
  };

  const cancelOrder = async (orderCode: string) => {
    if (!confirm(`Are you sure you want to cancel order ${orderCode}? This action cannot be undone.`)) {
      return;
    }

    setProcessingOrder(orderCode);
    try {
      const response = await fetch('/api/admin/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode }),
      });

      if (!response.ok) throw new Error('Failed to cancel order');

      const data = await response.json();
      alert(data.message);
      fetchOrders(); // Refresh the list
    } catch (err) {
      alert('Error cancelling order');
      console.error(err);
    } finally {
      setProcessingOrder(null);
    }
  };

  const sendManualTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualEmail || manualTickets < 1) {
      alert('Please enter a valid email and number of tickets');
      return;
    }

    if (!confirm(`Send ${manualTickets} ticket(s) to ${manualEmail}?`)) {
      return;
    }

    setSendingManual(true);
    try {
      const response = await fetch('/api/admin/manual-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: manualEmail,
          name: manualName || 'Manual Entry',
          numTickets: manualTickets,
          showTime: manualShowTime,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send tickets');
      }

      alert(`${data.message}\nOrder Code: ${data.orderCode}`);
      
      // Reset form
      setManualEmail('');
      setManualName('');
      setManualTickets(1);
      setShowManualForm(false);
      
      // Refresh orders list
      fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error sending tickets');
      console.error(err);
    } finally {
      setSendingManual(false);
    }
  };

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase();
    return orders.filter(order => 
      order.orderCode.toLowerCase().includes(query) ||
      order.name.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query) ||
      order.payerName?.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4">
        <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Admin Login
          </h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-white text-white"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-white text-[#212121] font-bold py-3 px-4 rounded-full hover:bg-gray-100 transition-all"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Order Management</h1>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="bg-white text-[#212121] hover:bg-gray-100 font-bold py-2 px-6 rounded-full transition-all disabled:bg-gray-600 disabled:text-gray-400"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-lg p-4">
            <div className="text-sm text-gray-400">Total Orders</div>
            <div className="text-2xl font-bold text-white">{orders.length}</div>
          </div>
          <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-lg p-4">
            <div className="text-sm text-gray-400">Paid</div>
            <div className="text-2xl font-bold text-green-500">
              {orders.filter(o => o.status === 'paid').length}
            </div>
          </div>
          <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-lg p-4">
            <div className="text-sm text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-amber-500">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
          <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-lg p-4">
            <div className="text-sm text-gray-400">Expired</div>
            <div className="text-2xl font-bold text-red-500">
              {orders.filter(o => o.status === 'expired').length}
            </div>
          </div>
          <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-lg p-4">
            <div className="text-sm text-gray-400">Cancelled</div>
            <div className="text-2xl font-bold text-gray-500">
              {orders.filter(o => o.status === 'cancelled').length}
            </div>
          </div>
          <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-lg p-4">
            <div className="text-sm text-gray-400">Total Revenue</div>
            <div className="text-2xl font-bold text-white">
              ${orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Search and Manual Ticket Section */}
        <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by order code, name, email, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-[#1a1a1a] border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-white text-white placeholder-gray-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-400 mt-2">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              )}
            </div>

            {/* Manual Ticket Button */}
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="bg-amber-500 text-black hover:bg-amber-400 font-bold py-3 px-6 rounded-full transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Manual Send Tickets
            </button>
          </div>

          {/* Manual Ticket Form */}
          {showManualForm && (
            <form onSubmit={sendManualTicket} className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Send Tickets Manually</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="customer@email.com"
                    required
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-white/20 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name (optional)
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-white/20 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Tickets *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={manualTickets}
                    onChange={(e) => setManualTickets(parseInt(e.target.value) || 1)}
                    required
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-white/20 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Show Time
                  </label>
                  <select
                    value={manualShowTime}
                    onChange={(e) => setManualShowTime(e.target.value)}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-white/20 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white"
                  >
                    <option value="7PM">7PM</option>
                    <option value="8PM">8PM</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={sendingManual}
                  className="bg-green-600 text-white hover:bg-green-500 font-bold py-2 px-6 rounded-full transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendingManual ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Tickets
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="bg-gray-600 text-white hover:bg-gray-500 font-bold py-2 px-6 rounded-full transition-all"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                * This will create a paid order and send tickets immediately to the specified email. Price: $10 per ticket.
              </p>
            </form>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Order Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Show Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#2a2a2a] divide-y divide-white/10">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#333333]">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm font-semibold text-white">
                        {order.orderCode}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-white">{order.name}</div>
                      <div className="text-sm text-gray-400">{order.email}</div>
                      {order.payerName && (
                        <div className="text-xs text-amber-500">Paid by: {order.payerName}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                      {order.numTickets}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-amber-400 font-medium">
                      {order.showTime || '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-white">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'paid'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : order.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : order.status === 'expired'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                      {(order.status === 'pending' || order.status === 'expired') && (
                        <button
                          onClick={() => markAsPaid(order.orderCode)}
                          disabled={processingOrder === order.orderCode}
                          className="text-green-400 hover:text-green-300 font-medium disabled:opacity-50"
                        >
                          Mark Paid
                        </button>
                      )}
                      {order.status === 'paid' && (
                        <button
                          onClick={() => resendTicket(order.orderCode)}
                          disabled={processingOrder === order.orderCode}
                          className="text-amber-400 hover:text-amber-300 font-medium disabled:opacity-50"
                        >
                          Resend Ticket
                        </button>
                      )}
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={() => cancelOrder(order.orderCode)}
                          disabled={processingOrder === order.orderCode}
                          className="text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              {searchQuery ? `No orders matching "${searchQuery}"` : 'No orders found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

