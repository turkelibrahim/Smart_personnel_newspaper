import { CATEGORY_META } from '@/lib/ui/categoryMeta'

export type PreferenceOption = {
  value: string
  label: string
}

export const CATEGORY_OPTIONS: PreferenceOption[] = CATEGORY_META.map((item) => ({
  value: item.slug,
  label: item.label,
}))

export const TOPIC_OPTIONS: PreferenceOption[] = [
  { value: 'yapay-zeka', label: 'Yapay Zeka' },
  { value: 'borsa', label: 'Borsa' },
  { value: 'futbol', label: 'Futbol' },
  { value: 'saglik', label: 'Saglik' },
  { value: 'egitim', label: 'Egitim' },
  { value: 'girisim', label: 'Girişim' },
  { value: 'bilim', label: 'Bilim' },
  { value: 'yerel-haberler', label: 'Yerel Haberler' },
  { value: 'ekonomi', label: 'Ekonomi' },
  { value: 'teknoloji', label: 'Teknoloji' },
]

export const BLOCKED_TOPIC_OPTIONS: PreferenceOption[] = [
  { value: 'magazin', label: 'Magazin' },
  { value: 'spor', label: 'Spor' },
  { value: 'siyaset', label: 'Siyaset' },
  { value: 'ekonomi', label: 'Ekonomi' },
  { value: 'dunya', label: 'Dunya' },
  { value: 'son-dakika', label: 'Son Dakika' },
]

export const READING_DEPTH_OPTIONS: PreferenceOption[] = [
  { value: 'quick', label: 'Kisa Ozet' },
  { value: 'balanced', label: 'Dengeli' },
  { value: 'deep', label: 'Detayli' },
]

export const PROFESSION_OPTIONS: PreferenceOption[] = [
  { value: 'ogrenci', label: 'Ogrenci' },
  { value: 'yazilimci', label: 'Yazilimci' },
  { value: 'girisimci', label: 'Girisimci' },
  { value: 'ogretmen', label: 'Ogretmen' },
  { value: 'finans', label: 'Finans' },
  { value: 'saglik', label: 'Saglik' },
  { value: 'genel', label: 'Genel' },
]

export const TONE_OPTIONS: PreferenceOption[] = [
  { value: 'neutral', label: 'Nötr' },
  { value: 'analytical', label: 'Analitik' },
  { value: 'concise', label: 'Kisa' },
  { value: 'friendly', label: 'Samimi' },
]

function getLabel(options: PreferenceOption[], value: string | null | undefined) {
  if (!value) return ''
  return options.find((option) => option.value === value)?.label || value
}

export function getCategoryLabel(slug: string | null | undefined) {
  return getLabel(CATEGORY_OPTIONS, slug)
}

export function getProfessionLabel(value: string | null | undefined) {
  return getLabel(PROFESSION_OPTIONS, value)
}

export function getReadingDepthLabel(value: string | null | undefined) {
  return getLabel(READING_DEPTH_OPTIONS, value)
}

export function getToneLabel(value: string | null | undefined) {
  return getLabel(TONE_OPTIONS, value)
}

export function isValidCategory(slug: string) {
  return CATEGORY_OPTIONS.some((option) => option.value === slug)
}

export function isValidProfession(value: string) {
  return PROFESSION_OPTIONS.some((option) => option.value === value)
}

export function isValidReadingDepth(value: string) {
  return READING_DEPTH_OPTIONS.some((option) => option.value === value)
}

export function isValidTone(value: string) {
  return TONE_OPTIONS.some((option) => option.value === value)
}
