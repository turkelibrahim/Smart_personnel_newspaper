'use client'

import type { PreferenceOption } from '@/lib/preferences/preferenceOptions'

type TopicChipsProps = {
  title: string
  description: string
  options: PreferenceOption[]
  selected: string[]
  onToggle: (value: string) => void
}

export default function TopicChips({
  title,
  description,
  options,
  selected,
  onToggle,
}: TopicChipsProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                isSelected
                  ? 'border-sky-300/45 bg-sky-300/14 text-sky-50 shadow-[0_10px_24px_rgba(56,189,248,0.16)]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/[0.08]'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
