# Farcaster Scheduler

A Buffer-like scheduling application for Farcaster built with a modular monorepo architecture.

## 🏗️ Architecture

This is a monorepo managed with **pnpm workspaces** and **Turborepo**.

### Apps

- **`apps/web`** - Next.js 14 dashboard (deployed to Netlify)
- **`apps/worker`** - Background cron scheduler (deployed to Render.com)

### Packages

- **`packages/core`** - Core business logic (scheduling, publishing)
- **`packages/database`** - Prisma schema and database access layer
- **`packages/farcaster`** - Farcaster/Neynar integration
- **`packages/ui`** - Shared React components and design system
- **`packages/types`** - Shared TypeScript types
- **`packages/config`** - Shared configuration (ESLint, TypeScript, Tailwind)

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
pnpm dev:web      # Web dashboard
pnpm dev:worker   # Background worker

# Build all packages
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## 📦 Package Management

This monorepo uses pnpm workspaces. To add a dependency:

```bash
# Add to root
pnpm add -D <package>

# Add to specific package
pnpm --filter=web add <package>
pnpm --filter=@farcaster-scheduler/core add <package>
```

## 🗄️ Database

```bash
# Open Prisma Studio
pnpm db:studio

# Create a migration
pnpm db:migrate

# Push schema without migration (dev only)
pnpm db:push
```

## 🚢 Deployment

### Web App (Netlify)

The web app in `apps/web` is configured to deploy to Netlify automatically.

### Worker (Render.com)

The background worker in `apps/worker` is configured to deploy to Render.com as a background service.

See individual app READMEs for detailed deployment instructions.

## 📝 License

MIT
