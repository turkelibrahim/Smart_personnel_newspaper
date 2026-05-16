import { NextResponse } from 'next/server'
import type { UserPreference } from '@prisma/client'
import { prisma } from '@/lib/db'
import { buildDailyNewspaper } from '@/lib/personalization/newspaperBuilder'
import { getOrCreateTodayPersonalEdition } from '@/lib/personalization/getTodayPersonalEdition'
import { getCurrentUser } from '@/lib/user/getCurrentUser'
import { buildDailyBrief } from '@/lib/ai/buildDailyBrief'
import {
  acquireLock,
  checkCooldown,
  releaseLock,
  setCooldown,
} from '@/lib/rate-limit/inMemoryRateLimit'

const NEWSPAPER_REFRESH_COOLDOWN_MS = 3 * 60 * 1000
const NEWSPAPER_REFRESH_LOCK_TTL_MS = 60 * 1000

async function attachBrief<T extends { headline?: unknown; sections?: Array<{ articles?: unknown[] }> }>(
  newspaper: T,
  userPreference: UserPreference | null | undefined
) {
  const headline = newspaper.headline && typeof newspaper.headline === 'object' ? newspaper.headline : null
  const sectionArticles = (newspaper.sections || []).flatMap((section) => section.articles || [])
  const brief = await buildDailyBrief({
    headline: headline as Parameters<typeof buildDailyBrief>[0]['headline'],
    sectionArticles: sectionArticles as Parameters<typeof buildDailyBrief>[0]['sectionArticles'],
    userPreference,
  })

  return {
    ...newspaper,
    brief,
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const refresh = searchParams.get('refresh') === 'true'

    const user = await getCurrentUser({ includePreference: true })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (refresh) {
      const rateLimitKey = `newspaper-refresh:${user.id}`
      const cooldown = checkCooldown(rateLimitKey, NEWSPAPER_REFRESH_COOLDOWN_MS)
      if (!cooldown.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Kisisel gazeten kisa sure once yenilendi.',
            retryAfterSeconds: cooldown.remainingSeconds,
          },
          { status: 429 }
        )
      }

      const lock = acquireLock(rateLimitKey, NEWSPAPER_REFRESH_LOCK_TTL_MS)
      if (!lock.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: 'Kisisel gazeten su anda yenileniyor. Lutfen birkac saniye sonra tekrar dene.',
          },
          { status: 409 }
        )
      }

      try {
        const newspaper = await getOrCreateTodayPersonalEdition(user.id, { refresh })
        const response = await attachBrief(newspaper, user.preference)
        setCooldown(rateLimitKey, NEWSPAPER_REFRESH_COOLDOWN_MS)
        return NextResponse.json(response)
      } finally {
        releaseLock(rateLimitKey)
      }
    }

    const newspaper = await getOrCreateTodayPersonalEdition(user.id, { refresh })
    const response = await attachBrief(newspaper, user.preference)
    return NextResponse.json(response)
  } catch {
    try {
      const user = await getCurrentUser({ includePreference: true })

      const articles = await prisma.article.findMany({
        include: { source: true },
        take: 100
      })

      const newspaper = buildDailyNewspaper(user || {}, user?.preference || null, articles)
      const response = await attachBrief(newspaper, user?.preference)

      return NextResponse.json({
        ...response,
        persisted: false,
        fallback: true,
      })
    } catch {
      return NextResponse.json({ error: 'Failed to generate newspaper' }, { status: 500 })
    }
  }
}
