import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateImpactAnalysis } from '@/lib/personalization/impactAnalysis'

const DEMO_EMAIL = 'demo@mypress.ai'

export async function POST(req: Request) {
  try {
    const { articleId } = await req.json()

    if (!articleId) {
      return NextResponse.json({ error: 'articleId is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
      include: { preference: true }
    })

    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const impact = generateImpactAnalysis(article, user?.preference || null)

    return NextResponse.json(impact)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate impact analysis' }, { status: 500 })
  }
}
