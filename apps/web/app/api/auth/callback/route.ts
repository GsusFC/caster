import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@farcaster-scheduler/database'
import { setSessionCookie } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  console.log('=== SIWN Callback Received ===')
  console.log('Full URL:', request.url)

  const searchParams = request.nextUrl.searchParams

  // SIWN returns fid and signer_uuid directly
  const fidStr = searchParams.get('fid')
  const signerUuid = searchParams.get('signer_uuid')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Log all query parameters
  const allParams: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    allParams[key] = value
  })
  console.log('All query params:', JSON.stringify(allParams, null, 2))

  if (error) {
    console.error('SIWN error received:', error, errorDescription)
    return NextResponse.json(
      { success: false, error: error, description: errorDescription },
      { status: 400 }
    )
  }

  if (!fidStr || !signerUuid) {
    console.error('Missing fid or signer_uuid in callback')
    return NextResponse.json(
      { success: false, error: 'missing_parameters' },
      { status: 400 }
    )
  }

  const fid = parseInt(fidStr, 10)
  if (isNaN(fid)) {
    console.error('Invalid fid received:', fidStr)
    return NextResponse.json(
      { success: false, error: 'invalid_fid' },
      { status: 400 }
    )
  }

  // Check if FID is in allowed list
  const allowedFids = process.env.ALLOWED_FIDS?.split(',').map(f => parseInt(f.trim(), 10)) || []
  if (allowedFids.length > 0 && !allowedFids.includes(fid)) {
    console.error('FID not in allowed list:', fid)
    return NextResponse.json(
      { success: false, error: 'unauthorized_fid', message: 'This FID is not authorized to access this application' },
      { status: 403 }
    )
  }

  console.log('SIWN callback - FID:', fid, 'Signer UUID:', signerUuid)

  try {
    // Get user info from Neynar using FID (skip if no API key)
    const neynarApiKey = process.env.NEYNAR_API_KEY
    let userResponse = null

    if (neynarApiKey) {
      console.log('Fetching user info for FID:', fid)
      userResponse = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
        {
          headers: {
            'api_key': neynarApiKey,
            'Content-Type': 'application/json',
          },
        }
      )
    } else {
      console.log('NEYNAR_API_KEY not set, skipping API call')
    }

    if (!userResponse || !userResponse.ok) {
      if (userResponse) {
        const errorText = await userResponse.text()
        console.error('Failed to fetch user info:', userResponse.status, errorText)
      }

      // If Neynar API fails, create a demo user
      console.log('Creating demo user instead...')
      const demoUser = await prisma.user.upsert({
        where: { fid: fid },
        update: {
          username: `user${fid}`,
          displayName: `Demo User ${fid}`,
          pfpUrl: null,
          signerUuid: signerUuid,
        },
        create: {
          fid: fid,
          username: `user${fid}`,
          displayName: `Demo User ${fid}`,
          pfpUrl: null,
          signerUuid: signerUuid,
        },
      })

      // Set session cookie with demo user
      await setSessionCookie({
        id: demoUser.id,
        fid: demoUser.fid,
        username: demoUser.username,
        displayName: demoUser.displayName,
        pfpUrl: demoUser.pfpUrl || undefined,
        signerUuid: demoUser.signerUuid,
      })

      console.log('Demo user session created successfully')
      return NextResponse.json({ success: true, user: demoUser })
    }

    const userData = await userResponse.json()
    console.log('User data received:', JSON.stringify(userData, null, 2))

    // Extract user info from the bulk response
    const users = userData.users
    if (!users || users.length === 0) {
      throw new Error('No user data returned from Neynar')
    }

    const neynarUser = users[0]

    // Save or update user in database
    console.log('Saving user to database...')
    const user = await prisma.user.upsert({
      where: { fid: fid },
      update: {
        username: neynarUser.username,
        displayName: neynarUser.display_name || null,
        pfpUrl: neynarUser.pfp_url || null,
        signerUuid: signerUuid,
      },
      create: {
        fid: fid,
        username: neynarUser.username,
        displayName: neynarUser.display_name || null,
        pfpUrl: neynarUser.pfp_url || null,
        signerUuid: signerUuid,
      },
    })
    console.log('User saved:', user.id)

    // Set session cookie
    await setSessionCookie({
      id: user.id,
      fid: user.fid,
      username: user.username,
      displayName: user.displayName,
      pfpUrl: user.pfpUrl || undefined,
      signerUuid: user.signerUuid,
    })

    // Return success
    return NextResponse.json({ success: true, user: user })
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.json(
      { success: false, error: 'authentication_failed' },
      { status: 500 }
    )
  }
}
