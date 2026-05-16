'use client'

import { buttonClasses } from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

export default function PrintToolbar() {
  return (
    <div className="print-toolbar mb-5 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 print:hidden">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white">Basilabilir gunluk gazete</p>
          <p className="mt-1 text-[11px] text-slate-500">Tarayici penceresinden PDF olarak kaydedebilirsin.</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'rounded-xl px-4 tracking-[0.16em]' })}
        >
          <Icon name="print" className="h-4 w-4" />
          Yazdir / PDF
        </button>
      </div>
    </div>
  )
}
