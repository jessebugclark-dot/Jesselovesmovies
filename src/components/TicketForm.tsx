'use client';

import { useState, useEffect } from 'react';

type OrderConfirmation = {
  orderCode: string;
  name: string;
  email: string;
  numTickets: number;
  totalAmount: number;
  showTime: string;
  venmoHandle: string;
  venmoNote: string;
  reservedUntil: string;
  remainingSeats: number;
};

type SeatAvailability = {
  [key: string]: {
    total: number;
    reserved: number;
    available: number;
  };
};

// Copy to clipboard component
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full text-left group active:scale-[0.98] transition-transform"
    >
      <div className="bg-white/5 border border-white/10 p-4 rounded-lg hover:bg-white/10 active:bg-white/15 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xl sm:text-2xl font-medium text-white break-all">{label}</span>
          <span className={`text-xs px-2 py-1 rounded shrink-0 transition-colors ${
            copied 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-white/10 text-white/50 group-hover:bg-white/20'
          }`}>
            {copied ? '✓ Copied!' : 'Tap to copy'}
          </span>
        </div>
      </div>
    </button>
  );
}

// Countdown timer component
function CountdownTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      return Math.max(0, Math.floor((expiry - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isLow = timeLeft <= 60;

  return (
    <div className={`text-center p-3 rounded-lg ${isLow ? 'bg-red-500/20 border border-red-500/30' : 'bg-gold/10 border border-gold/30'}`}>
      <p className={`text-xs uppercase tracking-wider mb-1 ${isLow ? 'text-red-400' : 'text-gold/70'}`}>
        Time remaining to complete payment
      </p>
      <p className={`text-2xl font-mono font-bold ${isLow ? 'text-red-400' : 'text-gold'}`}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </p>
    </div>
  );
}

export default function TicketForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [numTickets, setNumTickets] = useState(1);
  const [showTime, setShowTime] = useState('7PM-8PM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState('');
  const [seats, setSeats] = useState<SeatAvailability | null>(null);
  const [expired, setExpired] = useState(false);

  const ticketPrice = 10.0;
  const subtotal = numTickets * ticketPrice;

  // Fetch seat availability
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await fetch('/api/seats');
        if (response.ok) {
          const data = await response.json();
          setSeats(data.seats);
        }
      } catch (err) {
        console.error('Failed to fetch seats:', err);
      }
    };

    fetchSeats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSeats, 30000);
    return () => clearInterval(interval);
  }, []);

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
          showTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setConfirmation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpire = () => {
    setExpired(true);
  };

  const handleStartOver = () => {
    setConfirmation(null);
    setExpired(false);
    setError('');
  };

  // Expired state
  if (expired && confirmation) {
    return (
      <div className="bg-[#0f0f0f]/90 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Reservation Expired</h2>
        <p className="text-white/60 mb-6">
          Your 5-minute window to complete payment has expired. The seats have been released.
        </p>
        <button
          onClick={handleStartOver}
          className="cta-button w-full"
        >
          Start Over
        </button>
      </div>
    );
  }

  if (confirmation) {
    const venmoHandle = '@Jesse-Clark-39';
    const amountText = `$${confirmation.totalAmount.toFixed(2)}`;
    
    return (
      <div className="bg-[#0f0f0f]/90 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
        {/* Countdown Timer */}
        <div className="p-4 border-b border-white/10">
          <CountdownTimer expiresAt={confirmation.reservedUntil} onExpire={handleExpire} />
        </div>

        {/* Header */}
        <div className="p-6 sm:p-8 text-center border-b border-white/10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="tracking-text-lg text-base sm:text-lg text-white mb-2">Seats Reserved!</h2>
          <p className="text-sm text-white/60">Complete payment within 5 minutes to secure your tickets</p>
          <p className="text-sm text-gold mt-2">Show Time: {confirmation.showTime}</p>
        </div>

        {/* Payment Instructions */}
        <div className="p-6 sm:p-8 border-b border-white/10">
          <h3 className="tracking-text text-[10px] text-gold mb-6">Payment Instructions</h3>
          
          <div className="space-y-5">
            {/* Venmo Handle */}
            <div>
              <p className="text-[11px] text-white/50 mb-2 tracking-text">1. Open Venmo and send payment to:</p>
              <CopyButton text={venmoHandle} label={venmoHandle} />
            </div>

            {/* Amount */}
            <div>
              <p className="text-[11px] text-white/50 mb-2 tracking-text">2. Amount to send:</p>
              <CopyButton text={confirmation.totalAmount.toFixed(2)} label={amountText} />
            </div>

            {/* Note */}
            <div>
              <p className="text-[11px] text-white/50 mb-2 tracking-text">3. Include this exact note:</p>
              <CopyButton text={confirmation.venmoNote} label={confirmation.venmoNote} />
            </div>
          </div>

          {/* Open Venmo Button */}
          <a
            href={`venmo://paycharge?txn=pay&recipients=${encodeURIComponent(venmoHandle.replace('@', ''))}&amount=${confirmation.totalAmount.toFixed(2)}&note=${encodeURIComponent(confirmation.venmoNote)}`}
            className="w-full mt-6 cta-button flex items-center justify-center gap-2 bg-[#008CFF] border-[#008CFF] hover:bg-[#0077DD] text-white"
          >
            Open in Venmo
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zm11-3v8h-2V6.413l-7.293 7.294-1.414-1.414L17.586 5H13V3h8z"/>
            </svg>
          </a>
        </div>

        {/* What happens next */}
        <div className="p-6 sm:p-8 bg-white/[0.02]">
          <h4 className="tracking-text text-[10px] text-white/60 mb-4">What happens next?</h4>
          <ul className="text-sm text-white/50 space-y-2">
            <li>• Tickets will be emailed to: <span className="text-white break-all">{confirmation.email}</span></li>
            <li>• Typically arrives within 5-10 minutes</li>
            <li>• Check spam folder if not received</li>
            <li>• Bring ticket (digital or printed) to screening</li>
          </ul>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="tracking-text text-[10px] text-white/40">Order Code</p>
            <p className="font-mono text-base sm:text-lg text-white mt-1">{confirmation.orderCode}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentShowSeats = seats?.[showTime]?.available ?? null;
  const otherShowTime = showTime === '7PM-8PM' ? '8PM-9PM' : '7PM-8PM';
  const otherShowSeats = seats?.[otherShowTime]?.available ?? null;

  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="tracking-text-lg text-base sm:text-lg text-white mb-2">Get Your Tickets</h2>
        <p className="tracking-text text-[10px] text-white/50">DEC 22nd, 2025, Vineyard MEGAPLEX</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Form Fields */}
        <div className="bg-[#0f0f0f]/80 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
          {/* Venmo Username Field */}
          <div className="form-row flex-col sm:flex-row">
            <label htmlFor="name" className="form-label w-full sm:w-auto sm:min-w-[140px]">Venmo Username</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input border-0 bg-transparent flex-1 w-full"
              placeholder="@USERNAME"
            />
          </div>

          {/* Email Field */}
          <div className="form-row flex-col sm:flex-row">
            <label htmlFor="email" className="form-label w-full sm:w-auto sm:min-w-[140px]">Email</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input border-0 bg-transparent flex-1 w-full"
              placeholder="EMAIL@EMAIL.COM"
            />
          </div>

          {/* Number of Tickets */}
          <div className="form-row">
            <label htmlFor="numTickets" className="form-label flex-1 sm:flex-none sm:min-w-[140px]">Number of Tickets</label>
            <div className="flex items-center justify-end px-4 py-3">
              <button 
                type="button" 
                onClick={() => setNumTickets(Math.max(1, numTickets - 1))}
                className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xl"
              >
                −
              </button>
              <input
                type="number"
                id="numTickets"
                min="1"
                max="10"
                value={numTickets}
                onChange={(e) => setNumTickets(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="w-12 bg-transparent text-white text-center focus:outline-none text-lg font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button 
                type="button" 
                onClick={() => setNumTickets(Math.min(10, numTickets + 1))}
                className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* Show Time */}
          <div className="form-row">
            <span className="form-label flex-1 sm:flex-none sm:min-w-[140px]">Show Time</span>
            <div className="flex items-center gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => setShowTime('7PM-8PM')}
                disabled={seats?.['7PM-8PM']?.available === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showTime === '7PM-8PM'
                    ? 'bg-gold text-black'
                    : seats?.['7PM-8PM']?.available === 0
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                7PM-8PM
              </button>
              <button
                type="button"
                onClick={() => setShowTime('8PM-9PM')}
                disabled={seats?.['8PM-9PM']?.available === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showTime === '8PM-9PM'
                    ? 'bg-gold text-black'
                    : seats?.['8PM-9PM']?.available === 0
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }`}
              >
                8PM-9PM
              </button>
            </div>
          </div>

          {/* Seats Available */}
          {seats && (
            <div className="form-row border-b-0 bg-white/[0.02]">
              <span className="form-label flex-1 sm:flex-none sm:min-w-[140px]">Seats Available</span>
              <div className="px-4 py-3 flex items-center gap-4">
                <span className={`text-sm ${currentShowSeats !== null && currentShowSeats < 20 ? 'text-red-400' : 'text-white/60'}`}>
                  {currentShowSeats !== null ? (
                    currentShowSeats === 0 ? (
                      <span className="text-red-400 font-medium">SOLD OUT</span>
                    ) : (
                      <>{currentShowSeats} left for {showTime}</>
                    )
                  ) : (
                    'Loading...'
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Subtotal */}
          <div className="form-row border-b-0">
            <span className="form-label flex-1 sm:flex-none sm:min-w-[140px]">Subtotal</span>
            <span className="px-4 py-3 text-white text-right text-lg font-medium">${subtotal.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || (currentShowSeats !== null && currentShowSeats === 0)}
          className="w-full mt-6 cta-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-white/5 py-4"
        >
          {isSubmitting ? (
            'Processing...'
          ) : currentShowSeats === 0 ? (
            'Sold Out'
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
