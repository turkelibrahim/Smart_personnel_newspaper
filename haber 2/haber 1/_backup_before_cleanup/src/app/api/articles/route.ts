import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { publishedAt: 'desc' },
      include: { source: true },
      take: 50
    })
    return NextResponse.json(articles)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}
