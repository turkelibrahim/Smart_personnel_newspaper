import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="space-y-6">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-6 w-96 max-w-full" />
        <div className="surface-panel space-y-5 p-8">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-[22px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
