'use client'

import { useCallback, useState } from 'react'
import NewsCard from './NewsCard'
import NewsCardSkeleton from './NewsCardSkeleton'
import type { NewsUiArticle } from '@/types/news-ui'
import { CATEGORY_META, getCategoryMeta } from '@/lib/ui/categoryMeta'
import EmptyState from '@/components/ui/EmptyState'
import InlineNotice from '@/components/ui/InlineNotice'
import Icon from '@/components/ui/Icon'
import { buttonClasses } from '@/components/ui/Button'

interface NewsFeedProps {
  initialArticles: NewsUiArticle[]
  interests?: string[]
  sources: { slug: string; name: string }[]
  initialCategory?: string
}

const categories = [{ slug: '', name: 'Hepsi' }, ...CATEGORY_META.map((item) => ({ slug: item.slug, name: item.label }))]

function FilterBadge({
  label,
  value,
  onClear,
}: {
  label: string
  value: string
  onClear: () => void
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
      <span className="text-slate-500">{label}</span>
      <span className="text-white">{value}</span>
      <button
        type="button"
        onClick={onClear}
        className="text-slate-500 transition hover:text-white"
        aria-label={`${label} filtresini temizle`}
      >
        <Icon name="close" className="h-3 w-3" />
      </button>
    </span>
  )
}

export default function NewsFeed({ initialArticles, sources, initialCategory = '' }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsUiArticle[]>(initialArticles)
  const [category, setCategory] = useState(initialCategory)
  const [source, setSource] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialArticles.length >= 24)

  const categoryLabel = getCategoryMeta(category)?.label || category
  const sourceLabel = sources.find((item) => item.slug === source)?.name || source

  const fetchArticles = useCallback(
    async (reset = false, overrides?: { category?: string; source?: string; query?: string }) => {
      setLoading(true)
      setError(null)
      const currentPage = reset ? 1 : page + 1
      const nextCategory = overrides?.category ?? category
      const nextSource = overrides?.source ?? source
      const nextQuery = overrides?.query ?? query

      try {
        const params = new URLSearchParams({
          limit: '24',
          page: currentPage.toString(),
        })
        if (nextCategory) params.append('category', nextCategory)
        if (nextSource) params.append('source', nextSource)
        if (nextQuery.trim()) params.append('q', nextQuery.trim())

        const res = await fetch(`/api/news?${params.toString()}`)
        const result: { success?: boolean; data?: NewsUiArticle[]; error?: string } = await res.json()

        if (!result.success) {
          setError(result.error || 'Haberler yüklenemedi.')
          return
        }

        const nextArticles = result.data || []
        if (reset) {
          setArticles(nextArticles)
          setPage(1)
        } else {
          setArticles((prev) => [...prev, ...nextArticles])
          setPage(currentPage)
        }
        setHasMore(nextArticles.length === 24)
      } catch {
        setError('Haberler yüklenemedi.')
      } finally {
        setLoading(false)
      }
    },
    [category, page, query, source]
  )

  const resetFeed = () => {
    setCategory('')
    setSource('')
    setQuery('')
    setError(null)
    setArticles(initialArticles)
    setPage(1)
    setHasMore(initialArticles.length >= 24)
  }

  const selectCategory = (nextCategory: string) => {
    if (!nextCategory && !source && !query.trim()) {
      resetFeed()
      return
    }

    setCategory(nextCategory)
    void fetchArticles(true, { category: nextCategory })
  }

  const selectSource = (nextSource: string) => {
    if (!category && !nextSource && !query.trim()) {
      resetFeed()
      return
    }

    setSource(nextSource)
    void fetchArticles(true, { source: nextSource })
  }

  const clearQuery = () => {
    if (!query.trim()) return
    if (!category && !source) {
      resetFeed()
      return
    }

    setQuery('')
    void fetchArticles(true, { query: '' })
  }

  const submitSearch = () => {
    if (!category && !source && !query.trim()) {
      resetFeed()
      return
    }
    void fetchArticles(true, { query })
  }

  const activeFilters = [
    category ? { key: 'category', label: 'Kategori', value: categoryLabel, clear: () => selectCategory('') } : null,
    source ? { key: 'source', label: 'Kaynak', value: sourceLabel, clear: () => selectSource('') } : null,
    query.trim() ? { key: 'query', label: 'Arama', value: query.trim(), clear: clearQuery } : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string; clear: () => void }>

  return (
    <div className="space-y-8">
      <div className="surface-panel p-5">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => selectCategory(cat.slug)}
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                  category === cat.slug
                    ? 'border border-white bg-white text-black'
                    : 'border border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex w-full flex-col gap-3 lg:flex-row">
            <select
              value={source}
              onChange={(event) => selectSource(event.target.value)}
              className="ui-input h-12 rounded-2xl lg:w-56"
            >
              <option value="">Tüm kaynaklar</option>
              {sources.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Başlık, konu veya kaynak ara..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') submitSearch()
                }}
                className="ui-input h-12 w-full pl-11"
              />
            </div>

            <button
              type="button"
              onClick={submitSearch}
              className={buttonClasses({ variant: 'secondary', className: 'h-12 px-5' })}
            >
              Filtrele
            </button>
          </div>

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
              {activeFilters.map((filter) => (
                <FilterBadge key={filter.key} label={filter.label} value={filter.value} onClear={filter.clear} />
              ))}
              <button type="button" onClick={resetFeed} className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
                Filtreleri temizle
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {error ? <InlineNotice variant="error">{error}</InlineNotice> : null}

      {loading && articles.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <NewsCardSkeleton key={index} />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Akışta haber bulunamadı"
          description="Seçtiğin filtrelere uygun içerik şu anda görünmüyor. Aramayı genişletmeyi deneyebilirsin."
          icon="inbox"
          actionLabel="Filtreleri temizle"
          actionHref="/dashboard"
        />
      )}

      {loading && articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <NewsCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {hasMore && !loading && articles.length > 0 ? (
        <div className="flex justify-center">
          <button type="button" onClick={() => fetchArticles()} className={buttonClasses({ variant: 'secondary' })}>
            Daha fazla haber göster
            <Icon name="chevron-down" className="h-4 w-4 text-sky-300" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
