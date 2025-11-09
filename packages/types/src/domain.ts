/**
 * Domain types for Farcaster Scheduler
 */

export enum CastStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum CastPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

export interface User {
  id: string
  fid: number
  username: string
  displayName?: string
  pfpUrl?: string
  signerUuid: string
  createdAt: Date
  updatedAt: Date
}

export interface ScheduledCast {
  id: string
  userId: string
  content: string
  mediaUrls?: string[]
  channelKey?: string
  scheduledTime: Date
  publishedAt?: Date
  status: CastStatus
  priority: CastPriority
  castHash?: string
  errorMessage?: string
  retryCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CastThread {
  id: string
  userId: string
  casts: ScheduledCast[]
  status: CastStatus
  scheduledTime: Date
  createdAt: Date
  updatedAt: Date
}

export interface PublishResult {
  success: boolean
  castHash?: string
  error?: string
}

export interface ScheduleOptions {
  scheduledTime: Date
  priority?: CastPriority
  channelKey?: string
  threadId?: string
}
