import type { ArticleEnrichmentResult, EnrichmentInput, ExtractedEntity, EntityType } from './aiTypes'
import { normalizeTurkishText, stripHtml } from '@/lib/classification/textNormalization'
import { safeParseTags } from '@/types/news-ui'

const ORGANIZATIONS = [
  'Merkez Bankası',
  'TÜİK',
  'TBMM',
  'MEB',
  'Sağlık Bakanlığı',
  'UEFA',
  'Google',
  'Microsoft',
  'OpenAI',
]

const LOCATIONS = [
  'Türkiye',
  'İstanbul',
  'Ankara',
  'İzmir',
  'Avrupa',
  'ABD',
  'Çin',
  'Rusya',
]

const EVENT_TERMS = [
  'zirvesi',
  'seçimi',
  'krizi',
  'saldırısı',
  'operasyonu',
  'konferansı',
  'toplantısı',
  'turnuvası',
  'maçı',
]

const CONCEPT_KEYWORDS = [
  'yapay zeka',
  'enflasyon',
  'faiz',
  'borsa',
  'seçim',
  'enerji',
  'savunma',
  'iklim',
  'sağlık',
  'eğitim',
  'teknoloji',
  'girişim',
  'veri',
  'bulut',
  'siber güvenlik',
]

function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))))
}

function cleanText(value: string | null | undefined) {
  return stripHtml(value || '').replace(/\s+/g, ' ').trim()
}

function normalizeName(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function dedupeStrings(values: string[]) {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const value of values.map(normalizeName).filter(Boolean)) {
    const key = normalizeTurkishText(value)
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(value)
  }

  return unique.sort((a, b) => a.localeCompare(b, 'tr'))
}

function dedupeEntities(entities: ExtractedEntity[]) {
  const bestByKey = new Map<string, ExtractedEntity>()

  for (const entity of entities) {
    const key = `${entity.type}:${normalizeTurkishText(entity.name)}`
    const existing = bestByKey.get(key)

    if (!existing || entity.confidence > existing.confidence) {
      bestByKey.set(key, {
        ...entity,
        confidence: clampConfidence(entity.confidence),
      })
    }
  }

  return [...bestByKey.values()].sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence
    if (a.type !== b.type) return a.type.localeCompare(b.type, 'en')
    return a.name.localeCompare(b.name, 'tr')
  })
}

function extractEntityCandidates(text: string) {
  const matches = text.match(/\b(?:[A-ZÇĞİÖŞÜ][a-zçğıöşü]+|[A-ZÇĞİÖŞÜ]{2,})(?:\s+(?:[A-ZÇĞİÖŞÜ][a-zçğıöşü]+|[A-ZÇĞİÖŞÜ]{2,})){0,3}\b/g)
  return matches ? dedupeStrings(matches) : []
}

function classifyCandidate(candidate: string): { type: EntityType; confidence: number } {
  const normalized = normalizeTurkishText(candidate)

  if (ORGANIZATIONS.some((item) => normalizeTurkishText(item) === normalized)) {
    return { type: 'organization', confidence: 0.9 }
  }

  if (LOCATIONS.some((item) => normalizeTurkishText(item) === normalized)) {
    return { type: 'location', confidence: 0.88 }
  }

  if (EVENT_TERMS.some((term) => normalized.includes(normalizeTurkishText(term)))) {
    return { type: 'event', confidence: 0.78 }
  }

  const wordCount = candidate.split(' ').length
  if (wordCount >= 2) {
    return { type: 'person', confidence: 0.68 }
  }

  return { type: 'concept', confidence: 0.52 }
}

function extractKnownEntities(text: string, list: string[], type: EntityType, confidence: number) {
  const normalizedText = normalizeTurkishText(text)
  return list
    .filter((item) => normalizedText.includes(normalizeTurkishText(item)))
    .map<ExtractedEntity>((item) => ({
      type,
      name: item,
      confidence,
    }))
}

function extractConcepts(text: string, input: EnrichmentInput) {
  const normalizedText = normalizeTurkishText(text)
  const concepts = CONCEPT_KEYWORDS.filter((item) => normalizedText.includes(normalizeTurkishText(item)))

  const parsedTags = safeParseTags(input.tags)
  if (input.category) concepts.push(input.category)
  concepts.push(...parsedTags)

  return dedupeStrings(concepts)
}

function buildKeyPoints(input: EnrichmentInput) {
  const title = cleanText(input.title)
  const summary = cleanText(input.summary)
  const points = [title, summary].filter(Boolean)
  return points.slice(0, 2)
}

function buildImportanceReason(entities: ExtractedEntity[], concepts: string[]) {
  if (entities.length > 0) {
    return `${entities[0].name} ve ilişkili başlıklar etrafında şekilleniyor.`
  }

  if (concepts.length > 0) {
    return `${concepts[0]} odaklı bir haber akışı sunuyor.`
  }

  return 'Başlık ve özetten sınırlı kavramsal sinyal çıkarılabildi.'
}

export function ruleBasedEnrichment(input: EnrichmentInput): ArticleEnrichmentResult {
  const title = cleanText(input.title)
  const summary = cleanText(input.summary)
  const content = cleanText(input.content)
  const combined = [title, summary, content].filter(Boolean).join(' ')

  const candidateEntities = extractEntityCandidates(combined).map((candidate) => {
    const classified = classifyCandidate(candidate)
    return {
      type: classified.type,
      name: candidate,
      confidence: classified.confidence,
    }
  })

  const knownEntities = [
    ...extractKnownEntities(combined, ORGANIZATIONS, 'organization', 0.93),
    ...extractKnownEntities(combined, LOCATIONS, 'location', 0.9),
  ]

  const concepts = extractConcepts(combined, input)
  const conceptEntities = concepts.slice(0, 6).map<ExtractedEntity>((concept) => ({
    type: 'concept',
    name: concept,
    confidence: 0.58,
  }))

  const entities = dedupeEntities([...knownEntities, ...candidateEntities, ...conceptEntities]).slice(0, 20)
  const keyPoints = buildKeyPoints(input)

  return {
    entities,
    concepts,
    keyPoints,
    importanceReason: buildImportanceReason(entities, concepts),
    enrichmentVersion: 'rule-based-v1',
    provider: 'rule-based',
  }
}
