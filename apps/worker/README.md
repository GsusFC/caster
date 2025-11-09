# Background Worker

Node.js background worker that publishes scheduled Farcaster casts.

## How it Works

- Runs a cron job every minute
- Checks for casts scheduled to be published
- Publishes them via Neynar API
- Updates database with publish status

## Development

```bash
# From root of monorepo
pnpm dev:worker

# Or from this directory
pnpm dev
```

## Build

```bash
pnpm build
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="your_database_url"
NEYNAR_API_KEY="your_neynar_api_key"
NODE_ENV="development"
```

## Deployment

This worker is configured to deploy to Render.com as a background service.

### Deploy Steps

1. Connect your GitHub repository to Render
2. Render will detect the `render.yaml` file
3. Create the database first
4. Add NEYNAR_API_KEY to environment variables
5. Deploy the worker service

The worker will start automatically and run continuously, checking every minute for scheduled casts.

## Logs

In production, view logs in the Render dashboard to monitor:
- Casts being published
- Errors or failures
- Performance metrics
