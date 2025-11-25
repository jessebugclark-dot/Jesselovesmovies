'use client';

import { useState } from 'react';

type OrderConfirmation = {
  orderCode: string;
  name: string;
  email: string;
  numTickets: number;
  totalAmount: number;
  venmoHandle: string;
  venmoNote: string;
};

export default function TicketForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [numTickets, setNumTickets] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState('');

  const ticketPrice = 15.0;
  const subtotal = numTickets * ticketPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          numTickets,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      setConfirmation(data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-2xl p-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-3xl font-bold text-white mb-2">Order Created!</h2>
          <p className="text-gray-300">Complete your payment to receive your tickets</p>
        </div>

        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Payment Instructions</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-300 mb-1">1. Open Venmo and send payment to:</p>
              <p className="text-2xl font-bold text-white">{confirmation.venmoHandle}</p>
            </div>

            <div>
              <p className="text-sm text-gray-300 mb-1">2. Amount to send:</p>
              <p className="text-3xl font-bold text-amber-500">${confirmation.totalAmount.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-300 mb-1">3. <strong>IMPORTANT:</strong> Include this exact note:</p>
              <div className="bg-[#1a1a1a] border border-white/20 rounded p-3 font-mono text-sm break-all text-white">
                {confirmation.venmoNote}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-white mb-2">What happens next?</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Once your payment is received, we&apos;ll email your tickets to: <strong className="text-white">{confirmation.email}</strong></li>
            <li>• Tickets typically arrive within 5-10 minutes</li>
            <li>• Check your spam folder if you don&apos;t see the email</li>
            <li>• Bring your ticket (digital or printed) to the festival</li>
          </ul>
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>Order Code: <span className="font-mono font-semibold text-white">{confirmation.orderCode}</span></p>
          <p className="mt-2">Questions? Email us at support@filmfestival.com</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-2xl p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Get Your Tickets</h2>
      
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-200">
          <strong className="text-white">One ticket</strong> grants you access to all three film screenings!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-white text-white placeholder-gray-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-white text-white placeholder-gray-500"
            placeholder="john@example.com"
          />
          <p className="text-xs text-gray-400 mt-1">Your tickets will be sent to this email</p>
        </div>

        <div>
          <label htmlFor="numTickets" className="block text-sm font-medium text-gray-200 mb-2">
            Number of Tickets *
          </label>
          <select
            id="numTickets"
            value={numTickets}
            onChange={(e) => setNumTickets(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/20 rounded-lg focus:ring-2 focus:ring-white focus:border-white text-white"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num} className="bg-[#1a1a1a]">
                {num} {num === 1 ? 'Ticket' : 'Tickets'}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/20">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-gray-200">Subtotal:</span>
            <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            ${ticketPrice.toFixed(2)} per ticket × {numTickets} ticket{numTickets !== 1 ? 's' : ''}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-[#212121] font-bold py-4 px-6 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? 'Processing...' : 'Continue to Payment'}
        </button>

        <p className="text-xs text-center text-gray-400">
          You&apos;ll be shown payment instructions after clicking continue
        </p>
      </form>
    </div>
  );
}

