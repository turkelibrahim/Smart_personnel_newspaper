import { cn } from '@/lib/ui/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-[0.18em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617] disabled:cursor-not-allowed disabled:opacity-60',
    variant === 'primary' && 'bg-white text-black hover:-translate-y-0.5 hover:bg-slate-200',
    variant === 'secondary' &&
      'border border-white/10 bg-white/[0.04] text-white hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]',
    variant === 'ghost' &&
      'border border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-white',
    variant === 'danger' &&
      'border border-sky-500/35 bg-sky-500/12 text-sky-50 hover:-translate-y-0.5 hover:bg-sky-500/18',
    size === 'sm' && 'min-h-10 px-4 py-2.5 text-[10px]',
    size === 'md' && 'min-h-11 px-5 py-3 text-[11px]',
    size === 'lg' && 'min-h-12 px-6 py-3.5 text-[11px]',
    size === 'icon' && 'h-11 w-11 rounded-2xl p-0',
    className
  )
}
