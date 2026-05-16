import type { DailyBriefResult } from '@/lib/ai/buildDailyBrief'
import Icon from '@/components/ui/Icon'

export default function DailyBriefPanel({ brief }: { brief: DailyBriefResult | null }) {
  if (!brief) return null

  const providerLabel = brief.provider === 'ai' ? 'AI' : 'Rule-based'

  return (
    <section className="print-section mb-10 rounded-[24px] border border-sky-300/15 bg-sky-300/[0.055] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.22)] print:border-black print:bg-white md:p-6">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-sky-400">AI editör özeti</p>
          <h2 className="font-serif text-2xl font-black text-white print:text-black">{brief.title}</h2>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 print:border print:border-black print:text-black">
          <Icon name="sparkles" className="h-3.5 w-3.5 text-sky-300 print:text-black" />
          {providerLabel}
          {brief.model ? <span className="hidden text-slate-500 sm:inline">/ {brief.model}</span> : null}
        </span>
      </div>

      <p className="newspaper-prose mb-5 max-w-4xl text-sm leading-7 text-slate-300 print:text-black">{brief.overview}</p>

      <div className="grid gap-5 border-t border-white/8 pt-5 md:grid-cols-[1.35fr_0.8fr] print:border-black">
        <div>
          <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Öne çıkanlar</h3>
          <ul className="space-y-2.5">
            {brief.highlights.slice(0, 4).map((highlight) => (
              <li key={highlight} className="flex gap-3 text-sm font-medium leading-6 text-slate-300 print:text-black">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Takip başlıkları</h3>
          <div className="flex flex-wrap gap-2">
            {brief.watchTopics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-white/[0.055] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 print:border print:border-black print:bg-white print:text-black"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
