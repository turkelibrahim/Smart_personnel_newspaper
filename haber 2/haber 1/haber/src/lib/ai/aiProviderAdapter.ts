import type { ArticleEnrichmentResult, EnrichmentInput, EnrichmentProvider } from './aiTypes'
import { ruleBasedEnrichment } from './ruleBasedEnrichment'
import { getAIConfig } from './aiConfig'

class RuleBasedProvider implements EnrichmentProvider {
  name = 'rule-based'

  isAvailable() {
    return true
  }

  async enrich(input: EnrichmentInput): Promise<ArticleEnrichmentResult> {
    return ruleBasedEnrichment(input)
  }
}

class PlaceholderAiProvider implements EnrichmentProvider {
  name: string

  constructor(name: string) {
    this.name = name
  }

  isAvailable() {
    const config = getAIConfig()
    return config.mode === 'ai' && config.provider === this.name
  }

  async enrich(input: EnrichmentInput): Promise<ArticleEnrichmentResult> {
    void input
    throw new Error(`${this.name} provider adapter is not implemented yet.`)
  }
}

export function getEnrichmentProviders() {
  return {
    ruleBased: new RuleBasedProvider(),
    openai: new PlaceholderAiProvider('openai'),
    anthropic: new PlaceholderAiProvider('anthropic'),
  }
}

export function getPreferredEnrichmentProvider() {
  const providers = getEnrichmentProviders()
  return providers.ruleBased
}
