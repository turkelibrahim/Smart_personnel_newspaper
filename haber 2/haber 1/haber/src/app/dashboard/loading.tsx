import NewsCardSkeleton from '@/components/news/NewsCardSkeleton'
import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
      <div className="surface-panel-strong mb-10 p-6 md:p-8">
        <Skeleton className="mb-4 h-6 w-28 rounded-full" />
        <Skeleton className="mb-4 h-12 w-72 max-w-full" />
        <Skeleton className="h-6 w-[32rem] max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <NewsCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
