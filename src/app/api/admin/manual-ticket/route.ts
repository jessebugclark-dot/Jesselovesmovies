import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendTicketEmail } from '@/lib/email';
import { generateOrderCode } from '@/lib/order-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, numTickets, showTime, name } = body;

    if (!email || !numTickets) {
      return NextResponse.json(
        { error: 'Email and number of tickets are required' },
        { status: 400 }
      );
    }

    if (numTickets < 1 || numTickets > 10) {
      return NextResponse.json(
        { error: 'Number of tickets must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Generate a unique order code
    const orderCode = generateOrderCode();
    const ticketPrice = 10;
    const totalAmount = numTickets * ticketPrice;

    // Create the order in database (marked as paid)
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        order_code: orderCode,
        name: name || 'Manual Entry',
        email: email,
        num_tickets: numTickets,
        total_amount: totalAmount,
        show_time: showTime || '7PM',
        status: 'paid',
        paid_at: new Date().toISOString(),
        payer_name: 'Manual Admin Entry',
        payment_note: 'Manually sent by admin',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating order:', insertError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Send ticket email
    const emailSent = await sendTicketEmail(order);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Order created but failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Tickets sent successfully to ${email}`,
      orderCode: orderCode,
    });
  } catch (error) {
    console.error('Error sending manual ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
