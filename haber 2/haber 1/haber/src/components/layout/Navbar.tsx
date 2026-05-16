'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { buttonClasses } from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { CATEGORY_META } from '@/lib/ui/categoryMeta'

const categories = CATEGORY_META.filter((item) =>
  ['gundem', 'ekonomi', 'teknoloji', 'spor', 'dunya'].includes(item.slug)
)

const primaryLinks = [
  { href: '/dashboard', label: 'Akış' },
  { href: '/newspaper', label: 'Gazete', featured: true },
  { href: '/ask', label: 'Sor' },
  { href: '/bookmarks', label: 'Kaydet' },
  { href: '/profile', label: 'Profil' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#080b10]/82 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-2.5">
        <div className="flex min-h-[54px] items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-[#101720]/86 px-3 py-2 shadow-[0_16px_48px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex items-center gap-3 rounded-2xl px-1 py-1 transition-colors hover:text-sky-200">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px] border border-sky-300/20 bg-sky-300/10 text-sky-200">
                <Icon name="newspaper" className="h-4 w-4" />
              </span>
              <div className="leading-none">
                <div className="font-serif text-lg font-black tracking-[-0.04em] text-white md:text-xl">
                  MYPRESS<span className="text-sky-300">AI</span>
                </div>
                <div className="mt-1 hidden text-[9px] font-black uppercase tracking-[0.24em] text-slate-500 sm:block">
                  Kişisel AI Gazetesi
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 xl:flex">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/dashboard?category=${category.slug}`}
                  className="rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
                >
                  {category.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden flex-1 justify-center xl:flex">
            <form onSubmit={submitSearch} className="relative w-full max-w-sm">
              <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ekonomi, teknoloji, gündem..."
                className="ui-input h-11 w-full rounded-full pl-11 pr-12"
              />
              <button
                type="submit"
                className={buttonClasses({
                  variant: 'ghost',
                  size: 'sm',
                  className: 'absolute right-2 top-1/2 h-7 min-h-0 -translate-y-1/2 rounded-full px-3 py-1.5',
                })}
              >
                Ara
              </button>
            </form>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.featured
                    ? 'rounded-full border border-sky-300/25 bg-sky-300/12 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-sky-100 transition hover:bg-sky-300/18'
                    : 'rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 transition hover:bg-white/[0.05] hover:text-white'
                }
              >
                {link.label}
              </Link>
            ))}
            <Link href="/settings" className={buttonClasses({ variant: 'secondary', size: 'icon', className: 'h-10 w-10 text-slate-300' })}>
              <Icon name="settings" className="h-4 w-4" />
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={buttonClasses({ variant: 'secondary', size: 'icon', className: 'md:hidden' })}
            aria-label="Menüyü aç"
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} className="h-4 w-4" />
          </button>
        </div>

        {open ? (
          <div className="surface-panel mt-3 space-y-4 px-4 py-4 md:hidden">
            <form onSubmit={submitSearch} className="relative">
              <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Haber ara"
                className="ui-input h-12 w-full pl-11"
              />
            </form>

            <div className="grid grid-cols-2 gap-3">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  onClick={() => setOpen(false)}
                  href={link.href}
                  className={
                    link.featured
                      ? 'rounded-2xl border border-sky-300/25 bg-sky-300/12 px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.16em] text-sky-100'
                      : 'ui-chip justify-center rounded-2xl px-4 py-3 text-center'
                  }
                >
                  {link.label}
                </Link>
              ))}
              <Link onClick={() => setOpen(false)} href="/settings" className="ui-chip justify-center rounded-2xl px-4 py-3 text-center">
                Ayarlar
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  onClick={() => setOpen(false)}
                  href={`/dashboard?category=${category.slug}`}
                  className="ui-chip justify-center rounded-2xl px-4 py-3 text-center"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <nav className="fixed inset-x-4 bottom-4 z-50 grid grid-cols-4 rounded-[24px] border border-white/10 bg-[#11151c]/90 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:hidden">
        <Link href="/" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
          <Icon name="newspaper" className="h-4 w-4 text-sky-200" />
          Ana
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
          <Icon name="chart" className="h-4 w-4 text-sky-200" />
          Akış
        </Link>
        <Link href="/newspaper" className="flex flex-col items-center gap-1 rounded-2xl bg-sky-300 px-2 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-950">
          <Icon name="sparkles" className="h-4 w-4" />
          Gazete
        </Link>
        <Link href="/ask" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
          <Icon name="search" className="h-4 w-4 text-sky-200" />
          Sor
        </Link>
      </nav>
    </header>
  )
}
