import { scheduledCastRepository } from '@farcaster-scheduler/database'
import { publishCast } from '@farcaster-scheduler/farcaster'
import { PublishResult } from '@farcaster-scheduler/types'

/**
 * Publisher service for publishing scheduled casts
 */
export class Publisher {
  /**
   * Publish a single cast
   */
  async publishSingleCast(castId: string): Promise<PublishResult> {
    const cast = await scheduledCastRepository.findById(castId)

    if (!cast) {
      return {
        success: false,
        error: 'Cast not found',
      }
    }

    if (cast.status !== 'PENDING') {
      return {
        success: false,
        error: `Cast status is ${cast.status}, expected PENDING`,
      }
    }

    // Prepare embeds
    const embeds = cast.mediaUrls.map((url) => ({ url }))

    // Publish to Farcaster via Neynar
    const result = await publishCast(
      cast.user.signerUuid,
      cast.content,
      {
        embeds,
        channelKey: cast.channelKey || undefined,
      }
    )

    if (result.success && result.castHash) {
      // Mark as published
      await scheduledCastRepository.markAsPublished(castId, result.castHash)
      
      return {
        success: true,
        castHash: result.castHash,
      }
    } else {
      // Mark as failed
      await scheduledCastRepository.markAsFailed(
        castId,
        result.error || 'Unknown error'
      )

      return {
        success: false,
        error: result.error,
      }
    }
  }

  /**
   * Publish all due casts
   */
  async publishDueCasts() {
    const dueCasts = await scheduledCastRepository.findDueForPublishing()

    console.log(`Found ${dueCasts.length} casts due for publishing`)

    const results = await Promise.allSettled(
      dueCasts.map((cast) => this.publishSingleCast(cast.id))
    )

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length

    const failed = results.length - successful

    console.log(`Published: ${successful} successful, ${failed} failed`)

    return {
      total: dueCasts.length,
      successful,
      failed,
      results,
    }
  }
}

export const publisher = new Publisher()
