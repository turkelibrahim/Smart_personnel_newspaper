'use client'

import { useEffect, useState } from 'react'
import NewsCard from '@/components/news/NewsCard'
import NewsCardSkeleton from '@/components/news/NewsCardSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import InlineNotice from '@/components/ui/InlineNotice'
import { buttonClasses } from '@/components/ui/Button'
import type { NewsUiArticle } from '@/types/news-ui'

type BookmarkApiItem = {
  id: string
  articleId: string
  article: {
    id: string
    title: string
    summary?: string | null
    content?: string | null
    imageUrl?: string | null
    url?: string | null
    publishedAt?: string | Date | null
    readingTime?: number | null
    tags?: string[] | string | null
    category?: string | null
    source?: { name?: string | null } | null
  }
}

function mapBookmarkArticle(item: BookmarkApiItem): NewsUiArticle {
  return {
    id: item.article.id,
    title: item.article.title,
    summary: item.article.summary,
    content: item.article.content,
    imageUrl: item.article.imageUrl,
    url: item.article.url,
    publishedAt: item.article.publishedAt,
    readingTime: item.article.readingTime,
    tags: item.article.tags,
    category: item.article.category,
    source: item.article.source?.name || 'Kaynak',
  }
}

export default function BookmarksPage() {
  const [items, setItems] = useState<BookmarkApiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    fetch('/api/bookmarks', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return
        if (!data?.success) {
          setError(data?.error || 'Kaydedilen haberler yüklenemedi.')
          return
        }
        setItems(Array.isArray(data.data) ? data.data : [])
      })
      .catch(() => {
        if (active) setError('Kaydedilen haberler yüklenemedi.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const removeBookmark = async (articleId: string) => {
    setRemovingId(articleId)
    setError('')

    try {
      const response = await fetch(`/api/bookmarks/${encodeURIComponent(articleId)}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!data?.success) {
        setError(data?.error || 'Kaydedilen haber kaldırılamadı.')
        return
      }
      setItems((current) => current.filter((item) => item.articleId !== articleId))
    } catch {
      setError('Kaydedilen haber kaldırılamadı.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
      <section className="mb-8">
        <p className="ui-kicker mb-3">Reader Archive</p>
        <h1 className="font-serif text-4xl font-black tracking-tight text-white">Kaydedilen Haberler</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
          Sonra okumak için kaydettiğin haberler burada.
        </p>
      </section>

      {error ? <InlineNotice variant="error">{error}</InlineNotice> : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <NewsCardSkeleton key={index} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="space-y-3">
              <NewsCard article={mapBookmarkArticle(item)} />
              <button
                type="button"
                onClick={() => removeBookmark(item.articleId)}
                disabled={removingId === item.articleId}
                className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'w-full justify-center' })}
              >
                {removingId === item.articleId ? 'Kaldırılıyor...' : 'Kaydı kaldır'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Henüz kaydedilen haber yok"
          description="Beğendiğin haberleri kaydederek burada toplayabilirsin."
          icon="bookmark"
          actionLabel="Haberleri keşfet"
          actionHref="/"
        />
      )}
    </div>
  )
}
