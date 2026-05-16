'use client'

import { useEffect, useState } from 'react'
import InlineNotice from '@/components/ui/InlineNotice'
import Skeleton from '@/components/ui/Skeleton'

interface ImpactData {
  impactLevel: string
  whyImportant: string
  personalImpact: string
  opportunity: string
  risk: string
  followUp: string
}

export default function ImpactPanel({ articleId }: { articleId: string }) {
  const [impact, setImpact] = useState<ImpactData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchImpact() {
      try {
        const res = await fetch('/api/impact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        })
        if (!res.ok) {
          setError(true)
          return
        }
        const data = await res.json()
        setImpact(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchImpact()
  }, [articleId])

  if (loading) {
    return (
      <div className="surface-panel overflow-hidden p-6">
        <Skeleton className="mb-5 h-4 w-1/3 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="surface-panel p-6">
        <h3 className="text-sm font-black uppercase tracking-[0.22em] text-white">Etki özeti</h3>
        <div className="mt-4">
          <InlineNotice variant="warning">Bu haber için kişisel etki yorumu şu anda yüklenemiyor.</InlineNotice>
        </div>
      </div>
    )
  }

  if (!impact) return null

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'text-red-200 bg-red-500/12 border-red-400/20'
      case 'Medium':
        return 'text-amber-200 bg-amber-500/12 border-amber-400/20'
      default:
        return 'text-sky-200 bg-sky-500/12 border-sky-400/20'
    }
  }

  return (
    <div className="surface-panel overflow-hidden p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="ui-kicker mb-2">Impact Layer</p>
          <h3 className="text-lg font-black uppercase tracking-tight text-white">Bu haberin sana etkisi</h3>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${getImpactColor(impact.impactLevel)}`}>
          {impact.impactLevel} etki
        </span>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h4 className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Kısa analiz</h4>
          <p className="text-sm leading-7 text-slate-300">{impact.personalImpact}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/6 p-4">
            <h4 className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Fırsat</h4>
            <p className="text-sm leading-6 text-slate-300">{impact.opportunity}</p>
          </div>
          <div className="rounded-2xl border border-red-500/10 bg-red-500/6 p-4">
            <h4 className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-300">Risk</h4>
            <p className="text-sm leading-6 text-slate-300">{impact.risk}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Takip noktası</p>
          <p className="mt-2 text-sm leading-6 text-white">{impact.followUp}</p>
        </div>
      </div>
    </div>
  )
}
