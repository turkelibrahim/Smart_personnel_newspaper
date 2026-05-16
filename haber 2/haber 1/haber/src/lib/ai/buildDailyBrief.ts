import type { Article, UserPreference } from '@prisma/client'
import { safeParseTags } from '@/types/news-ui'
import { getAIConfig } from './aiConfig'
import { generateAIText } from './providerAdapter'

export type DailyBriefProvider = 'rule-based' | 'ai'

export type DailyBriefArticle = Partial<Article> & {
  id?: string
  source?: { name?: string | null } | null
  articleTags?: Array<{ tag: { name: string } }>
}

export type DailyBriefSection = {
  title?: string | null
  articles?: DailyBriefArticle[]
}

export type BuildDailyBriefInput = {
  headline?: DailyBriefArticle | null
  sections?: DailyBriefSection[]
  sectionArticles?: DailyBriefArticle[]
  userPreference?: UserPreference | null
  topCategories?: string[]
  topTags?: string[]
}

export type DailyBriefResult = {
  title: string
  overview: string
  highlights: string[]
  watchTopics: string[]
  provider: DailyBriefProvider
  model: string
  generatedAt: string
}

const BRIEF_TITLE = 'Bugünün kısa özeti'

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function relationTags(article: DailyBriefArticle) {
  return article.articleTags?.map((item) => item.tag.name).filter(Boolean) || []
}

function articleTags(article: DailyBriefArticle) {
  return [...safeParseTags(article.tags), ...relationTags(article)].map(cleanText).filter(Boolean)
}

function dedupe(values: string[]) {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const value of values.map(cleanText).filter(Boolean)) {
    const key = value.toLocaleLowerCase('tr-TR')
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(value)
  }

  return unique
}

function countValues(values: string[]) {
  const counts = new Map<string, { label: string; count: number }>()

  for (const value of values.map(cleanText).filter(Boolean)) {
    const key = value.toLocaleLowerCase('tr-TR')
    const existing = counts.get(key)
    if (existing) {
      existing.count += 1
    } else {
      counts.set(key, { label: value, count: 1 })
    }
  }

  return [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'tr'))
}

function deriveTopCategories(articles: DailyBriefArticle[]) {
  return countValues(articles.map((article) => cleanText(article.category || article.categoryId))).map((item) => item.label)
}

function deriveTopTags(articles: DailyBriefArticle[]) {
  return countValues(articles.flatMap(articleTags)).map((item) => item.label)
}

function dedupeArticles(articles: Array<DailyBriefArticle | null | undefined>) {
  const seen = new Set<string>()
  const unique: DailyBriefArticle[] = []

  for (const article of articles) {
    if (!article) continue
    const key = cleanText(article.id) || cleanText(article.title)
    if (!key || seen.has(key)) continue
    seen.add(key)
    unique.push(article)
  }

  return unique
}

function normalizeInput(input: BuildDailyBriefInput) {
  const sectionArticles = [
    ...(input.sectionArticles || []),
    ...(input.sections || []).flatMap((section) => section.articles || []),
  ]
  const articles = dedupeArticles([input.headline, ...sectionArticles])
  const headline = input.headline || articles[0] || null

  return {
    headline,
    sectionArticles: articles.filter((article) => {
      const articleKey = cleanText(article.id) || cleanText(article.title)
      const headlineKey = cleanText(headline?.id) || cleanText(headline?.title)
      return articleKey !== headlineKey
    }),
    userPreference: input.userPreference || null,
    topCategories: dedupe([...(input.topCategories || []), ...deriveTopCategories(articles)]).slice(0, 6),
    topTags: dedupe([...(input.topTags || []), ...deriveTopTags(articles)]).slice(0, 10),
  }
}

function buildOverview(input: ReturnType<typeof normalizeInput>) {
  const headlineTitle = cleanText(input.headline?.title)
  const profession = cleanText(input.userPreference?.profession)
  const topCategory = input.topCategories[0]

  if (headlineTitle && profession) {
    return `Bugün ${profession} profilin için seçilen ana gündem "${headlineTitle}". Seçki özellikle ${topCategory || 'güncel başlıklar'} etrafında yoğunlaşıyor.`
  }

  if (headlineTitle) {
    return `Bugün senin için öne çıkan ana haber "${headlineTitle}". Gazete, bunu tamamlayan güncel ve ilişkili başlıklarla hazırlandı.`
  }

  if (topCategory) {
    return `Bugünün kişisel gazetesinde ${topCategory} başlığı öne çıkıyor. Seçki, ilgi alanların ve güncellik sinyallerine göre dengelendi.`
  }

  return 'Bugünün kişisel gazetesinde ilgi alanlarına yakın güncel haberler kısa ve okunabilir bir seçki halinde toplandı.'
}

function buildHighlights(input: ReturnType<typeof normalizeInput>) {
  const articleHighlights = input.sectionArticles
    .map((article) => cleanText(article.title))
    .filter(Boolean)
    .slice(0, 3)
    .map((title) => `Seçkide öne çıkan haber: ${title}`)

  const highlights = [
    input.headline?.title ? `Manşet: ${input.headline.title}` : '',
    ...articleHighlights,
    input.topCategories.length > 0 ? `Yoğunlaşan kategoriler: ${input.topCategories.slice(0, 3).join(', ')}` : '',
  ]

  return dedupe(highlights).slice(0, 4)
}

function buildWatchTopics(input: ReturnType<typeof normalizeInput>) {
  const recentArticles = [...input.sectionArticles]
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime())
    .slice(0, 8)
  const recentTags = deriveTopTags(recentArticles)
  const topics = dedupe([...recentTags, ...input.topTags, ...input.topCategories])

  return topics.slice(0, 3)
}

function ruleBasedDailyBrief(input: ReturnType<typeof normalizeInput>): DailyBriefResult {
  const config = getAIConfig()

  return {
    title: BRIEF_TITLE,
    overview: buildOverview(input),
    highlights: buildHighlights(input),
    watchTopics: buildWatchTopics(input),
    provider: 'rule-based',
    model: config.model,
    generatedAt: new Date().toISOString(),
  }
}

function normalizeAiBrief(value: unknown, fallback: DailyBriefResult): DailyBriefResult | null {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const overview = cleanText(record.overview)
  const highlights = Array.isArray(record.highlights)
    ? dedupe(record.highlights.filter((item): item is string => typeof item === 'string')).slice(0, 4)
    : []
  const watchTopics = Array.isArray(record.watchTopics)
    ? dedupe(record.watchTopics.filter((item): item is string => typeof item === 'string')).slice(0, 3)
    : []

  if (!overview || highlights.length === 0 || watchTopics.length === 0) return null

  return {
    title: cleanText(record.title) || BRIEF_TITLE,
    overview,
    highlights,
    watchTopics,
    provider: 'ai',
    model: fallback.model,
    generatedAt: new Date().toISOString(),
  }
}

function compactArticle(article: DailyBriefArticle) {
  return {
    title: cleanText(article.title),
    summary: cleanText(article.summary),
    category: cleanText(article.category),
    tags: articleTags(article).slice(0, 8),
    source: article.source?.name || article.sourceId,
    publishedAt: article.publishedAt,
  }
}

function compactPreference(preference: UserPreference | null) {
  if (!preference) return null

  return {
    profession: preference.profession,
    preferredReadingDepth: preference.preferredReadingDepth,
    preferredTone: preference.preferredTone,
    categoryId: preference.categoryId,
    interests: safeParseTags(preference.interests).slice(0, 12),
    blockedTopics: safeParseTags(preference.blockedTopics).slice(0, 12),
  }
}

async function tryAiDailyBrief(input: ReturnType<typeof normalizeInput>, fallback: DailyBriefResult) {
  const response = await generateAIText({
    systemInstruction:
      'Türkçe yazan kişisel gazete editörüsün. Kullanıcının ilgi alanlarına göre kısa bir günlük editör özeti üret. En fazla 4 highlight ve en fazla 3 takip edilecek konu yaz. Kaynak haberlerde olmayan bilgi ekleme. Yalnızca JSON döndür.',
    input: JSON.stringify({
      outputShape: {
        title: BRIEF_TITLE,
        overview: 'string',
        highlights: ['string'],
        watchTopics: ['string'],
      },
      constraints: {
        language: 'tr',
        maxHighlights: 4,
        maxWatchTopics: 3,
        noUnsupportedFacts: true,
      },
      headline: input.headline ? compactArticle(input.headline) : null,
      sections: input.sectionArticles.slice(0, 24).map(compactArticle),
      userPreference: compactPreference(input.userPreference),
      topCategories: input.topCategories,
      topTags: input.topTags,
    }),
    fallbackText: JSON.stringify(fallback),
    maxOutputTokens: 700,
  })

  if (response.mode !== 'ai') return null

  try {
    const result = normalizeAiBrief(JSON.parse(response.text), { ...fallback, model: response.model || fallback.model })
    return result ? { ...result, model: response.model || fallback.model } : null
  } catch {
    return null
  }
}

export async function buildDailyBrief(input: BuildDailyBriefInput): Promise<DailyBriefResult> {
  const normalizedInput = normalizeInput(input)
  const fallback = ruleBasedDailyBrief(normalizedInput)

  try {
    const aiBrief = await tryAiDailyBrief(normalizedInput, fallback)
    return aiBrief || fallback
  } catch {
    return fallback
  }
}
