# Film Festival 2024 - Ticketing System

A Next.js-based ticketing system for a film festival that accepts Venmo payments and automatically sends ticket confirmations via email.

## Features

- 🎬 Beautiful landing page showcasing 3 festival films
- 🎫 Simple ticket ordering system (one ticket = access to all 3 films)
- 💰 Venmo-based payment flow
- 📧 Automatic ticket email delivery with QR codes
- 👨‍💼 Admin dashboard for order management
- 🤖 Automated payment detection via email listener

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Email**: Nodemailer
- **Payment**: Venmo (via email monitoring)

## Getting Started

### Prerequisites

- Node.js 20.11+ 
- npm or yarn
- An email account for receiving Venmo notifications (Gmail recommended)
- SMTP credentials for sending emails

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jessebugclark-dot/Jesselovesmovies.git
   cd Jesselovesmovies
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure the following:

   ```bash
   # Database
   DATABASE_URL="file:./dev.db"

   # Email Configuration (SMTP)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   SMTP_FROM="Festival Tickets <your-email@gmail.com>"

   # Venmo Configuration
   VENMO_HANDLE="@YourVenmoHandle"
   TICKET_PRICE="15.00"

   # Security
   WEBHOOK_SECRET="your-random-secret-here"
   ADMIN_PASSWORD="your-secure-password"

   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # IMAP Configuration (for Venmo email listener)
   IMAP_HOST="imap.gmail.com"
   IMAP_PORT="993"
   IMAP_USER="payments@yourdomain.com"
   IMAP_PASSWORD="your-app-password"
   ```

   **Important Notes:**
   - For Gmail, you'll need to generate an [App Password](https://support.google.com/accounts/answer/185833)
   - Use the same email for both SMTP and IMAP if monitoring Venmo receipts in the same inbox
   - Generate a strong random string for `WEBHOOK_SECRET`

4. **Initialize the database**
   ```bash
   DATABASE_URL="file:./dev.db" npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

## Usage

### Customer Flow

1. **Browse Films**: Customer visits the landing page and sees all 3 festival films
2. **Order Tickets**: Fills out the form with name, email, and number of tickets
3. **Payment Instructions**: Receives Venmo payment instructions with:
   - Your Venmo handle
   - Exact amount to pay
   - Unique order code to include in the payment note
4. **Send Payment**: Customer sends payment via Venmo with the order code in the note
5. **Receive Tickets**: Automatic email with tickets (QR code + order details)

### Running the Venmo Payment Listener

The payment listener monitors your email inbox for Venmo payment receipts and automatically processes tickets:

```bash
npm run listen-venmo
```

**How it works:**
1. Connects to your email via IMAP
2. Watches for new emails from Venmo
3. Parses payment details (amount, payer, note)
4. Extracts the order code from the payment note
5. Calls the webhook to mark order as paid and send tickets

**Note**: Keep this running during your event/sales period. You can run it on:
- Your local machine
- A small cloud server (AWS EC2, DigitalOcean, etc.)
- As a background process with PM2 or systemd

### Admin Dashboard

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

**Features:**
- View all orders (pending and paid)
- See revenue statistics
- Manually mark orders as paid
- Resend ticket emails if needed
- View customer and payment details

**Default credentials:** Use the password you set in `ADMIN_PASSWORD` env variable

## API Endpoints

### Public Endpoints

- `POST /api/orders` - Create a new ticket order
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "numTickets": 2
  }
  ```

### Webhook Endpoints

- `POST /api/venmo-payment-hook` - Process Venmo payment (requires `Authorization: Bearer {WEBHOOK_SECRET}`)
  ```json
  {
    "orderCode": "FF24-ABC123",
    "amount": 30.00,
    "payerName": "John Doe",
    "paymentNote": "FF24 FF24-ABC123 john@example.com"
  }
  ```

### Admin Endpoints

- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/mark-paid` - Manually mark an order as paid
- `POST /api/admin/resend-ticket` - Resend ticket email

## Testing

### Manual Testing Flow

1. **Test Order Creation**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Fill out the ticket form
   - Submit and verify you receive payment instructions

2. **Test Payment Processing (Manual)**
   - Go to [http://localhost:3000/admin](http://localhost:3000/admin)
   - Find your test order
   - Click "Mark Paid" to manually process it
   - Check your email for the ticket

3. **Test Payment Processing (Automated)**
   - Create a test order
   - Send a real Venmo payment with the order code in the note
   - Ensure the listener is running (`npm run listen-venmo`)
   - Wait for the email to be detected and processed
   - Verify ticket email is received

### Edge Cases Handled

- ✅ Duplicate order codes (regenerates if collision detected)
- ✅ Amount mismatches (flags for manual review, doesn't auto-process)
- ✅ Already paid orders (prevents duplicate processing)
- ✅ Missing order codes in Venmo notes (ignored)
- ✅ Failed email sending (order still marked paid, admin can resend)
- ✅ Invalid email addresses (validation on form)

## Customization

### Update Festival Information

Edit `/src/lib/order-utils.ts`:

```typescript
export const FESTIVAL_MOVIES = [
  { id: 'premiere', name: 'Your Movie Title', showtime: 'Saturday 7:00 PM', isPremiere: true },
  { id: 'classic', name: 'Second Movie', showtime: 'Saturday 9:30 PM', isPremiere: false },
  { id: 'indie', name: 'Third Movie', showtime: 'Sunday 5:00 PM', isPremiere: false },
];
```

### Update Landing Page Content

Edit `/src/app/page.tsx` to customize:
- Festival name and tagline
- Movie descriptions
- Showtimes
- Styling and colors

### Change Ticket Price

Update the `TICKET_PRICE` environment variable in `.env`:
```bash
TICKET_PRICE="20.00"
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables
4. Deploy!

**Important**: For the email listener, you'll need to run it separately (not on Vercel). Options:
- Small VPS (DigitalOcean, AWS EC2)
- Your local machine during the event
- A Raspberry Pi

### Database in Production

For production, consider upgrading from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `DATABASE_URL` to your PostgreSQL connection string

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Security Considerations

- 🔐 Change `ADMIN_PASSWORD` to a strong password
- 🔐 Generate a cryptographically random `WEBHOOK_SECRET`
- 🔐 Use App Passwords for Gmail (never your main password)
- 🔐 Keep `.env` file out of version control (already in `.gitignore`)
- 🔐 Consider adding rate limiting in production
- 🔐 Use HTTPS in production

## Troubleshooting

### Emails Not Sending

- Verify SMTP credentials are correct
- For Gmail, ensure "Less secure app access" is enabled OR use an App Password
- Check spam folder
- Review server logs for detailed error messages

### Payment Listener Not Working

- Verify IMAP credentials are correct
- For Gmail, ensure IMAP is enabled in settings
- Check that Venmo receipts are going to the configured email
- Verify the order code format matches (FF24-XXXXXX)

### Orders Stuck in Pending

- Use the admin dashboard to manually mark as paid
- Check if the payment note included the correct order code
- Verify the email listener is running and connected

## License

MIT License - feel free to use for your own events!

## Support

For questions or issues, please open an issue on GitHub or contact support@filmfestival.com

---

Built with ❤️ for indie film festivals
