import { slugifyTurkish } from './textNormalization'

export const CATEGORY_RULES = {
  gundem: [
    'gündem', 'gundem', 'son dakika', 'meclis', 'bakanlık', 'bakanlik', 'yasa', 'düzenleme',
    'duzenleme', 'karar', 'açıklama', 'aciklama', 'kamu', 'seçim', 'secim', 'valilik',
    'cumhurbaşkanı', 'cumhurbaskani'
  ],
  ekonomi: [
    'ekonomi', 'dolar', 'euro', 'avro', 'altın', 'altin', 'borsa', 'faiz', 'enflasyon',
    'merkez bankası', 'merkez bankasi', 'piyasa', 'yatırım', 'yatirim', 'kredi', 'vergi',
    'ihracat', 'ithalat', 'finans', 'banka', 'emekli', 'maaş', 'maas'
  ],
  spor: [
    'spor', 'futbol', 'basketbol', 'voleybol', 'transfer', 'maç', 'mac', 'lig', 'gol',
    'teknik direktör', 'teknik direktor', 'galatasaray', 'fenerbahçe', 'fenerbahce',
    'beşiktaş', 'besiktas', 'trabzonspor', 'uefa', 'şampiyonlar ligi', 'sampiyonlar ligi'
  ],
  teknoloji: [
    'teknoloji', 'yapay zeka', 'yapayzeka', 'ai', 'yazılım', 'yazilim', 'donanım', 'donanim',
    'siber güvenlik', 'siber guvenlik', 'uygulama', 'telefon', 'robot', 'veri', 'internet',
    'startup', 'girişim', 'girisim', 'cloud', 'bulut', 'gpu', 'platform'
  ],
  dunya: [
    'dünya', 'dunya', 'avrupa', 'abd', 'amerika', 'rusya', 'çin', 'cin', 'nato', 'diplomasi',
    'savaş', 'savas', 'dışişleri', 'disisleri', 'uluslararası', 'uluslararasi', 'sınır',
    'sinir', 'birleşmiş milletler', 'birlesmis milletler', 'israil', 'filistin', 'gazze',
    'batı şeria', 'bati seria', 'lübnan', 'lubnan', 'suriye', 'iran', 'ukrayna'
  ],
  saglik: [
    'sağlık', 'saglik', 'hastane', 'doktor', 'tedavi', 'aşı', 'asi', 'tanı', 'tani', 'hasta',
    'sağlık bakanlığı', 'saglik bakanligi', 'ilaç', 'ilac', 'klinik', 'virüs', 'virus',
    'kanser', 'ameliyat'
  ],
  'kultur-sanat': [
    'kültür', 'kultur', 'sanat', 'tiyatro', 'sergi', 'film', 'sinema', 'konser', 'festival',
    'bienal', 'sanatçı', 'sanatci', 'müzik', 'muzik', 'kitap', 'edebiyat'
  ],
  egitim: [
    'eğitim', 'egitim', 'öğrenci', 'ogrenci', 'okul', 'üniversite', 'universite', 'sınav',
    'sinav', 'yks', 'osym', 'ösym', 'meb', 'burs', 'tercih', 'müfredat', 'mufredat',
    'öğretmen', 'ogretmen'
  ],
  bilim: [
    'bilim', 'araştırma', 'arastirma', 'laboratuvar', 'uzay', 'teleskop', 'deney', 'akademik',
    'makale', 'tübitak', 'tubitak', 'keşif', 'kesif', 'biyoteknoloji', 'genetik', 'fizik', 'kimya'
  ],
  yerel: [
    'belediye', 'ilçe', 'ilce', 'şehir', 'sehir', 'trafik', 'toplu taşıma', 'toplu tasima',
    'istanbul', 'ankara', 'izmir', 'su kesintisi', 'altyapı', 'altyapi', 'mahalle',
    'kaymakamlık', 'kaymakamlik'
  ],
} as const

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  gundem: 'Gündem',
  ekonomi: 'Ekonomi',
  spor: 'Spor',
  teknoloji: 'Teknoloji',
  dunya: 'Dünya',
  saglik: 'Sağlık',
  'kultur-sanat': 'Kültür Sanat',
  egitim: 'Eğitim',
  bilim: 'Bilim',
  yerel: 'Yerel',
}

const CATEGORY_ALIAS_MAP: Record<string, string> = {
  genel: 'gundem',
  'son-dakika': 'gundem',
  son_dakika: 'gundem',
  economy: 'ekonomi',
  tech: 'teknoloji',
  teknoloji: 'teknoloji',
  health: 'saglik',
  culture: 'kultur-sanat',
  'kultur sanat': 'kultur-sanat',
  world: 'dunya',
  education: 'egitim',
  science: 'bilim',
  local: 'yerel',
}

export function getCategoryRules() {
  return CATEGORY_RULES
}

export function normalizeCategoryName(input: string): string {
  if (!input) return 'gundem'
  const normalized = slugifyTurkish(input) || 'gundem'
  return CATEGORY_ALIAS_MAP[normalized] || normalized
}

export function getCategoryDisplayName(slug: string): string {
  return CATEGORY_DISPLAY_NAMES[slug] || 'Gündem'
}

export function isKnownCategory(slug: string): boolean {
  return slug in CATEGORY_RULES
}
