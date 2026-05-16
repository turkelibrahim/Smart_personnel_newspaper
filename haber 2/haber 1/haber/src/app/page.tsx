import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getOrCreateTodayPersonalEdition, getTodayPersonalEdition } from '@/lib/personalization/getTodayPersonalEdition'
import { getTrendingArticles } from '@/lib/news/getTrendingArticles'
import NewsCard from '@/components/news/NewsCard'
import type { NewsUiArticle } from '@/types/news-ui'
import { getCurrentUser } from '@/lib/user/getCurrentUser'
import SafeImage from '@/components/ui/SafeImage'
import EmptyState from '@/components/ui/EmptyState'
import Icon from '@/components/ui/Icon'
import { CATEGORY_META } from '@/lib/ui/categoryMeta'
import { resolveArticleImage } from '@/lib/news/resolveArticleImage'

export const dynamic = 'force-dynamic'

function formatArticle(article: NewsUiArticle, reason?: string | null): NewsUiArticle {
  return {
    ...article,
    reason: reason || article.reason,
  }
}

export default async function HomePage() {
  const user = await getCurrentUser()

  let edition = null
  if (user) {
    await getOrCreateTodayPersonalEdition(user.id)
    edition = await getTodayPersonalEdition(user.id)
  }

  const latestArticles = await prisma.article.findMany({
    where: { isActive: true },
    include: { source: true },
    orderBy: { publishedAt: 'desc' },
    take: 12,
  })

  const trendingArticles = await getTrendingArticles({ limit: 5 })

  const orderedEditionItems = edition?.articles.sort((a, b) => a.position - b.position) || []
  const headlineItem = orderedEditionItems[0]
  const headline = headlineItem?.article || latestArticles[0] || null
  const headlineImage = headline ? await resolveArticleImage(headline.imageUrl, headline.originalUrl || headline.url) : null
  const personalArticles = orderedEditionItems.slice(1, 7).map((item) => formatArticle(item.article, item.reason))
  const previewSections = orderedEditionItems.slice(1, 7)
  const sourceCount = new Set(latestArticles.map((article) => article.sourceId)).size
  const topCategory = personalArticles[0]?.category || headline?.category || 'gundem'

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_390px]">
          <div>
            <p className="ui-kicker mb-3">Kişisel AI haber gazetesi</p>
            <h1 className="max-w-4xl font-serif text-5xl font-black leading-[0.98] tracking-tight text-white md:text-7xl">
              Bugünün akıllı haber özeti hazır.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              Editoryal seçki, kişisel sinyaller, kaynak güveni ve AI özetleri tek bir sakin okuma deneyiminde birleşir.
            </p>
          </div>

          <div className="surface-panel p-4">
            <form action="/search" className="relative mb-4">
              <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input name="q" placeholder="Piyasa, AI, İstanbul..." className="ui-input h-14 w-full rounded-[22px] pl-11 pr-4" />
            </form>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Sana özel</p>
                <p className="mt-2 text-2xl font-black text-white">{personalArticles.length || latestArticles.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Kaynak</p>
                <p className="mt-2 text-2xl font-black text-white">{sourceCount}</p>
              </div>
              <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-100">Sinyal</p>
                <p className="mt-2 truncate text-2xl font-black text-white">{topCategory}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-8 lg:grid-cols-[1.65fr_0.82fr]">
          {headline ? (
            <Link href={`/news/${headline.id}`} className="group surface-panel-strong overflow-hidden">
              <div className="grid min-h-[500px] lg:grid-cols-[1.12fr_0.88fr]">
                <div className="relative min-h-[300px] overflow-hidden bg-slate-950">
                  <SafeImage
                    src={headlineImage}
                    alt={headline.title}
                    wrapperClassName="relative h-full w-full"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    priority
                    fallbackLabel="Manşet"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.18),rgba(2,6,23,0.82))]" />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                    <span className="ui-pill border-sky-500/20 bg-sky-500/14 text-sky-100">Bugünün manşeti</span>
                    <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                      Premium özet
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center p-7 md:p-9">
                  <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                    {headline.category ? <span className="text-sky-400">{headline.category}</span> : null}
                    <span>{headline.source?.name || 'Kaynak'}</span>
                    <span>{new Date(headline.publishedAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <h1 className="mb-5 font-serif text-4xl font-black leading-[1.04] tracking-tight text-white md:text-5xl">
                    {headline.title}
                  </h1>
                  {headline.summary ? <p className="mb-7 text-base leading-8 text-slate-300 md:text-lg">{headline.summary}</p> : null}
                  {headlineItem?.reason ? (
                    <div className="mb-7 rounded-2xl border border-sky-500/15 bg-sky-500/10 p-4 text-sm leading-6 text-sky-50/90">
                      <span className="mr-2 font-black uppercase tracking-[0.16em] text-sky-300">Neden önerildi</span>
                      {headlineItem.reason}
                    </div>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
                    <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-white/80 group-hover:text-white">
                      Haberi oku <Icon name="arrow-right" className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Kişisel baskı</span>
                  </div>
                </div>
              </div>
            </Link>
          ) : null}

          <aside className="space-y-5">
            <div className="surface-panel p-6">
              <p className="ui-kicker mb-2">AI özeti</p>
              <h2 className="mb-4 font-serif text-2xl font-black text-white">Kaydırmadan önce net bağlam.</h2>
              <p className="text-sm leading-7 text-slate-400">
                Manşet, tam habere geçmeden önce öneri nedeni, kaynak dengesi ve ilişkili sinyallerle birlikte sunulur.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="surface-panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Kaynak güveni</p>
                  <span className="rounded-full bg-sky-300/12 px-3 py-1 text-[10px] font-black text-sky-100">Canlı</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[82%] rounded-full bg-sky-300" />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-400">Kişisel baskıda dengeli kaynak dağılımı.</p>
              </div>

              <div className="surface-panel p-5">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Sinyal radarı</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {['Güncel', 'Alakalı', 'Güvenilir'].map((label) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-3">
                      <p className="text-lg font-black text-white">92</p>
                      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-panel p-6">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="ui-kicker mb-2">Canlı gündem</p>
                  <h2 className="font-serif text-2xl font-black text-white">Bugün yükselen başlıklar</h2>
                </div>
                <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-400">
                  Tümü
                </Link>
              </div>
              <div className="space-y-4">
                {trendingArticles.map((item, index) => (
                  <Link
                    key={item.article.id}
                    href={`/news/${item.article.id}`}
                    className="surface-subtle group flex gap-4 p-4 transition-all duration-200 hover:border-sky-500/20 hover:bg-white/[0.06]"
                  >
                    <span className="text-3xl font-black italic leading-none text-white/15">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-sm font-bold leading-6 text-white group-hover:text-sky-300">
                        {item.article.title}
                      </h3>
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                        {item.article.source.name} · {new Date(item.article.publishedAt).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-sky-100/70">{item.reason}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mb-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="ui-kicker mb-2">Keşfet</p>
              <h2 className="section-heading">Kategori rotası</h2>
            </div>
            <p className="hidden text-sm text-slate-500 md:block">Daha temiz bir akış için konu ekseninden ilerle.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {CATEGORY_META.map((category) => (
              <Link
                key={category.slug}
                href={`/dashboard?category=${category.slug}`}
                className={`surface-subtle flex min-h-[132px] flex-col justify-between bg-gradient-to-br p-4 transition-all duration-200 hover:-translate-y-1 hover:border-sky-500/25 hover:bg-white/[0.07] ${category.gradient}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
                  <Icon name={category.icon} className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-black text-white">{category.label}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Akışa git</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {personalArticles.length > 0 ? (
          <section className="mb-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="ui-kicker mb-2">Sana özel</p>
                <h2 className="section-heading">Senin için seçilen haberler</h2>
              </div>
              <Link href="/newspaper" className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-400">
                Gazeteyi aç
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {personalArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="surface-panel mb-10 p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="ui-kicker mb-3">Günlük özet</p>
              <h2 className="mb-4 font-serif text-3xl font-black text-white">Kişisel gazetenin bugünkü baskısı hazır.</h2>
              <p className="mb-6 text-sm leading-7 text-slate-400">
                Manşetler, ilgi alanları ve kaynak dengesi korunarak kalıcı bir baskı halinde toplandı.
              </p>
              <Link href="/newspaper" className="ui-button-primary">
                Günlük gazeteyi oku
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {previewSections.length > 0 ? (
                previewSections.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.article.id}`}
                    className="surface-subtle flex min-h-[160px] flex-col justify-between p-4 transition hover:border-sky-500/20 hover:bg-white/[0.06]"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">#{item.position}</p>
                    <div>
                      <h3 className="line-clamp-3 text-sm font-bold leading-6 text-white">{item.article.title}</h3>
                      {item.reason ? <p className="mt-3 line-clamp-2 text-xs leading-5 text-sky-100/70">{item.reason}</p> : null}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="md:col-span-3">
                  <EmptyState
                    title="Gazete seçkisi hazırlanıyor"
                    description="Kişisel baskı oluşturulduğunda bu bölümde kart önizlemeleri görünecek."
                    icon="newspaper"
                    actionLabel="Gazeteyi aç"
                    actionHref="/newspaper"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="ui-kicker mb-2">Hızlı akış</p>
              <h2 className="section-heading">Son haberler</h2>
            </div>
            <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-400">
              Tüm akış
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {latestArticles.slice(0, 8).map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
