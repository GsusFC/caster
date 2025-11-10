import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@farcaster-scheduler/database'

// Force Node.js runtime for Prisma
export const runtime = 'nodejs'

// DELETE /api/casts/[id] - Delete a scheduled cast
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find the cast
    const cast = await prisma.scheduledCast.findUnique({
      where: { id: params.id },
    })

    if (!cast) {
      return NextResponse.json({ error: 'Cast not found' }, { status: 404 })
    }

    // Verify ownership
    if (cast.userId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this cast' },
        { status: 403 }
      )
    }

    // Only allow deletion of pending or failed casts
    if (cast.status !== 'PENDING' && cast.status !== 'FAILED') {
      return NextResponse.json(
        { error: 'Can only delete pending or failed casts' },
        { status: 400 }
      )
    }

    // Delete the cast
    await prisma.scheduledCast.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cast:', error)
    return NextResponse.json(
      { error: 'Failed to delete cast' },
      { status: 500 }
    )
  }
}
