import type { PersonalizationArticle, PersonalizationScoreBreakdown } from './calculatePersonalizationScore'

export interface ScoredArticle {
  article: PersonalizationArticle
  score: number
  scoreBreakdown: PersonalizationScoreBreakdown
  reason?: string
  position?: number
  section?: string
}

export interface DiversifyOptions {
  maxItems?: number
  maxPerCategory?: number
  duplicateStrategy?: 'best-only' | 'penalize'
}

function getCategory(article: PersonalizationArticle): string {
  return article.category || article.categoryRef?.slug || article.categoryId || 'genel'
}

export function removeDuplicateGroups(scoredArticles: ScoredArticle[]): ScoredArticle[] {
  const byHash = new Map<string, ScoredArticle>()
  const withoutHash: ScoredArticle[] = []

  for (const item of scoredArticles) {
    const hash = item.article.duplicateHash
    if (!hash) {
      withoutHash.push(item)
      continue
    }

    const current = byHash.get(hash)
    if (!current || item.score > current.score) {
      byHash.set(hash, item)
    }
  }

  return [...withoutHash, ...byHash.values()].sort((a, b) => b.score - a.score)
}

export function limitCategoryDensity(scoredArticles: ScoredArticle[], options: DiversifyOptions = {}): ScoredArticle[] {
  const maxPerCategory = options.maxPerCategory ?? 4
  const maxItems = options.maxItems ?? scoredArticles.length
  const selected: ScoredArticle[] = []
  const overflow: ScoredArticle[] = []
  const categoryCounts: Record<string, number> = {}

  for (const item of scoredArticles) {
    const category = getCategory(item.article)
    const current = categoryCounts[category] || 0
    const limitApplies = selected.length < 12

    if (!limitApplies || current < maxPerCategory) {
      selected.push(item)
      categoryCounts[category] = current + 1
    } else {
      overflow.push({
        ...item,
        score: Math.max(0, item.score - 10),
        scoreBreakdown: {
          ...item.scoreBreakdown,
          total: Math.max(0, item.scoreBreakdown.total - 10),
          diversityPenalty: -10,
        },
      })
    }

    if (selected.length >= maxItems) break
  }

  if (selected.length < maxItems) {
    selected.push(...overflow.sort((a, b) => b.score - a.score).slice(0, maxItems - selected.length))
  }

  return selected.slice(0, maxItems).map((item, index) => ({ ...item, position: index + 1 }))
}

export function diversifyRecommendations(scoredArticles: ScoredArticle[], options: DiversifyOptions = {}): ScoredArticle[] {
  const sorted = [...scoredArticles]
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (a.article.isDuplicate !== b.article.isDuplicate) return a.article.isDuplicate ? 1 : -1
      return b.score - a.score
    })

  const duplicateHandled =
    options.duplicateStrategy === 'penalize'
      ? sorted.map((item) =>
          item.article.isDuplicate
            ? {
                ...item,
                score: Math.max(0, item.score - 30),
                scoreBreakdown: {
                  ...item.scoreBreakdown,
                  total: Math.max(0, item.scoreBreakdown.total - 30),
                  duplicatePenalty: item.scoreBreakdown.duplicatePenalty - 30,
                },
              }
            : item
        )
      : removeDuplicateGroups(sorted)

  return limitCategoryDensity(duplicateHandled, options)
}
