import NewsCardSkeleton from '@/components/news/NewsCardSkeleton'
import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-12 w-72 max-w-full" />
        <Skeleton className="h-6 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <NewsCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
