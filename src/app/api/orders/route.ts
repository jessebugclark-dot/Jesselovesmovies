import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateOrderCode, calculateTotalAmount } from '@/lib/order-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, numTickets } = body;

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
      const existing = await prisma.order.findUnique({
        where: { orderCode },
      });
      if (!existing) break;
      orderCode = generateOrderCode();
      attempts++;
    }

    const totalAmount = calculateTotalAmount(numTickets);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderCode,
        name,
        email,
        numTickets,
        totalAmount,
        status: 'pending',
      },
    });

    const venmoHandle = process.env.VENMO_HANDLE || '@YourVenmoHandle';
    const venmoNote = `FF24 ${orderCode} ${email}`;

    return NextResponse.json({
      orderCode: order.orderCode,
      name: order.name,
      email: order.email,
      numTickets: order.numTickets,
      totalAmount: order.totalAmount,
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

