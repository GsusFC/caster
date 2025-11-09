#!/bin/bash

echo "🚀 Setting up Farcaster Scheduler monorepo..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm db:generate

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual values"
fi

# Build all packages
echo "🏗️  Building all packages..."
pnpm build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your DATABASE_URL and NEYNAR_API_KEY"
echo "2. Run 'pnpm db:migrate' to create database tables"
echo "3. Run 'pnpm dev' to start development servers"
