import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildPersonalizedFeed } from '@/lib/personalization/scoring'

const DEMO_EMAIL = 'demo@mypress.ai'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
      include: { preference: true }
    })

    const articles = await prisma.article.findMany({
      include: { source: true },
      take: 100 // Get a bunch of recent articles to score
    })

    const feed = buildPersonalizedFeed(articles, user?.preference || null)

    return NextResponse.json(feed.slice(0, 20)) // Return top 20 for feed
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate personalized feed' }, { status: 500 })
  }
}
