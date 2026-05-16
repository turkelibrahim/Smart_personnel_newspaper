import NewsCardSkeleton from '@/components/news/NewsCardSkeleton'
import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="surface-panel-strong mb-12 p-8">
        <Skeleton className="mb-6 h-6 w-40 rounded-full" />
        <Skeleton className="mb-6 h-16 w-80 max-w-full" />
        <Skeleton className="h-6 w-96 max-w-full" />
      </div>
      <div className="mb-10 grid gap-8 lg:grid-cols-[1.6fr_0.7fr]">
        <Skeleton className="h-[420px] rounded-[30px]" />
        <Skeleton className="h-[280px] rounded-[30px]" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <NewsCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
