'use client'

import { useState } from 'react'
import { BLOCKED_TOPIC_OPTIONS } from '@/lib/preferences/preferenceOptions'
import { buttonClasses } from '@/components/ui/Button'

type BlockedTopicsInputProps = {
  selected: string[]
  onToggle: (value: string) => void
  onAddCustom: (value: string) => void
}

export default function BlockedTopicsInput({
  selected,
  onToggle,
  onAddCustom,
}: BlockedTopicsInputProps) {
  const [customTopic, setCustomTopic] = useState('')

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Kaçınmak istediğim konular</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">Bu başlıklar kişiselleştirme sırasında geri planda tutulur.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {BLOCKED_TOPIC_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                isSelected
                  ? 'border-slate-600 bg-slate-800 text-red-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/[0.08]'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          value={customTopic}
          onChange={(event) => setCustomTopic(event.target.value)}
          placeholder="Özel konu ekle"
          className="ui-input flex-1"
        />
        <button
          type="button"
          onClick={() => {
            onAddCustom(customTopic)
            setCustomTopic('')
          }}
          className={buttonClasses({ variant: 'primary', className: 'px-5 py-3' })}
        >
          Ekle
        </button>
      </div>
    </div>
  )
}
