# Supabase Setup Guide

This project now uses Supabase (PostgreSQL) instead of SQLite for the database.

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in project details:
   - **Name:** `film-festival` (or your choice)
   - **Database Password:** Create a strong password **and save it!**
   - **Region:** Choose closest to your location
5. Click **"Create new project"**
6. Wait ~2 minutes for provisioning

### 2. Get Your Connection Strings

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **Database** section
3. Scroll to **Connection String**
4. Select **URI** tab
5. Copy the connection string
   - It looks like: `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
6. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with your actual database password

You'll need TWO connection strings:
- **DATABASE_URL** - For connection pooling (port 6543)
- **DIRECT_URL** - For migrations (port 5432)

### 3. Update Your Local .env File

Create or update your `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Then edit `.env` and replace the DATABASE_URL lines:

```bash
# Supabase Connection - Pooled (for app queries)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Connection - Direct (for migrations)
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**Replace:**
- `[PROJECT-REF]` with your project reference
- `[YOUR-PASSWORD]` with your database password

### 4. Run Database Migration

Now migrate your schema to Supabase:

```bash
# Generate migration files
npx prisma migrate dev --name init_supabase

# Or if you want to push without creating migration files
npx prisma db push
```

This will:
- Create the `Order` table in Supabase
- Set up indexes
- Generate Prisma Client

### 5. Verify Setup

Check that it worked:

```bash
# Open Prisma Studio to view your Supabase database
npx prisma studio
```

Visit http://localhost:5555 - you should see your Order table (empty for now).

You can also check in Supabase:
- Go to **Table Editor** in Supabase dashboard
- You should see the `Order` table

### 6. Test the Application

```bash
# Start your dev server
npm run dev
```

Visit http://localhost:3000 and create a test order to verify everything works!

---

## For Production Deployment

### Environment Variables for Vercel/Netlify

When deploying, add these environment variables in your hosting platform:

```bash
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Plus all your other environment variables:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="Festival Tickets <your-email@gmail.com>"
VENMO_HANDLE=@YourVenmoHandle
TICKET_PRICE=15.00
WEBHOOK_SECRET=your-random-secret
ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional: For Venmo listener (if running separately)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=payments@yourdomain.com
IMAP_PASSWORD=your-imap-password
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo in the Vercel dashboard for automatic deployments.

---

## Troubleshooting

### Connection Issues

**Error: "Can't reach database server"**
- Check your connection string is correct
- Verify your IP isn't blocked (Supabase allows all IPs by default)
- Make sure you replaced `[YOUR-PASSWORD]` with actual password

**Error: "SSL connection required"**
Add `?sslmode=require` to your connection string:
```
DATABASE_URL="postgresql://...?pgbouncer=true&sslmode=require"
```

### Migration Issues

**Error: "Migration failed"**
Try pushing directly:
```bash
npx prisma db push
```

**Reset database (⚠️ DELETES ALL DATA):**
```bash
npx prisma migrate reset
```

---

## Supabase Features You Can Use

Now that you're on Supabase, you have access to:

### 1. **Real-time Subscriptions**
Listen to database changes in real-time:
```typescript
const { data, error } = await supabase
  .from('Order')
  .on('INSERT', payload => {
    console.log('New order!', payload)
  })
  .subscribe()
```

### 2. **Built-in Auth** (Optional)
Replace your simple admin password with proper auth:
- Email/password
- OAuth (Google, GitHub, etc.)
- Magic links

### 3. **Storage**
Store ticket PDFs or images:
```typescript
const { data, error } = await supabase.storage
  .from('tickets')
  .upload('ticket.pdf', file)
```

### 4. **Row Level Security (RLS)**
Secure your database with policies:
```sql
-- Only allow admins to see all orders
CREATE POLICY "Admins can view all orders"
ON Order FOR SELECT
TO authenticated
USING (auth.role() = 'admin');
```

### 5. **Automatic Backups**
Your database is automatically backed up - no setup needed!

---

## Monitoring & Maintenance

### View Logs
In Supabase dashboard:
- **Database** → **Logs** - See all queries
- **API** → **Logs** - See API usage

### Monitor Usage
- **Settings** → **Usage** - Check storage, bandwidth, rows

### Backups
- Free tier: 7 days of backups
- Pro: Point-in-time recovery

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Prisma + Supabase:** https://www.prisma.io/docs/guides/database/supabase
- **Discord:** https://discord.supabase.com

---

## Summary

✅ Schema updated to PostgreSQL  
✅ .env.example updated with Supabase format  
✅ Ready to run migrations  

**Next steps:**
1. Create your Supabase project
2. Update your `.env` file with connection strings
3. Run `npx prisma migrate dev`
4. Test your app!

🚀 You're now ready for production deployment!

