import type { DetectedEventResult } from '@/lib/ai/detectEvents'
import Icon from '@/components/ui/Icon'

const eventTypeLabels: Record<DetectedEventResult['eventType'], string> = {
  exam: 'Sınav',
  deadline: 'Son tarih',
  meeting: 'Toplantı',
  announcement: 'Duyuru',
  sports: 'Spor etkinliği',
  other: 'Etkinlik',
}

export default function EventNotice({ event }: { event: DetectedEventResult }) {
  if (!event.hasEvent) return null

  return (
    <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5">
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/10 text-amber-200">
          <Icon name="info" className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">Bu haber bir etkinlik/duyuru içerebilir</p>
          <p className="mt-1 text-sm font-bold text-white">{eventTypeLabels[event.eventType]}</p>
        </div>
      </div>

      <dl className="space-y-2 text-xs text-slate-300">
        {event.dateText ? (
          <div className="flex justify-between gap-4">
            <dt className="font-black uppercase tracking-[0.14em] text-slate-500">Tarih</dt>
            <dd className="text-right font-semibold">{event.dateText}</dd>
          </div>
        ) : null}
        {event.organization ? (
          <div className="flex justify-between gap-4">
            <dt className="font-black uppercase tracking-[0.14em] text-slate-500">Kurum</dt>
            <dd className="text-right font-semibold">{event.organization}</dd>
          </div>
        ) : null}
        {event.location ? (
          <div className="flex justify-between gap-4">
            <dt className="font-black uppercase tracking-[0.14em] text-slate-500">Yer</dt>
            <dd className="text-right font-semibold">{event.location}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
