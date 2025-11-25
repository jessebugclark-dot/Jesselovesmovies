# Quick Start Guide

Get your Film Festival ticketing system running in 5 minutes!

## 🚀 Fast Setup

### 1. Configure Environment

Copy and edit the environment file:
```bash
cp .env.example .env
```

**Minimum required settings:**
```bash
DATABASE_URL="file:./dev.db"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
VENMO_HANDLE="@YourVenmoHandle"
WEBHOOK_SECRET="random-secret-here"
ADMIN_PASSWORD="secure-password"
```

> 💡 **Gmail Users**: Get an [App Password](https://myaccount.google.com/apppasswords)

### 2. Install & Run

```bash
npm install
npm run dev
```

Visit: **http://localhost:3000** 🎉

### 3. Access Admin

Visit: **http://localhost:3000/admin**

Password: Whatever you set in `ADMIN_PASSWORD`

## 📋 What You Get

✅ **Landing page** - Beautiful festival showcase  
✅ **Ticket ordering** - Simple form, instant confirmation  
✅ **Venmo payments** - Easy instructions for customers  
✅ **Admin dashboard** - View orders, mark paid, resend tickets  
✅ **Email tickets** - Professional HTML emails with QR codes  
✅ **Verification** - QR codes link to verification page  

## 🎫 Customer Flow

1. Customer visits site → sees 3 films
2. Fills form → gets Venmo payment instructions
3. Sends payment via Venmo (includes order code)
4. Admin marks paid OR automated listener processes
5. Customer receives ticket email instantly
6. Shows QR code at door → instant verification

## 🔧 Manual vs Automated

### Manual (Easiest)
- Customers pay via Venmo
- You check Venmo, see the payment
- Open admin dashboard
- Click "Mark Paid" → tickets sent!

### Automated (Advanced)
- Run: `npm run listen-venmo`
- Monitors your email for Venmo receipts
- Automatically processes tickets
- Zero manual work!

## 📧 Email Setup (Important!)

### Gmail
1. Enable 2-factor authentication
2. Create [App Password](https://myaccount.google.com/apppasswords)
3. Use that in `SMTP_PASSWORD`

### Other Providers
- **Outlook**: Enable SMTP, use regular password
- **Custom Domain**: Get SMTP credentials from your host
- **SendGrid/Mailgun**: Best for production!

## 💰 Venmo Setup

1. Set your Venmo handle in `.env`:
   ```bash
   VENMO_HANDLE="@YourHandle"
   ```

2. Tell customers to include order code in payment note:
   ```
   FF24 FF24-ABC123 email@example.com
   ```

3. That's it! 

## 🎨 Customization

### Change Ticket Price
```bash
# .env
TICKET_PRICE="20.00"
```

### Update Movies
Edit: `src/lib/order-utils.ts`
```typescript
export const FESTIVAL_MOVIES = [
  { id: 'premiere', name: 'Your Film Title', showtime: 'Sat 7PM', isPremiere: true },
  // ... more films
];
```

### Customize Landing Page
Edit: `src/app/page.tsx`

## 🐛 Troubleshooting

### Emails Not Sending?
- ✅ Check SMTP credentials
- ✅ For Gmail, use App Password not regular password
- ✅ Check spam folder

### Can't Login to Admin?
- ✅ Check `ADMIN_PASSWORD` in `.env`
- ✅ Try default: `admin123` (if you didn't change it)

### Orders Not Showing?
- ✅ Refresh the page
- ✅ Check browser console for errors

## 📚 Next Steps

- ✅ Read [README.md](README.md) for full documentation
- ✅ Check [TESTING.md](TESTING.md) for complete test guide
- ✅ Test with a real order before going live!
- ✅ Set up automated listener for production

## 🆘 Need Help?

1. Check the [README.md](README.md) for detailed docs
2. Review [TESTING.md](TESTING.md) for test scenarios
3. Open an issue on GitHub

## ✅ Pre-Launch Checklist

Before accepting real orders:

- [ ] Configure all environment variables
- [ ] Test email delivery to multiple providers
- [ ] Create a test order and mark it paid
- [ ] Verify ticket email looks good
- [ ] Test QR code scanning
- [ ] Change default passwords!
- [ ] Test on mobile devices
- [ ] (Optional) Set up automated listener

## 🎬 You're Ready!

Your film festival ticketing system is ready to go. Have a great event! 🍿

