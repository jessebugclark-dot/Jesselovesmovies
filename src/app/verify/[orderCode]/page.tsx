import { prisma } from '@/lib/db';
import { FESTIVAL_MOVIES } from '@/lib/order-utils';

type Props = {
  params: Promise<{ orderCode: string }>;
};

export default async function VerifyTicketPage({ params }: Props) {
  const { orderCode } = await params;
  
  const order = await prisma.order.findUnique({
    where: { orderCode: orderCode.toUpperCase() },
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4">
        <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Ticket</h1>
          <p className="text-gray-400">Order code not found: {orderCode}</p>
        </div>
      </div>
    );
  }

  if (order.status !== 'paid') {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4">
        <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Pending</h1>
          <p className="text-gray-400 mb-4">
            This ticket has not been paid for yet.
          </p>
          <p className="text-sm text-gray-500">Order: {order.orderCode}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#212121] flex items-center justify-center px-4 py-8">
      <div className="bg-[#2a2a2a] border border-white/20 rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-green-500 mb-2">Valid Ticket</h1>
          <p className="text-gray-300">This ticket is confirmed and paid</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Order Code</div>
              <div className="font-mono font-bold text-lg text-white">{order.orderCode}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Ticket Holder</div>
              <div className="font-semibold text-white">{order.name}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Number of Tickets</div>
              <div className="font-semibold text-white">{order.numTickets}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Amount Paid</div>
              <div className="font-semibold text-green-500">${order.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h2 className="font-semibold text-white mb-4">Festival Access</h2>
          <div className="space-y-3">
            {FESTIVAL_MOVIES.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-lg p-3"
              >
                <div>
                  <div className="font-medium text-white">{movie.name}</div>
                  {movie.isPremiere && (
                    <span className="text-xs text-amber-500 font-semibold">★ PREMIERE</span>
                  )}
                </div>
                <div className="text-sm text-gray-400">{movie.showtime}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Verified at {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}

