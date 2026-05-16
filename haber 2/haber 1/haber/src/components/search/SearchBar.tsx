'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { buttonClasses } from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

export default function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  return (
    <form onSubmit={submit} className="relative w-full">
      <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Haberlerde ara..."
        className="ui-input h-14 w-full rounded-[24px] pl-11 pr-28 text-base"
      />
      <button
        type="submit"
        className={buttonClasses({
          variant: 'ghost',
          size: 'sm',
          className: 'absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-2xl px-4',
        })}
      >
        Ara
      </button>
    </form>
  )
}
