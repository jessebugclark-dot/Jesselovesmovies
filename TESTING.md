# Testing Guide

This document outlines how to test all functionality of the Film Festival ticketing system.

## Prerequisites

Before testing, ensure:
- ✅ `.env` file is configured with valid credentials
- ✅ Database is initialized (`npm run dev` will auto-generate if needed)
- ✅ Development server is running (`npm run dev`)

## Test 1: Landing Page

**Objective**: Verify the landing page displays correctly

1. Visit `http://localhost:3000`
2. Verify you see:
   - Film Festival 2024 header
   - Featured premiere movie section (highlighted)
   - Two additional movie sections
   - "Get Your Festival Pass" button
   - Ticket form at the bottom

**Expected Result**: ✅ All content displays properly with good styling

---

## Test 2: Order Creation

**Objective**: Test the ticket order flow

1. Scroll to the ticket form
2. Fill in:
   - Name: "Test User"
   - Email: Your test email
   - Number of tickets: 2
3. Click "Continue to Payment"
4. Verify you see:
   - Success checkmark
   - Order code (format: FF24-XXXXXX)
   - Venmo payment instructions
   - Amount to pay (should be $30.00 for 2 tickets at $15 each)
   - Payment note with the order code

**Expected Result**: ✅ Order created, unique code generated, payment instructions displayed

**Edge Cases Tested**:
- ✅ Email validation (try invalid email format)
- ✅ Required fields (try submitting empty form)
- ✅ Unique order codes (create multiple orders, verify different codes)

---

## Test 3: Admin Dashboard - View Orders

**Objective**: Verify admin can view orders

1. Visit `http://localhost:3000/admin`
2. Enter admin password (from `ADMIN_PASSWORD` in `.env`)
3. Verify you see:
   - Summary stats (total orders, paid, pending, revenue)
   - Table with your test order
   - Order shows status "pending"

**Expected Result**: ✅ Admin dashboard displays orders correctly

---

## Test 4: Manual Payment Processing

**Objective**: Test manually marking an order as paid

1. In admin dashboard, find your test order
2. Click "Mark Paid" button
3. Confirm the action
4. Check your email inbox for the ticket email
5. Verify ticket email contains:
   - Order code
   - QR code
   - All 3 movie screenings
   - Your name and ticket count
   - "Paid" status badge

**Expected Result**: ✅ Order marked as paid, ticket email received

**Edge Cases Tested**:
- ✅ Already paid orders (try clicking "Mark Paid" again, should not resend)
- ✅ Email failure handling (check admin response if email fails)

---

## Test 5: QR Code Verification

**Objective**: Test ticket verification via QR code

1. Open the ticket email
2. Click the QR code or copy the verification URL
3. Visit the URL (format: `http://localhost:3000/verify/FF24-XXXXXX`)
4. Verify you see:
   - Green checkmark
   - "Valid Ticket" message
   - Order details (name, ticket count, amount)
   - All 3 movie showtimes

**Expected Result**: ✅ Ticket verification page shows valid ticket

**Edge Cases Tested**:
- ✅ Invalid order code (visit `/verify/FF24-INVALID`)
  - Should show "Invalid Ticket" error
- ✅ Unpaid order (create new order, verify before paying)
  - Should show "Payment Pending" message

---

## Test 6: Resend Ticket Email

**Objective**: Test resending ticket emails

1. In admin dashboard, find a paid order
2. Click "Resend Ticket" button
3. Confirm the action
4. Check email inbox for duplicate ticket

**Expected Result**: ✅ Ticket email resent successfully

---

## Test 7: Payment Webhook - Amount Validation

**Objective**: Test amount mismatch detection

**Manual Test** (requires curl or API client):

```bash
curl -X POST http://localhost:3000/api/venmo-payment-hook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{
    "orderCode": "FF24-XXXXXX",
    "amount": 10.00,
    "payerName": "Test Payer",
    "paymentNote": "FF24 FF24-XXXXXX test@example.com"
  }'
```

Replace:
- `YOUR_WEBHOOK_SECRET` with your actual webhook secret from `.env`
- `FF24-XXXXXX` with a real pending order code
- `10.00` should be WRONG amount (order expects $15 or $30)

**Expected Result**: ✅ Request returns error, order not marked as paid, flagged for review

---

## Test 8: Payment Webhook - Correct Payment

**Objective**: Test successful automated payment processing

```bash
curl -X POST http://localhost:3000/api/venmo-payment-hook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{
    "orderCode": "FF24-XXXXXX",
    "amount": 15.00,
    "payerName": "Test Payer",
    "paymentNote": "FF24 FF24-XXXXXX test@example.com"
  }'
```

**Expected Result**: 
- ✅ Request returns success
- ✅ Order marked as paid in database
- ✅ Ticket email sent to customer

---

## Test 9: Duplicate Payment Prevention

**Objective**: Ensure orders can't be paid twice

1. Use the webhook test from Test 8 on an already-paid order
2. Verify response indicates "already paid"
3. Verify no duplicate email sent

**Expected Result**: ✅ System prevents duplicate processing

---

## Test 10: Venmo Email Listener (Optional - Advanced)

**Objective**: Test automated payment detection

**Prerequisites**:
- Valid IMAP credentials in `.env`
- Access to send test Venmo payments

**Steps**:

1. Create a new test order and note the order code
2. Start the listener:
   ```bash
   npm run listen-venmo
   ```
3. Send a Venmo payment to your configured Venmo handle with:
   - Amount: Exact order total
   - Note: `FF24 [ORDER_CODE] [EMAIL]`
4. Wait for Venmo receipt email to arrive
5. Watch listener logs for processing
6. Check email inbox for ticket

**Expected Result**: 
- ✅ Listener detects Venmo receipt
- ✅ Parses order code from payment note
- ✅ Calls webhook automatically
- ✅ Customer receives ticket email

**Edge Cases**:
- ✅ Missing order code in note (listener ignores)
- ✅ Invalid order code (webhook returns 404)
- ✅ Non-Venmo emails (listener ignores)

---

## Test 11: Multiple Tickets

**Objective**: Verify multiple ticket orders work correctly

1. Create order with 5 tickets
2. Verify:
   - Subtotal = $75.00 (5 × $15)
   - Payment instructions show correct amount
3. Mark as paid via admin
4. Verify ticket email shows "5 tickets"

**Expected Result**: ✅ Multi-ticket orders calculated and displayed correctly

---

## Test 12: Email Spam/Delivery

**Objective**: Ensure emails aren't marked as spam

1. Send test ticket to multiple email providers:
   - Gmail
   - Outlook/Hotmail
   - Yahoo
   - Your custom domain
2. Check each inbox (including spam folders)
3. Verify delivery rate

**Expected Result**: ✅ High delivery rate, minimal spam flagging

**Tips to improve delivery**:
- Use a verified sending domain
- Set up SPF, DKIM, DMARC records
- Use a reputable SMTP provider (SendGrid, Mailgun, etc.)

---

## Test 13: Concurrent Orders

**Objective**: Test system under concurrent load

1. Open multiple browser tabs
2. Create orders simultaneously
3. Verify:
   - All orders get unique codes
   - No database conflicts
   - All confirmations display correctly

**Expected Result**: ✅ System handles concurrent requests

---

## Test 14: Mobile Responsiveness

**Objective**: Verify mobile experience

1. Open site on mobile device or use browser dev tools
2. Test all flows:
   - Landing page scrolling
   - Form submission
   - Payment instructions readability
   - Admin dashboard on mobile
3. Verify QR codes scan properly on mobile

**Expected Result**: ✅ Site is fully responsive and usable on mobile

---

## Test Checklist Summary

- [ ] Landing page displays correctly
- [ ] Order creation works
- [ ] Admin login works
- [ ] Admin can view orders
- [ ] Manual payment processing works
- [ ] Ticket emails send correctly
- [ ] QR code verification works
- [ ] Invalid tickets are rejected
- [ ] Pending tickets show correct status
- [ ] Resend email works
- [ ] Amount mismatch is caught
- [ ] Duplicate payments prevented
- [ ] Webhook authentication works
- [ ] Multiple tickets calculated correctly
- [ ] Email delivery is reliable
- [ ] Mobile responsive
- [ ] (Optional) Venmo listener works

---

## Known Limitations

1. **No real-time updates**: Admin must refresh to see new orders
2. **Simple authentication**: Admin password is basic (consider upgrading for production)
3. **SQLite limitations**: May need PostgreSQL for high traffic
4. **Email listener requires separate process**: Can't run on serverless platforms like Vercel
5. **Venmo parsing is fragile**: Depends on Venmo's email format staying consistent

---

## Production Checklist

Before going live:

- [ ] Change all default passwords and secrets
- [ ] Set up proper SMTP service (not Gmail)
- [ ] Configure production DATABASE_URL (PostgreSQL recommended)
- [ ] Set up domain and SSL certificate
- [ ] Test email deliverability extensively
- [ ] Set up monitoring/logging
- [ ] Deploy email listener to reliable server
- [ ] Create backup strategy for database
- [ ] Test with real Venmo payments
- [ ] Prepare customer support contact info

---

## Troubleshooting

### Emails not sending
- Check SMTP credentials
- Verify firewall/security settings
- Check server logs for detailed errors
- Try sending from a different SMTP provider

### Listener not detecting payments
- Verify IMAP credentials and connection
- Check Venmo email format hasn't changed
- Ensure order code is in payment note exactly as instructed
- Check listener logs for parsing errors

### Database errors
- Verify DATABASE_URL is correct
- Run `npx prisma migrate reset` to reset database (⚠️ deletes all data)
- Check file permissions on SQLite database file

### Orders stuck in pending
- Use admin dashboard to manually mark as paid
- Verify webhook secret matches on both ends
- Check that email listener is running and connected

