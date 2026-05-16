import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/user/getCurrentUser'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const articleId = searchParams.get('articleId')

  if (articleId) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_articleId: { userId: user.id, articleId } },
      select: { id: true },
    })
    return NextResponse.json({ success: true, saved: Boolean(bookmark) })
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    include: { article: { include: { source: true, categoryRef: true, articleTags: { include: { tag: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: bookmarks })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

  let articleId = ''
  try {
    const body = await req.json()
    articleId = typeof body.articleId === 'string' ? body.articleId : ''
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  if (!articleId) {
    return NextResponse.json({ success: false, error: 'articleId is required' }, { status: 400 })
  }

  const article = await prisma.article.findUnique({ where: { id: articleId }, select: { id: true } })
  if (!article) {
    return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 })
  }

  await prisma.bookmark.upsert({
    where: { userId_articleId: { userId: user.id, articleId } },
    update: {},
    create: { userId: user.id, articleId },
  })

  return NextResponse.json({ success: true, saved: true })
}
