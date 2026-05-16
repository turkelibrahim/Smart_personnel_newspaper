export type NewsUiSource = string | { name?: string | null } | null | undefined

export interface NewsUiArticle {
  id: string
  title: string
  summary?: string | null
  content?: string | null
  imageUrl?: string | null
  image?: string | null
  source?: NewsUiSource
  sourceName?: string | null
  sourceSlug?: string | null
  category?: string | null
  publishedAt?: string | Date | null
  readingTime?: number | null
  tags?: string[] | string | null
  reason?: string | null
  score?: number | null
  url?: string | null
  originalUrl?: string | null
  relativeTime?: string | null
}

export function safeParseTags(tags: NewsUiArticle['tags']): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.filter((tag): tag is string => typeof tag === 'string')

  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === 'string') : []
  } catch {
    return []
  }
}

export function getArticleImage(article: NewsUiArticle): string | null {
  return article.imageUrl || article.image || null
}

export function getArticleSourceName(article: NewsUiArticle): string {
  if (typeof article.source === 'string') return article.source
  return article.source?.name || article.sourceName || article.sourceSlug || 'Kaynak'
}

export function getArticleDate(article: NewsUiArticle): string {
  if (article.relativeTime) return article.relativeTime
  if (!article.publishedAt) return ''

  const date = new Date(article.publishedAt)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function getArticleUrl(article: NewsUiArticle): string {
  return article.url || article.originalUrl || `/news/${article.id}`
}

export function getArticleSummary(article: NewsUiArticle): string {
  return article.summary || article.content?.slice(0, 180) || ''
}
