'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { buttonClasses } from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

type AskResult = {
  answer: string
  citedArticles: Array<{
    id: string
    title: string
    source: string
    publishedAt: string
  }>
  confidence: number
  provider: string
  model: string
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AskNewspaperClient() {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<AskResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Soru yanıtlanamadı')
      }

      setResult(payload.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Soru yanıtlanamadı')
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-12">
      <section className="surface-panel-strong mb-8 p-6 md:p-8">
        <p className="ui-kicker mb-3">Ask My Newspaper</p>
        <h1 className="mb-5 font-serif text-4xl font-black tracking-tight text-white md:text-5xl">Gazetene sor</h1>
        <p className="mb-6 max-w-2xl text-base leading-7 text-slate-400">
          Sorular mevcut kişisel gazete ve yakın dönem haber verisiyle yanıtlanır. Cevaplar kaynak haber olmadan iddia üretmez.
        </p>

        <form onSubmit={submit} className="relative">
          <Icon name="search" className="absolute left-4 top-5 h-4 w-4 text-slate-500" />
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Bugün ekonomide ne oldu?"
            rows={4}
            className="ui-input w-full resize-none rounded-[24px] px-11 py-4 text-base leading-7"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className={buttonClasses({ variant: 'primary', size: 'sm', className: 'mt-4' })}
          >
            {isLoading ? 'Yanıtlanıyor' : 'Sor'}
          </button>
        </form>
      </section>

      {error ? (
        <div className="mb-8 rounded-3xl border border-sky-300/25 bg-sky-300/10 p-5 text-sm font-semibold text-sky-100">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <section className="surface-panel p-6 md:p-8" aria-live="polite">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="h-8 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="h-7 w-36 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-11/12 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-8/12 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="h-28 animate-pulse rounded-3xl bg-white/10" />
            <div className="h-28 animate-pulse rounded-3xl bg-white/10" />
          </div>
        </section>
      ) : null}

      {result ? (
        <section className="surface-panel p-6 md:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-black text-white">Yanıt</h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              {result.provider === 'ai' ? 'AI' : 'Rule-based'} / {result.model} / güven {Math.round(result.confidence * 100)}%
            </span>
          </div>

          <p className="mb-8 text-base leading-8 text-slate-300">{result.answer}</p>

          <div>
            <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Kaynak haberler</h3>
            {result.citedArticles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {result.citedArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.id}`}
                    className="rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:border-sky-300/35 hover:bg-white/[0.06]"
                  >
                    <div className="mb-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                      <span>{article.source}</span>
                      <span aria-hidden="true">•</span>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <p className="font-serif text-lg font-black leading-7 text-white">{article.title}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-slate-400">
                Bu cevap için kaynak gösterilebilir haber bulunamadı.
              </p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}
