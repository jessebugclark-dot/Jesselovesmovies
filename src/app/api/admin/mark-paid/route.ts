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

    // Check if already paid
    if (order.status === 'paid') {
      return NextResponse.json(
        { message: 'Order is already marked as paid' },
        { status: 200 }
      );
    }

    // Update order to paid
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payer_name: 'Manual Admin Override',
      })
      .eq('id', order.id)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Send ticket email
    const emailSent = await sendTicketEmail(updatedOrder);

    if (!emailSent) {
      return NextResponse.json(
        { message: 'Order marked as paid but email failed to send. Use resend option.' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      message: 'Order marked as paid and ticket email sent successfully',
    });
  } catch (error) {
    console.error('Error marking order as paid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
