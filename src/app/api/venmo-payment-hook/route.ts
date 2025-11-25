import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendTicketEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderCode, amount, payerName, paymentNote } = body;

    // Validation
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
        { 
          message: 'Order already marked as paid',
          alreadyPaid: true,
        },
        { status: 200 }
      );
    }

    // Validate amount if provided
    if (amount !== undefined) {
      const expectedAmount = order.total_amount;
      const receivedAmount = parseFloat(amount);
      
      // Allow small rounding differences (within 1 cent)
      if (Math.abs(receivedAmount - expectedAmount) > 0.01) {
        console.warn(`Amount mismatch for order ${orderCode}: expected ${expectedAmount}, received ${receivedAmount}`);
        
        // Flag for manual review but don't auto-process
        await supabase
          .from('orders')
          .update({
            payer_name: payerName,
            payment_note: paymentNote || `AMOUNT MISMATCH: Received $${receivedAmount}`,
          })
          .eq('id', order.id);

        return NextResponse.json(
          { 
            error: 'Amount mismatch - flagged for manual review',
            expected: expectedAmount,
            received: receivedAmount,
          },
          { status: 400 }
        );
      }
    }

    // Update order to paid
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payer_name: payerName,
        payment_note: paymentNote,
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
      console.error(`Failed to send ticket email for order ${orderCode}`);
      // Order is still marked as paid, but email failed
      return NextResponse.json(
        { 
          message: 'Order marked as paid but email failed to send',
          orderCode: updatedOrder.order_code,
          emailSent: false,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      message: 'Payment processed and ticket sent',
      orderCode: updatedOrder.order_code,
      emailSent: true,
    });
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
