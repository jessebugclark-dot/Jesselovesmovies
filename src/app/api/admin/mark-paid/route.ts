import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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
        { message: 'Order is already marked as paid' },
        { status: 200 }
      );
    }

    // Update order to paid
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        payerName: 'Manual Admin Override',
      },
    });

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

