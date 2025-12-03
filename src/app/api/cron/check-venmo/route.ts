import { NextRequest, NextResponse } from 'next/server';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { supabase } from '@/lib/supabase';
import { sendTicketEmail } from '@/lib/email';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

interface VenmoPayment {
  orderCode: string;
  amount: number;
  payerName: string;
  paymentNote: string;
}

function parseVenmoEmail(subject: string, body: string): VenmoPayment | null {
  try {
    // Check if this is a payment received notification
    if (!subject.toLowerCase().includes('paid you') && !subject.toLowerCase().includes('sent you')) {
      return null;
    }

    // Extract payer name from subject
    const nameMatch = subject.match(/^(.+?)\s+(paid|sent)\s+you/i);
    const payerName = nameMatch ? nameMatch[1].trim() : 'Unknown';

    // Extract amount
    const amountMatch = body.match(/\$([0-9,]+\.[0-9]{2})/);
    const amountStr = amountMatch ? amountMatch[1].replace(/,/g, '') : '0';
    const amount = parseFloat(amountStr);

    // Extract order code (format: DA25-XXXXXX)
    const orderCodeMatch = body.match(/DA25-[A-Z0-9]{6}/i);
    if (!orderCodeMatch) {
      console.log('No valid order code found in payment');
      return null;
    }

    const orderCode = orderCodeMatch[0].toUpperCase();

    return {
      orderCode,
      amount,
      payerName,
      paymentNote: body.substring(0, 200),
    };
  } catch (error) {
    console.error('Error parsing Venmo email:', error);
    return null;
  }
}

async function processPayment(payment: VenmoPayment): Promise<boolean> {
  try {
    // Find the order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', payment.orderCode)
      .single();

    if (fetchError || !order) {
      console.log('Order not found:', payment.orderCode);
      return false;
    }

    // Check if already paid
    if (order.status === 'paid') {
      console.log('Order already paid:', payment.orderCode);
      return true;
    }

    // Validate amount (allow small rounding differences)
    if (Math.abs(payment.amount - order.total_amount) > 0.01) {
      console.warn(`Amount mismatch for ${payment.orderCode}: expected ${order.total_amount}, got ${payment.amount}`);
      // Still process but log the mismatch
    }

    // Update order to paid
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payer_name: payment.payerName,
      })
      .eq('id', order.id)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error('Error updating order:', updateError);
      return false;
    }

    // Send ticket email
    const emailSent = await sendTicketEmail(updatedOrder);
    console.log(`Order ${payment.orderCode} processed, email sent: ${emailSent}`);
    
    return true;
  } catch (error) {
    console.error('Error processing payment:', error);
    return false;
  }
}

async function checkEmails(): Promise<{ processed: number; errors: number }> {
  return new Promise((resolve) => {
    const results = { processed: 0, errors: 0 };

    const imapConfig = {
      user: process.env.IMAP_USER || '',
      password: process.env.IMAP_PASSWORD || '',
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 10000,
      authTimeout: 10000,
    };

    if (!imapConfig.user || !imapConfig.password) {
      console.error('IMAP credentials not configured');
      resolve(results);
      return;
    }

    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err) => {
        if (err) {
          console.error('Error opening inbox:', err);
          imap.end();
          resolve(results);
          return;
        }

        // Search for unread Venmo emails
        imap.search(['UNSEEN', ['FROM', 'venmo.com']], (searchErr, uids) => {
          if (searchErr || !uids || uids.length === 0) {
            console.log('No new Venmo emails found');
            imap.end();
            resolve(results);
            return;
          }

          console.log(`Found ${uids.length} unread Venmo emails`);

          const fetch = imap.fetch(uids, { bodies: '', markSeen: true });
          const emailPromises: Promise<void>[] = [];

          fetch.on('message', (msg) => {
            const emailPromise = new Promise<void>((resolveEmail) => {
              msg.on('body', (stream) => {
                simpleParser(stream, async (parseErr, mail) => {
                  if (parseErr) {
                    results.errors++;
                    resolveEmail();
                    return;
                  }

                  const subject = mail.subject || '';
                  const body = mail.text || mail.html?.toString() || '';

                  const payment = parseVenmoEmail(subject, body);
                  if (payment) {
                    const success = await processPayment(payment);
                    if (success) {
                      results.processed++;
                    } else {
                      results.errors++;
                    }
                  }
                  resolveEmail();
                });
              });
            });
            emailPromises.push(emailPromise);
          });

          fetch.once('end', async () => {
            await Promise.all(emailPromises);
            imap.end();
            resolve(results);
          });

          fetch.once('error', (fetchErr) => {
            console.error('Fetch error:', fetchErr);
            imap.end();
            resolve(results);
          });
        });
      });
    });

    imap.once('error', (imapErr: Error) => {
      console.error('IMAP error:', imapErr);
      resolve(results);
    });

    imap.connect();

    // Timeout after 25 seconds (Vercel has 60s limit, leave buffer)
    setTimeout(() => {
      try {
        imap.end();
      } catch (e) {
        // Ignore
      }
      resolve(results);
    }, 25000);
  });
}

// Mark expired reservations
async function expireOldReservations(): Promise<number> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('reserved_until', now)
    .select('id');

  if (error) {
    console.error('Error expiring reservations:', error);
    return 0;
  }

  return data?.length || 0;
}

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Cron job started: checking for Venmo payments...');

  try {
    // First, expire old reservations
    const expiredCount = await expireOldReservations();
    if (expiredCount > 0) {
      console.log(`Expired ${expiredCount} old reservations`);
    }

    // Then check for payments
    const results = await checkEmails();
    
    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} payments, ${results.errors} errors, ${expiredCount} expired`,
      ...results,
      expiredReservations: expiredCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

