import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/user/getCurrentUser'

function normalizeNumber(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.max(min, Math.min(max, value))
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

  let body: { articleId?: string; readingTime?: number; scrollDepth?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const articleId = typeof body.articleId === 'string' ? body.articleId : ''
  if (!articleId) {
    return NextResponse.json({ success: false, error: 'articleId is required' }, { status: 400 })
  }

  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { id: true } })
  if (!article) {
    return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const readingTime = normalizeNumber(body.readingTime, 0, 24 * 60 * 60)
  const scrollDepth = normalizeNumber(body.scrollDepth, 0, 1)

  const recent = await prisma.readingHistory.findFirst({
    where: {
      userId: user.id,
      articleId,
      readAt: { gte: oneHourAgo },
    },
    orderBy: { readAt: 'desc' },
  })

  if (recent) {
    await prisma.readingHistory.update({
      where: { id: recent.id },
      data: {
        readAt: new Date(),
        readingTime,
        scrollDepth,
      },
    })
  } else {
    await prisma.readingHistory.create({
      data: {
        userId: user.id,
        articleId,
        readingTime,
        scrollDepth,
      },
    })
  }

  return NextResponse.json({ success: true })
}
