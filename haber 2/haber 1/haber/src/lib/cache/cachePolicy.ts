export const cachePolicy = {
  rssCacheTtlMs: 10 * 60 * 1000,
  apiCacheTtlMs: 2 * 60 * 1000,
  healthCacheTtlMs: 24 * 60 * 60 * 1000,
  userSpecificCache: false,
  cachedEndpoints: ['/api/news', '/api/news/trending', 'rss-fetch', '/api/news/health'],
  nonCachedEndpoints: [
    '/api/preferences',
    '/api/bookmarks',
    '/api/history',
    '/api/newspaper/today',
    '/api/impact',
  ],
} as const
