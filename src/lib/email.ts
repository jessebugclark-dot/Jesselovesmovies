import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { Order } from './supabase';

// Create reusable transporter
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Generate QR code for ticket
 */
async function generateTicketQR(orderCode: string): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const qrData = `${appUrl}/verify/${orderCode}`;
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

/**
 * Generate HTML email template for ticket confirmation
 */
async function generateTicketEmailHTML(order: Order): Promise<string> {
  const qrCode = await generateTicketQR(order.order_code);
  const showTime = order.show_time || '7PM';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your DEADARM Tickets</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); color: white; padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center; border: 1px solid #333; border-bottom: none;">
          <h1 style="margin: 0 0 10px 0; font-size: 36px; font-style: italic; letter-spacing: 2px;">DEADARM</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.7; text-transform: uppercase; letter-spacing: 3px;">Your Tickets Are Ready</p>
        </div>

        <!-- Content -->
        <div style="background-color: #111; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #333; border-top: none;">
          
          <p style="font-size: 16px; color: #ccc; margin-bottom: 20px;">
            Hi <strong style="color: white;">${order.name}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #999; margin-bottom: 30px;">
            Thank you for your purchase! Your payment has been confirmed and your tickets are ready.
          </p>

          <!-- Ticket Details -->
          <div style="background-color: #1a1a1a; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #333;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">Ticket Code</div>
              <div style="font-size: 28px; font-weight: bold; color: white; font-family: monospace;">${order.order_code}</div>
            </div>
            
            ${qrCode ? `
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${qrCode}" alt="Ticket QR Code" style="max-width: 180px; height: auto; border-radius: 8px;" />
                <div style="font-size: 11px; color: #666; margin-top: 10px;">Scan at entrance</div>
              </div>
            ` : ''}
            
            <div style="border-top: 1px solid #333; padding-top: 20px; margin-top: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Ticket Holder</td>
                  <td style="color: white; padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${order.name}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Number of Tickets</td>
                  <td style="color: white; padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${order.num_tickets}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Show Time</td>
                  <td style="color: #d4a84b; padding: 8px 0; text-align: right; font-weight: bold; font-size: 16px;">${showTime}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Total Paid</td>
                  <td style="color: #22c55e; padding: 8px 0; text-align: right; font-weight: bold; font-size: 18px;">$${order.total_amount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Event Details -->
          <div style="background-color: #d4a84b; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <div style="font-size: 12px; color: #000; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; opacity: 0.7;">Screening Date</div>
            <div style="font-size: 24px; font-weight: bold; color: #000;">December 11th, 2025</div>
            <div style="font-size: 16px; color: #000; margin-top: 5px;">Vineyard MEGAPLEX</div>
            <div style="font-size: 20px; font-weight: bold; color: #000; margin-top: 10px;">${showTime}</div>
          </div>

          <!-- Important Information -->
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border-left: 4px solid #d4a84b; margin-bottom: 20px;">
            <h3 style="color: #d4a84b; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">Important Information</h3>
            <ul style="color: #999; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
              <li>Please arrive 15 minutes before showtime</li>
              <li>Present this email (digital or printed) at the entrance</li>
              <li>Your QR code will be scanned for entry</li>
              <li>Seating is first-come, first-served</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Questions? Email us at <a href="mailto:jessbugclark@gmail.com" style="color: #d4a84b;">jessbugclark@gmail.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p style="margin: 0;">© 2025 The Jesse Clark Film Club. All rights reserved.</p>
          <p style="margin: 10px 0 0 0;">See you at the premiere! 🎬</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text version of ticket email
 */
function generateTicketEmailText(order: Order): string {
  const showTime = order.show_time || '7PM';

  return `
DEADARM - YOUR TICKETS

Hi ${order.name},

Thank you for your purchase! Your payment has been confirmed and your tickets are ready.

TICKET DETAILS
--------------
Ticket Code: ${order.order_code}
Ticket Holder: ${order.name}
Number of Tickets: ${order.num_tickets}
Show Time: ${showTime}
Total Paid: $${order.total_amount.toFixed(2)}

EVENT DETAILS
-------------
DEADARM Premiere
December 11th, 2025 at ${showTime}
Vineyard MEGAPLEX

IMPORTANT INFORMATION
---------------------
- Please arrive 15 minutes before showtime
- Present this email (digital or printed) at the entrance
- Seating is first-come, first-served

Questions? Email us at jessbugclark@gmail.com

See you at the premiere!

© 2025 The Jesse Clark Film Club. All rights reserved.
  `.trim();
}

/**
 * Send ticket confirmation email
 */
export async function sendTicketEmail(order: Order): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const htmlContent = await generateTicketEmailHTML(order);
    const textContent = generateTicketEmailText(order);

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"DEADARM Tickets" <noreply@deadarm.com>',
      to: order.email,
      subject: `Your DEADARM Tickets - Order ${order.order_code}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('Ticket email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending ticket email:', error);
    return false;
  }
}

/**
 * Send test email to verify configuration
 */
export async function sendTestEmail(toEmail: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"DEADARM Tickets" <noreply@deadarm.com>',
      to: toEmail,
      subject: 'Test Email - DEADARM Ticketing System',
      text: 'This is a test email from your DEADARM ticketing system. If you received this, your email configuration is working correctly!',
      html: '<p>This is a test email from your DEADARM ticketing system.</p><p>If you received this, your email configuration is working correctly!</p>',
    });

    console.log('Test email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}
