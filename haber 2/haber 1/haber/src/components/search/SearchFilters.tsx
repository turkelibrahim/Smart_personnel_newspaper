import Link from 'next/link'
import { CATEGORY_META } from '@/lib/ui/categoryMeta'

interface SearchFiltersProps {
  q?: string
  category?: string
  sort?: string
}

const categories = [{ slug: '', name: 'Hepsi' }, ...CATEGORY_META.map((item) => ({ slug: item.slug, name: item.label }))]

const sorts = [
  { slug: 'newest', name: 'En yeni' },
  { slug: 'popular', name: 'En popüler' },
  { slug: 'relevant', name: 'En alakalı' },
]

function makeHref(params: { q?: string; category?: string; sort?: string; page?: string }) {
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.category) searchParams.set('category', params.category)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.page) searchParams.set('page', params.page)
  const query = searchParams.toString()
  return query ? `/search?${query}` : '/search'
}

export default function SearchFilters({ q, category, sort = 'newest' }: SearchFiltersProps) {
  return (
    <div className="surface-panel p-5">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Link
              key={item.slug}
              href={makeHref({ q, category: item.slug, sort })}
              className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                (category || '') === item.slug
                  ? 'border border-white bg-white text-black'
                  : 'border border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {sorts.map((item) => (
            <Link
              key={item.slug}
              href={makeHref({ q, category, sort: item.slug })}
              className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${
                sort === item.slug
                  ? 'border border-sky-300/45 bg-sky-300/14 text-sky-50'
                  : 'border border-white/10 bg-transparent text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
