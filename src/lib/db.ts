import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type Order = {
  id: string;
  orderCode: string;
  name: string;
  email: string;
  numTickets: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  payerName: string | null;
  paymentNote: string | null;
};

