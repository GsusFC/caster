import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@farcaster-scheduler/database'

// Force Node.js runtime for Prisma
export const runtime = 'nodejs'

// GET /api/casts - List all casts for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's FID from session
    const userFid = session.user.fid

    if (!userFid) {
      return NextResponse.json({ error: 'User FID not found' }, { status: 400 })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { fid: userFid },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all casts for this user, ordered by scheduled time
    const casts = await prisma.scheduledCast.findMany({
      where: { userId: user.id },
      orderBy: { scheduledTime: 'asc' },
    })

    return NextResponse.json(casts)
  } catch (error) {
    console.error('Error fetching casts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch casts' },
      { status: 500 }
    )
  }
}

// POST /api/casts - Create a new scheduled cast
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's FID from session
    const userFid = session.user.fid

    if (!userFid) {
      return NextResponse.json({ error: 'User FID not found' }, { status: 400 })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { fid: userFid },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { content, scheduledTime, priority = 'NORMAL' } = body

    console.log('Creating cast:', { content: content?.substring(0, 50), scheduledTime, priority })

    // Validate input
    if (!content || !scheduledTime) {
      console.error('Missing required fields:', { hasContent: !!content, hasScheduledTime: !!scheduledTime })
      return NextResponse.json(
        { error: 'Content and scheduledTime are required' },
        { status: 400 }
      )
    }

    if (content.length > 320) {
      console.error('Content too long:', content.length)
      return NextResponse.json(
        { error: 'Content must be 320 characters or less' },
        { status: 400 }
      )
    }

    const scheduledDate = new Date(scheduledTime)
    const now = new Date()

    console.log('Time comparison:', {
      scheduledDate: scheduledDate.toISOString(),
      now: now.toISOString(),
      isPast: scheduledDate < now,
      diffMinutes: (scheduledDate.getTime() - now.getTime()) / 1000 / 60
    })

    if (scheduledDate < now) {
      return NextResponse.json(
        {
          error: 'Scheduled time must be in the future',
          details: {
            scheduledTime: scheduledDate.toISOString(),
            currentTime: now.toISOString()
          }
        },
        { status: 400 }
      )
    }

    // Create the scheduled cast
    const cast = await prisma.scheduledCast.create({
      data: {
        userId: user.id,
        content,
        scheduledTime: scheduledDate,
        status: 'PENDING',
        priority,
        mediaUrls: [],
      },
    })

    return NextResponse.json(cast, { status: 201 })
  } catch (error) {
    console.error('Error creating cast:', error)
    return NextResponse.json(
      { error: 'Failed to create cast' },
      { status: 500 }
    )
  }
}
