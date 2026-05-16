import { slugifyTurkish } from '@/lib/classification/textNormalization'
import {
  isValidProfession,
  isValidReadingDepth,
  isValidTone,
} from './preferenceOptions'

export type PreferencePayload = {
  interests: string[]
  blockedTopics: string[]
  preferredReadingDepth: string
  preferredTone: string
  profession: string
  primaryCategory: string | null
}

export function normalizePreferenceToken(value: string): string {
  return slugifyTurkish(String(value || '').trim()).toLowerCase()
}

export function uniqueNormalizedTokens(values: unknown): string[] {
  if (!Array.isArray(values)) return []

  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === 'string')
        .map(normalizePreferenceToken)
        .filter(Boolean)
    )
  )
}

export function parsePreferenceJson(value: string | null | undefined): string[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return uniqueNormalizedTokens(parsed)
  } catch {
    return []
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validatePreferencePayload(body: unknown) {
  if (!isRecord(body)) {
    return { ok: false as const, error: 'Request body must be an object.' }
  }

  if ('interests' in body && !Array.isArray(body.interests)) {
    return { ok: false as const, error: 'interests must be an array.' }
  }

  if ('blockedTopics' in body && !Array.isArray(body.blockedTopics)) {
    return { ok: false as const, error: 'blockedTopics must be an array.' }
  }

  if (
    'preferredReadingDepth' in body &&
    (typeof body.preferredReadingDepth !== 'string' || !isValidReadingDepth(body.preferredReadingDepth))
  ) {
    return { ok: false as const, error: 'preferredReadingDepth is invalid.' }
  }

  if (
    'profession' in body &&
    (typeof body.profession !== 'string' || !isValidProfession(normalizePreferenceToken(body.profession)))
  ) {
    return { ok: false as const, error: 'profession is invalid.' }
  }

  if (
    'preferredTone' in body &&
    (typeof body.preferredTone !== 'string' || !isValidTone(body.preferredTone))
  ) {
    return { ok: false as const, error: 'preferredTone is invalid.' }
  }

  return { ok: true as const }
}

export function normalizePreferencePayload(body: unknown): PreferencePayload {
  const data = isRecord(body) ? body : {}
  const interests = uniqueNormalizedTokens(data.interests)
  const blockedTopics = uniqueNormalizedTokens(data.blockedTopics)
  const preferredReadingDepth =
    typeof data.preferredReadingDepth === 'string' ? data.preferredReadingDepth : 'balanced'
  const preferredTone = typeof data.preferredTone === 'string' ? data.preferredTone : 'neutral'
  const profession =
    typeof data.profession === 'string' && data.profession.trim()
      ? normalizePreferenceToken(data.profession)
      : 'genel'
  const primaryCategory =
    typeof data.primaryCategory === 'string' && data.primaryCategory.trim()
      ? normalizePreferenceToken(data.primaryCategory)
      : null

  return {
    interests,
    blockedTopics,
    preferredReadingDepth,
    preferredTone,
    profession,
    primaryCategory,
  }
}
