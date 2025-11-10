import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  console.log('=== SignIn Route Called ===')
  const neynarApiKey = process.env.NEYNAR_API_KEY
  const neynarClientId = process.env.NEYNAR_CLIENT_ID
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`

  console.log('NEYNAR_CLIENT_ID:', neynarClientId ? 'Set' : 'Missing')
  console.log('NEYNAR_API_KEY:', neynarApiKey ? 'Set' : 'Missing')
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
  console.log('Redirect URI:', redirectUri)

  if (!neynarClientId || !neynarApiKey) {
    console.error('Neynar credentials not configured')
    return NextResponse.json(
      { error: 'Neynar credentials not configured' },
      { status: 500 }
    )
  }

  try {
    // Get authorization URL from Neynar API
    console.log('Fetching authorization URL from Neynar...')
    const response = await fetch(
      'https://api.neynar.com/v2/farcaster/login/authorize',
      {
        method: 'GET',
        headers: {
          'api_key': neynarApiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Neynar API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to get authorization URL from Neynar' },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log('Authorization URL received:', data)

    // The response should contain an authorization_url
    if (data.authorization_url) {
      console.log('Redirecting to:', data.authorization_url)
      return NextResponse.redirect(data.authorization_url)
    } else {
      console.error('No authorization_url in response:', data)
      return NextResponse.json(
        { error: 'Invalid response from Neynar' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching authorization URL:', error)
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    )
  }
}
