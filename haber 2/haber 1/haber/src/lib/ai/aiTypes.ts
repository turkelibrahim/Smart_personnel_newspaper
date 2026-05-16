export type AIProviderName = 'rule-based' | 'openai' | 'anthropic' | 'google'
export type AIProviderMode = 'ai' | 'fallback'

export type AIUsageInfo = {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

export type AITextRequest = {
  systemInstruction: string
  input: string
  fallbackText: string
  model?: string
  temperature?: number
  maxOutputTokens?: number
}

export type AITextResponse = {
  text: string
  provider: AIProviderName
  mode: AIProviderMode
  model?: string
  usage?: AIUsageInfo
  error?: string
}

export type EntityType = 'person' | 'organization' | 'location' | 'event' | 'concept' | 'topic'

export type ExtractedEntity = {
  type: EntityType
  name: string
  confidence: number
}

export type ArticleEnrichmentResult = {
  entities: ExtractedEntity[]
  concepts: string[]
  keyPoints: string[]
  importanceReason: string
  enrichmentVersion: string
  provider: string
}

export type EnrichmentInput = {
  title?: string | null
  summary?: string | null
  content?: string | null
  category?: string | null
  tags?: string[] | string | null
}

export interface EnrichmentProvider {
  name: string
  isAvailable(): boolean
  enrich(input: EnrichmentInput): Promise<ArticleEnrichmentResult>
}
