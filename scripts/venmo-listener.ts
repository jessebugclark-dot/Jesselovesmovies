/**
 * Venmo Payment Email Listener
 * 
 * This script monitors an email inbox for Venmo payment receipts,
 * parses the payment information, and calls the webhook to process tickets.
 * 
 * Usage:
 *   npm run listen-venmo
 * 
 * Environment Variables Required:
 *   - IMAP_HOST: IMAP server host (e.g., imap.gmail.com)
 *   - IMAP_PORT: IMAP port (e.g., 993)
 *   - IMAP_USER: Email address to monitor
 *   - IMAP_PASSWORD: Email password or app password
 *   - WEBHOOK_SECRET: Secret token for authenticating with the webhook
 *   - NEXT_PUBLIC_APP_URL: Your app URL (e.g., http://localhost:3000)
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
};

const WEBHOOK_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/venmo-payment-hook`;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

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
    // Venmo subjects typically include "paid you" or "sent you"
    if (!subject.toLowerCase().includes('paid you') && !subject.toLowerCase().includes('sent you')) {
      return null;
    }

    // Extract payer name from subject (e.g., "John Doe paid you")
    const nameMatch = subject.match(/^(.+?)\s+(paid|sent)\s+you/i);
    const payerName = nameMatch ? nameMatch[1].trim() : 'Unknown';

    // Extract amount - look for dollar amounts in the body
    // Venmo typically formats as "$XX.XX" or "$X,XXX.XX"
    const amountMatch = bodyContent.match(/\$([0-9,]+\.[0-9]{2})/);
    const amountStr = amountMatch ? amountMatch[1].replace(/,/g, '') : '0';
    const amount = parseFloat(amountStr);

    // Extract payment note - this is where the order code should be
    // Venmo notes typically appear in quotes or after "For" or "Note:"
    let paymentNote = '';
    
    // Try different patterns to extract the note
    const notePatterns = [
      /[Ff]or[:\s]+"([^"]+)"/,
      /[Nn]ote[:\s]+"([^"]+)"/,
      /[Mm]essage[:\s]+"([^"]+)"/,
      /"([^"]*FF24[^"]*)"/i, // Look for our order code format
    ];

    for (const pattern of notePatterns) {
      const match = bodyContent.match(pattern);
      if (match && match[1]) {
        paymentNote = match[1].trim();
        break;
      }
    }

    // Extract order code from the note (format: FF24-XXXXXX)
    const orderCodeMatch = paymentNote.match(/FF24-[A-Z0-9]{6}/i);
    if (!orderCodeMatch) {
      console.log('No valid order code found in payment note:', paymentNote);
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
    console.error('Error parsing Venmo email:', error);
    return null;
  }
}

/**
 * Call the webhook to process the payment
 */
async function processPayment(payment: VenmoPayment): Promise<boolean> {
  try {
    console.log('Processing payment:', payment);

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
      console.error('Webhook error:', data);
      return false;
    }

    console.log('Payment processed successfully:', data);
    return true;
  } catch (error) {
    console.error('Error calling webhook:', error);
    return false;
  }
}

/**
 * Process a single email message
 */
function processMessage(msg: any, seqno: number) {
  const parser = simpleParser(msg);
  
  parser.then(async (mail: ParsedMail) => {
    console.log(`Processing email #${seqno}: ${mail.subject}`);
    
    const payment = parseVenmoEmail(mail);
    if (payment) {
      console.log('Found Venmo payment:', payment.orderCode);
      await processPayment(payment);
    }
  }).catch((err: Error) => {
    console.error('Error parsing message:', err);
  });
}

/**
 * Main listener function
 */
function startListener() {
  console.log('Starting Venmo payment listener...');
  console.log(`Monitoring: ${imapConfig.user}`);
  console.log(`Webhook URL: ${WEBHOOK_URL}`);

  if (!imapConfig.user || !imapConfig.password) {
    console.error('ERROR: IMAP_USER and IMAP_PASSWORD must be set in .env file');
    process.exit(1);
  }

  if (!WEBHOOK_SECRET) {
    console.error('ERROR: WEBHOOK_SECRET must be set in .env file');
    process.exit(1);
  }

  const imap = new Imap(imapConfig);

  imap.once('ready', () => {
    console.log('Connected to IMAP server');

    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('Error opening inbox:', err);
        return;
      }

      console.log('Inbox opened. Listening for new emails...');
      console.log('Press Ctrl+C to stop');

      // Process existing unread emails on startup
      imap.search(['UNSEEN', ['FROM', 'venmo.com']], (err, results) => {
        if (err) {
          console.error('Error searching for emails:', err);
          return;
        }

        if (results.length > 0) {
          console.log(`Found ${results.length} unread Venmo emails`);
          const fetch = imap.fetch(results, { bodies: '', markSeen: true });

          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream) => {
              processMessage(stream, seqno);
            });
          });

          fetch.once('error', (err) => {
            console.error('Fetch error:', err);
          });
        } else {
          console.log('No unread Venmo emails found');
        }
      });

      // Listen for new incoming emails
      imap.on('mail', (numNewMsgs: number) => {
        console.log(`New mail detected: ${numNewMsgs} message(s)`);
        
        // Search for new unread Venmo emails
        imap.search(['UNSEEN', ['FROM', 'venmo.com']], (err, results) => {
          if (err || results.length === 0) return;

          const fetch = imap.fetch(results, { bodies: '', markSeen: true });

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
    console.error('IMAP error:', err);
  });

  imap.once('end', () => {
    console.log('Connection ended');
  });

  imap.connect();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down listener...');
    imap.end();
    process.exit(0);
  });
}

// Start the listener
startListener();

