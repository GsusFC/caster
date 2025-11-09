# Neynar Integration Patterns

Comprehensive guide for working with Neynar SDK in the Farcaster Scheduler.

## Setup

### Client Configuration

```typescript
// packages/farcaster/src/neynar-client.ts
import { NeynarAPIClient } from '@neynar/nodejs-sdk'

if (!process.env.NEYNAR_API_KEY) {
  throw new Error('NEYNAR_API_KEY is required')
}

export const neynarClient = new NeynarAPIClient(
  process.env.NEYNAR_API_KEY
)
```

## Core Operations

### 1. Publishing Casts

```typescript
export async function publishCast(
  signerUuid: string,
  text: string,
  options?: {
    embeds?: Array<{ url: string }>
    channelKey?: string
    parent?: string // For replies
  }
) {
  try {
    const response = await neynarClient.publishCast(
      signerUuid,
      text,
      {
        embeds: options?.embeds || [],
        channelKey: options?.channelKey,
        parent: options?.parent,
      }
    )

    return {
      success: true,
      castHash: response.hash,
      cast: response,
    }
  } catch (error) {
    console.error('[Neynar] Publish cast failed:', error)
    
    // Parse Neynar error
    const errorMessage = parseNeynarError(error)
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}
```

### 2. Creating Signers

```typescript
export async function createSigner() {
  try {
    const response = await neynarClient.createSigner()
    
    return {
      success: true,
      signer: {
        signerUuid: response.signer_uuid,
        publicKey: response.public_key,
        status: response.status,
        signerApprovalUrl: response.signer_approval_url,
      },
    }
  } catch (error) {
    console.error('[Neynar] Create signer failed:', error)
    return {
      success: false,
      error: parseNeynarError(error),
    }
  }
}
```

### 3. Looking Up Signers

```typescript
export async function lookupSigner(signerUuid: string) {
  try {
    const response = await neynarClient.lookupSigner(signerUuid)
    
    return {
      success: true,
      signer: {
        uuid: response.signer_uuid,
        fid: response.fid,
        status: response.status, // 'pending_approval', 'approved', 'revoked'
      },
    }
  } catch (error) {
    console.error('[Neynar] Lookup signer failed:', error)
    return {
      success: false,
      error: parseNeynarError(error),
    }
  }
}
```

### 4. Fetching User Data

```typescript
export async function getUserByFid(fid: number) {
  try {
    const response = await neynarClient.fetchBulkUsers([fid])
    const user = response.users[0]
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    return {
      success: true,
      user: {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        bio: user.profile.bio.text,
        followerCount: user.follower_count,
        followingCount: user.following_count,
      },
    }
  } catch (error) {
    console.error('[Neynar] Get user failed:', error)
    return {
      success: false,
      error: parseNeynarError(error),
    }
  }
}
```

### 5. Fetching Cast Details

```typescript
export async function getCastByHash(hash: string) {
  try {
    const response = await neynarClient.lookUpCastByHashOrWarpcastUrl(
      hash,
      'hash'
    )
    
    return {
      success: true,
      cast: {
        hash: response.cast.hash,
        text: response.cast.text,
        author: response.cast.author,
        timestamp: response.cast.timestamp,
        reactions: {
          likes: response.cast.reactions.likes_count,
          recasts: response.cast.reactions.recasts_count,
          replies: response.cast.replies.count,
        },
        embeds: response.cast.embeds,
      },
    }
  } catch (error) {
    console.error('[Neynar] Get cast failed:', error)
    return {
      success: false,
      error: parseNeynarError(error),
    }
  }
}
```

## Error Handling

### Parsing Neynar Errors

```typescript
function parseNeynarError(error: unknown): string {
  if (error instanceof Error) {
    // Check for specific Neynar error messages
    const message = error.message.toLowerCase()
    
    if (message.includes('invalid signer')) {
      return 'Signer is invalid or revoked. Please reconnect your account.'
    }
    
    if (message.includes('rate limit')) {
      return 'Rate limit exceeded. Please try again in a few minutes.'
    }
    
    if (message.includes('cast too long')) {
      return 'Cast exceeds 320 character limit.'
    }
    
    if (message.includes('invalid channel')) {
      return 'Channel not found or invalid.'
    }
    
    if (message.includes('unauthorized')) {
      return 'Not authorized to perform this action.'
    }
    
    return error.message
  }
  
  return 'Unknown error occurred'
}
```

### Retry Logic

```typescript
export async function publishCastWithRetry(
  signerUuid: string,
  text: string,
  options?: PublishOptions,
  maxRetries = 3
) {
  let lastError: string = ''
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await publishCast(signerUuid, text, options)
    
    if (result.success) {
      return result
    }
    
    lastError = result.error || 'Unknown error'
    
    // Don't retry for certain errors
    if (
      lastError.includes('invalid signer') ||
      lastError.includes('character limit') ||
      lastError.includes('unauthorized')
    ) {
      break
    }
    
    // Exponential backoff
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
      console.log(`[Neynar] Retry ${attempt}/${maxRetries} after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return {
    success: false,
    error: lastError,
  }
}
```

## Advanced Features

### Publishing with Images

```typescript
export async function publishCastWithImages(
  signerUuid: string,
  text: string,
  imageUrls: string[],
  options?: Omit<PublishOptions, 'embeds'>
) {
  // Validate image URLs
  const validUrls = imageUrls.filter(url => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  })
  
  if (validUrls.length === 0) {
    return {
      success: false,
      error: 'No valid image URLs provided',
    }
  }
  
  // Neynar supports up to 2 images per cast
  const embeds = validUrls.slice(0, 2).map(url => ({ url }))
  
  return publishCast(signerUuid, text, {
    ...options,
    embeds,
  })
}
```

### Publishing to Channels

```typescript
export async function publishToChannel(
  signerUuid: string,
  text: string,
  channelKey: string
) {
  return publishCast(signerUuid, text, { channelKey })
}

// Common channels
export const CHANNELS = {
  FARCASTER: 'farcaster',
  DEV: 'dev',
  DESIGN: 'design',
  CRYPTO: 'crypto',
  // Add more as needed
}
```

### Creating Threads

```typescript
export async function publishThread(
  signerUuid: string,
  casts: string[]
) {
  const results: Array<{ success: boolean; castHash?: string; error?: string }> = []
  let parentHash: string | undefined = undefined
  
  for (const text of casts) {
    const result = await publishCast(signerUuid, text, {
      parent: parentHash,
    })
    
    results.push(result)
    
    if (!result.success) {
      // Stop on first failure
      break
    }
    
    parentHash = result.castHash
  }
  
  return {
    success: results.every(r => r.success),
    results,
  }
}
```

## Rate Limits

Neynar has rate limits - handle them gracefully:

```typescript
const RATE_LIMIT = {
  CASTS_PER_MINUTE: 10,
  CASTS_PER_HOUR: 100,
}

// Simple in-memory rate limiter
class RateLimiter {
  private timestamps: number[] = []
  
  canPublish(): boolean {
    const now = Date.now()
    const oneMinuteAgo = now - 60 * 1000
    
    // Remove old timestamps
    this.timestamps = this.timestamps.filter(t => t > oneMinuteAgo)
    
    return this.timestamps.length < RATE_LIMIT.CASTS_PER_MINUTE
  }
  
  recordPublish(): void {
    this.timestamps.push(Date.now())
  }
}

export const rateLimiter = new RateLimiter()
```

## Testing with Mock Data

```typescript
// For testing, mock Neynar client
export function createMockNeynarClient() {
  return {
    publishCast: async (signerUuid: string, text: string) => ({
      hash: 'mock-hash-' + Date.now(),
      text,
      author: { fid: 12345, username: 'testuser' },
    }),
    
    createSigner: async () => ({
      signer_uuid: 'mock-signer-uuid',
      public_key: 'mock-public-key',
      status: 'approved',
    }),
    
    // Add more mocks as needed
  }
}
```

## Best Practices

1. **Always use try-catch**: Neynar calls can fail
2. **Parse errors**: Convert Neynar errors to user-friendly messages
3. **Retry transient failures**: Network issues, rate limits
4. **Don't retry permanent failures**: Invalid signer, content issues
5. **Log everything**: Especially errors and rate limit hits
6. **Respect rate limits**: Don't spam the API
7. **Validate before calling**: Check text length, image URLs, etc.

## Common Pitfalls

❌ **Not checking signer status**
```typescript
// BAD: Assuming signer is approved
await publishCast(signerUuid, text)

// GOOD: Check signer first
const signerStatus = await lookupSigner(signerUuid)
if (signerStatus.signer?.status !== 'approved') {
  return { success: false, error: 'Signer not approved' }
}
```

❌ **Exposing raw errors to users**
```typescript
// BAD
catch (error) {
  return { error: error.message } // Might expose API keys!
}

// GOOD
catch (error) {
  console.error('Internal error:', error)
  return { error: 'Failed to publish cast' }
}
```

❌ **Not handling rate limits**
```typescript
// BAD: Spam the API
for (const cast of casts) {
  await publishCast(signerUuid, cast) // Might hit rate limit!
}

// GOOD: Add delays
for (const cast of casts) {
  await publishCast(signerUuid, cast)
  await sleep(6000) // 10 casts/minute = 6 seconds between
}
```

## Reference

- [Neynar Docs](https://docs.neynar.com)
- [Neynar SDK](https://github.com/neynarxyz/nodejs-sdk)
- [Farcaster Protocol](https://docs.farcaster.xyz)
