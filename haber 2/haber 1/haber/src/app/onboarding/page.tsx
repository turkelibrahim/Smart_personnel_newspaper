'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategoryPreferenceGrid from '@/components/preferences/CategoryPreferenceGrid'
import TopicChips from '@/components/preferences/TopicChips'
import ReadingDepthSelector from '@/components/preferences/ReadingDepthSelector'
import BlockedTopicsInput from '@/components/preferences/BlockedTopicsInput'
import { CATEGORY_OPTIONS, PROFESSION_OPTIONS, TONE_OPTIONS, TOPIC_OPTIONS } from '@/lib/preferences/preferenceOptions'
import { normalizePreferenceToken } from '@/lib/preferences/normalizePreferences'
import { buttonClasses } from '@/components/ui/Button'
import InlineNotice from '@/components/ui/InlineNotice'

const TOTAL_STEPS = 6

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    interests: [] as string[],
    blockedTopics: [] as string[],
    preferredReadingDepth: 'balanced',
    preferredTone: 'neutral',
    profession: 'genel',
    primaryCategory: null as string | null,
  })

  const selectedCategories = formData.interests.filter((value) =>
    CATEGORY_OPTIONS.some((option) => option.value === value)
  )
  const selectedTopics = formData.interests.filter((value) => TOPIC_OPTIONS.some((option) => option.value === value))

  function nextStep() {
    if (step === 2 && selectedCategories.length < 3) {
      setError('Devam etmek için en az 3 kategori seçmelisin.')
      return
    }

    setError('')
    setStep((current) => Math.min(TOTAL_STEPS, current + 1))
  }

  function previousStep() {
    setError('')
    setStep((current) => Math.max(1, current - 1))
  }

  async function savePreferences() {
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Tercihler kaydedilemedi.')
        return
      }

      setStep(6)
    } catch {
      setError('Bağlantı hatası oluştu.')
    } finally {
      setSaving(false)
    }
  }

  async function buildNewspaper() {
    setRefreshing(true)
    setError('')

    try {
      const response = await fetch('/api/newspaper/today?refresh=true')
      if (!response.ok) {
        setError('Kişisel gazete oluşturulamadı.')
        return
      }

      router.push('/newspaper')
      router.refresh()
    } catch {
      setError('Kişisel gazete oluşturulamadı.')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-12">
      <div className="surface-panel-strong p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between gap-6">
          <div className="flex flex-1 gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, index) => (
              <div key={index} className={`h-1.5 flex-1 rounded-full ${step >= index + 1 ? 'bg-sky-300' : 'bg-white/10'}`} />
            ))}
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            Adım {step}/{TOTAL_STEPS}
          </span>
        </div>

        {step === 1 ? (
          <section className="space-y-5">
            <p className="ui-kicker">Hoş geldin</p>
            <h1 className="max-w-2xl font-serif text-4xl font-black leading-tight text-white">
              Kişisel gazeten ilgi alanlarına göre hazırlanacak.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-400">
              Birkaç tercih belirle. Sonraki akışta kategori, konu ve okuma tarzına göre daha isabetli bir seçki göreceksin.
            </p>
          </section>
        ) : null}

        {step === 2 ? (
          <CategoryPreferenceGrid
            selected={selectedCategories}
            minSelection={3}
            error={error}
            onToggle={(value) =>
              setFormData((current) => {
                const interests = toggleValue(current.interests, value)
                const primaryCategory = interests.includes(current.primaryCategory || '') ? current.primaryCategory : value
                return { ...current, interests, primaryCategory }
              })
            }
          />
        ) : null}

        {step === 3 ? (
          <TopicChips
            title="Konu ve etiketler"
            description="Takip etmek istediğin alt başlıkları seç."
            options={TOPIC_OPTIONS}
            selected={selectedTopics}
            onToggle={(value) => setFormData((current) => ({ ...current, interests: toggleValue(current.interests, value) }))}
          />
        ) : null}

        {step === 4 ? (
          <div className="grid gap-8">
            <ReadingDepthSelector
              value={formData.preferredReadingDepth}
              onChange={(preferredReadingDepth) => setFormData((current) => ({ ...current, preferredReadingDepth }))}
            />

            <div className="surface-subtle p-5">
              <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-white">Ton</label>
              <select
                value={formData.preferredTone}
                onChange={(event) => setFormData((current) => ({ ...current, preferredTone: event.target.value }))}
                className="ui-input w-full"
              >
                {TONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-950">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-8">
            <BlockedTopicsInput
              selected={formData.blockedTopics}
              onToggle={(value) =>
                setFormData((current) => ({ ...current, blockedTopics: toggleValue(current.blockedTopics, value) }))
              }
              onAddCustom={(value) => {
                const normalized = normalizePreferenceToken(value)
                if (!normalized) return
                setFormData((current) => ({
                  ...current,
                  blockedTopics: current.blockedTopics.includes(normalized)
                    ? current.blockedTopics
                    : [...current.blockedTopics, normalized],
                }))
              }}
            />

            <div className="surface-subtle p-5">
              <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-white">Meslek / rol</label>
              <select
                value={formData.profession}
                onChange={(event) => setFormData((current) => ({ ...current, profession: event.target.value }))}
                className="ui-input w-full"
              >
                {PROFESSION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-950">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <section className="space-y-5">
            <p className="ui-kicker">Tamamlandı</p>
            <h2 className="font-serif text-3xl font-black text-white">Tercihlerin kaydedildi.</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-400">
              Dashboard hemen kullanıma hazır. Dilersen kişisel gazete baskını bu tercihlere göre şimdi oluşturabilirsin.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button type="button" onClick={() => router.push('/dashboard')} className={buttonClasses({ variant: 'primary' })}>
                Dashboard&apos;a git
              </button>
              <button
                type="button"
                onClick={buildNewspaper}
                disabled={refreshing}
                className={buttonClasses({ variant: 'danger', className: 'text-sm' })}
              >
                {refreshing ? 'Gazete hazırlanıyor...' : 'Gazeteyi oluştur'}
              </button>
            </div>
          </section>
        ) : null}

        {error ? <div className="mt-6"><InlineNotice variant="error">{error}</InlineNotice></div> : null}

        {step < 6 ? (
          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={previousStep}
              className={`rounded-2xl px-5 py-3 text-sm font-bold text-slate-300 transition hover:text-white ${
                step === 1 ? 'pointer-events-none opacity-0' : ''
              }`}
            >
              Geri
            </button>

            {step < 5 ? (
              <button type="button" onClick={nextStep} className={buttonClasses({ variant: 'primary' })}>
                Devam et
              </button>
            ) : (
              <button
                type="button"
                onClick={savePreferences}
                disabled={saving}
                className={buttonClasses({ variant: 'danger', className: 'text-sm' })}
              >
                {saving ? 'Kaydediliyor...' : 'Tercihleri kaydet'}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
