import type { Article, NewsSource } from '@prisma/client'
import { prisma } from '@/lib/db'
import { getTodayPersonalEdition } from '@/lib/personalization/getTodayPersonalEdition'
import { CATEGORY_RULES, normalizeCategoryName } from '@/lib/classification/categoryRules'
import { normalizeTurkishText, tokenizeTurkishText } from '@/lib/classification/textNormalization'
import { TURKISH_STOPWORDS } from '@/lib/classification/stopwords.tr'
import { safeParseTags } from '@/types/news-ui'
import { getAIConfig } from './aiConfig'
import { generateAIText } from './providerAdapter'

export type AnswerProvider = 'rule-based' | 'ai'

export type AnswerNewspaperQuestionInput = {
  question: string
  userId: string
  dateRange?: {
    from?: string | Date | null
    to?: string | Date | null
  }
}

export type CitedArticle = {
  id: string
  title: string
  source: string
  publishedAt: string
}

export type AnswerNewspaperQuestionResult = {
  answer: string
  citedArticles: CitedArticle[]
  confidence: number
  provider: AnswerProvider
  model: string
}

type ArticleForAnswer = Article & {
  source?: NewsSource | null
  articleTags?: Array<{ tag: { name: string } }>
  editionPosition?: number
  contextSignals?: string[]
}

const DEFAULT_DAYS_BACK = 7

function cleanText(value: string | null | undefined) {
  return (value || '').replace(/\s+/g, ' ').trim()
}

function parseDate(value: string | Date | null | undefined) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function buildDateRange(input?: AnswerNewspaperQuestionInput['dateRange']) {
  const to = parseDate(input?.to) || new Date()
  const from = parseDate(input?.from) || new Date(to.getTime() - DEFAULT_DAYS_BACK * 24 * 60 * 60 * 1000)
  return { from, to }
}

function articleTags(article: ArticleForAnswer) {
  return [
    ...safeParseTags(article.tags),
    ...(article.articleTags?.map((item) => item.tag.name) || []),
  ].map(cleanText).filter(Boolean)
}

function questionTokens(question: string) {
  return tokenizeTurkishText(question)
    .filter((token) => token.length >= 3)
    .filter((token) => !TURKISH_STOPWORDS.has(token))
}

function detectCategory(question: string) {
  const normalizedQuestion = normalizeTurkishText(question)
  const direct = normalizeCategoryName(question)
  if (direct in CATEGORY_RULES) return direct

  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some((keyword) => normalizedQuestion.includes(normalizeTurkishText(keyword)))) {
      return category
    }
  }

  return null
}

function asksForImportance(question: string) {
  const normalized = normalizeTurkishText(question)
  return ['en onemli', 'en önemli', 'one cikti', 'öne çıktı', 'one cikan', 'öne çıkan', 'manşet', 'manset'].some((item) =>
    normalized.includes(normalizeTurkishText(item))
  )
}

function asksForWeek(question: string) {
  const normalized = normalizeTurkishText(question)
  return ['bu hafta', 'hafta', 'son 7 gun', 'son 7 gün'].some((item) => normalized.includes(normalizeTurkishText(item)))
}

function sourceName(article: ArticleForAnswer) {
  return article.source?.name || article.sourceId || 'Kaynak'
}

function citeArticle(article: ArticleForAnswer): CitedArticle {
  return {
    id: article.id,
    title: article.title,
    source: sourceName(article),
    publishedAt: new Date(article.publishedAt).toISOString(),
  }
}

function scoreArticle(article: ArticleForAnswer, question: string, category: string | null, tokens: string[]) {
  const haystack = normalizeTurkishText(
    [article.title, article.summary, article.content, article.category, articleTags(article).join(' ')].filter(Boolean).join(' ')
  )
  let score = 0

  for (const token of tokens) {
    if (haystack.includes(token)) score += 3
  }

  if (category && article.category === category) score += 8
  if (category && articleTags(article).some((tag) => normalizeTurkishText(tag).includes(category))) score += 4
  if (article.editionPosition !== undefined) score += Math.max(0, 8 - article.editionPosition)
  if (article.contextSignals?.includes('bookmark')) score += 5
  if (article.contextSignals?.includes('history')) score += 3
  score += Math.min(5, (article.popularityScore || 0) / 20)
  score += Math.min(4, (article.trustScore || article.reliabilityScore || 0) / 25)

  const ageHours = Math.max(0, (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60))
  if (ageHours <= 24) score += 3
  else if (ageHours <= 72) score += 1.5

  return Number(score.toFixed(2))
}

function dedupeArticles(articles: ArticleForAnswer[]) {
  const byId = new Map<string, ArticleForAnswer>()
  for (const article of articles) {
    const existing = byId.get(article.id)
    if (!existing || (article.editionPosition ?? 999) < (existing.editionPosition ?? 999)) {
      byId.set(article.id, {
        ...article,
        contextSignals: [...new Set([...(existing?.contextSignals || []), ...(article.contextSignals || [])])],
      })
    } else {
      existing.contextSignals = [...new Set([...(existing.contextSignals || []), ...(article.contextSignals || [])])]
    }
  }
  return [...byId.values()]
}

function articleInclude() {
  return {
    source: true,
    articleTags: { include: { tag: true } },
  }
}

async function loadCandidateArticles(input: AnswerNewspaperQuestionInput, category: string | null, tokens: string[]) {
  const { from, to } = buildDateRange(input.dateRange)
  const edition = await getTodayPersonalEdition(input.userId)
  const editionArticles = (edition?.articles || []).map((item) => ({
    ...(item.article as ArticleForAnswer),
    editionPosition: item.position,
    contextSignals: ['personal-edition'],
  }))

  const searchFilters = tokens.slice(0, 5).flatMap((token) => [
    { title: { contains: token } },
    { summary: { contains: token } },
    { content: { contains: token } },
    { tags: { contains: token } },
  ])

  const matchingWhere = {
    isActive: true,
    publishedAt: { gte: from, lte: to },
    ...(category || searchFilters.length > 0
      ? {
          OR: [
            ...(category ? [{ category }] : []),
            ...searchFilters,
          ],
        }
      : {}),
  }

  const [recentArticles, bookmarks, history] = await Promise.all([
    prisma.article.findMany({
      where: matchingWhere,
      include: articleInclude(),
      orderBy: [{ publishedAt: 'desc' }],
      take: 80,
    }),
    prisma.bookmark.findMany({
      where: { userId: input.userId },
      include: { article: { include: articleInclude() } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.readingHistory.findMany({
      where: { userId: input.userId, readAt: { gte: from, lte: to } },
      include: { article: { include: articleInclude() } },
      orderBy: { readAt: 'desc' },
      take: 30,
    }),
  ])

  const bookmarkArticles = bookmarks.map((item) => ({
    ...(item.article as ArticleForAnswer),
    contextSignals: ['bookmark'],
  }))
  const historyArticles = history.map((item) => ({
    ...(item.article as ArticleForAnswer),
    contextSignals: ['history'],
  }))

  return dedupeArticles([
    ...editionArticles,
    ...(recentArticles as ArticleForAnswer[]),
    ...bookmarkArticles,
    ...historyArticles,
  ])
}

function buildAnswer(question: string, articles: ArticleForAnswer[], category: string | null) {
  if (articles.length === 0) {
    return 'Bu soruya mevcut kişisel gazete ve yakın dönem haber verisiyle güvenilir bir cevap veremiyorum. Kaynak gösterebileceğim ilgili haber bulunamadı.'
  }

  const categoryLabel = category || 'ilgili başlıklar'
  const top = articles[0]
  const otherTitles = articles.slice(1, 3).map((article) => `"${article.title}"`)

  if (asksForImportance(question)) {
    return `Mevcut haber verisine göre en güçlü sinyal "${top.title}" haberinde. Bu haberi ${sourceName(top)} yayımladı. ${
      otherTitles.length > 0 ? `Aynı bağlamda ${otherTitles.join(' ve ')} haberleri de dikkate değer.` : ''
    }`.trim()
  }

  if (asksForWeek(question)) {
    return `Bu hafta ${categoryLabel} tarafında öne çıkan çizgi "${top.title}" haberiyle başlıyor. ${
      otherTitles.length > 0 ? `Kümede ayrıca ${otherTitles.join(' ve ')} başlıkları var.` : ''
    } Cevap yalnızca aşağıdaki kaynak haberlerden derlendi.`
  }

  return `Sorunla en yakından eşleşen haber "${top.title}". ${
    top.summary ? `Haberde öne çıkan kısa bağlam: ${top.summary}` : `${sourceName(top)} bu başlığı güncel akışta yayımladı.`
  } ${otherTitles.length > 0 ? `Ek kaynak olarak ${otherTitles.join(' ve ')} haberleri de kullanıldı.` : ''}`.trim()
}

function calculateConfidence(scoredArticles: Array<{ score: number }>) {
  if (scoredArticles.length === 0) return 0
  const topScore = scoredArticles[0].score
  const secondScore = scoredArticles[1]?.score || 0
  const spread = Math.max(0, topScore - secondScore)
  return Math.max(0.25, Math.min(0.92, Number(((topScore / 25) + spread / 40).toFixed(2))))
}

function compactArticle(article: ArticleForAnswer, index: number) {
  return {
    ref: index + 1,
    id: article.id,
    title: cleanText(article.title),
    summary: cleanText(article.summary),
    category: cleanText(article.category),
    tags: articleTags(article).slice(0, 8),
    source: sourceName(article),
    publishedAt: new Date(article.publishedAt).toISOString(),
    signals: article.contextSignals || [],
  }
}

function normalizeAiAnswer(
  value: unknown,
  selected: ArticleForAnswer[],
  model: string
): AnswerNewspaperQuestionResult | null {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const answer = cleanText(typeof record.answer === 'string' ? record.answer : '')
  const citedIds = Array.isArray(record.citedArticleIds)
    ? record.citedArticleIds.filter((item): item is string => typeof item === 'string')
    : []
  const cited = citedIds.length > 0
    ? selected.filter((article) => citedIds.includes(article.id))
    : selected.slice(0, 4)
  const confidence = Number(record.confidence)

  if (!answer || cited.length === 0) return null

  return {
    answer,
    citedArticles: cited.slice(0, 6).map(citeArticle),
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(0.95, confidence)) : 0.7,
    provider: 'ai',
    model,
  }
}

async function tryAiAnswer(
  question: string,
  selected: ArticleForAnswer[],
  fallback: AnswerNewspaperQuestionResult
) {
  if (selected.length === 0) return null

  const response = await generateAIText({
    systemInstruction:
      'Türkçe cevap veren bir kişisel gazete asistanısın. Sadece verilen haberleri kullan. Haberlerde olmayan bilgi ekleme. Emin değilsen bunu açıkça belirt. Cevap kısa ve net olsun. Kaynak haberleri citedArticleIds alanında id ile referans göster. Yalnızca JSON döndür.',
    input: JSON.stringify({
      outputShape: {
        answer: 'string',
        citedArticleIds: ['article-id'],
        confidence: 0.0,
      },
      question,
      articles: selected.map(compactArticle),
      constraints: {
        language: 'tr',
        useOnlyProvidedArticles: true,
        noUnsupportedFacts: true,
        maxArticles: selected.length,
      },
    }),
    fallbackText: JSON.stringify({
      answer: fallback.answer,
      citedArticleIds: fallback.citedArticles.map((article) => article.id),
      confidence: fallback.confidence,
    }),
    maxOutputTokens: 700,
    temperature: 0.2,
  })

  if (response.mode !== 'ai') return null

  try {
    return normalizeAiAnswer(JSON.parse(response.text), selected, response.model || fallback.model)
  } catch {
    return null
  }
}

export async function answerNewspaperQuestion(input: AnswerNewspaperQuestionInput): Promise<AnswerNewspaperQuestionResult> {
  const config = getAIConfig()
  const question = cleanText(input.question)
  if (!question) {
    return {
      answer: 'Soru boş geldi. Gazetendeki haberlerden cevap verebilmem için kısa bir soru yazmalısın.',
      citedArticles: [],
      confidence: 0,
      provider: 'rule-based',
      model: config.model,
    }
  }

  const tokens = questionTokens(question)
  const category = detectCategory(question)
  const candidates = await loadCandidateArticles(input, category, tokens)
  const scored = candidates
    .map((article) => ({ article, score: scoreArticle(article, question, category, tokens) }))
    .filter((item) => item.score >= 5)
    .sort((a, b) => b.score - a.score || new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime())

  const selected = scored.slice(0, 10).map((item) => item.article)

  const fallback: AnswerNewspaperQuestionResult = {
    answer: buildAnswer(question, selected, category),
    citedArticles: selected.slice(0, 6).map(citeArticle),
    confidence: calculateConfidence(scored),
    provider: 'rule-based',
    model: config.model,
  }

  try {
    const aiAnswer = await tryAiAnswer(question, selected, fallback)
    return aiAnswer || fallback
  } catch {
    return fallback
  }
}
