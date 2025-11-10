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
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=${error}`)
  }

  if (!fidStr || !signerUuid) {
    console.error('Missing fid or signer_uuid in callback')
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/?error=missing_parameters`
    )
  }

  const fid = parseInt(fidStr, 10)
  if (isNaN(fid)) {
    console.error('Invalid fid received:', fidStr)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/?error=invalid_fid`
    )
  }

  console.log('SIWN callback - FID:', fid, 'Signer UUID:', signerUuid)

  try {
    // Get user info from Neynar using FID
    console.log('Fetching user info for FID:', fid)
    const userResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('Failed to fetch user info:', userResponse.status, errorText)
      throw new Error('Failed to fetch user info from Neynar')
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

    // Redirect to dashboard
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/?error=authentication_failed`
    )
  }
}
