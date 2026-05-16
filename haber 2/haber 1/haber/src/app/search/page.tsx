import Link from 'next/link'
import NewsCard from '@/components/news/NewsCard'
import SearchBar from '@/components/search/SearchBar'
import SearchFilters from '@/components/search/SearchFilters'
import EmptyState from '@/components/ui/EmptyState'
import InlineNotice from '@/components/ui/InlineNotice'
import { searchArticles } from '@/lib/search/searchArticles'
import { getCategoryMeta } from '@/lib/ui/categoryMeta'

export const dynamic = 'force-dynamic'

function SearchBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
      <span className="text-slate-500">{label}</span>
      <span className="text-white">{value}</span>
    </span>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; source?: string; sort?: string; page?: string }>
}) {
  const params = searchParams ? await searchParams : {}
  let result

  try {
    result = await searchArticles({
      q: params.q,
      category: params.category,
      source: params.source,
      sort: params.sort || 'newest',
      page: params.page || '1',
      limit: 24,
    })
  } catch {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <section className="surface-panel-strong mb-8 p-6 md:p-8">
          <div className="max-w-4xl">
            <p className="ui-kicker mb-3">Search Desk</p>
            <h1 className="mb-5 font-serif text-4xl font-black tracking-tight text-white md:text-5xl">Haberlerde ara</h1>
            <SearchBar initialQuery={params.q || ''} />
          </div>
        </section>
        <InlineNotice variant="error">Arama sonuçları şu anda yüklenemiyor. Lütfen kısa süre sonra tekrar dene.</InlineNotice>
      </div>
    )
  }

  const currentPage = result.page
  const hasNext = currentPage * result.limit < result.total
  const categoryLabel = getCategoryMeta(params.category)?.label || params.category
  const sortLabel =
    params.sort === 'popular' ? 'En popüler' : params.sort === 'relevant' ? 'En alakalı' : 'En yeni'

  const pageHref = (page: number) => {
    const next = new URLSearchParams()
    if (params.q) next.set('q', params.q)
    if (params.category) next.set('category', params.category)
    if (params.sort) next.set('sort', params.sort)
    next.set('page', String(page))
    return `/search?${next.toString()}`
  }

  const hasActiveFilters = Boolean(params.q || params.category || params.sort)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
      <section className="surface-panel-strong mb-8 p-6 md:p-8">
        <div className="max-w-4xl">
          <p className="ui-kicker mb-3">Search Desk</p>
          <h1 className="mb-5 font-serif text-4xl font-black tracking-tight text-white md:text-5xl">Haberlerde ara</h1>
          <p className="mb-6 max-w-2xl text-base leading-7 text-slate-400">
            Güncel akışı, kategorileri ve sıralamayı birlikte filtreleyerek daha net sonuçlara ulaş.
          </p>
          <SearchBar initialQuery={params.q || ''} />
        </div>
      </section>

      <SearchFilters q={params.q} category={params.category} sort={params.sort || 'newest'} />

      {hasActiveFilters ? (
        <div className="mb-6 mt-6 flex flex-wrap items-center gap-2">
          {params.q ? <SearchBadge label="Arama" value={params.q} /> : null}
          {categoryLabel ? <SearchBadge label="Kategori" value={categoryLabel} /> : null}
          {params.sort ? <SearchBadge label="Sıralama" value={sortLabel} /> : null}
          <Link href="/search" className="ui-button-secondary px-4 py-2 text-[10px]">
            Filtreleri temizle
          </Link>
        </div>
      ) : null}

      <div className="mb-6 mt-8 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {result.q ? <span>&quot;{result.q}&quot; için </span> : null}
          <span className="font-black text-white">{result.total}</span> sonuç
        </p>
      </div>

      {result.formattedArticles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.formattedArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sonuç bulunamadı"
          description="Farklı bir kelime, kategori veya sıralama deneyebilirsin."
          icon="search"
          actionLabel="Filtreleri temizle"
          actionHref="/search"
        />
      )}

      <div className="mt-10 flex justify-center gap-3">
        {currentPage > 1 ? (
          <Link href={pageHref(currentPage - 1)} className="ui-button-secondary px-5">
            Önceki
          </Link>
        ) : null}
        {hasNext ? (
          <Link href={pageHref(currentPage + 1)} className="ui-button-secondary px-5">
            Sonraki
          </Link>
        ) : null}
      </div>
    </div>
  )
}
