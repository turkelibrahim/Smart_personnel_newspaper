import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/user/getCurrentUser'
import {
  normalizePreferencePayload,
  normalizePreferenceToken,
  parsePreferenceJson,
  validatePreferencePayload,
} from '@/lib/preferences/normalizePreferences'
import {
  isValidProfession,
  isValidReadingDepth,
  isValidTone,
} from '@/lib/preferences/preferenceOptions'

function serializePreference(
  preference:
    | {
        id: string
        profession: string | null
        preferredReadingDepth: string | null
        preferredTone: string | null
        interests: string | null
        blockedTopics: string | null
        categoryId: string | null
        category?: { slug: string } | null
      }
    | null
) {
  if (!preference) return null

  const normalizedProfession = normalizePreferenceToken(preference.profession || '')
  const profession = isValidProfession(normalizedProfession) ? normalizedProfession : 'genel'
  const preferredReadingDepth = isValidReadingDepth(preference.preferredReadingDepth || '')
    ? preference.preferredReadingDepth || 'balanced'
    : 'balanced'
  const preferredTone = isValidTone(preference.preferredTone || '')
    ? preference.preferredTone || 'neutral'
    : 'neutral'

  return {
    id: preference.id,
    profession,
    preferredReadingDepth,
    preferredTone,
    interests: parsePreferenceJson(preference.interests),
    blockedTopics: parsePreferenceJson(preference.blockedTopics),
    primaryCategory: preference.category?.slug || null,
    categoryId: preference.categoryId || null,
    raw: {
      interests: preference.interests,
      blockedTopics: preference.blockedTopics,
    },
  }
}

async function upsertPreference(req: Request) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const validation = validatePreferencePayload(body)
  if (!validation.ok) {
    return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
  }

  const normalized = normalizePreferencePayload(body)
  const category = normalized.primaryCategory
    ? await prisma.category.findUnique({ where: { slug: normalized.primaryCategory } })
    : null

  const preference = await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {
      profession: normalized.profession,
      interests: JSON.stringify(normalized.interests),
      blockedTopics: JSON.stringify(normalized.blockedTopics),
      preferredReadingDepth: normalized.preferredReadingDepth,
      preferredTone: normalized.preferredTone,
      categoryId: category?.id || null,
    },
    create: {
      userId: user.id,
      profession: normalized.profession,
      interests: JSON.stringify(normalized.interests),
      blockedTopics: JSON.stringify(normalized.blockedTopics),
      preferredReadingDepth: normalized.preferredReadingDepth,
      preferredTone: normalized.preferredTone,
      categoryId: category?.id || null,
    },
    include: { category: { select: { slug: true } } },
  })

  return NextResponse.json({
    success: true,
    preference: serializePreference(preference),
  })
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 })
    }

    const preference = await prisma.userPreference.findUnique({
      where: { userId: user.id },
      include: { category: { select: { slug: true } } },
    })

    return NextResponse.json({
      success: true,
      preference: serializePreference(preference),
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch preferences.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    return await upsertPreference(req)
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update preferences.' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    return await upsertPreference(req)
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update preferences.' }, { status: 500 })
  }
}
