import { NextRequest, NextResponse } from 'next/server';
import { apiCache } from '@/lib/news/cache';
import { normalizeSearchQuery, searchArticles } from '@/lib/search/searchArticles';
import { buildNewsListCacheKey } from '@/lib/cache/cacheKeys';

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function normalizeSort(value: string | null) {
  return value === 'popular' || value === 'relevant' || value === 'newest' ? value : 'newest';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  const source = searchParams.get('source');
  const rawCategory = searchParams.get('category');
  const q = normalizeSearchQuery(searchParams.get('q') || searchParams.get('search'));
  const sort = normalizeSort(searchParams.get('sort'));
  const limit = parsePositiveInt(searchParams.get('limit'), 30, 100);
  const page = parsePositiveInt(searchParams.get('page'), 1, 1000);

  const cacheKey = buildNewsListCacheKey({
    source,
    category: rawCategory,
    query: q,
    sort,
    limit,
    page,
  });
  const cached = apiCache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const result = await searchArticles({
      q,
      category: rawCategory,
      source,
      sort,
      limit,
      page,
    });

    const response = {
      success: true,
      data: result.formattedArticles,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        cache: "miss",
        updatedAt: new Date().toISOString()
      }
    };

    apiCache.set(cacheKey, { ...response, meta: { ...response.meta, cache: "hit" } });
    return NextResponse.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown news route error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
