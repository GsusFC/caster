import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const neynarClientId = process.env.NEYNAR_CLIENT_ID
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`

  if (!neynarClientId) {
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

  return NextResponse.redirect(authUrl.toString())
}
