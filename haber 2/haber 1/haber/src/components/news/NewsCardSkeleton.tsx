import Skeleton from '@/components/ui/Skeleton'

export default function NewsCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.045] shadow-[0_16px_40px_rgba(2,6,23,0.22)]">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <div className="flex items-center justify-between border-t border-white/8 pt-4">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
