import { prisma } from '@/lib/db'
import { calculatePersonalizationScore } from './calculatePersonalizationScore'
import type { PersonalizationArticle, PersonalizationScoreBreakdown } from './calculatePersonalizationScore'
import { diversifyRecommendations } from './diversifyRecommendations'
import type { ScoredArticle } from './diversifyRecommendations'
import { generateRecommendationReason } from './recommendationReason'
import { buildUserInterestProfile } from './userInterestProfile'
import type { UserInterestProfile } from './userInterestProfile'

export interface PersonalEditionSection {
  title: string
  articles: PersonalEditionArticleItem[]
}

export interface PersonalEditionArticleItem {
  article: PersonalizationArticle
  score: number
  scoreBreakdown: PersonalizationScoreBreakdown
  reason: string
  position: number
  section: string
}

export interface BuildPersonalEditionOptions {
  maxCandidates?: number
  maxItems?: number
  daysBack?: number
  save?: boolean
}

export interface PersonalEditionResult {
  userId: string
  generatedAt: Date
  profile: UserInterestProfile
  headline: PersonalEditionArticleItem | null
  sections: PersonalEditionSection[]
  articles: PersonalEditionArticleItem[]
  stats: {
    candidateCount: number
    selectedCount: number
    sectionCount: number
  }
}

function assignSection(item: ScoredArticle, section: string, position: number): PersonalEditionArticleItem {
  return {
    article: item.article,
    score: item.score,
    scoreBreakdown: item.scoreBreakdown,
    reason: item.reason || 'İlgi alanlarına ve güncelliğe göre önerildi',
    position,
    section,
  }
}

function takeSection(
  source: ScoredArticle[],
  usedIds: Set<string>,
  title: string,
  count: number,
  predicate?: (item: ScoredArticle) => boolean
): PersonalEditionSection | null {
  const selected = source
    .filter((item) => !usedIds.has(item.article.id))
    .filter((item) => (predicate ? predicate(item) : true))
    .slice(0, count)

  selected.forEach((item) => usedIds.add(item.article.id))
  if (selected.length === 0) return null

  return {
    title,
    articles: selected.map((item, index) => assignSection(item, title, index + 1)),
  }
}

export async function buildPersonalEdition(
  userId: string,
  options: BuildPersonalEditionOptions = {}
): Promise<PersonalEditionResult> {
  const profile = await buildUserInterestProfile(userId)
  const daysBack = options.daysBack ?? 7
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)

  const articles = (await prisma.article.findMany({
    where: {
      isActive: true,
      publishedAt: { gte: since },
    },
    include: {
      source: true,
      categoryRef: true,
      articleTags: { include: { tag: true } },
    },
    orderBy: [{ isDuplicate: 'asc' }, { publishedAt: 'desc' }],
    take: options.maxCandidates ?? 250,
  })) as PersonalizationArticle[]

  const scored = articles.map((article) => {
    const scoreBreakdown = calculatePersonalizationScore(article, profile)
    return {
      article,
      score: scoreBreakdown.total,
      scoreBreakdown,
      reason: generateRecommendationReason(article, scoreBreakdown, profile),
    }
  })

  const diversified = diversifyRecommendations(scored, {
    maxItems: options.maxItems ?? 36,
    maxPerCategory: 4,
    duplicateStrategy: 'best-only',
  })

  const headlineSource = [...diversified].sort((a, b) => {
    const aHeadlineScore = a.score + a.scoreBreakdown.freshness + a.scoreBreakdown.reliability
    const bHeadlineScore = b.score + b.scoreBreakdown.freshness + b.scoreBreakdown.reliability
    return bHeadlineScore - aHeadlineScore
  })[0]

  const usedIds = new Set<string>()
  let headline: PersonalEditionArticleItem | null = null
  if (headlineSource) {
    usedIds.add(headlineSource.article.id)
    headline = assignSection(headlineSource, 'Günün Manşeti', 1)
  }

  const sections = [
    takeSection(diversified, usedIds, 'Sana Özel Öneriler', 6),
    takeSection(diversified, usedIds, 'İlgi Alanlarına Göre', 6, (item) => item.scoreBreakdown.category > 0 || item.scoreBreakdown.tags > 0),
    takeSection(diversified, usedIds, 'Trend Ama Sana Yakın', 4, (item) => item.scoreBreakdown.popularity >= 2 && item.scoreBreakdown.total >= 20),
    takeSection(diversified, usedIds, 'Kaçırılmaması Gerekenler', 4, (item) => item.scoreBreakdown.reliability >= 4 || item.scoreBreakdown.freshness >= 8),
    takeSection(diversified, usedIds, 'Kategori Dengeli Seçki', 6),
    takeSection(diversified, usedIds, 'Basılabilir Gazete Seçkisi', 6),
  ].filter((section): section is PersonalEditionSection => Boolean(section))

  const sectionArticles = sections.flatMap((section) => section.articles)
  const allArticles = headline ? [headline, ...sectionArticles] : sectionArticles

  return {
    userId,
    generatedAt: new Date(),
    profile,
    headline,
    sections,
    articles: allArticles,
    stats: {
      candidateCount: articles.length,
      selectedCount: allArticles.length,
      sectionCount: sections.length,
    },
  }
}
