import type { Bookmark, ReadingHistory, UserPreference } from '@prisma/client'
import { prisma } from '@/lib/db'
import { normalizeCategoryName } from '@/lib/classification/categoryRules'
import { slugifyTurkish } from '@/lib/classification/textNormalization'

export interface UserInterestProfile {
  userId: string
  interests: string[]
  blockedTopics: string[]
  categoryWeights: Record<string, number>
  tagWeights: Record<string, number>
  bookmarkedCategoryWeights: Record<string, number>
  bookmarkedTagWeights: Record<string, number>
  readingHistoryCategoryWeights: Record<string, number>
  readingHistoryTagWeights: Record<string, number>
  preferredReadingDepth: string | null
  profession: string | null
  generatedAt: Date
}

type ArticleSignals = {
  category?: string | null
  categoryId?: string | null
  tags?: string | null
  articleTags?: Array<{ tag?: { name?: string | null; slug?: string | null } | null }>
}

type HistoryWithArticle = ReadingHistory & { article?: ArticleSignals | null }
type BookmarkWithArticle = Bookmark & { article?: ArticleSignals | null }

function parseJsonArray(jsonString: string | null | undefined): string[] {
  if (!jsonString) return []
  try {
    const parsed = JSON.parse(jsonString)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function addWeight(weights: Record<string, number>, key: string | null | undefined, amount: number) {
  if (!key) return
  weights[key] = Number(((weights[key] || 0) + amount).toFixed(3))
}

function clampWeights(weights: Record<string, number>, max = 1) {
  for (const key of Object.keys(weights)) {
    weights[key] = Math.min(max, Number(weights[key].toFixed(3)))
  }
  return weights
}

export function normalizeInterestToken(value: string): string {
  if (!value) return ''
  const category = normalizeCategoryName(value)
  const slug = slugifyTurkish(value)
  return category || slug
}

function normalizeTagToken(value: string): string {
  return slugifyTurkish(value) || normalizeInterestToken(value)
}

export function parsePreferenceInterests(preference: UserPreference | null | undefined): string[] {
  const interests = parseJsonArray(preference?.interests)
  const category = preference?.categoryId ? [preference.categoryId] : []
  return Array.from(new Set([...interests.map(normalizeInterestToken), ...category].filter(Boolean)))
}

export function parseBlockedTopics(preference: UserPreference | null | undefined): string[] {
  return Array.from(new Set(parseJsonArray(preference?.blockedTopics).map(normalizeInterestToken).filter(Boolean)))
}

function extractArticleTags(article: ArticleSignals | null | undefined): string[] {
  const jsonTags = parseJsonArray(article?.tags).map(normalizeTagToken)
  const relationTags = (article?.articleTags || [])
    .map((item) => item.tag?.slug || item.tag?.name || '')
    .map(normalizeTagToken)
  return Array.from(new Set([...jsonTags, ...relationTags].filter(Boolean)))
}

function extractArticleCategory(article: ArticleSignals | null | undefined): string | null {
  if (article?.category) return normalizeCategoryName(article.category)
  if (article?.categoryId) return article.categoryId
  return null
}

export function extractProfileFromReadingHistory(history: HistoryWithArticle[]) {
  const categoryWeights: Record<string, number> = {}
  const tagWeights: Record<string, number> = {}

  history.forEach((item, index) => {
    const recencyWeight = Math.max(0.2, 1 - index * 0.03)
    const engagementWeight = item.scrollDepth ? Math.min(1.25, Math.max(0.5, item.scrollDepth)) : 0.75
    const amount = recencyWeight * engagementWeight

    addWeight(categoryWeights, extractArticleCategory(item.article), amount)
    extractArticleTags(item.article).forEach((tag) => addWeight(tagWeights, tag, amount))
  })

  return {
    categoryWeights: clampWeights(categoryWeights, 5),
    tagWeights: clampWeights(tagWeights, 5),
  }
}

export function extractProfileFromBookmarks(bookmarks: BookmarkWithArticle[]) {
  const categoryWeights: Record<string, number> = {}
  const tagWeights: Record<string, number> = {}

  bookmarks.forEach((item) => {
    addWeight(categoryWeights, extractArticleCategory(item.article), 1.5)
    extractArticleTags(item.article).forEach((tag) => addWeight(tagWeights, tag, 1.5))
  })

  return {
    categoryWeights: clampWeights(categoryWeights, 5),
    tagWeights: clampWeights(tagWeights, 5),
  }
}

export async function buildUserInterestProfile(userId: string): Promise<UserInterestProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      preference: true,
      readingHistory: {
        orderBy: { readAt: 'desc' },
        take: 80,
        include: { article: { include: { articleTags: { include: { tag: true } } } } },
      },
      bookmarks: {
        orderBy: { createdAt: 'desc' },
        take: 80,
        include: { article: { include: { articleTags: { include: { tag: true } } } } },
      },
    },
  })

  const preference = user?.preference || null
  const interests = parsePreferenceInterests(preference)
  const blockedTopics = parseBlockedTopics(preference)
  const readingProfile = extractProfileFromReadingHistory((user?.readingHistory || []) as HistoryWithArticle[])
  const bookmarkProfile = extractProfileFromBookmarks((user?.bookmarks || []) as BookmarkWithArticle[])

  const categoryWeights: Record<string, number> = {}
  const tagWeights: Record<string, number> = {}

  interests.forEach((interest) => {
    addWeight(categoryWeights, interest, 1)
    addWeight(tagWeights, interest, 0.7)
  })

  for (const [key, value] of Object.entries(readingProfile.categoryWeights)) addWeight(categoryWeights, key, value)
  for (const [key, value] of Object.entries(bookmarkProfile.categoryWeights)) addWeight(categoryWeights, key, value)
  for (const [key, value] of Object.entries(readingProfile.tagWeights)) addWeight(tagWeights, key, value)
  for (const [key, value] of Object.entries(bookmarkProfile.tagWeights)) addWeight(tagWeights, key, value)

  return {
    userId,
    interests,
    blockedTopics,
    categoryWeights: clampWeights(categoryWeights, 10),
    tagWeights: clampWeights(tagWeights, 10),
    bookmarkedCategoryWeights: bookmarkProfile.categoryWeights,
    bookmarkedTagWeights: bookmarkProfile.tagWeights,
    readingHistoryCategoryWeights: readingProfile.categoryWeights,
    readingHistoryTagWeights: readingProfile.tagWeights,
    preferredReadingDepth: preference?.preferredReadingDepth || 'balanced',
    profession: preference?.profession || null,
    generatedAt: new Date(),
  }
}
