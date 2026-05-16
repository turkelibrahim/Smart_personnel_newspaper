'use client'

import { useEffect, useState } from 'react'
import PreferenceForm, { type PreferenceFormValues } from '@/components/preferences/PreferenceForm'
import Skeleton from '@/components/ui/Skeleton'

const DEFAULT_VALUES: PreferenceFormValues = {
  interests: [],
  blockedTopics: [],
  preferredReadingDepth: 'balanced',
  preferredTone: 'neutral',
  profession: 'genel',
  primaryCategory: null,
}

export default function SettingsPage() {
  const [values, setValues] = useState<PreferenceFormValues>(DEFAULT_VALUES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetch('/api/preferences', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted || !data?.preference) return

        setValues({
          interests: Array.isArray(data.preference.interests) ? data.preference.interests : [],
          blockedTopics: Array.isArray(data.preference.blockedTopics) ? data.preference.blockedTopics : [],
          preferredReadingDepth: data.preference.preferredReadingDepth || 'balanced',
          preferredTone: data.preference.preferredTone || 'neutral',
          profession: data.preference.profession || 'genel',
          primaryCategory: data.preference.primaryCategory || null,
        })
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="space-y-6">
          <Skeleton className="h-12 w-56" />
          <Skeleton className="h-6 w-96 max-w-full" />
          <div className="surface-panel space-y-5 p-8">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-[22px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-12">
      <div className="mb-10">
        <p className="ui-kicker mb-3">Tercih stüdyosu</p>
        <h1 className="font-serif text-4xl font-black tracking-tight text-white">Tercihlerim</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
          Kişisel gazeten bu tercihlere göre şekillenir. Kategori, okuma derinliği ve ton dengesini buradan yönet.
        </p>
      </div>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="surface-panel p-5">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Takip edilen konu</p>
          <p className="font-serif text-2xl font-black text-white">{values.interests.length}</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">Kaydedince kişisel akış ağırlıkları güncellenir.</p>
        </div>
        <div className="surface-panel p-5">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Kaynak dengesi</p>
          <p className="font-serif text-2xl font-black text-white">Dengeli</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">Güvenilir ve çeşitli kaynaklar önceliklenir.</p>
        </div>
        <div className="surface-panel border-sky-300/20 bg-sky-300/10 p-5">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-sky-100">Günlük özet saati</p>
          <p className="font-serif text-2xl font-black text-white">08:30</p>
          <p className="mt-2 text-xs leading-5 text-sky-50/75">Sabah baskısı önizlemesi sonraki aşama için hazır.</p>
        </div>
      </section>

      <PreferenceForm initialValues={values} submitLabel="Tercihleri kaydet" onSaved={setValues} minCategories={1} />
    </div>
  )
}
