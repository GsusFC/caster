# Farcaster Scheduler - Project Context

## What Gets Saved Here

This file preserves key decisions, file locations, and context that helps Claude understand the project after context resets.

## Core Architecture Decisions

### Package Structure
**Decision**: Modular monorepo with clear boundaries
```
packages/
├── core/       → Business logic only, no UI or external APIs
├── database/   → Prisma + repository pattern, no business logic
├── farcaster/  → Neynar integration, isolated from business logic
├── types/      → Shared types, imported by all packages
```

**Rationale**: 
- Separation of concerns
- Easy testing
- Reusable across apps
- Type safety enforced

### Key File Locations

**Scheduling Logic**:
- `packages/core/src/scheduler/index.ts` - Scheduling functions
- `packages/core/src/publisher/index.ts` - Publishing logic

**Database**:
- `packages/database/prisma/schema.prisma` - Schema definition
- `packages/database/src/repositories/` - Data access layer

**Farcaster Integration**:
- `packages/farcaster/src/neynar-client.ts` - Neynar SDK wrapper

**Worker**:
- `apps/worker/src/index.ts` - Cron job entry point

**Web App**:
- `apps/web/app/` - Next.js App Router
- `apps/web/app/api/` - API routes

### Code Patterns

**Error Handling**: Always return `{ success, data?, error? }`
```typescript
// ✅ Correct pattern
async function doSomething() {
  try {
    const result = await externalCall()
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

**Repository Pattern**: All database access through repositories
```typescript
// ✅ Correct
import { scheduledCastRepository } from '@farcaster-scheduler/database'
const casts = await scheduledCastRepository.findDue()

// ❌ Wrong
import { prisma } from '@farcaster-scheduler/database'
const casts = await prisma.scheduledCast.findMany()
```

**Type Imports**: Always from shared package
```typescript
// ✅ Correct
import type { ScheduledCast } from '@farcaster-scheduler/types'

// ❌ Wrong
type ScheduledCast = { ... } // Duplicating types!
```

## Database Schema Key Points

### ScheduledCast
- `status`: PENDING → PUBLISHED/FAILED/CANCELLED
- `priority`: HIGH/NORMAL/LOW (affects publishing order)
- `scheduledTime`: UTC timestamp
- `retryCount`: Tracks failed publish attempts
- Index on `[status, scheduledTime]` for efficient queries

### User
- `fid`: Farcaster ID (unique)
- `signerUuid`: For publishing via Neynar
- One user → many scheduled casts

## Important Conventions

### Naming
- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Package References
- Always use `workspace:*` for internal packages
- Example: `"@farcaster-scheduler/types": "workspace:*"`

### Import Order
1. External packages
2. Internal packages (@farcaster-scheduler/*)
3. Types
4. Relative imports

## Environment Variables

Required across all environments:
```env
DATABASE_URL=postgresql://...
NEYNAR_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://...
```

## Deployment Architecture

**Web (Netlify)**:
- Base directory: `apps/web`
- Build command: `cd ../.. && pnpm --filter=web build`
- Auto-deploy on push to main

**Worker (Render.com)**:
- Service type: Background Worker
- Build command: `cd apps/worker && pnpm build`
- Start command: `pnpm start`
- Runs cron every minute

**Database (Render.com)**:
- PostgreSQL Starter plan
- Automatic backups
- Connection via DATABASE_URL

## Critical Integrations

### Neynar API
- SDK: `@neynar/nodejs-sdk`
- Client in: `packages/farcaster/src/neynar-client.ts`
- Rate limits: 10 casts/minute
- Always check signer status before publishing

### Prisma
- Client generated: `pnpm db:generate`
- Migrations: `pnpm db:migrate`
- Studio: `pnpm db:studio`

## Known Gotchas

1. **Turborepo caching**: Sometimes need `pnpm build --force`
2. **Prisma client**: Must regenerate after schema changes
3. **Worker timezone**: Cron uses 'America/Los_Angeles', times stored in UTC
4. **Neynar errors**: Not always clear, wrap with parseNeynarError()
5. **Rate limits**: Can hit Neynar limits, implement backoff

## Testing Strategy

- **Unit tests**: For pure functions in core/
- **Integration tests**: For repository layer
- **E2E tests**: For critical user flows
- **Manual testing**: Scheduling → publishing flow

## Monitoring Points

Watch these metrics:
- Queue depth (pending casts)
- Publish success rate
- Error types and frequency
- Average time schedule → publish

## Recent Changes

### 2024-11-09: Initial Setup
- Created monorepo structure
- Configured Turborepo
- Set up Prisma schema
- Implemented core scheduler and publisher
- Added Neynar integration
- Created worker cron job
- Configured Claude Code infrastructure

## TODO: Document Later

As development progresses, document:
- [ ] Authentication flow details
- [ ] API route patterns
- [ ] UI component structure
- [ ] Testing approach specifics
- [ ] Performance optimization decisions

## Questions & Assumptions

**Assumptions**:
- Users will primarily schedule 1-10 casts at a time
- Most casts scheduled <24 hours in advance
- Typical user has 1 Farcaster account
- Free tier sufficient for MVP

**Open Questions**:
- How handle very large queue (1000s of pending casts)?
- Should we support scheduling years in advance?
- What happens if Neynar is down?
- How to handle user deleting Farcaster account?
