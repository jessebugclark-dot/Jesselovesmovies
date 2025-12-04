import { supabase } from '@/lib/supabase';

type Props = {
  params: Promise<{ orderCode: string }>;
};

export default async function VerifyTicketPage({ params }: Props) {
  const { orderCode } = await params;
  
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('order_code', orderCode.toUpperCase())
    .single();

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="bg-[#111] border border-white/10 rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Ticket</h1>
          <p className="text-gray-400">Order code not found: {orderCode}</p>
        </div>
      </div>
    );
  }

  if (order.status !== 'paid') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="bg-[#111] border border-white/10 rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Pending</h1>
          <p className="text-gray-400 mb-4">
            This ticket has not been paid for yet.
          </p>
          <p className="text-sm text-gray-500">Order: {order.order_code}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8">
      <div className="bg-[#111] border border-white/10 rounded-lg shadow-2xl p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-500 mb-2">Valid Ticket</h1>
          <p className="text-gray-400">This ticket is confirmed and paid</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Code</div>
            <div className="font-mono font-bold text-2xl text-white">{order.order_code}</div>
          </div>
          
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Ticket Holder</span>
              <span className="text-white font-medium">{order.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Number of Tickets</span>
              <span className="text-white font-medium">{order.num_tickets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Show Time</span>
              <span className="text-[#d4a84b] font-bold">{order.show_time || '7PM'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount Paid</span>
              <span className="text-green-500 font-bold">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#d4a84b] rounded-lg p-4 text-center mb-6">
          <div className="text-xs text-black/60 uppercase tracking-wider mb-1">Event</div>
          <div className="text-xl font-bold text-black italic">DEADARM</div>
          <div className="text-sm text-black/80 mt-1">December 22nd, 2025 • Vineyard MEGAPLEX</div>
        </div>

        <div className="text-center text-xs text-gray-500">
          Verified at {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
