import type { ArticleEnrichmentResult, EnrichmentInput, ExtractedEntity } from './aiTypes'
import { getPreferredEnrichmentProvider } from './aiProviderAdapter'
import { safeParseTags } from '@/types/news-ui'

function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))))
}

function dedupeEntities(entities: ExtractedEntity[]) {
  const byKey = new Map<string, ExtractedEntity>()

  for (const entity of entities) {
    const key = `${entity.type}:${entity.name.trim().toLocaleLowerCase('tr-TR')}`
    const normalized: ExtractedEntity = {
      ...entity,
      name: entity.name.trim(),
      confidence: clampConfidence(entity.confidence),
    }

    const existing = byKey.get(key)
    if (!existing || normalized.confidence > existing.confidence) {
      byKey.set(key, normalized)
    }
  }

  return [...byKey.values()].sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence
    if (a.type !== b.type) return a.type.localeCompare(b.type, 'en')
    return a.name.localeCompare(b.name, 'tr')
  })
}

function dedupeStrings(values: string[]) {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const value of values.map((item) => item.trim()).filter(Boolean)) {
    const key = value.toLocaleLowerCase('tr-TR')
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(value)
  }

  return unique.sort((a, b) => a.localeCompare(b, 'tr'))
}

export async function enrichArticle(input: EnrichmentInput): Promise<ArticleEnrichmentResult> {
  const provider = getPreferredEnrichmentProvider()

  const normalizedInput: EnrichmentInput = {
    title: input.title?.trim() || '',
    summary: input.summary?.trim() || '',
    content: input.content?.trim() || '',
    category: input.category?.trim() || '',
    tags: Array.isArray(input.tags) ? input.tags : safeParseTags(input.tags),
  }

  const result = await provider.enrich(normalizedInput)

  return {
    entities: dedupeEntities(result.entities),
    concepts: dedupeStrings(result.concepts),
    keyPoints: dedupeStrings(result.keyPoints),
    importanceReason: result.importanceReason.trim(),
    enrichmentVersion: result.enrichmentVersion || 'rule-based-v1',
    provider: result.provider || provider.name,
  }
}
