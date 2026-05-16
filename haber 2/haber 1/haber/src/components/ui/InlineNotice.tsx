import type { ReactNode } from 'react'
import Icon, { type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/ui/cn'

type Variant = 'success' | 'warning' | 'error' | 'info'

const variantMap: Record<Variant, { wrapper: string; icon: IconName; iconColor: string }> = {
  success: {
    wrapper: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
    icon: 'check-circle',
    iconColor: 'text-emerald-300',
  },
  warning: {
    wrapper: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
    icon: 'triangle-alert',
    iconColor: 'text-amber-300',
  },
  error: {
    wrapper: 'border-red-500/20 bg-red-500/10 text-red-100',
    icon: 'triangle-alert',
    iconColor: 'text-red-300',
  },
  info: {
    wrapper: 'border-sky-500/20 bg-sky-500/10 text-sky-100',
    icon: 'info',
    iconColor: 'text-sky-300',
  },
}

export default function InlineNotice({
  variant = 'info',
  children,
  className,
}: {
  variant?: Variant
  children: ReactNode
  className?: string
}) {
  const style = variantMap[variant]

  return (
    <div className={cn('flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-6', style.wrapper, className)}>
      <Icon name={style.icon} className={cn('mt-0.5 h-4 w-4', style.iconColor)} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
