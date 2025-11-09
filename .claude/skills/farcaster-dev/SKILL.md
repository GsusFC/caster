# Farcaster Scheduler Development Skill

## Purpose

Guide development for the Farcaster Scheduler application - a Buffer-like scheduling tool for Farcaster casts built with a modular monorepo architecture.

## Technology Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Node.js cron worker
- **Database**: PostgreSQL + Prisma ORM
- **Farcaster**: Neynar SDK
- **Deploy**: Netlify (web) + Render.com (worker + DB)

## When This Skill Activates

Automatically activated when:
- Working on Farcaster integration code
- Implementing scheduling or publishing logic
- Writing Neynar API interactions
- Modifying database schema for casts
- Working in: `packages/farcaster/`, `packages/core/`, `apps/worker/`

Manual activation: `@farcaster-dev`

## Project Architecture Overview

```
packages/
├── core/           # Business logic (scheduler + publisher)
├── database/       # Prisma + repositories (data access)
├── farcaster/      # Neynar SDK integration
├── types/          # Shared TypeScript types
└── config/         # Shared configurations

apps/
├── web/            # Next.js dashboard
└── worker/         # Cron job for publishing
```

## Core Principles

### 1. Modular Architecture
- Each package has ONE responsibility
- Packages are independent but composable
- Clear dependency flow: apps → core → database/farcaster → types

### 2. Type Safety First
- TypeScript strict mode everywhere
- Shared types in `@farcaster-scheduler/types`
- Prisma-generated types for database entities

### 3. Repository Pattern
- All database access through repositories
- No direct Prisma calls in business logic
- Repositories in `packages/database/src/repositories/`

### 4. Error Handling
- Never throw raw errors from external APIs
- Always return `{ success: boolean, data?, error? }`
- Log errors but don't expose details to users

## Quick Navigation

For detailed patterns, read these resources:

### Neynar Integration
**Read**: `resources/neynar-integration.md`
- Neynar SDK setup and usage
- Publishing casts
- Creating signers
- Authentication patterns

### Scheduling Logic
**Read**: `resources/scheduling-patterns.md`
- How the scheduler works
- Cron job implementation
- Queue management
- Retry logic

### Database Patterns
**Read**: `resources/database-patterns.md`
- Prisma schema design
- Repository implementations
- Migrations workflow
- Type safety with Prisma

### Monorepo Workflows
**Read**: `resources/monorepo-guide.md`
- Package dependencies
- Turborepo configuration
- Build optimization
- Cross-package imports

### Testing Strategies
**Read**: `resources/testing-guide.md`
- Unit testing patterns
- Integration tests
- Mocking Neynar API
- Database testing

### Deployment
**Read**: `resources/deployment-guide.md`
- Netlify configuration
- Render.com setup
- Environment variables
- CI/CD patterns

## Common Tasks

### Creating a New API Route (Next.js)

```typescript
// apps/web/app/api/casts/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { scheduler } from '@farcaster-scheduler/core'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.content || !body.scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Use core logic
    const cast = await scheduler.scheduleCast(
      body.userId,
      body.content,
      { scheduledTime: new Date(body.scheduledTime) }
    )
    
    return NextResponse.json({ cast })
  } catch (error) {
    console.error('Schedule cast error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule cast' },
      { status: 500 }
    )
  }
}
```

### Adding a New Repository Method

```typescript
// packages/database/src/repositories/scheduled-cast.ts
export class ScheduledCastRepository {
  async findUpcoming(userId: string, limit = 10) {
    return prisma.scheduledCast.findMany({
      where: {
        userId,
        status: CastStatus.PENDING,
        scheduledTime: {
          gt: new Date(),
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
      take: limit,
    })
  }
}
```

### Publishing a Cast with Neynar

```typescript
// packages/farcaster/src/neynar-client.ts
import { neynarClient } from './client'

export async function publishCast(
  signerUuid: string,
  text: string,
  options?: {
    embeds?: Array<{ url: string }>
    channelKey?: string
  }
) {
  try {
    const response = await neynarClient.publishCast(
      signerUuid,
      text,
      options
    )
    
    return {
      success: true,
      castHash: response.hash,
    }
  } catch (error) {
    console.error('Neynar publish error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
```

## Code Standards

### Naming Conventions
- **Files**: kebab-case (`scheduled-cast.ts`)
- **Classes**: PascalCase (`ScheduledCastRepository`)
- **Functions**: camelCase (`scheduleCast`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)

### Import Order
```typescript
// 1. External packages
import { PrismaClient } from '@prisma/client'
import { NeynarAPIClient } from '@neynar/nodejs-sdk'

// 2. Internal packages
import { scheduledCastRepository } from '@farcaster-scheduler/database'
import { publishCast } from '@farcaster-scheduler/farcaster'

// 3. Types
import type { ScheduledCast, CastStatus } from '@farcaster-scheduler/types'

// 4. Relative imports
import { validateCastContent } from '../utils/validation'
```

### Error Handling Pattern
```typescript
// ✅ GOOD: Return error objects
async function doSomething() {
  try {
    const result = await externalCall()
    return { success: true, data: result }
  } catch (error) {
    console.error('Error in doSomething:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ❌ BAD: Throw errors from public APIs
async function doSomething() {
  const result = await externalCall() // Might throw!
  return result
}
```

### TypeScript Types
```typescript
// ✅ GOOD: Use types from shared package
import type { ScheduledCast } from '@farcaster-scheduler/types'

// ✅ GOOD: Infer types from Prisma
import type { Prisma } from '@prisma/client'
type CastWithUser = Prisma.ScheduledCastGetPayload<{
  include: { user: true }
}>

// ❌ BAD: Duplicate type definitions
type ScheduledCast = { ... } // Already in @farcaster-scheduler/types!
```

## Progressive Disclosure

This skill uses progressive disclosure - don't load all resources at once.

**Start here** (this file) for overview and common tasks.

**Load resources** only when needed:
- Need Neynar patterns? → `resources/neynar-integration.md`
- Need database help? → `resources/database-patterns.md`
- Need deploy info? → `resources/deployment-guide.md`

## Development Workflow

1. **Make changes** in appropriate package
2. **Type check**: `pnpm typecheck`
3. **Build**: `pnpm build` (or let Turbo cache)
4. **Test locally**: `pnpm dev`
5. **Commit**: Clear commit messages
6. **Deploy**: Push to GitHub → Auto-deploy

## Environment Variables

Required for development:
```env
DATABASE_URL=postgresql://...
NEYNAR_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

## Getting Help

- **Architecture questions**: Read `ARCHITECTURE.md` in repo root
- **Deployment issues**: Read `DEPLOYMENT.md`
- **Contributing guidelines**: Read `CONTRIBUTING.md`
- **Next steps**: Read `NEXT_STEPS.md`

## Skill Maintenance

This skill should be updated when:
- New packages are added to monorepo
- Major architecture changes
- New Neynar API patterns emerge
- Deployment process changes

---

**Remember**: Use resources for deep dives, keep this file as your compass. Progressive disclosure keeps context manageable!
