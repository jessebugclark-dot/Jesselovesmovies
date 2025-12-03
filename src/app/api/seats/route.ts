import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SEATS_PER_SHOWTIME = 220;
const SHOWTIMES = ['7PM-8PM', '8PM-9PM'];

export async function GET() {
  try {
    const now = new Date().toISOString();
    
    // Get all active orders (paid or pending with valid reservation)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('num_tickets, show_time, status, reserved_until')
      .or(`status.eq.paid,and(status.eq.pending,reserved_until.gt.${now})`);

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch seat availability' },
        { status: 500 }
      );
    }

    // Calculate available seats per showtime
    const seatsByShowtime: Record<string, { total: number; reserved: number; available: number }> = {};
    
    for (const showtime of SHOWTIMES) {
      const reserved = orders
        ?.filter(o => o.show_time === showtime)
        .reduce((sum, o) => sum + o.num_tickets, 0) || 0;
      
      seatsByShowtime[showtime] = {
        total: SEATS_PER_SHOWTIME,
        reserved,
        available: Math.max(0, SEATS_PER_SHOWTIME - reserved),
      };
    }

    return NextResponse.json({
      seats: seatsByShowtime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

