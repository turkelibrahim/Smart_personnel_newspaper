'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategoryPreferenceGrid from './CategoryPreferenceGrid'
import TopicChips from './TopicChips'
import ReadingDepthSelector from './ReadingDepthSelector'
import BlockedTopicsInput from './BlockedTopicsInput'
import {
  CATEGORY_OPTIONS,
  PROFESSION_OPTIONS,
  TONE_OPTIONS,
  TOPIC_OPTIONS,
} from '@/lib/preferences/preferenceOptions'
import { normalizePreferenceToken } from '@/lib/preferences/normalizePreferences'
import InlineNotice from '@/components/ui/InlineNotice'
import { buttonClasses } from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'

export type PreferenceFormValues = {
  interests: string[]
  blockedTopics: string[]
  preferredReadingDepth: string
  preferredTone: string
  profession: string
  primaryCategory: string | null
}

type PreferenceFormProps = {
  initialValues: PreferenceFormValues
  mode?: 'settings' | 'onboarding'
  minCategories?: number
  submitLabel?: string
  onSaved?: (values: PreferenceFormValues) => void
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

export default function PreferenceForm({
  initialValues,
  mode = 'settings',
  minCategories = 0,
  submitLabel = 'Kaydet',
  onSaved,
}: PreferenceFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<PreferenceFormValues>(initialValues)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showRefreshAction, setShowRefreshAction] = useState(false)

  const selectedCategories = values.interests.filter((value) =>
    CATEGORY_OPTIONS.some((option) => option.value === value)
  )

  const selectedTopics = values.interests.filter((value) => TOPIC_OPTIONS.some((option) => option.value === value))

  async function handleSubmit() {
    setSaving(true)
    setError('')
    setMessage('')

    if (selectedCategories.length < minCategories) {
      setSaving(false)
      setError(`En az ${minCategories} kategori seçmen gerekiyor.`)
      return
    }

    try {
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Tercihler kaydedilemedi.')
        return
      }

      const nextValues = data.preference
        ? {
            interests: Array.isArray(data.preference.interests) ? data.preference.interests : values.interests,
            blockedTopics: Array.isArray(data.preference.blockedTopics)
              ? data.preference.blockedTopics
              : values.blockedTopics,
            preferredReadingDepth: data.preference.preferredReadingDepth || values.preferredReadingDepth,
            preferredTone: data.preference.preferredTone || values.preferredTone,
            profession: data.preference.profession || values.profession,
            primaryCategory: data.preference.primaryCategory || values.primaryCategory,
          }
        : values

      setValues(nextValues)
      setMessage('Tercihler kaydedildi. Günlük gazete yeni seçimlerle yeniden üretilebilir.')
      setShowRefreshAction(true)
      onSaved?.(nextValues)
    } catch {
      setError('Bağlantı hatası oluştu.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRefreshNewspaper() {
    setRefreshing(true)
    setError('')

    try {
      const response = await fetch('/api/newspaper/today?refresh=true')
      if (!response.ok) {
        setError('Kişisel gazete yenilenemedi.')
        return
      }

      setMessage('Kişisel gazete yenilendi. Gazete sayfasına yönlendiriliyorsun.')
      router.push('/newspaper')
      router.refresh()
    } catch {
      setError('Kişisel gazete yenilenemedi.')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="surface-panel p-6 md:p-8">
        <CategoryPreferenceGrid
          selected={selectedCategories}
          minSelection={minCategories || undefined}
          error={error && selectedCategories.length < minCategories ? error : ''}
          onToggle={(value) => {
            setValues((current) => {
              const interests = toggleValue(current.interests, value)
              const primaryCategory = interests.includes(current.primaryCategory || '') ? current.primaryCategory : value
              return { ...current, interests, primaryCategory }
            })
          }}
        />
      </div>

      <div className="surface-panel p-6 md:p-8">
        <TopicChips
          title="Konu ve etiketler"
          description="İlgini çeken alt başlıkları seçerek önerileri daha isabetli hale getir."
          options={TOPIC_OPTIONS}
          selected={selectedTopics}
          onToggle={(value) => setValues((current) => ({ ...current, interests: toggleValue(current.interests, value) }))}
        />
      </div>

      <div className="surface-panel p-6 md:p-8">
        <BlockedTopicsInput
          selected={values.blockedTopics}
          onToggle={(value) =>
            setValues((current) => ({ ...current, blockedTopics: toggleValue(current.blockedTopics, value) }))
          }
          onAddCustom={(value) => {
            const normalized = normalizePreferenceToken(value)
            if (!normalized) return
            setValues((current) => ({
              ...current,
              blockedTopics: current.blockedTopics.includes(normalized)
                ? current.blockedTopics
                : [...current.blockedTopics, normalized],
            }))
          }}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="surface-panel p-6 md:p-8">
          <ReadingDepthSelector
            value={values.preferredReadingDepth}
            onChange={(preferredReadingDepth) => setValues((current) => ({ ...current, preferredReadingDepth }))}
          />
        </div>

        <div className="surface-panel space-y-8 p-6 md:p-8">
          <div>
            <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-white">Meslek / rol</label>
            <select
              value={values.profession}
              onChange={(event) => setValues((current) => ({ ...current, profession: event.target.value }))}
              className="ui-input w-full"
            >
              {PROFESSION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-3 block text-sm font-black uppercase tracking-[0.2em] text-white">Ton</label>
            <select
              value={values.preferredTone}
              onChange={(event) => setValues((current) => ({ ...current, preferredTone: event.target.value }))}
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
      </div>

      {error && !(selectedCategories.length < minCategories) ? <InlineNotice variant="error">{error}</InlineNotice> : null}
      {message ? <InlineNotice variant="success">{message}</InlineNotice> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="button" onClick={handleSubmit} disabled={saving} className={buttonClasses({ variant: 'primary' })}>
          {saving ? 'Kaydediliyor...' : submitLabel}
        </button>
      </div>

      {showRefreshAction ? (
        <div className="rounded-[28px] border border-sky-500/20 bg-sky-500/10 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                {mode === 'onboarding' ? 'Gazeteyi yenileyerek devam et' : 'Kişisel gazeteyi yenile'}
              </h4>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-sky-100/85">
                Bugünkü baskı eski tercih anlık görüntüsüyle oluşmuş olabilir. Yeni seçimleri uygulamak için gazeteyi yenile.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshNewspaper}
              disabled={refreshing}
              className={buttonClasses({ variant: 'danger', className: 'px-6 py-4 text-sm' })}
            >
              <Icon name="refresh" className="h-4 w-4" />
              {refreshing ? 'Gazete yenileniyor...' : 'Gazeteyi yenile'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
