# Deployment Guide

This guide covers deploying the Farcaster Scheduler to Netlify (web) and Render.com (worker + database).

## Prerequisites

- GitHub account
- Netlify account
- Render.com account
- Neynar API key ([get one here](https://neynar.com))

## Step 1: Database Setup (Render.com)

### Create PostgreSQL Database

1. Go to [Render.com Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `farcaster-scheduler-db`
   - **Database**: `farcaster_scheduler`
   - **User**: `farcaster_user`
   - **Region**: Choose closest to your users
   - **Plan**: Starter ($7/month)
4. Click "Create Database"
5. **Save the connection string** (Internal Database URL)

### Run Migrations

```bash
# Update .env with your database URL
DATABASE_URL="postgresql://user:pass@host/db"

# Run migrations
pnpm db:migrate
```

## Step 2: Worker Deployment (Render.com)

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml`
5. Add environment variables:
   - `NEYNAR_API_KEY`: Your Neynar API key
6. Click "Apply"

Render will automatically:
- Create the database (if using render.yaml)
- Deploy the worker
- Connect them together

### Option B: Manual Setup

1. Click "New +" → "Background Worker"
2. Connect GitHub repository
3. Configure:
   - **Name**: `farcaster-scheduler-worker`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `apps/worker`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
4. Add environment variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (from Step 1)
   - `NEYNAR_API_KEY`: Your API key
5. Click "Create Background Worker"

### Verify Worker

1. Check logs in Render dashboard
2. Should see: "✅ Cron worker started successfully"
3. Every minute should see: "🔄 Checking for scheduled casts..."

## Step 3: Web App Deployment (Netlify)

### Connect Repository

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and select your repository
4. Netlify should auto-detect Next.js

### Configure Build Settings

If not auto-detected, configure:
- **Base directory**: `apps/web`
- **Build command**: `cd ../.. && pnpm install && pnpm --filter=web build`
- **Publish directory**: `apps/web/.next`

### Add Environment Variables

In Netlify dashboard → Site settings → Environment variables:

```
DATABASE_URL=your_render_database_url
NEYNAR_API_KEY=your_neynar_api_key
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=https://your-site.netlify.app
NODE_ENV=production
```

### Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Visit your site URL

## Step 4: Post-Deployment

### Test the Flow

1. **Sign in** with Farcaster (once auth is implemented)
2. **Schedule a test cast** for 2 minutes in the future
3. **Wait and verify** it gets published
4. **Check worker logs** in Render dashboard

### Monitor

#### Netlify
- Build logs: Site → Deploys
- Function logs: Site → Functions
- Analytics: Site → Analytics

#### Render
- Worker logs: Service → Logs
- Database metrics: Database → Metrics
- Resource usage: Service → Metrics

## Troubleshooting

### Worker not publishing casts

**Check logs in Render:**
```
❌ Error: connect ECONNREFUSED
```
→ Database connection issue. Verify DATABASE_URL.

```
❌ Error: Invalid API key
```
→ Check NEYNAR_API_KEY is correct.

### Web app build failing

**Netlify build logs show:**
```
Cannot find module '@farcaster-scheduler/core'
```
→ Build command needs to install from monorepo root.

**Solution:** Ensure build command is:
```
cd ../.. && pnpm install && pnpm --filter=web build
```

### Database connection issues

**Error: too many connections**
→ Enable connection pooling:
```typescript
// In packages/database/src/client.ts
new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=5'
    }
  }
})
```

### Worker consuming too much memory

→ Upgrade Render plan or optimize queries.
→ Check for memory leaks in logs.
→ Consider implementing pagination for large result sets.

## Scaling

### When to Scale

Monitor these metrics:
- **Worker**: CPU/memory usage, job latency
- **Database**: Connection count, query performance
- **Web**: Response time, build time

### Scaling Options

#### Vertical (Upgrade plans)
- Render: Starter → Standard → Pro
- Netlify: Free → Pro → Enterprise
- Database: Increase storage/compute

#### Horizontal (Add instances)
- **Worker**: Run multiple instances (requires job locking)
- **Web**: Automatic with Netlify
- **Database**: Use read replicas (Render Pro+)

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/farcaster_dev
NEXTAUTH_URL=http://localhost:3000
```

### Staging
```env
NODE_ENV=staging
DATABASE_URL=your_staging_db_url
NEXTAUTH_URL=https://staging.your-domain.com
```

### Production
```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
NEXTAUTH_URL=https://your-domain.com
```

## Backup and Recovery

### Database Backups

Render provides automatic daily backups (Starter plan+).

**Manual backup:**
```bash
pg_dump $DATABASE_URL > backup.sql
```

**Restore:**
```bash
psql $DATABASE_URL < backup.sql
```

### Code Backups

- Primary: GitHub repository
- Netlify: Deploy history (rollback available)
- Render: Deployment history (rollback available)

## Security Checklist

- [ ] Environment variables set correctly
- [ ] DATABASE_URL uses SSL (`?sslmode=require`)
- [ ] NEXTAUTH_SECRET is strong and random
- [ ] NEYNAR_API_KEY kept secret
- [ ] Database firewall configured (if needed)
- [ ] HTTPS enabled (automatic on Netlify/Render)
- [ ] Dependency updates scheduled

## Cost Estimation

### Free Tier (Testing)
- Netlify: Free (100GB bandwidth)
- Render: $0 (with credit card for verification)
- **Total: $0/month** (limited usage)

### Production Starter
- Netlify: Free (sufficient for MVP)
- Render Worker: $7/month
- Render Database: $7/month
- **Total: $14/month**

### Production Scale
- Netlify Pro: $19/month (if needed)
- Render Standard: $25/month (worker)
- Render Database: $20/month (larger)
- **Total: ~$64/month**

## Monitoring and Alerts

### Set up alerts in Render:

1. Service → Settings → Notifications
2. Add alerts for:
   - Deploy failures
   - High memory usage
   - Service downtime

### Monitor with external services:

- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry
- **Analytics**: PostHog, Plausible

## Next Steps

After deployment:
1. Set up custom domain
2. Configure monitoring
3. Enable automatic deployments
4. Set up staging environment
5. Implement CI/CD tests

## Support

If you encounter issues:
1. Check logs in Render/Netlify dashboards
2. Review this guide's troubleshooting section
3. Open an issue on GitHub
4. Contact support (Render/Netlify)
