import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ImpactPanel from '@/components/news/ImpactPanel'
import RelatedArticles from '@/components/news/RelatedArticles'
import StoryClusterPanel from '@/components/news/StoryClusterPanel'
import EventNotice from '@/components/news/EventNotice'
import BookmarkButton from '@/components/bookmark/BookmarkButton'
import ReadingHistoryTracker from '@/components/history/ReadingHistoryTracker'
import { safeParseTags } from '@/types/news-ui'
import SafeImage from '@/components/ui/SafeImage'
import Icon from '@/components/ui/Icon'
import { getCategoryMeta } from '@/lib/ui/categoryMeta'
import { resolveArticleImage } from '@/lib/news/resolveArticleImage'
import { findRelatedStoryCluster } from '@/lib/news/storyClustering'
import { detectEvents } from '@/lib/ai/detectEvents'
import { summarizeArticle } from '@/lib/ai/summarizeArticle'

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      source: true,
      categoryRef: true,
      articleTags: { include: { tag: true } },
    },
  })

  if (!article) {
    notFound()
  }

  const relationTags = article.articleTags.map((item) => item.tag.name)
  const tags = Array.from(new Set([...safeParseTags(article.tags), ...relationTags])).filter(Boolean)
  const tagIds = article.articleTags.map((item) => item.tagId)
  const relatedFilters: Prisma.ArticleWhereInput[] = []
  if (article.category) relatedFilters.push({ category: article.category })
  if (article.categoryId) relatedFilters.push({ categoryId: article.categoryId })
  if (tagIds.length > 0) relatedFilters.push({ articleTags: { some: { tagId: { in: tagIds } } } })
  const categoryMeta = getCategoryMeta(article.category)
  const resolvedImageUrl = await resolveArticleImage(article.imageUrl, article.originalUrl || article.url)
  const storyCluster = await findRelatedStoryCluster(article.id)
  const eventDetection = detectEvents({
    title: article.title,
    summary: article.summary,
    content: article.content,
    category: article.category,
    tags,
  })
  const aiSummary = await summarizeArticle({
    title: article.title,
    summary: article.summary,
    content: article.content,
    category: article.category,
    tags,
  })

  const relatedArticles = await prisma.article.findMany({
    where: {
      id: { not: article.id },
      isActive: true,
      ...(relatedFilters.length > 0 ? { OR: relatedFilters } : {}),
    },
    include: {
      source: true,
      articleTags: { include: { tag: true } },
    },
    orderBy: [{ publishedAt: 'desc' }],
    take: 6,
  })

  const paragraphs = (article.content || article.summary || '').split('\n').filter(Boolean)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <ReadingHistoryTracker articleId={article.id} />

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard" className="ui-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-center">
          <Icon name="arrow-left" className="h-3.5 w-3.5" />
          Akışa dön
        </Link>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
          <span>{article.source.name}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString('tr-TR')}</span>
        </div>
      </div>

      <article className="space-y-10">
        <section className="surface-panel-strong overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.18fr_0.82fr]">
            <div className="p-6 md:p-10">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                {categoryMeta ? (
                  <span className="ui-pill border-sky-500/20 bg-sky-500/14 text-sky-100">
                    <Icon name={categoryMeta.icon} className="h-3.5 w-3.5" />
                    {categoryMeta.label}
                  </span>
                ) : null}
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  {article.categoryRef?.name || 'Güncel akış'}
                </span>
              </div>

              <div className="mb-6">
                <BookmarkButton articleId={article.id} />
              </div>

              <h1 className="mb-6 max-w-4xl font-serif text-4xl font-black leading-[1.06] tracking-tight text-white md:text-5xl">
                {article.title}
              </h1>

              {article.summary ? (
                <div className="rounded-[22px] border border-sky-300/15 bg-sky-300/[0.055] p-5">
                  <p className="border-l-4 border-sky-400 pl-5 text-lg font-medium leading-8 text-slate-200">
                    {article.summary}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="relative min-h-[280px] overflow-hidden border-t border-white/10 lg:min-h-full lg:border-l lg:border-t-0">
              {resolvedImageUrl ? (
                <SafeImage
                  src={resolvedImageUrl}
                  alt={article.title}
                  wrapperClassName="relative h-full min-h-[280px] w-full"
                  className="h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  priority
                  fallbackLabel="Haber görseli"
                />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center bg-[linear-gradient(145deg,#0f172a,#020617)]">
                  <span className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5 text-white/20">
                    <Icon name={categoryMeta?.icon || 'newspaper'} className="h-8 w-8" />
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.16),rgba(2,6,23,0.62))]" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="surface-panel p-6 md:p-8">
            <div className="article-prose max-w-3xl">
              {paragraphs.map((para, index) => (
                <p key={`${article.id}-${index}`}>{para}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-start md:justify-between">
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 8).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <a href={article.url} target="_blank" rel="noopener noreferrer" className="ui-button-secondary px-5 py-3">
                Orijinal kaynak <Icon name="external-link" className="h-4 w-4" />
              </a>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-panel border-sky-300/15 bg-sky-300/[0.055] p-6">
              <p className="ui-kicker mb-3">30 saniyelik AI özeti</p>
              <p className="text-sm leading-7 text-slate-200">{aiSummary.shortSummary}</p>
              {aiSummary.keyPoints.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {aiSummary.keyPoints.slice(0, 3).map((point) => (
                    <li key={point} className="flex gap-3 text-xs leading-6 text-slate-300">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <EventNotice event={eventDetection} />
            <StoryClusterPanel cluster={storyCluster} />
            <ImpactPanel articleId={article.id} />

            <div className="surface-panel p-6">
              <h4 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-white">Kaynak güvenilirliği</h4>
              <div className="mb-3 h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" style={{ width: `${article.trustScore}%` }} />
              </div>
              <p className="flex justify-between text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                <span>Skor: {article.trustScore}/100</span>
                <span className="text-emerald-300">Doğrulanmış kaynak</span>
              </p>
            </div>
          </aside>
        </section>
      </article>

      <RelatedArticles articles={relatedArticles} />
    </div>
  )
}
