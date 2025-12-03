/**
 * Generate a unique order code
 * Format: FF24-XXXXXX (FF = Film Festival, 24 = year, XXXXXX = random alphanumeric)
 */
export function generateOrderCode(): string {
  const prefix = 'FF24';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

/**
 * Convert camelCase to snake_case for Supabase
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Calculate total amount based on number of tickets
 * One ticket gives access to all 3 movies at the festival
 */
export function calculateTotalAmount(numTickets: number): number {
  const ticketPrice = parseFloat(process.env.TICKET_PRICE || '10.00');
  return numTickets * ticketPrice;
}

/**
 * Festival movies information
 * One ticket admits to all three screenings
 */
export const FESTIVAL_MOVIES = [
  { id: 'premiere', name: 'The Featured Premiere', showtime: 'Saturday 7:00 PM', isPremiere: true },
  { id: 'classic', name: 'Classic Cinema Night', showtime: 'Saturday 9:30 PM', isPremiere: false },
  { id: 'indie', name: 'Independent Spotlight', showtime: 'Sunday 5:00 PM', isPremiere: false },
] as const;

