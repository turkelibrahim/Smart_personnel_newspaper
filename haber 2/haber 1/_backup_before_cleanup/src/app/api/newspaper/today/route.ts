import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { buildDailyNewspaper } from '@/lib/personalization/newspaperBuilder'

const DEMO_EMAIL = 'demo@mypress.ai'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
      include: { preference: true }
    })

    const articles = await prisma.article.findMany({
      include: { source: true },
      take: 100
    })

    const newspaper = buildDailyNewspaper(user || {}, user?.preference || null, articles)

    return NextResponse.json(newspaper)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate newspaper' }, { status: 500 })
  }
}
