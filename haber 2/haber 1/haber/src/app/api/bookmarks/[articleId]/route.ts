import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/user/getCurrentUser'

export async function DELETE(_req: Request, { params }: { params: Promise<{ articleId: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

  const { articleId } = await params
  if (!articleId) {
    return NextResponse.json({ success: false, error: 'articleId is required' }, { status: 400 })
  }

  await prisma.bookmark.deleteMany({
    where: { userId: user.id, articleId },
  })

  return NextResponse.json({ success: true, saved: false })
}
