import 'dotenv/config';
import Imap from 'imap';
import { simpleParser } from 'mailparser';

console.log('=== IMAP Debug Script ===\n');
console.log('IMAP Configuration:');
console.log('  User:', process.env.IMAP_USER);
console.log('  Host:', process.env.IMAP_HOST || 'imap.gmail.com');
console.log('  Port:', process.env.IMAP_PORT || '993');
console.log('');

const imap = new Imap({
  user: process.env.IMAP_USER || '',
  password: process.env.IMAP_PASSWORD || '',
  host: process.env.IMAP_HOST || 'imap.gmail.com',
  port: parseInt(process.env.IMAP_PORT || '993'),
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

imap.once('ready', () => {
  console.log('✅ Connected to IMAP server\n');
  
  imap.openBox('INBOX', true, (err, box) => {
    if (err) {
      console.error('❌ Error opening inbox:', err);
      imap.end();
      return;
    }

    console.log('📬 Inbox opened');
    console.log('   Total messages:', box.messages.total);
    console.log('   Unread messages:', box.messages.unseen);
    console.log('');

    // Search for ALL Venmo emails (not just unread)
    console.log('🔍 Searching for ALL emails from venmo...\n');
    
    imap.search([['FROM', 'venmo']], (searchErr, allVenmoUids) => {
      if (searchErr) {
        console.error('❌ Search error:', searchErr);
      } else {
        console.log(`Found ${allVenmoUids?.length || 0} total emails from venmo`);
      }

      // Search for UNREAD Venmo emails
      console.log('\n🔍 Searching for UNREAD emails from venmo...\n');
      
      imap.search(['UNSEEN', ['FROM', 'venmo']], (unreadErr, unreadVenmoUids) => {
        if (unreadErr) {
          console.error('❌ Search error:', unreadErr);
          imap.end();
          return;
        }

        console.log(`Found ${unreadVenmoUids?.length || 0} unread emails from venmo`);

        if (!unreadVenmoUids || unreadVenmoUids.length === 0) {
          console.log('\n⚠️  No unread Venmo emails found.');
          console.log('   - Check if the email is already read');
          console.log('   - Check your spam folder');
          console.log('   - Verify Venmo sends notifications to this email');
          
          // Let's also search recent emails to see what's there
          console.log('\n🔍 Fetching 5 most recent unread emails (any sender)...\n');
          
          imap.search(['UNSEEN'], (anyErr, anyUids) => {
            if (anyErr || !anyUids || anyUids.length === 0) {
              console.log('No unread emails at all.');
              imap.end();
              return;
            }

            const recentUids = anyUids.slice(-5);
            const fetch = imap.fetch(recentUids, { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)'], struct: true });
            
            fetch.on('message', (msg, seqno) => {
              msg.on('body', (stream) => {
                let buffer = '';
                stream.on('data', (chunk) => buffer += chunk.toString());
                stream.on('end', () => {
                  console.log(`--- Email ${seqno} ---`);
                  console.log(buffer.trim());
                  console.log('');
                });
              });
            });

            fetch.once('end', () => {
              console.log('--- End of recent emails ---');
              imap.end();
            });
          });
          return;
        }

        // Fetch the unread Venmo emails
        console.log('\n📧 Fetching unread Venmo emails...\n');
        
        const fetch = imap.fetch(unreadVenmoUids, { bodies: '' });
        
        fetch.on('message', (msg, seqno) => {
          msg.on('body', (stream) => {
            simpleParser(stream as any, (parseErr, mail) => {
              if (parseErr) {
                console.error('Parse error:', parseErr);
                return;
              }

              console.log(`--- Venmo Email ${seqno} ---`);
              console.log('From:', mail.from?.text);
              console.log('Subject:', mail.subject);
              console.log('Date:', mail.date);
              
              // Check for order code
              const body = mail.text || '';
              const orderCodeMatch = body.match(/DA25-[A-Z0-9]{6}/i);
              console.log('Order code found:', orderCodeMatch ? orderCodeMatch[0] : 'NONE');
              
              // Check for amount
              const amountMatch = body.match(/\$([0-9,]+\.[0-9]{2})/);
              console.log('Amount found:', amountMatch ? amountMatch[0] : 'NONE');
              
              console.log('');
            });
          });
        });

        fetch.once('end', () => {
          imap.end();
        });
      });
    });
  });
});

imap.once('error', (err: Error) => {
  console.error('❌ IMAP connection error:', err.message);
});

imap.once('end', () => {
  console.log('\n✅ IMAP connection closed');
});

console.log('Connecting to IMAP server...\n');
imap.connect();

