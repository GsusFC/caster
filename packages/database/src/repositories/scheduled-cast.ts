import { CastStatus, CastPriority, Prisma } from '@prisma/client'
import { prisma } from '../client'

export class ScheduledCastRepository {
  /**
   * Create a new scheduled cast
   */
  async create(data: {
    userId: string
    content: string
    scheduledTime: Date
    mediaUrls?: string[]
    channelKey?: string
    priority?: CastPriority
    threadId?: string
    threadOrder?: number
  }) {
    return prisma.scheduledCast.create({
      data: {
        userId: data.userId,
        content: data.content,
        scheduledTime: data.scheduledTime,
        mediaUrls: data.mediaUrls || [],
        channelKey: data.channelKey,
        priority: data.priority || CastPriority.NORMAL,
        threadId: data.threadId,
        threadOrder: data.threadOrder,
        status: CastStatus.PENDING,
      },
      include: {
        user: true,
      },
    })
  }

  /**
   * Find cast by ID
   */
  async findById(id: string) {
    return prisma.scheduledCast.findUnique({
      where: { id },
      include: {
        user: true,
        thread: true,
      },
    })
  }

  /**
   * Find casts due for publishing
   */
  async findDueForPublishing(limit = 100) {
    return prisma.scheduledCast.findMany({
      where: {
        status: CastStatus.PENDING,
        scheduledTime: {
          lte: new Date(),
        },
      },
      include: {
        user: true,
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledTime: 'asc' },
      ],
      take: limit,
    })
  }

  /**
   * Find casts by user ID
   */
  async findByUserId(
    userId: string,
    options?: {
      status?: CastStatus
      limit?: number
      offset?: number
    }
  ) {
    const where: Prisma.ScheduledCastWhereInput = {
      userId,
    }

    if (options?.status) {
      where.status = options.status
    }

    return prisma.scheduledCast.findMany({
      where,
      orderBy: {
        scheduledTime: 'desc',
      },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      include: {
        thread: true,
      },
    })
  }

  /**
   * Update cast
   */
  async update(
    id: string,
    data: {
      content?: string
      scheduledTime?: Date
      mediaUrls?: string[]
      channelKey?: string
      priority?: CastPriority
      status?: CastStatus
      castHash?: string
      errorMessage?: string
      publishedAt?: Date
      retryCount?: number
    }
  ) {
    return prisma.scheduledCast.update({
      where: { id },
      data,
    })
  }

  /**
   * Mark as published
   */
  async markAsPublished(id: string, castHash: string) {
    return this.update(id, {
      status: CastStatus.PUBLISHED,
      castHash,
      publishedAt: new Date(),
    })
  }

  /**
   * Mark as failed
   */
  async markAsFailed(id: string, errorMessage: string) {
    const cast = await this.findById(id)
    
    return this.update(id, {
      status: CastStatus.FAILED,
      errorMessage,
      retryCount: (cast?.retryCount || 0) + 1,
    })
  }

  /**
   * Cancel cast
   */
  async cancel(id: string) {
    return this.update(id, {
      status: CastStatus.CANCELLED,
    })
  }

  /**
   * Delete cast
   */
  async delete(id: string) {
    return prisma.scheduledCast.delete({
      where: { id },
    })
  }

  /**
   * Count casts by status
   */
  async countByStatus(userId: string) {
    const [total, pending, published, failed, cancelled] = await Promise.all([
      prisma.scheduledCast.count({ where: { userId } }),
      prisma.scheduledCast.count({ where: { userId, status: CastStatus.PENDING } }),
      prisma.scheduledCast.count({ where: { userId, status: CastStatus.PUBLISHED } }),
      prisma.scheduledCast.count({ where: { userId, status: CastStatus.FAILED } }),
      prisma.scheduledCast.count({ where: { userId, status: CastStatus.CANCELLED } }),
    ])

    return {
      total,
      pending,
      published,
      failed,
      cancelled,
    }
  }
}

export const scheduledCastRepository = new ScheduledCastRepository()
