/**
 * API request/response types
 */

import { CastPriority, CastStatus, ScheduledCast } from './domain'

// Auth
export interface SignInRequest {
  fid: number
  signature: string
  message: string
}

export interface SignInResponse {
  user: {
    id: string
    fid: number
    username: string
    signerUuid: string
  }
  token: string
}

// Casts
export interface CreateCastRequest {
  content: string
  mediaUrls?: string[]
  channelKey?: string
  scheduledTime: string // ISO date string
  priority?: CastPriority
}

export interface CreateCastResponse {
  cast: ScheduledCast
}

export interface ListCastsRequest {
  status?: CastStatus
  limit?: number
  offset?: number
}

export interface ListCastsResponse {
  casts: ScheduledCast[]
  total: number
  hasMore: boolean
}

export interface UpdateCastRequest {
  content?: string
  mediaUrls?: string[]
  scheduledTime?: string
  priority?: CastPriority
  status?: CastStatus
}

export interface UpdateCastResponse {
  cast: ScheduledCast
}

export interface DeleteCastResponse {
  success: boolean
}

// Analytics
export interface AnalyticsData {
  totalCasts: number
  publishedCasts: number
  failedCasts: number
  pendingCasts: number
  avgEngagement?: number
}

export interface AnalyticsResponse {
  data: AnalyticsData
  period: {
    start: string
    end: string
  }
}

// API Error
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
