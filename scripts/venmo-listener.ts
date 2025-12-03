/**
 * Venmo Payment Email Listener
 * 
 * This script monitors an email inbox for Venmo payment receipts,
 * parses the payment information, and calls the webhook to process tickets.
 * 
 * Designed to run on Railway.app as a long-running process.
 * 
 * Environment Variables Required:
 *   - IMAP_HOST: IMAP server host (e.g., imap.gmail.com)
 *   - IMAP_PORT: IMAP port (e.g., 993)
 *   - IMAP_USER: Email address to monitor
 *   - IMAP_PASSWORD: Email password or app password
 *   - WEBHOOK_SECRET: Secret token for authenticating with the webhook
 *   - NEXT_PUBLIC_APP_URL: Your app URL (e.g., https://your-app.vercel.app)
 */

import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const imapConfig = {
  user: process.env.IMAP_USER || '',
  password: process.env.IMAP_PASSWORD || '',
  host: process.env.IMAP_HOST || 'imap.gmail.com',
  port: parseInt(process.env.IMAP_PORT || '993'),
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  keepalive: {
    interval: 10000,
    idleInterval: 300000,
    forceNoop: true
  }
};

const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/venmo-payment-hook`;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// Reconnection settings
const RECONNECT_DELAY = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 10;
let reconnectAttempts = 0;
let imap: Imap | null = null;

interface VenmoPayment {
  orderCode: string;
  amount: number;
  payerName: string;
  paymentNote: string;
}

/**
 * Parse Venmo receipt email to extract payment information
 */
function parseVenmoEmail(mail: ParsedMail): VenmoPayment | null {
  try {
    // Venmo emails typically come from venmo@venmo.com
    const fromAddress = mail.from?.text || '';
    if (!fromAddress.includes('venmo.com')) {
      return null;
    }

    const subject = mail.subject || '';
    const textBody = mail.text || '';
    const htmlBody = mail.html || '';
    const bodyContent = htmlBody ? htmlBody.toString() : textBody;

    // Check if this is a payment received notification
    if (!subject.toLowerCase().includes('paid you') && !subject.toLowerCase().includes('sent you')) {
      return null;
    }

    // Extract payer name from subject
    const nameMatch = subject.match(/^(.+?)\s+(paid|sent)\s+you/i);
    const payerName = nameMatch ? nameMatch[1].trim() : 'Unknown';

    // Extract amount
    const amountMatch = bodyContent.match(/\$([0-9,]+\.[0-9]{2})/);
    const amountStr = amountMatch ? amountMatch[1].replace(/,/g, '') : '0';
    const amount = parseFloat(amountStr);

    // Extract payment note
    let paymentNote = '';
    const notePatterns = [
      /[Ff]or[:\s]+"([^"]+)"/,
      /[Nn]ote[:\s]+"([^"]+)"/,
      /[Mm]essage[:\s]+"([^"]+)"/,
      /"([^"]*DA25[^"]*)"/i,
    ];

    for (const pattern of notePatterns) {
      const match = bodyContent.match(pattern);
      if (match && match[1]) {
        paymentNote = match[1].trim();
        break;
      }
    }

    // Extract order code (format: DA25-XXXXXX)
    const orderCodeMatch = paymentNote.match(/DA25-[A-Z0-9]{6}/i);
    if (!orderCodeMatch) {
      console.log('[SKIP] No valid order code found in payment note:', paymentNote);
      return null;
    }

    const orderCode = orderCodeMatch[0].toUpperCase();

    return {
      orderCode,
      amount,
      payerName,
      paymentNote,
    };
  } catch (error) {
    console.error('[ERROR] Parsing Venmo email:', error);
    return null;
  }
}

/**
 * Call the webhook to process the payment
 */
async function processPayment(payment: VenmoPayment): Promise<boolean> {
  try {
    console.log('[PROCESS] Payment:', payment.orderCode, '$' + payment.amount);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify(payment),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[ERROR] Webhook response:', data);
      return false;
    }

    console.log('[SUCCESS] Payment processed:', data);
    return true;
  } catch (error) {
    console.error('[ERROR] Calling webhook:', error);
    return false;
  }
}

/**
 * Process a single email message
 */
function processMessage(msg: any, seqno: number) {
  const parser = simpleParser(msg);
  
  parser.then(async (mail: ParsedMail) => {
    console.log(`[EMAIL] #${seqno}: ${mail.subject}`);
    
    const payment = parseVenmoEmail(mail);
    if (payment) {
      console.log('[FOUND] Venmo payment:', payment.orderCode);
      await processPayment(payment);
    }
  }).catch((err: Error) => {
    console.error('[ERROR] Parsing message:', err);
  });
}

/**
 * Connect to IMAP and start listening
 */
function connect() {
  console.log('[INFO] Connecting to IMAP server...');
  console.log(`[INFO] Monitoring: ${imapConfig.user}`);
  console.log(`[INFO] Webhook: ${WEBHOOK_URL}`);

  imap = new Imap(imapConfig);

  imap.once('ready', () => {
    console.log('[CONNECTED] IMAP server ready');
    reconnectAttempts = 0; // Reset on successful connection

    imap!.openBox('INBOX', false, (err) => {
      if (err) {
        console.error('[ERROR] Opening inbox:', err);
        scheduleReconnect();
        return;
      }

      console.log('[READY] Inbox opened. Listening for new emails...');
      console.log('[INFO] Server started at', new Date().toISOString());

      // Process existing unread emails on startup
      imap!.search(['UNSEEN', ['FROM', 'venmo.com']], (err, results) => {
        if (err) {
          console.error('[ERROR] Searching emails:', err);
          return;
        }

        if (results.length > 0) {
          console.log(`[INFO] Found ${results.length} unread Venmo emails`);
          const fetch = imap!.fetch(results, { bodies: '', markSeen: true });

          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream) => {
              processMessage(stream, seqno);
            });
          });

          fetch.once('error', (err) => {
            console.error('[ERROR] Fetch:', err);
          });
        } else {
          console.log('[INFO] No unread Venmo emails found');
        }
      });

      // Listen for new incoming emails
      imap!.on('mail', (numNewMsgs: number) => {
        console.log(`[NEW MAIL] ${numNewMsgs} message(s) received`);
        
        imap!.search(['UNSEEN', ['FROM', 'venmo.com']], (err, results) => {
          if (err || results.length === 0) return;

          const fetch = imap!.fetch(results, { bodies: '', markSeen: true });

          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream) => {
              processMessage(stream, seqno);
            });
          });
        });
      });
    });
  });

  imap.once('error', (err: Error) => {
    console.error('[ERROR] IMAP:', err.message);
    scheduleReconnect();
  });

  imap.once('end', () => {
    console.log('[DISCONNECTED] Connection ended');
    scheduleReconnect();
  });

  imap.once('close', () => {
    console.log('[CLOSED] Connection closed');
    scheduleReconnect();
  });

  imap.connect();
}

/**
 * Schedule a reconnection attempt
 */
function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('[FATAL] Max reconnection attempts reached. Exiting...');
    process.exit(1);
  }

  reconnectAttempts++;
  const delay = RECONNECT_DELAY * reconnectAttempts;
  console.log(`[RECONNECT] Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay/1000}s...`);
  
  setTimeout(() => {
    if (imap) {
      try {
        imap.destroy();
      } catch (e) {
        // Ignore
      }
    }
    connect();
  }, delay);
}

/**
 * Main entry point
 */
function main() {
  console.log('========================================');
  console.log('   DEADARM Venmo Payment Listener');
  console.log('========================================');
  console.log('');

  if (!imapConfig.user || !imapConfig.password) {
    console.error('[FATAL] IMAP_USER and IMAP_PASSWORD must be set');
    process.exit(1);
  }

  if (!WEBHOOK_SECRET) {
    console.error('[FATAL] WEBHOOK_SECRET must be set');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.warn('[WARN] NEXT_PUBLIC_APP_URL not set, using localhost');
  }

  connect();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[SHUTDOWN] Received SIGINT...');
    if (imap) {
      imap.end();
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n[SHUTDOWN] Received SIGTERM...');
    if (imap) {
      imap.end();
    }
    process.exit(0);
  });

  // Keep alive log every 5 minutes
  setInterval(() => {
    console.log('[HEARTBEAT]', new Date().toISOString(), '- Listener active');
  }, 5 * 60 * 1000);
}

// Start the listener
main();
