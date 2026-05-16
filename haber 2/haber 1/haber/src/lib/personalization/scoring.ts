import type { Article, UserPreference } from '@prisma/client'
import { calculatePersonalizationScore } from './calculatePersonalizationScore'
import type { PersonalizationArticle, PersonalizationScoreBreakdown } from './calculatePersonalizationScore'
import { normalizeInterestToken } from './userInterestProfile'
import type { UserInterestProfile } from './userInterestProfile'

export interface ProfileSignature {
  status?: 'new'
  interests: string[]
  readingStyle: string
  blockedCount: number
  profession: string | null
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

function buildCompatibilityProfile(preference: UserPreference | null): UserInterestProfile {
  const interests = parseJsonArray(preference?.interests).map(normalizeInterestToken).filter(Boolean)
  const blockedTopics = parseJsonArray(preference?.blockedTopics).map(normalizeInterestToken).filter(Boolean)
  const categoryWeights: Record<string, number> = {}
  const tagWeights: Record<string, number> = {}

  interests.forEach((interest) => {
    categoryWeights[interest] = Math.max(categoryWeights[interest] || 0, 1)
    tagWeights[interest] = Math.max(tagWeights[interest] || 0, 1)
  })

  if (preference?.categoryId) {
    categoryWeights[preference.categoryId] = Math.max(categoryWeights[preference.categoryId] || 0, 1.5)
  }

  return {
    userId: preference?.userId || 'anonymous',
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

export function calculatePersonalizedScore(article: Article, preference: UserPreference | null): number {
  const profile = buildCompatibilityProfile(preference)
  const breakdown = calculatePersonalizationScore(article as PersonalizationArticle, profile)

  let score = breakdown.total

  const relatedProfessions = parseJsonArray(article.relatedProfessions)
  if (preference?.profession && relatedProfessions.includes(preference.profession)) {
    score += 10
  }

  if (preference?.preferredReadingDepth === 'quick' && article.readingTime && article.readingTime <= 3) {
    score += 5
  } else if (preference?.preferredReadingDepth === 'deep' && article.readingTime && article.readingTime > 5) {
    score += 5
  }

  if (preference?.preferredTone === 'analytical' && Math.abs(article.sentiment || 0) < 0.3) {
    score += 3
  }

  return Math.max(0, Math.min(100, Number(score.toFixed(2))))
}

export function calculatePersonalizedScoreBreakdown(
  article: Article,
  preference: UserPreference | null
): PersonalizationScoreBreakdown {
  return calculatePersonalizationScore(article as PersonalizationArticle, buildCompatibilityProfile(preference))
}

export function buildPersonalizedFeed(articles: Article[], preference: UserPreference | null): Article[] {
  const scoredArticles = articles.map(article => ({
    article,
    score: calculatePersonalizedScore(article, preference)
  }))

  scoredArticles.sort((a, b) => b.score - a.score)

  return scoredArticles.filter(item => item.score > 0).map(item => item.article)
}

export function createProfileSignature(preference: UserPreference | null): ProfileSignature {
  if (!preference) return { status: 'new', interests: [], readingStyle: 'balanced', blockedCount: 0, profession: null }

  return {
    interests: parseJsonArray(preference.interests),
    readingStyle: preference.preferredReadingDepth || 'balanced',
    blockedCount: parseJsonArray(preference.blockedTopics).length,
    profession: preference.profession
  }
}
