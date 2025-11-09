import { scheduledCastRepository } from '@farcaster-scheduler/database'
import { CastPriority, ScheduleOptions } from '@farcaster-scheduler/types'

/**
 * Scheduler service for managing scheduled casts
 */
export class Scheduler {
  /**
   * Schedule a new cast
   */
  async scheduleCast(
    userId: string,
    content: string,
    options: ScheduleOptions
  ) {
    // Validate scheduled time is in the future
    if (options.scheduledTime <= new Date()) {
      throw new Error('Scheduled time must be in the future')
    }

    // Validate content length (Farcaster limit is 320 characters)
    if (content.length > 320) {
      throw new Error('Cast content exceeds 320 character limit')
    }

    const cast = await scheduledCastRepository.create({
      userId,
      content,
      scheduledTime: options.scheduledTime,
      priority: options.priority || CastPriority.NORMAL,
      channelKey: options.channelKey,
      threadId: options.threadId,
    })

    return cast
  }

  /**
   * Schedule multiple casts (batch)
   */
  async scheduleBatch(
    userId: string,
    casts: Array<{
      content: string
      scheduledTime: Date
      mediaUrls?: string[]
      channelKey?: string
      priority?: CastPriority
    }>
  ) {
    const scheduled = await Promise.all(
      casts.map((cast) =>
        scheduledCastRepository.create({
          userId,
          content: cast.content,
          scheduledTime: cast.scheduledTime,
          mediaUrls: cast.mediaUrls,
          channelKey: cast.channelKey,
          priority: cast.priority || CastPriority.NORMAL,
        })
      )
    )

    return scheduled
  }

  /**
   * Update a scheduled cast
   */
  async updateScheduledCast(
    castId: string,
    updates: {
      content?: string
      scheduledTime?: Date
      mediaUrls?: string[]
      channelKey?: string
      priority?: CastPriority
    }
  ) {
    const cast = await scheduledCastRepository.findById(castId)

    if (!cast) {
      throw new Error('Cast not found')
    }

    if (cast.status !== 'PENDING') {
      throw new Error('Can only update pending casts')
    }

    // Validate scheduled time if being updated
    if (updates.scheduledTime && updates.scheduledTime <= new Date()) {
      throw new Error('Scheduled time must be in the future')
    }

    // Validate content length if being updated
    if (updates.content && updates.content.length > 320) {
      throw new Error('Cast content exceeds 320 character limit')
    }

    return scheduledCastRepository.update(castId, updates)
  }

  /**
   * Cancel a scheduled cast
   */
  async cancelCast(castId: string) {
    const cast = await scheduledCastRepository.findById(castId)

    if (!cast) {
      throw new Error('Cast not found')
    }

    if (cast.status !== 'PENDING') {
      throw new Error('Can only cancel pending casts')
    }

    return scheduledCastRepository.cancel(castId)
  }

  /**
   * Delete a scheduled cast
   */
  async deleteCast(castId: string) {
    return scheduledCastRepository.delete(castId)
  }

  /**
   * Get user's scheduled casts
   */
  async getUserCasts(
    userId: string,
    options?: {
      status?: 'PENDING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED'
      limit?: number
      offset?: number
    }
  ) {
    return scheduledCastRepository.findByUserId(userId, options)
  }

  /**
   * Get cast statistics for a user
   */
  async getUserStats(userId: string) {
    return scheduledCastRepository.countByStatus(userId)
  }
}

export const scheduler = new Scheduler()
