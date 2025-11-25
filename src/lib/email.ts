import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { Order } from './supabase';
import { FESTIVAL_MOVIES } from './order-utils';

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
  
  const moviesHtml = FESTIVAL_MOVIES.map(movie => `
    <div style="margin-bottom: 20px; padding: 15px; background-color: ${movie.isPremiere ? '#FEF3C7' : '#F3F4F6'}; border-radius: 8px; border-left: 4px solid ${movie.isPremiere ? '#F59E0B' : '#6B7280'};">
      ${movie.isPremiere ? '<div style="color: #F59E0B; font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 5px;">★ PREMIERE EVENT ★</div>' : ''}
      <div style="font-weight: bold; font-size: 18px; color: #111827; margin-bottom: 5px;">${movie.name}</div>
      <div style="color: #4B5563; font-size: 14px;">${movie.showtime}</div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Film Festival Tickets</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F9FAFB;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1F2937 0%, #111827 100%); color: white; padding: 40px 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0 0 10px 0; font-size: 32px;">Film Festival 2024</h1>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Your Tickets Are Ready!</p>
        </div>

        <!-- Content -->
        <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi <strong>${order.name}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
            Thank you for your purchase! Your payment has been confirmed and your tickets are ready. 
            This single ticket grants you access to all three amazing film screenings.
          </p>

          <!-- Ticket Details -->
          <div style="background-color: #F9FAFB; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 2px dashed #D1D5DB;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: 14px; color: #6B7280; text-transform: uppercase; margin-bottom: 5px;">Ticket Code</div>
              <div style="font-size: 28px; font-weight: bold; color: #111827; font-family: monospace;">${order.order_code}</div>
            </div>
            
            ${qrCode ? `
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="${qrCode}" alt="Ticket QR Code" style="max-width: 200px; height: auto;" />
                <div style="font-size: 12px; color: #6B7280; margin-top: 10px;">Scan at entrance</div>
              </div>
            ` : ''}
            
            <div style="border-top: 1px solid #D1D5DB; padding-top: 15px; margin-top: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6B7280;">Ticket Holder:</span>
                <span style="color: #111827; font-weight: 600;">${order.name}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6B7280;">Number of Tickets:</span>
                <span style="color: #111827; font-weight: 600;">${order.num_tickets}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6B7280;">Total Paid:</span>
                <span style="color: #10B981; font-weight: bold; font-size: 18px;">$${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Movie Schedule -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #111827; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #F59E0B; padding-bottom: 10px;">
              Your Festival Schedule
            </h2>
            ${moviesHtml}
          </div>

          <!-- Important Information -->
          <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6; margin-bottom: 20px;">
            <h3 style="color: #1E40AF; font-size: 16px; margin: 0 0 10px 0;">Important Information</h3>
            <ul style="color: #1E3A8A; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
              <li>Please arrive 15 minutes before showtime</li>
              <li>Present this email (digital or printed) at the entrance</li>
              <li>Your QR code will be scanned for entry</li>
              <li>One ticket grants access to all three screenings</li>
              <li>Seating is first-come, first-served</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #6B7280; text-align: center; margin-top: 30px;">
            Questions? Email us at <a href="mailto:support@filmfestival.com" style="color: #3B82F6;">support@filmfestival.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
          <p style="margin: 0;">© 2024 Film Festival. All rights reserved.</p>
          <p style="margin: 10px 0 0 0;">See you at the festival! 🎬</p>
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
  const movies = FESTIVAL_MOVIES.map(movie => 
    `${movie.isPremiere ? '★ PREMIERE ★ ' : ''}${movie.name} - ${movie.showtime}`
  ).join('\n');

  return `
FILM FESTIVAL 2024 - YOUR TICKETS

Hi ${order.name},

Thank you for your purchase! Your payment has been confirmed and your tickets are ready.

TICKET DETAILS
--------------
Ticket Code: ${order.order_code}
Ticket Holder: ${order.name}
Number of Tickets: ${order.num_tickets}
Total Paid: $${order.total_amount.toFixed(2)}

YOUR FESTIVAL SCHEDULE
----------------------
${movies}

IMPORTANT INFORMATION
---------------------
- Please arrive 15 minutes before showtime
- Present this email (digital or printed) at the entrance
- One ticket grants access to all three screenings
- Seating is first-come, first-served

Questions? Email us at support@filmfestival.com

See you at the festival!

© 2024 Film Festival. All rights reserved.
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
      from: process.env.SMTP_FROM || '"Film Festival" <noreply@filmfestival.com>',
      to: order.email,
      subject: `Your Film Festival Tickets - Order ${order.order_code}`,
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
      from: process.env.SMTP_FROM || '"Film Festival" <noreply@filmfestival.com>',
      to: toEmail,
      subject: 'Test Email - Film Festival Ticketing System',
      text: 'This is a test email from your Film Festival ticketing system. If you received this, your email configuration is working correctly!',
      html: '<p>This is a test email from your Film Festival ticketing system.</p><p>If you received this, your email configuration is working correctly!</p>',
    });

    console.log('Test email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}

