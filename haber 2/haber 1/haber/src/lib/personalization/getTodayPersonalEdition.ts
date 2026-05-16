import type { Article } from '@prisma/client'
import { prisma } from '@/lib/db'
import { buildPersonalEdition } from './buildPersonalEdition'
import { DAILY_EDITION_TYPE, getTodayRange, persistPersonalEdition } from './persistPersonalEdition'

type EditionWithArticles = Awaited<ReturnType<typeof getTodayPersonalEdition>>

export interface NewspaperResponseSection {
  title: string
  articles: Article[]
}

export interface NewspaperResponse {
  headline: Article | null
  sections: NewspaperResponseSection[]
  generatedAt?: Date
  editionId?: string
  persisted?: boolean
  status?: string
}

const SECTION_TITLES = [
  'Sana Özel Öneriler',
  'İlgi Alanlarına Göre',
  'Kaçırılmaması Gerekenler',
  'Kategori Dengeli Seçki',
]

export async function getTodayPersonalEdition(userId: string) {
  const { start, end } = getTodayRange()

  return prisma.personalEdition.findFirst({
    where: {
      userId,
      type: DAILY_EDITION_TYPE,
      date: { gte: start, lt: end },
    },
    orderBy: { createdAt: 'desc' },
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
}

function chunkArticles(articles: Article[], size: number): NewspaperResponseSection[] {
  const sections: NewspaperResponseSection[] = []

  for (let index = 0; index < articles.length; index += size) {
    const chunk = articles.slice(index, index + size)
    if (chunk.length === 0) continue

    sections.push({
      title: SECTION_TITLES[sections.length] || 'Kategori Dengeli Seçki',
      articles: chunk,
    })
  }

  return sections
}

export function mapEditionToNewspaperResponse(edition: NonNullable<EditionWithArticles>): NewspaperResponse {
  const orderedItems = [...edition.articles].sort((a, b) => a.position - b.position)
  const headline = orderedItems[0]?.article || null
  const rest = orderedItems.slice(1).map((item) => item.article as Article)

  return {
    headline: headline as Article | null,
    sections: chunkArticles(rest, 4),
    generatedAt: edition.createdAt,
    editionId: edition.id,
    persisted: true,
    status: edition.status,
  }
}

export async function getOrCreateTodayPersonalEdition(userId: string, options?: { refresh?: boolean }) {
  if (!options?.refresh) {
    const existing = await getTodayPersonalEdition(userId)
    if (existing && existing.articles.length > 0) {
      return mapEditionToNewspaperResponse(existing)
    }
  }

  if (options?.refresh) {
    const existing = await getTodayPersonalEdition(userId)
    if (existing) {
      await prisma.personalEditionArticle.deleteMany({ where: { editionId: existing.id } })
      await prisma.personalEdition.delete({ where: { id: existing.id } })
    }
  }

  const editionData = await buildPersonalEdition(userId)
  const persisted = await persistPersonalEdition(userId, editionData)
  return mapEditionToNewspaperResponse(persisted)
}
