import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  console.log('=== SignIn Route Called ===')
  const neynarClientId = process.env.NEYNAR_CLIENT_ID
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`

  console.log('NEYNAR_CLIENT_ID:', neynarClientId ? 'Set' : 'Missing')
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
  console.log('Redirect URI:', redirectUri)

  if (!neynarClientId) {
    console.error('NEYNAR_CLIENT_ID not configured')
    return NextResponse.json(
      { error: 'NEYNAR_CLIENT_ID not configured' },
      { status: 500 }
    )
  }

  // Build Neynar OAuth URL
  const authUrl = new URL('https://app.neynar.com/oauth/authorize')
  authUrl.searchParams.set('client_id', neynarClientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'user:read cast:write')

  console.log('Redirecting to Neynar:', authUrl.toString())
  return NextResponse.redirect(authUrl.toString())
}
