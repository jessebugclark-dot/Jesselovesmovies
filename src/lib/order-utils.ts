/**
 * Generate a unique order code
 * Format: DA25-XXXXXX (DA = DEADARM, 25 = year, XXXXXX = random alphanumeric)
 */
export function generateOrderCode(): string {
  const prefix = 'DA25';
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
 */
export function calculateTotalAmount(numTickets: number): number {
  const ticketPrice = parseFloat(process.env.TICKET_PRICE || '10.00');
  return numTickets * ticketPrice;
}
