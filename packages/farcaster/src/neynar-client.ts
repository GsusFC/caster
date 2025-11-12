import { NeynarAPIClient } from '@neynar/nodejs-sdk'

if (!process.env.NEYNAR_API_KEY) {
  throw new Error('NEYNAR_API_KEY environment variable is required')
}

/**
 * Neynar API client singleton
 */
export const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY)

/**
 * Publish a cast to Farcaster
 */
export async function publishCast(
  signerUuid: string,
  text: string,
  options?: {
    embeds?: Array<{ url: string }>
    channelKey?: string
    parent?: string
  }
) {
  try {
    const response = await neynarClient.publishCast(
      signerUuid,
      text,
      {
        embeds: options?.embeds || [],
        channelId: options?.channelKey, // Neynar SDK usa channelId
        replyTo: options?.parent, // Neynar SDK usa replyTo
      }
    )

    return {
      success: true,
      castHash: response.hash,
      cast: response,
    }
  } catch (error) {
    // Log error detallado para debugging
    console.error('Error publishing cast:', JSON.stringify(error, null, 2))
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create a signer for a user
 */
export async function createSigner() {
  try {
    const response = await neynarClient.createSigner()
    return {
      success: true,
      signer: response,
    }
  } catch (error) {
    console.error('Error creating signer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Look up a signer by UUID
 */
export async function lookupSigner(signerUuid: string) {
  try {
    const response = await neynarClient.lookupSigner(signerUuid)
    return {
      success: true,
      signer: response,
    }
  } catch (error) {
    console.error('Error looking up signer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get user by FID
 */
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
      },
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch cast by hash
 */
export async function getCastByHash(hash: string) {
  try {
    const response = await neynarClient.lookUpCastByHashOrWarpcastUrl(hash, 'hash')
    return {
      success: true,
      cast: response.cast,
    }
  } catch (error) {
    console.error('Error fetching cast:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export * from '@neynar/nodejs-sdk'
