#!/bin/bash

echo "🎬 Film Festival Ticketing System - Setup Script"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and configure your:"
    echo "   - Email credentials (SMTP_USER, SMTP_PASSWORD)"
    echo "   - Venmo handle (VENMO_HANDLE)"
    echo "   - Security secrets (WEBHOOK_SECRET, ADMIN_PASSWORD)"
    echo "   - IMAP credentials for payment listener"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Setup database
echo "🗄️  Setting up database..."
DATABASE_URL="file:./dev.db" npx prisma migrate dev --name init
echo "✅ Database initialized"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
DATABASE_URL="file:./dev.db" npx prisma generate
echo "✅ Prisma client generated"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo "4. Access admin panel at http://localhost:3000/admin"
echo "5. Run 'npm run listen-venmo' to start payment listener"
echo ""
echo "📖 See README.md for detailed documentation"

