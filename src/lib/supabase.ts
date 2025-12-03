import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database
export type Order = {
  id: string;
  order_code: string;
  name: string;
  email: string;
  num_tickets: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  payer_name: string | null;
  payment_note: string | null;
};

export type OrderInsert = Omit<Order, 'id' | 'created_at' | 'updated_at'>;

