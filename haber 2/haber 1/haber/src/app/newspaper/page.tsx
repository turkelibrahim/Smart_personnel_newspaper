import { getOrCreateTodayPersonalEdition, getTodayPersonalEdition } from '@/lib/personalization/getTodayPersonalEdition'
import NewsCard from '@/components/news/NewsCard'
import PrintToolbar from '@/components/print/PrintToolbar'
import Link from 'next/link'
import type { NewsUiArticle } from '@/types/news-ui'
import { getCurrentUser } from '@/lib/user/getCurrentUser'
import SafeImage from '@/components/ui/SafeImage'
import EmptyState from '@/components/ui/EmptyState'
import { resolveArticleImage } from '@/lib/news/resolveArticleImage'
import { buildDailyBrief } from '@/lib/ai/buildDailyBrief'
import DailyBriefPanel from '@/components/newspaper/DailyBriefPanel'

export const dynamic = 'force-dynamic'

const sectionTitles = [
  'Sana özel öneriler',
  'İlgi alanlarına göre',
  'Kaçırılmaması gerekenler',
  'Kategori dengeli seçki',
]

function chunkItems<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

export default async function NewspaperPage() {
  const user = await getCurrentUser({ includePreference: true })

  let edition = null
  if (user) {
    await getOrCreateTodayPersonalEdition(user.id)
    edition = await getTodayPersonalEdition(user.id)
  }

  const orderedItems = edition?.articles.sort((a, b) => a.position - b.position) || []
  const headlineItem = orderedItems[0]
  const headline = headlineItem?.article || null
  const sectionItems = orderedItems.slice(1)
  const sectionChunks = chunkItems(sectionItems, 3)
  const editionDate = edition?.date || new Date()
  const issueNumber = editionDate.toISOString().slice(0, 10).replace(/-/g, '')
  const headlineImage = headline ? await resolveArticleImage(headline.imageUrl, headline.originalUrl || headline.url) : null
  const brief = await buildDailyBrief({
    headline,
    sectionArticles: sectionItems.map((item) => item.article),
    userPreference: user?.preference || null,
  })

  return (
    <div className="print-newspaper min-h-screen print:bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 print:max-w-none print:px-0 print:py-0 print:text-black md:py-8">
        <PrintToolbar />

        <header className="print-section mb-7 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-5 text-center shadow-[0_18px_56px_rgba(0,0,0,0.28)] print:border-black print:bg-white print:shadow-none md:px-8">
          <div className="mb-5 grid grid-cols-3 items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            <span className="text-left">Sayı: {issueNumber}</span>
            <span className="text-center">İstanbul / Türkiye</span>
            <span className="text-right">Günlük özel baskı</span>
          </div>

          <h1 className="mb-5 font-serif text-4xl font-black uppercase leading-none tracking-[-0.04em] text-white md:text-5xl print:text-black">
            MYPRESS<span className="text-sky-500">AI</span>
          </h1>

          <div className="grid gap-5 border-t border-white/8 pt-5 text-left md:grid-cols-[1fr_auto_0.82fr] md:items-center print:border-black">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-sky-400">Editör notu</p>
              <p className="max-w-sm text-sm leading-6 text-slate-400 print:text-black">
                Bugün senin için seçilen haberler; ilgi alanları, güncellik ve kaynak güvenilirliği dengesiyle hazırlandı.
              </p>
            </div>

            <div className="text-left md:text-center">
              <p className="font-serif text-base font-bold text-white print:text-black">
                {editionDate.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Kalıcı kişisel gazete</p>
            </div>

            <div className="text-left md:text-right">
              <div className="inline-block rounded-2xl bg-white/[0.045] px-4 py-3 print:border print:border-black">
                <p className="mb-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Okuyucu profili</p>
                <p className="text-xs font-bold uppercase tracking-tight text-white print:text-black">
                  {user?.name || 'Okuyucu'} / {user?.preference?.profession || 'Genel'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <DailyBriefPanel brief={brief} />

        {headline ? (
          <section className="print-headline print-section mb-12 grid gap-7 lg:grid-cols-[1.5fr_0.72fr]">
            <Link href={`/news/${headline.id}`} className="group">
              {headlineImage ? (
                <div className="print-headline-image relative mb-6 h-[300px] overflow-hidden rounded-[24px] bg-slate-900 print:h-auto print:rounded-none md:h-[340px]">
                  <SafeImage
                    src={headlineImage}
                    alt={headline.title}
                    mode="native"
                    wrapperClassName="relative h-full w-full"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    priority
                    fallbackLabel="Gazete görseli"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.12),rgba(2,6,23,0.65))] print:hidden" />
                  <span className="absolute left-5 top-5 rounded-full bg-sky-600 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white">
                    Bugünün manşeti
                  </span>
                </div>
              ) : null}

              <div className="mb-4 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                {headline.category ? <span className="text-sky-400">{headline.category}</span> : null}
                <span>{headline.source?.name || 'Kaynak'}</span>
                <span>{new Date(headline.publishedAt).toLocaleDateString('tr-TR')}</span>
              </div>
              <h2 className="mb-4 font-serif text-3xl font-black leading-tight text-white transition-colors group-hover:text-sky-400 md:text-4xl print:text-black">
                {headline.title}
              </h2>
              {headline.summary ? (
                <p className="newspaper-prose max-w-4xl text-base print:text-black">{headline.summary}</p>
              ) : null}
            </Link>

            <aside className="print-card rounded-[24px] border border-white/10 bg-white/[0.045] p-5 print:border-black print:bg-white">
              <h3 className="mb-4 border-b border-white/8 pb-3 text-xs font-black uppercase tracking-[0.2em] text-white print:border-black print:text-black">
                Neden öne çıktı?
              </h3>
              <p className="newspaper-prose text-sm print:text-black">
                {headlineItem?.reason || 'İlgi alanlarına ve güncelliğe göre önerildi.'}
              </p>
              <div className="mt-6">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Kaynak güveni</p>
                <div className="h-2 overflow-hidden rounded-full bg-white/10 print:bg-gray-200">
                  <div className="h-full bg-sky-400" style={{ width: `${headline.trustScore || headline.reliabilityScore || 50}%` }} />
                </div>
              </div>
            </aside>
          </section>
        ) : (
          <EmptyState
            title="Gazete henüz hazır değil"
            description="Bugünün kişisel baskısı oluşturulamadı. Tercihlerini güncelleyip yeniden deneyebilirsin."
            icon="newspaper"
            actionLabel="Ayarları aç"
            actionHref="/settings"
          />
        )}

        {sectionChunks.length > 0 ? (
          <section className="space-y-12">
            {sectionChunks.map((items, index) => (
              <div key={sectionTitles[index] || index} className="print-section break-inside-avoid">
                <div className="mb-6 flex items-center gap-5">
                  <h2 className="shrink-0 font-serif text-2xl font-black text-white print:text-black">
                    {sectionTitles[index] || 'Seçilen haberler'}
                  </h2>
                  <div className="h-px flex-1 bg-white/10 print:bg-black" />
                </div>

                {items.length > 0 ? (
                  <div className="print-card-grid grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <NewsCard key={item.id} article={{ ...(item.article as NewsUiArticle), reason: item.reason }} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Bu bölüm boş"
                    description="Bu bölüm için yeterli içerik bulunamadı."
                    icon="inbox"
                  />
                )}
              </div>
            ))}
          </section>
        ) : null}

        <footer className="mt-14 border-t border-white/10 pt-7 text-center print:border-black">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">MyPress AI Digital Gazette</p>
          <p className="mx-auto max-w-lg text-xs italic text-slate-500 print:text-black">
            Bu sayfa basılabilir günlük kişisel gazete yapısına uygun şekilde hazırlanmıştır.
          </p>
        </footer>
      </div>
    </div>
  )
}
