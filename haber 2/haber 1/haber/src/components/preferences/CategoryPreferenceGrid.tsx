'use client'

import Icon from '@/components/ui/Icon'
import InlineNotice from '@/components/ui/InlineNotice'
import { CATEGORY_META } from '@/lib/ui/categoryMeta'

type CategoryPreferenceGridProps = {
  selected: string[]
  onToggle: (value: string) => void
  minSelection?: number
  error?: string
}

export default function CategoryPreferenceGrid({
  selected,
  onToggle,
  minSelection,
  error,
}: CategoryPreferenceGridProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">İlgi kategorileri</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Kişisel gazeten bu kategori tercihleriyle önceliklendirilir.
          </p>
        </div>
        {typeof minSelection === 'number' && (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            En az {minSelection}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {CATEGORY_META.map((option) => {
          const isSelected = selected.includes(option.slug)
          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => onToggle(option.slug)}
              className={`rounded-[20px] border bg-gradient-to-br px-4 py-4 text-left transition-all duration-200 ${
                isSelected
                  ? `${option.gradient} border-sky-300/45 text-white shadow-[0_10px_30px_rgba(56,189,248,0.12)]`
                  : 'border-white/10 from-white/[0.05] to-transparent text-slate-300 hover:border-white/25 hover:bg-white/[0.08]'
              }`}
            >
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                <Icon name={option.icon} className="h-4 w-4" />
              </span>
              <p className="text-sm font-black">{option.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{option.description}</p>
            </button>
          )
        })}
      </div>

      {error ? <InlineNotice variant="error">{error}</InlineNotice> : null}
    </div>
  )
}
