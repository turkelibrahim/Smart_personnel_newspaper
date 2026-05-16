import { PrismaClient } from '@prisma/client'
import {
  CATEGORY_OPTIONS,
  isValidCategory,
  isValidProfession,
  isValidReadingDepth,
  isValidTone,
  TOPIC_OPTIONS,
  BLOCKED_TOPIC_OPTIONS,
} from '../src/lib/preferences/preferenceOptions'
import {
  normalizePreferenceToken,
  parsePreferenceJson,
} from '../src/lib/preferences/normalizePreferences'

const prisma = new PrismaClient()
const applyChanges = process.argv.includes('--apply')

const knownInterestTokens = new Set([
  ...CATEGORY_OPTIONS.map((option) => option.value),
  ...TOPIC_OPTIONS.map((option) => option.value),
])

const knownBlockedTokens = new Set(BLOCKED_TOPIC_OPTIONS.map((option) => option.value))

type PreferenceReport = {
  total: number
  changed: number
  unchanged: number
  parseErrors: number
  fallbackProfession: number
  fallbackReadingDepth: number
  fallbackTone: number
  categoryIdFilled: number
  invalidCategoryRelation: number
  unknownTokens: string[]
  mode: 'dry-run' | 'apply'
}

function safeParseArray(value: string | null | undefined) {
  if (!value) {
    return { tokens: [] as string[], parseError: false }
  }

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return { tokens: [] as string[], parseError: true }
    }

    return {
      tokens: Array.from(
        new Set(
          parsed
            .filter((item): item is string => typeof item === 'string')
            .map(normalizePreferenceToken)
            .filter(Boolean)
        )
      ),
      parseError: false,
    }
  } catch {
    return { tokens: [], parseError: true }
  }
}

function stableStringify(values: string[]) {
  return JSON.stringify(values)
}

async function main() {
  const preferences = await prisma.userPreference.findMany({
    include: {
      category: { select: { id: true, slug: true } },
    },
  })

  const categories = await prisma.category.findMany({
    select: { id: true, slug: true },
  })

  const categoryBySlug = new Map(categories.map((category) => [category.slug, category.id]))

  const report: PreferenceReport = {
    total: preferences.length,
    changed: 0,
    unchanged: 0,
    parseErrors: 0,
    fallbackProfession: 0,
    fallbackReadingDepth: 0,
    fallbackTone: 0,
    categoryIdFilled: 0,
    invalidCategoryRelation: 0,
    unknownTokens: [],
    mode: applyChanges ? 'apply' : 'dry-run',
  }

  const unknownTokenSet = new Set<string>()

  for (const preference of preferences) {
    const originalInterests = preference.interests || null
    const originalBlockedTopics = preference.blockedTopics || null
    const parsedInterests = safeParseArray(preference.interests)
    const parsedBlockedTopics = safeParseArray(preference.blockedTopics)

    if (parsedInterests.parseError || parsedBlockedTopics.parseError) {
      report.parseErrors += 1
    }

    parsedInterests.tokens.forEach((token) => {
      if (!knownInterestTokens.has(token)) unknownTokenSet.add(token)
    })

    parsedBlockedTopics.tokens.forEach((token) => {
      if (!knownBlockedTokens.has(token) && !knownInterestTokens.has(token)) unknownTokenSet.add(token)
    })

    const professionToken = normalizePreferenceToken(preference.profession || '')
    const nextProfession = isValidProfession(professionToken) ? professionToken : 'genel'
    if (nextProfession !== (preference.profession || '')) {
      report.fallbackProfession += nextProfession === 'genel' ? 1 : 0
    }

    const nextReadingDepth = isValidReadingDepth(preference.preferredReadingDepth || '')
      ? preference.preferredReadingDepth || 'balanced'
      : 'balanced'
    if (nextReadingDepth !== (preference.preferredReadingDepth || '')) {
      report.fallbackReadingDepth += 1
    }

    const nextTone = isValidTone(preference.preferredTone || '')
      ? preference.preferredTone || 'neutral'
      : 'neutral'
    if (nextTone !== (preference.preferredTone || '')) {
      report.fallbackTone += 1
    }

    let nextCategoryId = preference.categoryId
    if (!preference.categoryId) {
      const firstKnownCategory = parsedInterests.tokens.find((token) => isValidCategory(token))
      if (firstKnownCategory) {
        nextCategoryId = categoryBySlug.get(firstKnownCategory) || null
        if (nextCategoryId) report.categoryIdFilled += 1
      }
    } else if (!preference.category) {
      report.invalidCategoryRelation += 1
    }

    const nextInterests = stableStringify(parsedInterests.tokens)
    const nextBlockedTopics = stableStringify(parsedBlockedTopics.tokens)

    const hasChanged =
      nextInterests !== (originalInterests || stableStringify([])) ||
      nextBlockedTopics !== (originalBlockedTopics || stableStringify([])) ||
      nextProfession !== (preference.profession || '') ||
      nextReadingDepth !== (preference.preferredReadingDepth || '') ||
      nextTone !== (preference.preferredTone || '') ||
      nextCategoryId !== preference.categoryId

    if (hasChanged) {
      report.changed += 1

      if (applyChanges) {
        await prisma.userPreference.update({
          where: { id: preference.id },
          data: {
            interests: nextInterests,
            blockedTopics: nextBlockedTopics,
            profession: nextProfession,
            preferredReadingDepth: nextReadingDepth,
            preferredTone: nextTone,
            categoryId: nextCategoryId,
          },
        })
      }
    } else {
      report.unchanged += 1
    }

    // Reuse the shared parser to keep behavior aligned with app runtime.
    parsePreferenceJson(preference.interests)
    parsePreferenceJson(preference.blockedTopics)
  }

  report.unknownTokens = Array.from(unknownTokenSet).sort()

  console.log(JSON.stringify(report, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
