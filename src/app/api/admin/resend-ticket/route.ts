import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendTicketEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderCode } = body;

    if (!orderCode) {
      return NextResponse.json(
        { error: 'Order code is required' },
        { status: 400 }
      );
    }

    // Find the order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', orderCode)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is paid
    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Can only resend tickets for paid orders' },
        { status: 400 }
      );
    }

    // Send ticket email
    const emailSent = await sendTicketEmail(order);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send ticket email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Ticket email resent successfully',
    });
  } catch (error) {
    console.error('Error resending ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
