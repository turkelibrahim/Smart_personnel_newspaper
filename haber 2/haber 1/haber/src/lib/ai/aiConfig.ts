import type { AIProviderMode, AIProviderName } from './aiTypes'

const SUPPORTED_AI_PROVIDERS = new Set<AIProviderName>(['openai', 'anthropic', 'google', 'rule-based'])

export type AIConfig = {
  enabled: boolean
  provider: AIProviderName
  requestedProvider: string
  model: string
  hasApiKey: boolean
  providerAvailable: boolean
  mode: AIProviderMode
}

function normalizeBoolean(value: string | undefined) {
  return value?.trim().toLocaleLowerCase('en-US') === 'true'
}

function normalizeProvider(value: string | undefined): AIProviderName {
  const normalized = (value || 'rule-based').trim().toLocaleLowerCase('en-US')
  return SUPPORTED_AI_PROVIDERS.has(normalized as AIProviderName) ? (normalized as AIProviderName) : 'rule-based'
}

function getProviderApiKey(provider: AIProviderName) {
  if (provider === 'openai') return process.env.OPENAI_API_KEY?.trim() || ''
  if (provider === 'anthropic') return process.env.ANTHROPIC_API_KEY?.trim() || ''
  if (provider === 'google') return process.env.GOOGLE_AI_API_KEY?.trim() || ''
  return ''
}

export function getDefaultModel(provider: AIProviderName) {
  if (provider === 'openai') return 'gpt-4.1-mini'
  if (provider === 'anthropic') return 'claude-3-5-haiku-latest'
  if (provider === 'google') return 'gemini-1.5-flash'
  return 'rule-based'
}

export function getAIProviderApiKey(provider: AIProviderName) {
  return getProviderApiKey(provider)
}

export function getAIConfig(): AIConfig {
  const requestedProvider = process.env.AI_PROVIDER || 'rule-based'
  const provider = normalizeProvider(requestedProvider)
  const enabled = normalizeBoolean(process.env.AI_ENABLED)
  const hasApiKey = Boolean(getProviderApiKey(provider))
  const providerAvailable = provider !== 'rule-based' && hasApiKey
  const mode: AIProviderMode = enabled && providerAvailable ? 'ai' : 'fallback'

  return {
    enabled,
    provider,
    requestedProvider,
    model: process.env.AI_MODEL?.trim() || getDefaultModel(provider),
    hasApiKey,
    providerAvailable,
    mode,
  }
}
