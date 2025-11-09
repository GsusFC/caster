# Architecture Documentation

## Monorepo Structure

This project uses a modular monorepo architecture managed with **pnpm workspaces** and **Turborepo**.

```
farcaster-scheduler/
├── apps/                      # Applications
│   ├── web/                   # Next.js dashboard (Netlify)
│   └── worker/                # Background worker (Render.com)
├── packages/                  # Shared packages
│   ├── core/                  # Business logic
│   ├── database/              # Prisma + repositories
│   ├── farcaster/             # Neynar integration
│   ├── types/                 # TypeScript types
│   └── config/                # Shared configs
└── tools/                     # Development tools
```

## Design Principles

### 1. Separation of Concerns

Each package has a single responsibility:

- **`@farcaster-scheduler/types`**: Shared TypeScript types
- **`@farcaster-scheduler/database`**: Data access layer
- **`@farcaster-scheduler/farcaster`**: External API integration
- **`@farcaster-scheduler/core`**: Business logic (protocol-agnostic)

### 2. Dependency Flow

```
apps/web ──────┐
               ├──> core ──┐
apps/worker ───┘           ├──> database
                           └──> farcaster ──> types
```

Applications depend on `core`, which orchestrates `database` and `farcaster`.

### 3. Modular and Extensible

Want to add Lens Protocol support?

```bash
# Create new package
packages/lens/

# Update core to support multiple protocols
packages/core/src/publisher/
├── base-publisher.ts
├── farcaster-publisher.ts
└── lens-publisher.ts  # ✨ New
```

## Package Details

### Core Package

**Purpose**: Business logic for scheduling and publishing

**Key Features**:
- `Scheduler`: Manages scheduled casts
- `Publisher`: Publishes casts to Farcaster
- Protocol-agnostic design

**Usage**:
```typescript
import { scheduler, publisher } from '@farcaster-scheduler/core'

// Schedule a cast
await scheduler.scheduleCast(userId, content, {
  scheduledTime: new Date('2024-12-01T10:00:00Z')
})

// Publish due casts
await publisher.publishDueCasts()
```

### Database Package

**Purpose**: Data persistence with Prisma ORM

**Key Features**:
- Prisma schema and client
- Repository pattern
- Type-safe queries

**Usage**:
```typescript
import { scheduledCastRepository } from '@farcaster-scheduler/database'

const casts = await scheduledCastRepository.findDueForPublishing()
```

### Farcaster Package

**Purpose**: Integration with Farcaster via Neynar API

**Key Features**:
- Neynar SDK wrapper
- Type-safe API calls
- Error handling

**Usage**:
```typescript
import { publishCast, neynarClient } from '@farcaster-scheduler/farcaster'

const result = await publishCast(signerUuid, 'Hello Farcaster!')
```

### Types Package

**Purpose**: Shared TypeScript types

**Key Features**:
- Domain types (User, ScheduledCast, etc.)
- API types (requests/responses)
- Enums (CastStatus, CastPriority)

**Usage**:
```typescript
import { ScheduledCast, CastStatus } from '@farcaster-scheduler/types'
```

## Data Flow

### Scheduling a Cast

```
User Input (Web UI)
  ↓
Next.js API Route
  ↓
@farcaster-scheduler/core (scheduler.scheduleCast)
  ↓
@farcaster-scheduler/database (scheduledCastRepository.create)
  ↓
PostgreSQL (via Prisma)
```

### Publishing a Cast

```
Cron Job (Worker)
  ↓
@farcaster-scheduler/core (publisher.publishDueCasts)
  ↓
@farcaster-scheduler/database (find due casts)
  ↓
@farcaster-scheduler/farcaster (publishCast via Neynar)
  ↓
Farcaster Network
  ↓
@farcaster-scheduler/database (update cast status)
```

## Development Workflow

### Adding a New Feature

1. **Define types** in `packages/types`
2. **Update schema** in `packages/database`
3. **Add business logic** in `packages/core`
4. **Create UI** in `apps/web`
5. **Test end-to-end**

### Example: Adding Thread Support

```bash
# 1. Add types
packages/types/src/domain.ts
export interface CastThread { ... }

# 2. Update schema
packages/database/prisma/schema.prisma
model CastThread { ... }

# 3. Add logic
packages/core/src/threads/
└── thread-manager.ts

# 4. Add UI
apps/web/app/threads/
└── page.tsx
```

## Testing Strategy

### Unit Tests
- Test each package independently
- Mock external dependencies
- Fast feedback loop

### Integration Tests
- Test packages working together
- Use test database
- Verify data flow

### E2E Tests
- Test complete user flows
- Use real (staging) APIs
- Verify UI and backend

## Deployment

### Web App (Netlify)
- Automatic deploys on push to `main`
- Preview deploys for PRs
- Edge functions for API routes

### Worker (Render.com)
- Auto-deploy on push to `main`
- Background service (always running)
- PostgreSQL database included

## Performance Considerations

### Build Optimization
- Turborepo caching
- Incremental builds
- Parallel execution

### Runtime Optimization
- Database connection pooling
- API request caching
- Efficient queries with Prisma

## Security

### Environment Variables
- Never commit `.env` files
- Use platform-specific secret management
- Rotate keys regularly

### Database
- Use Prisma for SQL injection protection
- Row-level security policies
- Regular backups

### API Keys
- Store Neynar API key securely
- Use signers for user authorization
- Validate all inputs

## Scaling Considerations

### Horizontal Scaling
- Worker can run multiple instances
- Web app scales automatically on Netlify
- Database connection pooling required

### Vertical Scaling
- Upgrade Render.com plan for worker
- Upgrade database plan for storage
- Monitor performance metrics

## Future Enhancements

### Potential Additions
1. Mobile app (`apps/mobile`)
2. Admin dashboard (`apps/admin`)
3. Analytics service (`packages/analytics`)
4. Multiple protocol support (`packages/lens`, `packages/bluesky`)
5. Plugin system (`packages/plugins/`)

### Architecture Evolution
- Event-driven architecture
- Microservices separation
- GraphQL API layer
- Real-time updates with WebSockets
