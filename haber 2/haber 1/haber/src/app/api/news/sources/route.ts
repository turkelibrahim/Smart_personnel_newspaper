import { NextResponse } from 'next/server';
import { NEWS_SOURCES } from '@/lib/news/sources';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: NEWS_SOURCES.map(s => ({
      slug: s.slug,
      name: s.name,
      homepage: s.homepage,
      active: s.active,
      feedCount: s.feeds.length
    }))
  });
}
