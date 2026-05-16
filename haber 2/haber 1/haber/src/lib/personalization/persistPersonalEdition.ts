import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { PersonalEditionResult, PersonalEditionArticleItem } from './buildPersonalEdition'

export const DEFAULT_EDITION_TITLE = 'Günlük Kişisel Gazete'
export const DEFAULT_RECOMMENDATION_REASON = 'İlgi alanlarına ve güncelliğe göre önerildi'
export const DAILY_EDITION_TYPE = 'DAILY'

export function getTodayRange(now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return { start, end }
}

export function createGlobalPositionedItems(editionData: PersonalEditionResult): PersonalEditionArticleItem[] {
  const seenArticleIds = new Set<string>()
  const ordered: PersonalEditionArticleItem[] = []

  if (editionData.headline) {
    ordered.push(editionData.headline)
  }

  for (const item of editionData.articles) {
    if (editionData.headline && item.article.id === editionData.headline.article.id) continue
    ordered.push(item)
  }

  return ordered
    .filter((item) => {
      if (seenArticleIds.has(item.article.id)) return false
      seenArticleIds.add(item.article.id)
      return true
    })
    .map((item, index) => ({
      ...item,
      position: index + 1,
      reason: item.reason || DEFAULT_RECOMMENDATION_REASON,
    }))
}

export function mapPersonalEditionItems(editionData: PersonalEditionResult) {
  return createGlobalPositionedItems(editionData).map((item) => ({
    articleId: item.article.id,
    position: item.position,
    reason: item.reason || DEFAULT_RECOMMENDATION_REASON,
  }))
}

export async function persistPersonalEdition(userId: string, editionData: PersonalEditionResult) {
  const { start, end } = getTodayRange()
  const items = mapPersonalEditionItems(editionData)

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.personalEdition.findFirst({
        where: {
          userId,
          type: DAILY_EDITION_TYPE,
          date: { gte: start, lt: end },
        },
        include: {
          articles: {
            orderBy: { position: 'asc' },
            include: {
              article: {
                include: {
                  source: true,
                  categoryRef: true,
                  articleTags: { include: { tag: true } },
                },
              },
            },
          },
        },
      })

      if (existing) return existing

      const edition = await tx.personalEdition.create({
        data: {
          userId,
          title: DEFAULT_EDITION_TITLE,
          type: DAILY_EDITION_TYPE,
          date: start,
          status: 'READY',
        },
      })

      if (items.length > 0) {
        await tx.personalEditionArticle.createMany({
          data: items.map((item) => ({
            editionId: edition.id,
            articleId: item.articleId,
            position: item.position,
            reason: item.reason,
          })),
        })
      }

      return tx.personalEdition.findUniqueOrThrow({
        where: { id: edition.id },
        include: {
          articles: {
            orderBy: { position: 'asc' },
            include: {
              article: {
                include: {
                  source: true,
                  categoryRef: true,
                  articleTags: { include: { tag: true } },
                },
              },
            },
          },
        },
      })
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2002' || error.code === 'P2025')
    ) {
      const existing = await prisma.personalEdition.findFirst({
        where: {
          userId,
          type: DAILY_EDITION_TYPE,
          date: { gte: start, lt: end },
        },
        include: {
          articles: {
            orderBy: { position: 'asc' },
            include: {
              article: {
                include: {
                  source: true,
                  categoryRef: true,
                  articleTags: { include: { tag: true } },
                },
              },
            },
          },
        },
      })

      if (existing) return existing
    }

    throw error
  }
}
