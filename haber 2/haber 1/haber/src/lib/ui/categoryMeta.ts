export type CategorySlug =
  | 'gundem'
  | 'ekonomi'
  | 'spor'
  | 'teknoloji'
  | 'dunya'
  | 'saglik'
  | 'kultur-sanat'
  | 'egitim'
  | 'bilim'
  | 'yerel'

export type CategoryIconName =
  | 'newspaper'
  | 'chart'
  | 'trophy'
  | 'chip'
  | 'globe'
  | 'heart'
  | 'palette'
  | 'graduation'
  | 'flask'
  | 'pin'

export type CategoryMeta = {
  slug: CategorySlug
  label: string
  icon: CategoryIconName
  description: string
  gradient: string
}

export const CATEGORY_META: CategoryMeta[] = [
  {
    slug: 'gundem',
    label: 'Gündem',
    icon: 'newspaper',
    description: 'Günün öne çıkan başlıkları ve sıcak gelişmeler.',
    gradient: 'from-red-500/20 to-orange-500/10',
  },
  {
    slug: 'ekonomi',
    label: 'Ekonomi',
    icon: 'chart',
    description: 'Piyasalar, şirketler ve makro ekonomik hareketler.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    slug: 'spor',
    label: 'Spor',
    icon: 'trophy',
    description: 'Maçlar, transferler ve performans özetleri.',
    gradient: 'from-amber-500/20 to-yellow-500/10',
  },
  {
    slug: 'teknoloji',
    label: 'Teknoloji',
    icon: 'chip',
    description: 'Yapay zeka, ürün lansmanları ve dijital trendler.',
    gradient: 'from-cyan-500/20 to-sky-500/10',
  },
  {
    slug: 'dunya',
    label: 'Dünya',
    icon: 'globe',
    description: 'Küresel gündem, diplomasi ve dış politika.',
    gradient: 'from-indigo-500/20 to-blue-500/10',
  },
  {
    slug: 'saglik',
    label: 'Sağlık',
    icon: 'heart',
    description: 'Sağlık politikaları, araştırmalar ve yaşam kalitesi.',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
  {
    slug: 'kultur-sanat',
    label: 'Kültür Sanat',
    icon: 'palette',
    description: 'Sergiler, sinema, sahne sanatları ve yaratıcı üretim.',
    gradient: 'from-fuchsia-500/20 to-violet-500/10',
  },
  {
    slug: 'egitim',
    label: 'Eğitim',
    icon: 'graduation',
    description: 'Öğrenme, akademi ve eğitim politikalarındaki gelişmeler.',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    slug: 'bilim',
    label: 'Bilim',
    icon: 'flask',
    description: 'Araştırma, keşif ve bilimsel perspektifler.',
    gradient: 'from-violet-500/20 to-indigo-500/10',
  },
  {
    slug: 'yerel',
    label: 'Yerel',
    icon: 'pin',
    description: 'Şehir, bölge ve topluluk odaklı haber akışı.',
    gradient: 'from-orange-500/20 to-amber-500/10',
  },
]

export const CATEGORY_SLUGS = CATEGORY_META.map((item) => item.slug)

export function getCategoryMeta(slug?: string | null) {
  if (!slug) return null
  return CATEGORY_META.find((item) => item.slug === slug) || null
}
