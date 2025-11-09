# Web Dashboard

Next.js 14 web application for Farcaster Scheduler.

## Development

```bash
# From root of monorepo
pnpm dev:web

# Or from this directory
pnpm dev
```

## Build

```bash
pnpm build
```

## Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL="your_database_url"
NEYNAR_API_KEY="your_neynar_api_key"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Deployment

This app is configured to deploy to Netlify. The `netlify.toml` file contains all necessary configuration.

### Deploy Steps

1. Connect your GitHub repository to Netlify
2. Set the base directory to `apps/web`
3. Add environment variables in Netlify dashboard
4. Deploy!

Netlify will automatically detect the Next.js app and use the appropriate build plugin.
