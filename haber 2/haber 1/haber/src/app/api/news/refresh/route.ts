import { NextResponse } from 'next/server';
import { syncNews } from '@/lib/news/syncService';
import { apiCache, rssCache } from '@/lib/news/cache';

export async function POST() {
  // Simple protection: only allow in dev unless auth is added
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    rssCache.flushAll();
    const result = await syncNews();
    apiCache.flushAll();
    return NextResponse.json({
      success: true,
      fetchedCount: result.fetchedCount,
      insertedCount: result.insertedCount,
      updatedCount: result.updatedCount,
      duplicateCount: result.duplicateCount,
      failedSources: result.failedSources,
      durationMs: result.durationMs,
      message: `${result.fetchedCount} articles processed.`,
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown refresh error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
