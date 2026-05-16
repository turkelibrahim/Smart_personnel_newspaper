export function buildNewsListCacheKey(params: {
  source?: string | null
  category?: string | null
  query?: string | null
  sort?: string | null
  limit: number
  page: number
}) {
  return ['api', params.source || 'all', params.category || 'all', params.query || 'none', params.sort || 'newest', String(params.limit), String(params.page)].join(':')
}

export function buildTrendingCacheKey(params: { limit: number }) {
  return ['api', 'trending', String(params.limit)].join(':')
}

export function buildRssFeedCacheKey(sourceSlug: string, category: string | null | undefined, feedUrl: string) {
  return ['rss', sourceSlug, category || 'all', feedUrl].join(':')
}

export function buildSourceHealthCacheKey(sourceSlug: string, feedUrl: string) {
  return ['health', sourceSlug, feedUrl].join(':')
}
