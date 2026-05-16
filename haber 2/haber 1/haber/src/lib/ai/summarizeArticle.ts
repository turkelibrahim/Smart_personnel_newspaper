import { stripHtml } from '@/lib/classification/textNormalization'
import { safeParseTags } from '@/types/news-ui'
import { getAIConfig } from './aiConfig'

export type ArticleSummaryReadingLevel = 'quick' | 'balanced' | 'deep'
export type ArticleSummaryProvider = 'rule-based' | 'ai'
export type ArticleSummaryVersion = 'summary-v1'

export type ArticleSummaryInput = {
  title?: string | null
  summary?: string | null
  content?: string | null
  category?: string | null
  tags?: string[] | string | null
}

export type ArticleSummaryResult = {
  shortSummary: string
  keyPoints: string[]
  whyItMatters: string
  readingLevel: ArticleSummaryReadingLevel
  provider: ArticleSummaryProvider
  version: ArticleSummaryVersion
}

const SUMMARY_VERSION: ArticleSummaryVersion = 'summary-v1'

function cleanText(value: string | null | undefined) {
  return stripHtml(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeTags(tags: ArticleSummaryInput['tags']) {
  return safeParseTags(tags)
    .map((tag) => cleanText(tag))
    .filter(Boolean)
    .slice(0, 5)
}

function dedupeStrings(values: string[]) {
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

function extractMeaningfulSentences(content: string) {
  const cleaned = cleanText(content)
  if (!cleaned) return []

  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-ZÇĞİÖŞÜ0-9])/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 35)
}

function limitText(value: string, maxLength: number) {
  const cleaned = cleanText(value)
  if (cleaned.length <= maxLength) return cleaned

  const sliced = cleaned.slice(0, maxLength).trim()
  const lastSpace = sliced.lastIndexOf(' ')
  return `${sliced.slice(0, lastSpace > 80 ? lastSpace : sliced.length).trim()}...`
}

function inferReadingLevel(content: string): ArticleSummaryReadingLevel {
  const wordCount = cleanText(content).split(/\s+/).filter(Boolean).length
  if (wordCount <= 180) return 'quick'
  if (wordCount <= 650) return 'balanced'
  return 'deep'
}

function buildShortSummary(input: ArticleSummaryInput) {
  const summary = cleanText(input.summary)
  if (summary) return limitText(summary, 360)

  const sentences = extractMeaningfulSentences(input.content || '')
  if (sentences.length > 0) return limitText(sentences.slice(0, 3).join(' '), 420)

  return limitText(input.title || 'Bu haber için yeterli özet verisi bulunamadı.', 240)
}

function buildKeyPoints(input: ArticleSummaryInput) {
  const title = cleanText(input.title)
  const category = cleanText(input.category)
  const tags = normalizeTags(input.tags)
  const contentSentence = extractMeaningfulSentences(input.content || '')[0]

  const points = [
    title ? `Ana konu: ${title}` : '',
    category ? `Kategori odağı: ${category}` : '',
    tags.length > 0 ? `Etiket sinyalleri: ${tags.slice(0, 3).join(', ')}` : '',
    contentSentence ? `İçerik ipucu: ${limitText(contentSentence, 160)}` : '',
    'Haberin etkisi, gelişmenin kapsamı ve ilgili taraflara göre takip edilmeli.',
  ]

  return dedupeStrings(points).slice(0, 3)
}

function buildWhyItMatters(input: ArticleSummaryInput) {
  const category = cleanText(input.category).toLocaleLowerCase('tr-TR')
  const tags = normalizeTags(input.tags)

  if (category.includes('ekonomi') || tags.some((tag) => tag.toLocaleLowerCase('tr-TR').includes('ekonomi'))) {
    return 'Ekonomi haberleri fiyatlar, gelir beklentileri, şirket kararları ve gündelik harcama davranışları üzerinde doğrudan etki yaratabilir.'
  }

  if (category.includes('teknoloji') || tags.some((tag) => tag.toLocaleLowerCase('tr-TR').includes('teknoloji'))) {
    return 'Teknoloji gelişmeleri iş süreçlerini, veri güvenliğini, rekabeti ve kullanıcı alışkanlıklarını değiştirebileceği için önem taşır.'
  }

  if (category.includes('sağlık') || tags.some((tag) => tag.toLocaleLowerCase('tr-TR').includes('sağlık'))) {
    return 'Sağlıkla ilgili gelişmeler bireysel kararları, kamu hizmetlerini ve toplumsal risk algısını etkileyebilir.'
  }

  if (category.includes('spor')) {
    return 'Spor haberleri kulüplerin performansını, taraftar beklentilerini ve ilgili ekonomik-sosyal gündemi şekillendirebilir.'
  }

  if (category.includes('siyaset') || category.includes('gündem')) {
    return 'Bu tür gelişmeler kamu kararlarını, kurumların önceliklerini ve vatandaşların günlük hayatını etkileyebilecek sonuçlar doğurabilir.'
  }

  if (category.includes('dünya')) {
    return 'Uluslararası gelişmeler diplomasi, ekonomi, güvenlik ve bölgesel dengeler açısından takip edilmesi gereken sonuçlar doğurabilir.'
  }

  return 'Bu haber, ilgili konu başlığındaki gelişmeleri anlamak ve olası etkilerini izlemek için bağlam sağlar.'
}

function ruleBasedSummary(input: ArticleSummaryInput): ArticleSummaryResult {
  return {
    shortSummary: buildShortSummary(input),
    keyPoints: buildKeyPoints(input),
    whyItMatters: buildWhyItMatters(input),
    readingLevel: inferReadingLevel([input.summary, input.content].map((value) => value || '').join(' ')),
    provider: 'rule-based',
    version: SUMMARY_VERSION,
  }
}

function normalizeInput(input: ArticleSummaryInput): ArticleSummaryInput {
  return {
    title: cleanText(input.title),
    summary: cleanText(input.summary),
    content: cleanText(input.content),
    category: cleanText(input.category),
    tags: normalizeTags(input.tags),
  }
}

function isValidReadingLevel(value: unknown): value is ArticleSummaryReadingLevel {
  return value === 'quick' || value === 'balanced' || value === 'deep'
}

function normalizeAiResult(value: unknown, fallback: ArticleSummaryResult): ArticleSummaryResult | null {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const shortSummary = typeof record.shortSummary === 'string' ? cleanText(record.shortSummary) : ''
  const keyPoints = Array.isArray(record.keyPoints)
    ? dedupeStrings(record.keyPoints.filter((item): item is string => typeof item === 'string')).slice(0, 5)
    : []
  const whyItMatters = typeof record.whyItMatters === 'string' ? cleanText(record.whyItMatters) : ''
  const readingLevel = isValidReadingLevel(record.readingLevel) ? record.readingLevel : fallback.readingLevel

  if (!shortSummary || keyPoints.length === 0 || !whyItMatters) return null

  return {
    shortSummary: limitText(shortSummary, 420),
    keyPoints: keyPoints.slice(0, 3),
    whyItMatters: limitText(whyItMatters, 360),
    readingLevel,
    provider: 'ai',
    version: SUMMARY_VERSION,
  }
}

function extractOpenAiText(response: unknown) {
  if (!response || typeof response !== 'object') return ''
  const record = response as Record<string, unknown>

  if (typeof record.output_text === 'string') return record.output_text

  const output = Array.isArray(record.output) ? record.output : []
  for (const item of output) {
    if (!item || typeof item !== 'object') continue
    const itemRecord = item as Record<string, unknown>
    const content: unknown[] = Array.isArray(itemRecord.content) ? itemRecord.content : []
    for (const part of content) {
      if (!part || typeof part !== 'object') continue
      const text = (part as Record<string, unknown>).text
      if (typeof text === 'string') return text
    }
  }

  return ''
}

async function tryOpenAiSummary(input: ArticleSummaryInput, fallback: ArticleSummaryResult) {
  const config = getAIConfig()
  if (config.mode !== 'ai' || config.provider !== 'openai') return null

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || process.env.OPENAI_SUMMARY_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions:
        'Türkçe haber editörü gibi davran. Orijinal haber metnini değiştirme, sadece ayrı bir özet katmanı üret. Çıktıyı JSON şemasına tam uygun ver.',
      input: JSON.stringify(input),
      max_output_tokens: 700,
      text: {
        format: {
          type: 'json_schema',
          name: 'article_summary',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              shortSummary: { type: 'string' },
              keyPoints: {
                type: 'array',
                minItems: 3,
                maxItems: 3,
                items: { type: 'string' },
              },
              whyItMatters: { type: 'string' },
              readingLevel: { type: 'string', enum: ['quick', 'balanced', 'deep'] },
              provider: { type: 'string', enum: ['ai'] },
              version: { type: 'string', enum: [SUMMARY_VERSION] },
            },
            required: ['shortSummary', 'keyPoints', 'whyItMatters', 'readingLevel', 'provider', 'version'],
          },
        },
      },
    }),
  })

  if (!response.ok) return null

  const data = await response.json()
  const text = extractOpenAiText(data)
  if (!text) return null

  try {
    return normalizeAiResult(JSON.parse(text), fallback)
  } catch {
    return null
  }
}

export async function summarizeArticle(input: ArticleSummaryInput): Promise<ArticleSummaryResult> {
  const normalizedInput = normalizeInput(input)
  const fallback = ruleBasedSummary(normalizedInput)

  try {
    const aiSummary = await tryOpenAiSummary(normalizedInput, fallback)
    return aiSummary || fallback
  } catch {
    return fallback
  }
}
