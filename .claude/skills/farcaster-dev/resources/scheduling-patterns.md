# Scheduling Patterns

Guide for implementing cast scheduling logic in Farcaster Scheduler.

## Architecture

```
User schedules cast → Database (PENDING) → Cron Job → Publisher → Neynar → Farcaster
```

## Core Components

### 1. Scheduler (packages/core/src/scheduler/)

Responsible for:
- Creating scheduled casts
- Validating schedule times
- Managing cast lifecycle
- Updating schedules

```typescript
export class Scheduler {
  async scheduleCast(
    userId: string,
    content: string,
    options: ScheduleOptions
  ) {
    // Validate time is in future
    if (options.scheduledTime <= new Date()) {
      throw new Error('Time must be in future')
    }
    
    // Validate content
    if (content.length > 320) {
      throw new Error('Cast exceeds 320 characters')
    }
    
    // Create in database
    return scheduledCastRepository.create({
      userId,
      content,
      scheduledTime: options.scheduledTime,
      priority: options.priority || CastPriority.NORMAL,
    })
  }
}
```

### 2. Publisher (packages/core/src/publisher/)

Responsible for:
- Finding due casts
- Publishing to Neynar
- Updating status
- Handling failures

```typescript
export class Publisher {
  async publishDueCasts() {
    // Find casts ready to publish
    const casts = await scheduledCastRepository.findDueForPublishing()
    
    // Publish each
    const results = await Promise.allSettled(
      casts.map(cast => this.publishSingleCast(cast.id))
    )
    
    return {
      total: casts.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
    }
  }
}
```

### 3. Worker (apps/worker/)

Cron job that runs every minute:

```typescript
import { CronJob } from 'cron'
import { publisher } from '@farcaster-scheduler/core'

const job = new CronJob(
  '* * * * *', // Every minute
  async () => {
    await publisher.publishDueCasts()
  },
  null,
  true, // Start immediately
  'America/Los_Angeles' // Timezone
)
```

## Database Schema

```prisma
model ScheduledCast {
  id            String      @id @default(cuid())
  userId        String
  content       String
  scheduledTime DateTime
  publishedAt   DateTime?
  status        CastStatus  @default(PENDING)
  priority      CastPriority @default(NORMAL)
  castHash      String?
  errorMessage  String?
  retryCount    Int         @default(0)
  
  @@index([status, scheduledTime])
}

enum CastStatus {
  PENDING
  PUBLISHED
  FAILED
  CANCELLED
}

enum CastPriority {
  LOW
  NORMAL
  HIGH
}
```

## Error Handling & Retries

```typescript
async publishSingleCast(castId: string) {
  const cast = await scheduledCastRepository.findById(castId)
  
  // Check retry limit
  if (cast.retryCount >= MAX_RETRIES) {
    return { success: false, error: 'Max retries exceeded' }
  }
  
  // Attempt publish
  const result = await publishCast(
    cast.user.signerUuid,
    cast.content
  )
  
  if (result.success) {
    await scheduledCastRepository.markAsPublished(castId, result.castHash!)
  } else {
    await scheduledCastRepository.markAsFailed(castId, result.error!)
  }
  
  return result
}
```

## Priority Queue

Casts are processed by priority:

```typescript
async findDueForPublishing(limit = 100) {
  return prisma.scheduledCast.findMany({
    where: {
      status: CastStatus.PENDING,
      scheduledTime: { lte: new Date() },
    },
    orderBy: [
      { priority: 'desc' }, // HIGH → NORMAL → LOW
      { scheduledTime: 'asc' }, // Oldest first
    ],
    take: limit,
  })
}
```

## Timezone Handling

```typescript
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

// Convert user's local time to UTC for storage
const userTime = new Date('2024-12-25 10:00')
const userTimezone = 'America/New_York'
const utcTime = zonedTimeToUtc(userTime, userTimezone)

// Store in database
await scheduleCast(userId, content, { scheduledTime: utcTime })

// Display to user in their timezone
const displayTime = utcToZonedTime(cast.scheduledTime, userTimezone)
```

## Best Practices

1. **Always validate times**: Ensure schedule time is in future
2. **Use priorities**: Important casts get published first
3. **Limit retries**: Don't retry forever
4. **Log everything**: Debugging scheduled tasks is hard
5. **Handle failures gracefully**: Mark as failed, don't crash worker
6. **Monitor queue depth**: Alert if queue backs up
7. **Consider rate limits**: Don't overwhelm Neynar

## Testing

```typescript
describe('Scheduler', () => {
  it('rejects past times', async () => {
    const pastTime = new Date(Date.now() - 1000)
    
    await expect(
      scheduler.scheduleCast(userId, 'test', { scheduledTime: pastTime })
    ).rejects.toThrow('Time must be in future')
  })
  
  it('creates cast with correct priority', async () => {
    const cast = await scheduler.scheduleCast(userId, 'test', {
      scheduledTime: futureTime,
      priority: CastPriority.HIGH,
    })
    
    expect(cast.priority).toBe(CastPriority.HIGH)
  })
})
```

## Monitoring

Key metrics to track:
- Queue depth (pending casts)
- Publish success rate
- Average time from schedule to publish
- Error rate by error type
- Retry count distribution

```typescript
async getMetrics() {
  const stats = await scheduledCastRepository.countByStatus()
  
  return {
    pending: stats.pending,
    published: stats.published,
    failed: stats.failed,
    successRate: stats.published / (stats.published + stats.failed),
  }
}
```
