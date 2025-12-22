import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Check if already cancelled
    if (order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Order is already cancelled' },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('order_code', orderCode);

    if (updateError) {
      console.error('Error cancelling order:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Order ${orderCode} has been cancelled`,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
