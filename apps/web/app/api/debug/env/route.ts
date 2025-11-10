import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const envVars = {
    NEYNAR_CLIENT_ID: process.env.NEYNAR_CLIENT_ID ? 'Set (hidden)' : 'NOT SET',
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY ? 'Set (hidden)' : 'NOT SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set (hidden)' : 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    // List all env vars starting with NEYNAR or NEXTAUTH
    allNeynarKeys: Object.keys(process.env).filter(key => key.startsWith('NEYNAR')),
    allNextAuthKeys: Object.keys(process.env).filter(key => key.startsWith('NEXTAUTH')),
  }

  return NextResponse.json(envVars)
}
