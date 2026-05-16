import { NextResponse } from 'next/server';
import { healthCache, getCacheKey } from '@/lib/news/cache';
import { NEWS_SOURCES } from '@/lib/news/sources';

export async function GET() {
  const healthStats = NEWS_SOURCES.flatMap(source => 
    source.feeds.map(feed => {
      const key = getCacheKey('health', source.slug, feed.url);
      return healthCache.get(key) || {
        source: source.name,
        feedUrl: feed.url,
        status: 'unknown',
        lastFetchedAt: null,
        lastSuccessAt: null,
        error: null,
        itemCount: 0
      };
    })
  );

  return NextResponse.json({
    success: true,
    data: healthStats
  });
}
