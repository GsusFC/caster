import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// JWT configuration
const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
)
const SESSION_COOKIE_NAME = 'session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface SessionUser {
  id: string
  fid: number
  username: string
  displayName: string | null
  pfpUrl?: string
  signerUuid: string
}

export interface Session {
  user: SessionUser
  expires: number
}

// Create JWT token
export async function createToken(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return token
}

// Verify JWT token
export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as unknown as Session
  } catch (error) {
    return null
  }
}

// Get session from cookies (Server Components)
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

// Get session from request (API routes)
export async function getSessionFromRequest(
  request: NextRequest
): Promise<Session | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

// Set session cookie
export async function setSessionCookie(user: SessionUser) {
  const token = await createToken(user)
  const cookieStore = await cookies()

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  })
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
