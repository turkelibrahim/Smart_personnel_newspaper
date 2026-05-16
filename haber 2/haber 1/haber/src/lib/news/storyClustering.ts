import type { Article, NewsSource, Prisma, Tag } from '@prisma/client'
import { prisma } from '@/lib/db'
import { ruleBasedEnrichment } from '@/lib/ai/ruleBasedEnrichment'
import { normalizeTurkishText, tokenizeTurkishText } from '@/lib/classification/textNormalization'
import { TURKISH_STOPWORDS } from '@/lib/classification/stopwords.tr'
import { safeParseTags } from '@/types/news-ui'

type ArticleWithStoryData = Article & {
  source?: NewsSource | null
  articleTags?: Array<{ tag: Tag }>
}

export type StoryClusterSource = {
  id: string
  name: string
  url: string | null
  trustScore: number
  articleCount: number
}

export type StoryClusterResult = {
  mainArticle: ArticleWithStoryData
  relatedArticles: ArticleWithStoryData[]
  sources: StoryClusterSource[]
  sharedConcepts: string[]
  clusterReason: string
}

type SimilarityDetails = {
  score: number
  signals: string[]
  sharedConcepts: string[]
}

function relationTags(article: ArticleWithStoryData) {
  return article.articleTags?.map((item) => item.tag.name).filter(Boolean) || []
}

function articleTags(article: ArticleWithStoryData) {
  return [...safeParseTags(article.tags), ...relationTags(article)]
}

function uniqueNormalized(values: string[]) {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const value of values.map((item) => item.trim()).filter(Boolean)) {
    const key = normalizeTurkishText(value)
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(value)
  }

  return unique
}

function titleTokens(article: ArticleWithStoryData) {
  return tokenizeTurkishText(article.title)
    .filter((token) => token.length >= 3)
    .filter((token) => !TURKISH_STOPWORDS.has(token))
}

function jaccardSimilarity(a: string[], b: string[]) {
  const left = new Set(a)
  const right = new Set(b)
  if (left.size === 0 || right.size === 0) return 0

  let intersection = 0
  for (const item of left) {
    if (right.has(item)) intersection += 1
  }

  return intersection / new Set([...left, ...right]).size
}

function sameDuplicateHash(a: ArticleWithStoryData, b: ArticleWithStoryData) {
  return Boolean(a.duplicateHash && b.duplicateHash && a.duplicateHash === b.duplicateHash)
}

function hoursBetween(a: Date, b: Date) {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60)
}

function publishedAtProximityScore(a: ArticleWithStoryData, b: ArticleWithStoryData) {
  const hours = hoursBetween(new Date(a.publishedAt), new Date(b.publishedAt))
  if (hours <= 12) return 1
  if (hours <= 24) return 0.85
  if (hours <= 72) return 0.65
  if (hours <= 168) return 0.35
  return 0
}

function extractConcepts(article: ArticleWithStoryData) {
  const enrichment = ruleBasedEnrichment({
    title: article.title,
    summary: article.summary,
    content: article.content,
    category: article.category,
    tags: articleTags(article),
  })

  return uniqueNormalized([
    article.category || '',
    ...articleTags(article),
    ...enrichment.concepts,
    ...enrichment.entities.map((entity) => entity.name),
  ])
}

function sharedValues(a: string[], b: string[]) {
  const right = new Map(b.map((value) => [normalizeTurkishText(value), value]))
  return uniqueNormalized(
    a.filter((value) => right.has(normalizeTurkishText(value))).map((value) => right.get(normalizeTurkishText(value)) || value)
  )
}

function calculateSimilarityDetails(a: ArticleWithStoryData, b: ArticleWithStoryData): SimilarityDetails {
  const signals: string[] = []
  let score = 0

  if (sameDuplicateHash(a, b)) {
    score += 0.55
    signals.push('duplicateHash eşleşmesi')
  }

  const titleScore = jaccardSimilarity(titleTokens(a), titleTokens(b))
  if (titleScore >= 0.18) signals.push('başlık benzerliği')
  score += titleScore * 0.25

  if (a.category && b.category && a.category === b.category) {
    score += 0.12
    signals.push('aynı kategori')
  }

  const tagScore = jaccardSimilarity(
    articleTags(a).map(normalizeTurkishText),
    articleTags(b).map(normalizeTurkishText)
  )
  if (tagScore > 0) signals.push('ortak etiketler')
  score += tagScore * 0.18

  const aConcepts = extractConcepts(a)
  const bConcepts = extractConcepts(b)
  const sharedConcepts = sharedValues(aConcepts, bConcepts).slice(0, 8)
  const conceptScore = jaccardSimilarity(aConcepts.map(normalizeTurkishText), bConcepts.map(normalizeTurkishText))
  if (sharedConcepts.length > 0) signals.push('ortak kavram/varlıklar')
  score += conceptScore * 0.2

  const timeScore = publishedAtProximityScore(a, b)
  if (timeScore >= 0.65) signals.push('yakın yayın zamanı')
  score += timeScore * 0.1

  return {
    score: Math.min(1, Number(score.toFixed(3))),
    signals,
    sharedConcepts,
  }
}

export function calculateStorySimilarity(a: ArticleWithStoryData, b: ArticleWithStoryData) {
  return calculateSimilarityDetails(a, b).score
}

export function groupArticlesByStory(articles: ArticleWithStoryData[]) {
  const sorted = [...articles].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  const groups: ArticleWithStoryData[][] = []

  for (const article of sorted) {
    const matchingGroup = groups.find((group) => group.some((item) => calculateStorySimilarity(article, item) >= 0.34))

    if (matchingGroup) {
      matchingGroup.push(article)
    } else {
      groups.push([article])
    }
  }

  return groups.sort((a, b) => b.length - a.length || b[0].publishedAt.getTime() - a[0].publishedAt.getTime())
}

function buildSources(articles: ArticleWithStoryData[]) {
  const bySource = new Map<string, StoryClusterSource>()

  for (const article of articles) {
    const sourceId = article.sourceId
    const existing = bySource.get(sourceId)
    if (existing) {
      existing.articleCount += 1
      continue
    }

    bySource.set(sourceId, {
      id: sourceId,
      name: article.source?.name || sourceId,
      url: article.source?.url || article.source?.baseUrl || null,
      trustScore: article.source?.trustScore ?? article.trustScore,
      articleCount: 1,
    })
  }

  return [...bySource.values()].sort((a, b) => b.articleCount - a.articleCount || b.trustScore - a.trustScore)
}

function buildClusterReason(details: SimilarityDetails[]) {
  const signals = uniqueNormalized(details.flatMap((item) => item.signals)).slice(0, 4)
  if (signals.length === 0) return 'Benzer kategori, etiket ve yayın zamanı sinyalleri üzerinden sınırlı bir küme bulundu.'
  return `Bu küme ${signals.join(', ')} sinyalleriyle eşleşti.`
}

export async function findRelatedStoryCluster(articleId: string): Promise<StoryClusterResult | null> {
  const mainArticle = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      source: true,
      articleTags: { include: { tag: true } },
    },
  })

  if (!mainArticle) return null

  const tags = articleTags(mainArticle)
  const publishedAt = new Date(mainArticle.publishedAt)
  const from = new Date(publishedAt.getTime() - 1000 * 60 * 60 * 24 * 7)
  const to = new Date(publishedAt.getTime() + 1000 * 60 * 60 * 24 * 7)

  const candidateFilters: Prisma.ArticleWhereInput[] = []
  if (mainArticle.duplicateHash) candidateFilters.push({ duplicateHash: mainArticle.duplicateHash })
  if (mainArticle.category) candidateFilters.push({ category: mainArticle.category })
  if (mainArticle.categoryId) candidateFilters.push({ categoryId: mainArticle.categoryId })
  candidateFilters.push(...tags.slice(0, 6).map((tag) => ({ tags: { contains: tag } })))

  const candidates = await prisma.article.findMany({
    where: {
      id: { not: mainArticle.id },
      isActive: true,
      publishedAt: { gte: from, lte: to },
      ...(candidateFilters.length > 0 ? { OR: candidateFilters } : {}),
    },
    include: {
      source: true,
      articleTags: { include: { tag: true } },
    },
    orderBy: [{ publishedAt: 'desc' }],
    take: 80,
  })

  const scored = candidates
    .map((article) => ({
      article,
      details: calculateSimilarityDetails(mainArticle, article),
    }))
    .filter((item) => item.details.score >= 0.28)
    .sort((a, b) => b.details.score - a.details.score || b.article.publishedAt.getTime() - a.article.publishedAt.getTime())

  const relatedArticles = scored.slice(0, 5).map((item) => item.article)
  const clusterArticles = [mainArticle, ...relatedArticles]

  return {
    mainArticle,
    relatedArticles,
    sources: buildSources(clusterArticles),
    sharedConcepts: uniqueNormalized(scored.flatMap((item) => item.details.sharedConcepts)).slice(0, 8),
    clusterReason: buildClusterReason(scored.map((item) => item.details)),
  }
}
