import { cn } from '@/lib/ui/cn'

export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-white/8', className)} aria-hidden="true" />
}
