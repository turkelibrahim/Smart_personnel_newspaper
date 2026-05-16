import Link from 'next/link'
import { prisma } from '@/lib/db'
import { calculatePersonalizedScore } from '@/lib/personalization/scoring'
import NewsFeed from '@/components/news/NewsFeed'
import { NEWS_SOURCES } from '@/lib/news/sources'
import { normalizeCategoryName } from '@/lib/classification/categoryRules'
import { safeParseTags } from '@/types/news-ui'
import type { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/lib/user/getCurrentUser'
import { getCategoryMeta } from '@/lib/ui/categoryMeta'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const params = searchParams ? await searchParams : {}
  const selectedCategory = params.category ? normalizeCategoryName(params.category) : null
  const selectedMeta = getCategoryMeta(selectedCategory)

  const user = await getCurrentUser({ includePreference: true })

  const where: Prisma.ArticleWhereInput = selectedCategory ? { category: selectedCategory } : {}
  const articles = await prisma.article.findMany({
    where,
    include: { source: true },
    take: 100,
    orderBy: { publishedAt: 'desc' },
  })

  const scoredArticles = articles
    .map((article) => ({
      article,
      score: calculatePersonalizedScore(article, user?.preference || null),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)

  const initialArticles = scoredArticles.map(({ article, score }) => ({
    id: article.id,
    title: article.title,
    summary: article.summary || '',
    imageUrl: article.imageUrl,
    url: article.url,
    source: article.source.name,
    sourceSlug: article.sourceId,
    category: article.category || 'genel',
    publishedAt: article.publishedAt.toISOString(),
    readingTime: article.readingTime,
    tags: article.tags,
    score,
    relativeTime: 'Şimdi',
  }))

  const interests = safeParseTags(user?.preference?.interests)
  const activeSources = NEWS_SOURCES.filter((s) => s.active).map((s) => ({ slug: s.slug, name: s.name }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
      <section className="surface-panel-strong mb-10 overflow-hidden p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="ui-pill border-sky-500/20 bg-sky-500/12 text-sky-100">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
                </span>
                Canlı akış
              </span>
              {selectedMeta ? (
                <>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Kategori: {selectedMeta.label}
                  </span>
                  <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-300 transition hover:text-sky-200">
                    Filtreleri temizle
                  </Link>
                </>
              ) : null}
            </div>
            <h1 className="mb-4 font-serif text-4xl font-black tracking-tight text-white md:text-5xl">
              Merhaba, {user?.name?.split(' ')[0] || 'Okuyucu'}
            </h1>
            <p className="text-lg leading-8 text-slate-300">
              Bugün <span className="font-black text-white">{scoredArticles.length} haber</span> ilgi profilin ve kaynak
              dengesi baz alınarak senin için sıralandı.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
            <div className="surface-subtle p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">İlgi başlıkları</p>
              <p className="mt-2 text-2xl font-black text-white">{interests.length}</p>
            </div>
            <div className="surface-subtle p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Skorlu seçim</p>
              <p className="mt-2 text-2xl font-black text-white">{initialArticles.length}</p>
            </div>
          </div>
        </div>
      </section>

      <NewsFeed initialArticles={initialArticles} interests={interests} sources={activeSources} initialCategory={selectedCategory || ''} />
    </div>
  )
}
