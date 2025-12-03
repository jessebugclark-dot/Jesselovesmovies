import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOrderCode, calculateTotalAmount } from '@/lib/order-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, numTickets, showTime = '7PM' } = body;

    // Validation
    if (!name || !email || !numTickets) {
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
    if (!['7PM', '9PM'].includes(showTime)) {
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

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        name,
        email,
        num_tickets: numTickets,
        total_amount: totalAmount,
        show_time: showTime,
        status: 'pending',
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

    const venmoHandle = process.env.VENMO_HANDLE || '@jesse-clark-39';
    const venmoNote = `DA25 ${order.order_code} ${showTime} ${email}`;

    return NextResponse.json({
      orderCode: order.order_code,
      name: order.name,
      email: order.email,
      numTickets: order.num_tickets,
      totalAmount: order.total_amount,
      showTime: order.show_time || showTime,
      venmoHandle,
      venmoNote,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

