import Link from 'next/link'
import type { IconName } from '@/components/ui/Icon'
import Icon from '@/components/ui/Icon'
import { buttonClasses } from '@/components/ui/Button'

type EmptyStateProps = {
  title: string
  description: string
  icon?: IconName
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({
  title,
  description,
  icon = 'inbox',
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="surface-panel p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] text-slate-300">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl font-black text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {actionLabel && actionHref ? (
        <div className="mt-6">
          <Link href={actionHref} className={buttonClasses({ variant: 'secondary' })}>
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
