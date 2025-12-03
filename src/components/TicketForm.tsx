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

  const ticketPrice = 10.0;
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
      <div className="bg-[#0f0f0f]/90 backdrop-blur-sm border border-white/10">
        <div className="p-8 text-center border-b border-white/10">
          <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="tracking-text-lg text-lg text-white mb-2">Order Created!</h2>
          <p className="text-sm text-white/60">Complete your payment to receive your tickets</p>
        </div>

        <div className="p-8 border-b border-white/10">
          <h3 className="tracking-text text-[10px] text-gold mb-6">Payment Instructions</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-[11px] text-white/50 mb-1 tracking-text">1. Open Venmo and send payment to:</p>
              <p className="text-xl font-medium text-white">@jesse-clark-39</p>
            </div>

            <div>
              <p className="text-[11px] text-white/50 mb-1 tracking-text">2. Amount to send:</p>
              <p className="text-3xl font-medium text-gold">${confirmation.totalAmount.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-[11px] text-white/50 mb-1 tracking-text">3. Include this exact note:</p>
              <div className="bg-black/50 border border-white/10 p-4 font-mono text-sm break-all text-white">
                {confirmation.venmoNote}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.02]">
          <h4 className="tracking-text text-[10px] text-white/60 mb-4">What happens next?</h4>
          <ul className="text-sm text-white/50 space-y-2">
            <li>• Tickets will be emailed to: <span className="text-white">{confirmation.email}</span></li>
            <li>• Typically arrives within 5-10 minutes</li>
            <li>• Check spam folder if not received</li>
            <li>• Bring ticket (digital or printed) to screening</li>
          </ul>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="tracking-text text-[10px] text-white/40">Order Code</p>
            <p className="font-mono text-lg text-white mt-1">{confirmation.orderCode}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="tracking-text-lg text-lg text-white mb-2">Get Your Tickets</h2>
        <p className="tracking-text text-[10px] text-white/50">DEC 11th, 2025, Vineyard MEGAPLEX</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Form Fields */}
        <div className="bg-[#0f0f0f]/80 backdrop-blur-sm border border-white/10">
          {/* Venmo Username Field */}
          <div className="form-row">
            <label htmlFor="name" className="form-label">Venmo Username</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input border-0 bg-transparent flex-1"
              placeholder="@USERNAME"
            />
          </div>

          {/* Email Field */}
          <div className="form-row">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input border-0 bg-transparent flex-1"
              placeholder="EMAIL@EMAIL.COM"
            />
          </div>

          {/* Number of Tickets */}
          <div className="form-row">
            <label htmlFor="numTickets" className="form-label">Number of Tickets</label>
            <div className="flex-1 px-4 py-3 flex items-center justify-end">
              <input
                type="number"
                id="numTickets"
                min="1"
                max="10"
                value={numTickets}
                onChange={(e) => setNumTickets(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="w-16 bg-transparent text-white text-right focus:outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="flex flex-col ml-2">
                <button 
                  type="button" 
                  onClick={() => setNumTickets(Math.min(10, numTickets + 1))}
                  className="text-white/30 hover:text-white/60 text-[10px] leading-none"
                >
                  ▲
                </button>
                <button 
                  type="button" 
                  onClick={() => setNumTickets(Math.max(1, numTickets - 1))}
                  className="text-white/30 hover:text-white/60 text-[10px] leading-none"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          {/* Show Time */}
          <div className="form-row">
            <span className="form-label">Show Time</span>
            <span className="flex-1 px-4 py-3 text-white/60 text-right text-sm">7PM</span>
          </div>

          {/* Subtotal */}
          <div className="form-row border-b-0">
            <span className="form-label">Subtotal</span>
            <span className="flex-1 px-4 py-3 text-white text-right text-sm font-medium">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 cta-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white/5"
        >
          {isSubmitting ? (
            'Processing...'
          ) : (
            <>
              Continue to Payment
              <span className="text-lg">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
