import { NextRequest, NextResponse } from 'next/server'
import { apiCache } from '@/lib/news/cache'
import { getTrendingArticles } from '@/lib/news/getTrendingArticles'
import { buildTrendingCacheKey } from '@/lib/cache/cacheKeys'

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value || '', 10)
  if (!Number.isFinite(parsed) || parsed < 1) return 10
  return Math.min(parsed, 30)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseLimit(searchParams.get('limit'))
  const cacheKey = buildTrendingCacheKey({ limit })
  const cached = apiCache.get(cacheKey)
  if (cached) return NextResponse.json(cached)

  try {
    const trending = await getTrendingArticles({ limit })
    const response = {
      success: true,
      data: trending.map((item) => ({
        main: item.article,
        related: [],
        trendScore: item.trendScore,
        relatedCount: item.relatedCount,
        reason: item.reason,
      })),
    }

    apiCache.set(cacheKey, response)
    return NextResponse.json(response)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown trending error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
