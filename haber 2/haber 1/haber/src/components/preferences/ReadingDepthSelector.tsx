'use client'

import { READING_DEPTH_OPTIONS } from '@/lib/preferences/preferenceOptions'

type ReadingDepthSelectorProps = {
  value: string
  onChange: (value: string) => void
}

export default function ReadingDepthSelector({ value, onChange }: ReadingDepthSelectorProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Okuma tarzı</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">Kısa özet, dengeli akış veya daha detaylı seçki.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {READING_DEPTH_OPTIONS.map((option) => {
          const isSelected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-[20px] border px-4 py-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-sky-300/45 bg-sky-300/12 text-white shadow-[0_10px_30px_rgba(56,189,248,0.12)]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/[0.08]'
              }`}
            >
              <div className="text-sm font-bold">{option.label}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
