import type { Article, UserPreference } from '@prisma/client'
import { calculatePersonalizationScore } from './calculatePersonalizationScore'
import type { PersonalizationArticle, PersonalizationScoreBreakdown } from './calculatePersonalizationScore'
import { diversifyRecommendations } from './diversifyRecommendations'
import type { ScoredArticle } from './diversifyRecommendations'
import { generateRecommendationReason } from './recommendationReason'
import { normalizeInterestToken } from './userInterestProfile'
import type { UserInterestProfile } from './userInterestProfile'

export interface NewspaperSection {
  title: string
  articles: Article[]
}

export interface Newspaper {
  headline: Article | null
  sections: NewspaperSection[]
  generatedAt?: Date
}

function parseJsonArray(jsonString: string | null | undefined): string[] {
  if (!jsonString) return []
  try {
    const parsed = JSON.parse(jsonString)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function buildProfileFromPreference(userId: string, preference: UserPreference | null): UserInterestProfile {
  const interests = parseJsonArray(preference?.interests).map(normalizeInterestToken).filter(Boolean)
  const blockedTopics = parseJsonArray(preference?.blockedTopics).map(normalizeInterestToken).filter(Boolean)
  const categoryWeights: Record<string, number> = {}
  const tagWeights: Record<string, number> = {}

  interests.forEach((interest) => {
    categoryWeights[interest] = 1
    tagWeights[interest] = 1
  })

  if (preference?.categoryId) {
    categoryWeights[preference.categoryId] = 1.5
  }

  return {
    userId,
    interests,
    blockedTopics,
    categoryWeights,
    tagWeights,
    bookmarkedCategoryWeights: {},
    bookmarkedTagWeights: {},
    readingHistoryCategoryWeights: {},
    readingHistoryTagWeights: {},
    preferredReadingDepth: preference?.preferredReadingDepth || 'balanced',
    profession: preference?.profession || null,
    generatedAt: new Date(),
  }
}

function articleTags(article: Article): string[] {
  return parseJsonArray(article.tags).map(normalizeInterestToken).filter(Boolean)
}

function takeUnused(
  source: ScoredArticle[],
  usedArticleIds: Set<string>,
  count: number,
  filterFn?: (item: ScoredArticle) => boolean
): Article[] {
  const selected = source
    .filter((item) => !usedArticleIds.has(item.article.id))
    .filter((item) => (filterFn ? filterFn(item) : true))
    .slice(0, count)

  selected.forEach((item) => usedArticleIds.add(item.article.id))
  return selected.map((item) => item.article as Article)
}

export function buildDailyNewspaper(user: { id?: string | null; name?: string | null }, preference: UserPreference | null, articles: Article[]): Newspaper {
  const profile = buildProfileFromPreference(user.id || preference?.userId || 'demo', preference)

  const scoredArticles = articles.map((article) => {
    const scoreBreakdown: PersonalizationScoreBreakdown = calculatePersonalizationScore(article as PersonalizationArticle, profile)
    const reason = generateRecommendationReason(article as PersonalizationArticle, scoreBreakdown, profile)
    return {
      article: article as PersonalizationArticle,
      score: scoreBreakdown.total,
      scoreBreakdown,
      reason,
    }
  })

  const validArticles = diversifyRecommendations(scoredArticles, {
    maxItems: Math.min(articles.length, 60),
    maxPerCategory: 4,
    duplicateStrategy: 'best-only',
  })

  const usedArticleIds = new Set<string>()
  const headlineItem = [...validArticles].sort((a, b) => {
    const aScore = a.score + a.scoreBreakdown.freshness + a.scoreBreakdown.reliability
    const bScore = b.score + b.scoreBreakdown.freshness + b.scoreBreakdown.reliability
    return bScore - aScore
  })[0]

  const headline = headlineItem ? (headlineItem.article as Article) : null
  if (headline) usedArticleIds.add(headline.id)

  const interests = profile.interests
  const profession = preference?.profession

  const fiveMinuteNews = takeUnused(validArticles, usedArticleIds, 3, (item) => (item.article.readingTime || 0) <= 3)

  const professionNews = takeUnused(validArticles, usedArticleIds, 3, (item) => {
    const related = parseJsonArray(item.article.relatedProfessions)
    return !!profession && related.includes(profession)
  })

  const interestNews = takeUnused(validArticles, usedArticleIds, 3, (item) => {
    const tags = articleTags(item.article as Article)
    const category = item.article.category ? normalizeInterestToken(item.article.category) : ''
    return tags.some((tag) => interests.includes(tag)) || (!!category && interests.includes(category))
  })

  const surprisingNews = takeUnused(validArticles, usedArticleIds, 2, (item) => {
    const tags = articleTags(item.article as Article)
    const category = item.article.category ? normalizeInterestToken(item.article.category) : ''
    const isMatched = tags.some((tag) => interests.includes(tag)) || (!!category && interests.includes(category))
    return !isMatched && (item.article.importanceScore > 70 || item.scoreBreakdown.reliability >= 4)
  })

  const impactNews = takeUnused(validArticles, usedArticleIds, 2, (item) => {
    const category = item.article.category ? normalizeInterestToken(item.article.category) : ''
    return category === 'ekonomi' || Math.abs(item.article.sentiment || 0) > 0.5
  })

  const summaryNews = takeUnused(validArticles, usedArticleIds, 4)

  const sections: NewspaperSection[] = []

  if (fiveMinuteNews.length > 0) sections.push({ title: '5 Dakikada Gündem', articles: fiveMinuteNews })
  if (professionNews.length > 0) sections.push({ title: `${profession} Olarak Bilmeniz Gerekenler`, articles: professionNews })
  if (interestNews.length > 0) sections.push({ title: 'İlgi Alanlarınızdan Seçtiklerimiz', articles: interestNews })
  if (surprisingNews.length > 0) sections.push({ title: 'İlgi Alanınız Dışında Ama Önemli', articles: surprisingNews })
  if (impactNews.length > 0) sections.push({ title: 'Bana Etkisi Ne? (Özel Analiz)', articles: impactNews })
  if (summaryNews.length > 0) sections.push({ title: 'Günün Özeti', articles: summaryNews })

  return {
    headline,
    sections,
    generatedAt: new Date(),
  }
}
