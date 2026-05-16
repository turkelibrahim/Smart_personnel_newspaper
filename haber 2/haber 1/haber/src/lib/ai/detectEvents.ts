import { stripHtml } from '@/lib/classification/textNormalization'
import { safeParseTags } from '@/types/news-ui'

export type DetectedEventType = 'exam' | 'deadline' | 'meeting' | 'announcement' | 'sports' | 'other'

export type DetectEventsInput = {
  title?: string | null
  summary?: string | null
  content?: string | null
  category?: string | null
  tags?: string[] | string | null
}

export type DetectedEventResult = {
  hasEvent: boolean
  eventType: DetectedEventType
  title: string | null
  dateText: string | null
  organization: string | null
  location: string | null
  confidence: number
}

const MONTHS =
  'ocak|subat|şubat|mart|nisan|mayis|mayıs|haziran|temmuz|agustos|ağustos|eylul|eylül|ekim|kasim|kasım|aralik|aralık'

const DATE_PATTERNS = [
  new RegExp(`\\b\\d{1,2}\\s+(?:${MONTHS})(?:\\s+\\d{4})?\\b`, 'iu'),
  /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/u,
  /\b(?:bugün|yarın|hafta sonu|bu hafta|gelecek hafta|önümüzdeki hafta)\b/iu,
  /\b(?:son gün|son tarih|son başvuru|başvurular .*? kadar|deadline)\b/iu,
  /\b\d{1,2}:\d{2}\b/u,
]

const ORGANIZATION_PATTERNS = [
  /\b[A-ZÇĞİÖŞÜ][\p{L}\d.'&-]+(?:\s+[A-ZÇĞİÖŞÜ][\p{L}\d.'&-]+){0,5}\s+(?:Bakanlığı|Başkanlığı|Müdürlüğü|Üniversitesi|Federasyonu|Kurumu|Kurulu|Komitesi|Belediyesi|Derneği|Vakfı|Bankası|Meclisi|Birliği)\b/u,
  /(?<![\p{L}\d])(?:MEB|ÖSYM|YÖK|TÜİK|TBMM|TFF|TBF|UEFA|FIFA|AFAD|KOSGEB|SGK|İŞKUR)(?![\p{L}\d])/u,
  /(?<![\p{L}\d])(?:OSYM|MEB|YOK|TUIK|TBMM|TFF|TBF|UEFA|FIFA|AFAD|KOSGEB|SGK|ISKUR)(?![\p{L}\d])/u,
]

const LOCATION_PATTERNS = [
  /\b(?:İstanbul|Ankara|İzmir|Bursa|Antalya|Konya|Adana|Gaziantep|Kocaeli|Eskişehir|Türkiye|Avrupa|ABD)\b/u,
  /\b[A-ZÇĞİÖŞÜ][\p{L}\d.'&-]+(?:\s+[A-ZÇĞİÖŞÜ][\p{L}\d.'&-]+){0,3}\s+(?:Stadyumu|Salonu|Merkezi|Kampüsü|Meydanı|Konferans Salonu)\b/u,
]

const TYPE_KEYWORDS: Record<DetectedEventType, string[]> = {
  exam: ['sınav', 'sinav', 'ösym', 'yks', 'kpss', 'lgs', 'ales', 'yds', 'e-sınav'],
  deadline: ['başvuru', 'basvuru', 'son gün', 'son tarih', 'son başvuru', 'deadline', 'kadar', 'süre doluyor'],
  meeting: ['toplantı', 'toplanti', 'zirve', 'görüşme', 'gorusme', 'konferans', 'oturum', 'kongre'],
  announcement: ['duyuru', 'açıklandı', 'aciklandi', 'ilan', 'karar', 'yayımlandı', 'yayimlandi', 'bildiri'],
  sports: ['maç', 'mac', 'turnuva', 'final', 'derbi', 'lig', 'şampiyona', 'sampiyona', 'federasyon'],
  other: ['etkinlik', 'program', 'tören', 'toren', 'takvim'],
}

function cleanText(value: string | null | undefined) {
  return stripHtml(value || '').replace(/\s+/g, ' ').trim()
}

function normalize(value: string) {
  return value.toLocaleLowerCase('tr-TR')
}

function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))))
}

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[0]) return match[0].trim()
  }

  return null
}

function countKeywordHits(text: string, keywords: string[]) {
  const normalizedText = normalize(text)
  return keywords.filter((keyword) => normalizedText.includes(normalize(keyword))).length
}

function detectType(text: string, category: string, tags: string[]) {
  const combined = [text, category, tags.join(' ')].join(' ')
  const scores = Object.entries(TYPE_KEYWORDS).map(([type, keywords]) => ({
    type: type as DetectedEventType,
    hits: countKeywordHits(combined, keywords),
  }))

  scores.sort((a, b) => b.hits - a.hits)
  return scores[0].hits > 0 ? scores[0] : { type: 'other' as DetectedEventType, hits: 0 }
}

function buildEventTitle(input: DetectEventsInput, eventType: DetectedEventType, organization: string | null) {
  const title = cleanText(input.title)
  if (title) return title

  if (organization) {
    return `${organization} kaynaklı ${eventType === 'other' ? 'etkinlik' : eventType} sinyali`
  }

  return 'Haber içinde etkinlik veya duyuru sinyali'
}

export function detectEvents(input: DetectEventsInput): DetectedEventResult {
  const title = cleanText(input.title)
  const summary = cleanText(input.summary)
  const content = cleanText(input.content)
  const category = cleanText(input.category)
  const tags = safeParseTags(input.tags).map(cleanText).filter(Boolean)
  const text = [title, summary, content].filter(Boolean).join(' ')

  const dateText = firstMatch(text, DATE_PATTERNS)
  const organization = firstMatch(text, ORGANIZATION_PATTERNS)
  const location = firstMatch(text, LOCATION_PATTERNS)
  const typeSignal = detectType(text, category, tags)

  const hasDateSignal = Boolean(dateText)
  const hasKeywordSignal = typeSignal.hits > 0
  const hasContextSignal = Boolean(organization || location)
  const hasEvent = hasKeywordSignal && (hasDateSignal || hasContextSignal || typeSignal.hits >= 2)

  const confidence = clampConfidence(
    (hasKeywordSignal ? 0.34 : 0) +
      (hasDateSignal ? 0.28 : 0) +
      (organization ? 0.16 : 0) +
      (location ? 0.1 : 0) +
      (typeSignal.hits > 1 ? 0.08 : 0) +
      (category && countKeywordHits(category, TYPE_KEYWORDS.sports) > 0 ? 0.04 : 0)
  )

  return {
    hasEvent,
    eventType: hasEvent ? typeSignal.type : 'other',
    title: hasEvent ? buildEventTitle(input, typeSignal.type, organization) : null,
    dateText,
    organization,
    location,
    confidence: hasEvent ? confidence : Math.min(confidence, 0.49),
  }
}
