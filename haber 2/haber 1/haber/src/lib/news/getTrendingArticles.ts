import { prisma } from '@/lib/db'
import type { Article, NewsSource } from '@prisma/client'

export type TrendingArticle = Article & { source: NewsSource }

export interface TrendingItem {
  article: TrendingArticle
  trendScore: number
  relatedCount: number
  reason: string
}

function normalize(value: number, min = 0, max = 100) {
  if (max <= min) return 0
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

function freshnessScore(publishedAt: Date) {
  const ageHours = Math.max(0, (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60))
  if (ageHours <= 6) return 100
  if (ageHours <= 24) return 80
  if (ageHours <= 48) return 55
  return 20
}

function titleWords(title: string) {
  return new Set(title.toLocaleLowerCase('tr-TR').split(/\s+/).filter((word) => word.length > 3))
}

function relatedCount(article: TrendingArticle, articles: TrendingArticle[]) {
  const words = titleWords(article.title)
  let count = 0

  for (const other of articles) {
    if (other.id === article.id) continue
    if (article.duplicateHash && other.duplicateHash === article.duplicateHash) {
      count++
      continue
    }

    const matches = [...titleWords(other.title)].filter((word) => words.has(word)).length
    if (matches >= 4) count++
  }

  return count
}

function trendReason(item: { popularity: number; freshness: number; reliability: number; relatedCount: number }) {
  if (item.relatedCount > 0) return 'Aynı konuda birden fazla kaynakta öne çıkıyor'
  if (item.popularity >= 60) return 'Güncel ve yüksek popülerlik sinyali taşıyor'
  if (item.reliability >= 80 && item.freshness >= 80) return 'Son saatlerde öne çıkan güvenilir haber'
  return 'Güncellik ve kaynak sinyallerine göre öne çıktı'
}

export async function getTrendingArticles(options: { limit?: number; hours?: number } = {}): Promise<TrendingItem[]> {
  const limit = Math.min(options.limit || 10, 30)
  const since = new Date(Date.now() - (options.hours || 48) * 60 * 60 * 1000)

  const articles = await prisma.article.findMany({
    where: {
      isActive: true,
      isDuplicate: false,
      publishedAt: { gte: since },
    },
    include: { source: true },
    orderBy: [{ publishedAt: 'desc' }],
    take: 250,
  })

  const bestByDuplicateHash = new Map<string, TrendingItem>()
  const itemsWithoutHash: TrendingItem[] = []

  for (const article of articles) {
    const popularity = article.popularityScore || 0
    const freshness = freshnessScore(article.publishedAt)
    const reliability = article.reliabilityScore || article.source.reliabilityScore || article.trustScore || article.source.trustScore || 50
    const importance = article.importanceScore || 50
    const related = relatedCount(article, articles)
    const trendScore = Number((
      normalize(popularity) * 40 +
      normalize(freshness) * 25 +
      normalize(reliability) * 20 +
      normalize(importance) * 15 +
      Math.min(10, related * 2)
    ).toFixed(2))

    const item = {
      article,
      trendScore,
      relatedCount: related,
      reason: trendReason({ popularity, freshness, reliability, relatedCount: related }),
    }

    if (!article.duplicateHash) {
      itemsWithoutHash.push(item)
      continue
    }

    const existing = bestByDuplicateHash.get(article.duplicateHash)
    if (!existing || item.trendScore > existing.trendScore) {
      bestByDuplicateHash.set(article.duplicateHash, item)
    }
  }

  return [...itemsWithoutHash, ...bestByDuplicateHash.values()]
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit)
}
