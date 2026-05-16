import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <Skeleton className="mb-8 h-10 w-28 rounded-full" />
      <div className="surface-panel-strong mb-10 overflow-hidden p-8">
        <Skeleton className="mb-4 h-8 w-24 rounded-full" />
        <Skeleton className="mb-6 h-14 w-4/5 max-w-full" />
        <Skeleton className="mb-3 h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="surface-panel space-y-4 p-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-5 w-full" />
          ))}
        </div>
        <Skeleton className="h-[320px] rounded-[28px]" />
      </div>
    </div>
  )
}
