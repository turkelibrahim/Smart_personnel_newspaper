import type { Article } from '@prisma/client'
import { normalizeCategoryName } from '@/lib/classification/categoryRules'
import { slugifyTurkish } from '@/lib/classification/textNormalization'
import { normalizeInterestToken } from './userInterestProfile'
import type { UserInterestProfile } from './userInterestProfile'

export interface PersonalizationScoreBreakdown {
  total: number
  category: number
  tags: number
  readingHistory: number
  bookmarks: number
  freshness: number
  reliability: number
  popularity: number
  duplicatePenalty: number
  diversityPenalty: number
  matchedCategories: string[]
  matchedTags: string[]
}

export type PersonalizationArticle = Article & {
  source?: { reliabilityScore?: number | null; trustScore?: number | null } | null
  categoryRef?: { slug?: string | null; name?: string | null } | null
  articleTags?: Array<{ tag?: { name?: string | null; slug?: string | null } | null }>
}

function safeJsonArray(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function normalizeTag(value: string): string {
  return slugifyTurkish(value) || normalizeInterestToken(value)
}

export function normalizeScore(value: number, min: number, max: number): number {
  if (max <= min) return 0
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

export function getArticleCategories(article: PersonalizationArticle): string[] {
  const values = [
    article.category ? normalizeCategoryName(article.category) : '',
    article.categoryRef?.slug ? normalizeCategoryName(article.categoryRef.slug) : '',
    article.categoryRef?.name ? normalizeCategoryName(article.categoryRef.name) : '',
    article.categoryId || '',
  ]
  return Array.from(new Set(values.filter(Boolean)))
}

export function getArticleTags(article: PersonalizationArticle): string[] {
  const jsonTags = safeJsonArray(article.tags).map(normalizeTag)
  const relationTags = (article.articleTags || [])
    .map((item) => item.tag?.slug || item.tag?.name || '')
    .map(normalizeTag)
  return Array.from(new Set([...jsonTags, ...relationTags].filter(Boolean)))
}

export function calculateCategoryMatchScore(article: PersonalizationArticle, userProfile: UserInterestProfile) {
  const categories = getArticleCategories(article)
  const blocked = categories.some((category) => userProfile.blockedTopics.includes(category))
  if (blocked) return { score: 0, matchedCategories: [] }

  const matchedCategories = categories.filter((category) => (userProfile.categoryWeights[category] || 0) > 0)
  const strongest = matchedCategories.reduce((max, category) => Math.max(max, userProfile.categoryWeights[category] || 0), 0)
  return {
    score: Math.min(30, strongest * 10),
    matchedCategories,
  }
}

export function calculateTagMatchScore(article: PersonalizationArticle, userProfile: UserInterestProfile) {
  const tags = getArticleTags(article)
  const blocked = tags.some((tag) => userProfile.blockedTopics.includes(tag))
  if (blocked) return { score: 0, matchedTags: [] }

  const matchedTags = tags.filter((tag) => (userProfile.tagWeights[tag] || 0) > 0)
  const totalWeight = matchedTags.reduce((sum, tag) => sum + (userProfile.tagWeights[tag] || 0), 0)
  return {
    score: Math.min(25, totalWeight * 6),
    matchedTags,
  }
}

export function calculateReadingHistoryScore(article: PersonalizationArticle, userProfile: UserInterestProfile): number {
  const categoryScore = getArticleCategories(article).reduce(
    (max, category) => Math.max(max, userProfile.readingHistoryCategoryWeights[category] || 0),
    0
  )
  const tagScore = getArticleTags(article).reduce((sum, tag) => sum + (userProfile.readingHistoryTagWeights[tag] || 0), 0)
  return Math.min(15, categoryScore * 4 + tagScore * 2)
}

export function calculateBookmarkScore(article: PersonalizationArticle, userProfile: UserInterestProfile): number {
  const categoryScore = getArticleCategories(article).reduce(
    (max, category) => Math.max(max, userProfile.bookmarkedCategoryWeights[category] || 0),
    0
  )
  const tagScore = getArticleTags(article).reduce((sum, tag) => sum + (userProfile.bookmarkedTagWeights[tag] || 0), 0)
  return Math.min(10, categoryScore * 3 + tagScore * 1.5)
}

export function calculateFreshnessScore(publishedAt: Date | string | null | undefined): number {
  if (!publishedAt) return 4
  const published = new Date(publishedAt).getTime()
  if (Number.isNaN(published)) return 4

  const ageHours = Math.max(0, (Date.now() - published) / (1000 * 60 * 60))
  if (ageHours <= 6) return 10
  if (ageHours <= 24) return 8
  if (ageHours <= 72) return 5
  if (ageHours <= 168) return 3
  return 1
}

export function calculateSourceReliabilityScore(article: PersonalizationArticle): number {
  const raw =
    article.reliabilityScore ??
    article.source?.reliabilityScore ??
    article.trustScore ??
    article.source?.trustScore ??
    50
  return Number((normalizeScore(raw, 0, 100) * 5).toFixed(2))
}

export function calculatePopularityScore(article: PersonalizationArticle): number {
  return Number((normalizeScore(article.popularityScore || 0, 0, 100) * 5).toFixed(2))
}

export function calculateDuplicatePenalty(article: PersonalizationArticle): number {
  return article.isDuplicate ? -30 : 0
}

export function calculatePersonalizationScore(
  article: PersonalizationArticle,
  userProfile: UserInterestProfile
): PersonalizationScoreBreakdown {
  const categoryResult = calculateCategoryMatchScore(article, userProfile)
  const tagResult = calculateTagMatchScore(article, userProfile)
  const readingHistory = calculateReadingHistoryScore(article, userProfile)
  const bookmarks = calculateBookmarkScore(article, userProfile)
  const freshness = calculateFreshnessScore(article.publishedAt)
  const reliability = calculateSourceReliabilityScore(article)
  const popularity = calculatePopularityScore(article)
  const duplicatePenalty = calculateDuplicatePenalty(article)

  const blockedByCategory = getArticleCategories(article).some((category) => userProfile.blockedTopics.includes(category))
  const blockedByTag = getArticleTags(article).some((tag) => userProfile.blockedTopics.includes(tag))
  const blockedPenalty = blockedByCategory || blockedByTag ? -60 : 0

  const rawTotal =
    categoryResult.score +
    tagResult.score +
    readingHistory +
    bookmarks +
    freshness +
    reliability +
    popularity +
    duplicatePenalty +
    blockedPenalty

  return {
    total: Math.max(0, Math.min(100, Number(rawTotal.toFixed(2)))),
    category: Number(categoryResult.score.toFixed(2)),
    tags: Number(tagResult.score.toFixed(2)),
    readingHistory: Number(readingHistory.toFixed(2)),
    bookmarks: Number(bookmarks.toFixed(2)),
    freshness,
    reliability,
    popularity,
    duplicatePenalty: duplicatePenalty + blockedPenalty,
    diversityPenalty: 0,
    matchedCategories: categoryResult.matchedCategories,
    matchedTags: tagResult.matchedTags,
  }
}
