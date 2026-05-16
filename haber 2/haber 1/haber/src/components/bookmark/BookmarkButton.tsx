'use client'

import { useEffect, useState } from 'react'
import { buttonClasses } from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import InlineNotice from '@/components/ui/InlineNotice'

export default function BookmarkButton({ articleId }: { articleId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetch(`/api/bookmarks?articleId=${encodeURIComponent(articleId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success) setSaved(Boolean(data.saved))
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [articleId])

  const toggle = async () => {
    const nextSaved = !saved
    setError('')
    setSaved(nextSaved)
    setLoading(true)

    try {
      const res = await fetch(saved ? `/api/bookmarks/${encodeURIComponent(articleId)}` : '/api/bookmarks', {
        method: saved ? 'DELETE' : 'POST',
        headers: saved ? undefined : { 'Content-Type': 'application/json' },
        body: saved ? undefined : JSON.stringify({ articleId }),
      })
      const data = await res.json()
      if (!data.success) {
        setSaved(!nextSaved)
        setError('Kaydetme işlemi tamamlanamadı.')
      }
    } catch {
      setSaved(!nextSaved)
      setError('Bağlantı hatası oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className={buttonClasses({
          variant: saved ? 'danger' : 'secondary',
          className: saved ? 'px-4 py-3 text-red-100 shadow-[0_14px_30px_rgba(239,68,68,0.12)]' : 'px-4 py-3',
        })}
        aria-pressed={saved}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
            saved ? 'border-red-400/30 bg-red-500/12 text-red-300' : 'border-white/10 bg-white/5 text-white/70'
          }`}
        >
          {loading ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
          ) : (
            <Icon name={saved ? 'bookmark-filled' : 'bookmark'} className="h-4 w-4" />
          )}
        </span>
        {loading ? 'İşleniyor' : saved ? 'Kaydedildi' : 'Kaydet'}
      </button>
      {saved && !loading ? (
        <p className="text-xs leading-5 text-red-100/75">Bu haber daha sonra okumak için arşivine eklendi.</p>
      ) : null}
      {error ? <InlineNotice variant="error">{error}</InlineNotice> : null}
    </div>
  )
}
