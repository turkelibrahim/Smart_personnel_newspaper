import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { normalizeCategoryName } from '@/lib/classification/categoryRules'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

export interface SearchArticlesParams {
  q?: string | null
  search?: string | null
  category?: string | null
  source?: string | null
  sort?: string | null
  page?: number | string | null
  limit?: number | string | null
}

export function normalizeSearchQuery(value: string | null | undefined): string | null {
  const normalized = value?.trim()
  return normalized ? normalized.slice(0, 120) : null
}

function parsePositiveInt(value: number | string | null | undefined, fallback: number, max: number) {
  const parsed = typeof value === 'number' ? value : parseInt(value || '', 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.min(parsed, max)
}

export function buildArticleSearchWhere(params: SearchArticlesParams): Prisma.ArticleWhereInput {
  const q = normalizeSearchQuery(params.q || params.search)
  const category = params.category ? normalizeCategoryName(params.category) : null
  const where: Prisma.ArticleWhereInput = {}

  if (params.source) where.sourceId = params.source
  if (category) where.category = category

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { summary: { contains: q } },
      { content: { contains: q } },
      { tags: { contains: q } },
      { source: { name: { contains: q } } },
    ]
  }

  return where
}

export function buildArticleOrderBy(sort: string | null | undefined): Prisma.ArticleOrderByWithRelationInput[] {
  if (sort === 'popular') {
    return [{ popularityScore: 'desc' }, { publishedAt: 'desc' }]
  }

  if (sort === 'relevant') {
    return [{ popularityScore: 'desc' }, { publishedAt: 'desc' }]
  }

  return [{ publishedAt: 'desc' }]
}

export async function searchArticles(params: SearchArticlesParams) {
  const q = normalizeSearchQuery(params.q || params.search)
  const page = parsePositiveInt(params.page, 1, 1000)
  const limit = parsePositiveInt(params.limit, 30, 100)
  const skip = (page - 1) * limit
  const where = buildArticleSearchWhere(params)
  const orderBy = buildArticleOrderBy(params.sort)

  const [total, articles] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      include: { source: true },
      orderBy,
      take: limit,
      skip,
    }),
  ])

  const formattedArticles = articles.map((article) => ({
    id: article.id,
    title: article.title,
    summary: article.summary,
    image: article.imageUrl,
    imageUrl: article.imageUrl,
    url: article.url,
    source: article.source.name,
    sourceSlug: article.sourceId,
    category: article.category,
    publishedAt: article.publishedAt,
    readingTime: article.readingTime,
    tags: article.tags,
    popularityScore: article.popularityScore,
    relativeTime: formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: tr }),
  }))

  return {
    q,
    total,
    page,
    limit,
    articles,
    formattedArticles,
  }
}
