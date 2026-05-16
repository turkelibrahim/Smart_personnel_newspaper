import NewsCardSkeleton from '@/components/news/NewsCardSkeleton'
import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
      <div className="surface-panel-strong mb-8 p-6 md:p-8">
        <Skeleton className="mb-3 h-6 w-24 rounded-full" />
        <Skeleton className="mb-5 h-12 w-72 max-w-full" />
        <Skeleton className="h-14 w-full rounded-[24px]" />
      </div>
      <div className="surface-panel mb-8 p-5">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <NewsCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
