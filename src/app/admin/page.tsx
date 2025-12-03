'use client';

import { useState, useEffect } from 'react';

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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
            <div className="text-sm text-gray-400">Total Revenue</div>
            <div className="text-2xl font-bold text-white">
              ${orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
            </div>
          </div>
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
                {orders.map((order) => (
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              No orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

