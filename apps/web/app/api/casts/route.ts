import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@farcaster-scheduler/database'

// Force Node.js runtime for Prisma
export const runtime = 'nodejs'

// GET /api/casts - List all casts for the authenticated user
export async function GET(_request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's FID from session
    const userFid = (session.user as any).fid

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
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's FID from session
    const userFid = (session.user as any).fid

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

    // Validate input
    if (!content || !scheduledTime) {
      return NextResponse.json(
        { error: 'Content and scheduledTime are required' },
        { status: 400 }
      )
    }

    if (content.length > 320) {
      return NextResponse.json(
        { error: 'Content must be 320 characters or less' },
        { status: 400 }
      )
    }

    const scheduledDate = new Date(scheduledTime)
    if (scheduledDate < new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
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
