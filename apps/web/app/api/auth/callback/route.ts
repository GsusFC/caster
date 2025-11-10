import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@farcaster-scheduler/database'
import { setSessionCookie } from '@/lib/auth'

export const runtime = 'nodejs'

interface NeynarTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface NeynarUserResponse {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  signer_uuid: string
}

export async function GET(request: NextRequest) {
  console.log('=== OAuth Callback Received ===')
  console.log('Full URL:', request.url)

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Log all query parameters
  const allParams: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    allParams[key] = value
  })
  console.log('All query params:', JSON.stringify(allParams, null, 2))

  if (error) {
    console.error('OAuth error received:', error, errorDescription)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=${error}`)
  }

  if (!code) {
    console.error('No code parameter received')
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/?error=missing_code`
    )
  }

  console.log('Authorization code received, exchanging for token...')

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://app.neynar.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.NEYNAR_CLIENT_ID,
        client_secret: process.env.NEYNAR_API_KEY, // Using API key as client secret
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData: NeynarTokenResponse = await tokenResponse.json()

    // Get user info from Neynar
    const userResponse = await fetch('https://api.neynar.com/v2/farcaster/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'x-api-key': process.env.NEYNAR_API_KEY!,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info')
    }

    const userData: NeynarUserResponse = await userResponse.json()

    // Save or update user in database
    const user = await prisma.user.upsert({
      where: { fid: userData.fid },
      update: {
        username: userData.username,
        displayName: userData.display_name,
        pfpUrl: userData.pfp_url,
        signerUuid: userData.signer_uuid,
      },
      create: {
        fid: userData.fid,
        username: userData.username,
        displayName: userData.display_name,
        pfpUrl: userData.pfp_url,
        signerUuid: userData.signer_uuid,
      },
    })

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
