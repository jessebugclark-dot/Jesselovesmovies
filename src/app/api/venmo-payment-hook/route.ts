import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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
    const order = await prisma.order.findUnique({
      where: { orderCode },
    });

    if (!order) {
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
      const expectedAmount = order.totalAmount;
      const receivedAmount = parseFloat(amount);
      
      // Allow small rounding differences (within 1 cent)
      if (Math.abs(receivedAmount - expectedAmount) > 0.01) {
        console.warn(`Amount mismatch for order ${orderCode}: expected ${expectedAmount}, received ${receivedAmount}`);
        
        // Flag for manual review but don't auto-process
        await prisma.order.update({
          where: { id: order.id },
          data: {
            payerName,
            paymentNote: paymentNote || `AMOUNT MISMATCH: Received $${receivedAmount}`,
          },
        });

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
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        payerName,
        paymentNote,
      },
    });

    // Send ticket email
    const emailSent = await sendTicketEmail(updatedOrder);

    if (!emailSent) {
      console.error(`Failed to send ticket email for order ${orderCode}`);
      // Order is still marked as paid, but email failed
      return NextResponse.json(
        { 
          message: 'Order marked as paid but email failed to send',
          orderCode: updatedOrder.orderCode,
          emailSent: false,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      message: 'Payment processed and ticket sent',
      orderCode: updatedOrder.orderCode,
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

