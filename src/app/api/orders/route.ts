import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOrderCode, calculateTotalAmount } from '@/lib/order-utils';

const SEATS_PER_SHOWTIME = 220;
const RESERVATION_MINUTES = 5;

// Get available seats for a showtime
async function getAvailableSeats(showTime: string): Promise<number> {
  const now = new Date().toISOString();
  
  // Count seats from:
  // 1. Paid orders
  // 2. Pending orders with valid reservation (not expired)
  const { data: orders, error } = await supabase
    .from('orders')
    .select('num_tickets, status, reserved_until')
    .eq('show_time', showTime)
    .or(`status.eq.paid,and(status.eq.pending,reserved_until.gt.${now})`);

  if (error) {
    console.error('Error fetching orders:', error);
    return 0;
  }

  const reservedSeats = orders?.reduce((sum, order) => sum + order.num_tickets, 0) || 0;
  return Math.max(0, SEATS_PER_SHOWTIME - reservedSeats);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, numTickets, showTime = '7PM-8PM' } = body;

    // Validation
    if (!email || !numTickets) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (numTickets < 1 || numTickets > 10) {
      return NextResponse.json(
        { error: 'Number of tickets must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Validate show time
    if (!['7PM-8PM', '8PM-9PM'].includes(showTime)) {
      return NextResponse.json(
        { error: 'Invalid show time' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check available seats
    const availableSeats = await getAvailableSeats(showTime);
    if (availableSeats < numTickets) {
      return NextResponse.json(
        { 
          error: availableSeats === 0 
            ? 'This showtime is sold out' 
            : `Only ${availableSeats} seats remaining for this showtime`,
          availableSeats 
        },
        { status: 400 }
      );
    }

    // Generate unique order code
    let orderCode = generateOrderCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('order_code', orderCode)
        .single();
      if (!existing) break;
      orderCode = generateOrderCode();
      attempts++;
    }

    const totalAmount = calculateTotalAmount(numTickets);
    
    // Set reservation expiry (5 minutes from now)
    const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000).toISOString();

    // Create order (use email as name for backwards compatibility)
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        name: email,
        email,
        num_tickets: numTickets,
        total_amount: totalAmount,
        show_time: showTime,
        status: 'pending',
        reserved_until: reservedUntil,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const venmoHandle = process.env.VENMO_HANDLE || '@Jesse-Clark-39';
    const venmoNote = `DA25 ${order.order_code} ${showTime} ${email}`;

    // Get updated available seats
    const remainingSeats = await getAvailableSeats(showTime);

    return NextResponse.json({
      orderCode: order.order_code,
      email: order.email,
      numTickets: order.num_tickets,
      totalAmount: order.total_amount,
      showTime: order.show_time || showTime,
      venmoHandle,
      venmoNote,
      reservedUntil,
      remainingSeats,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
