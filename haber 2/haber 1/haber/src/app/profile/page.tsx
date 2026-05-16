import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/user/getCurrentUser'
import { parsePreferenceJson } from '@/lib/preferences/normalizePreferences'
import {
  getCategoryLabel,
  getProfessionLabel,
  getReadingDepthLabel,
  getToneLabel,
} from '@/lib/preferences/preferenceOptions'
import EmptyState from '@/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await getCurrentUser({ includePreference: true })

  const [bookmarkCount, readingHistoryCount] = user
    ? await Promise.all([
        prisma.bookmark.count({ where: { userId: user.id } }),
        prisma.readingHistory.count({ where: { userId: user.id } }),
      ])
    : [0, 0]

  const interests = parsePreferenceJson(user?.preference?.interests)
  const blockedTopics = parsePreferenceJson(user?.preference?.blockedTopics)
  const categories = interests.filter((value) =>
    ['gundem', 'ekonomi', 'spor', 'teknoloji', 'dunya', 'saglik', 'kultur-sanat', 'egitim', 'bilim', 'yerel'].includes(
      value
    )
  )
  const topics = interests.filter((value) => !categories.includes(value))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-12">
      <div className="mb-10">
        <p className="ui-kicker mb-3">Reader Profile</p>
        <h1 className="font-serif text-4xl font-black tracking-tight text-white">Profilim</h1>
        <p className="mt-3 text-base text-slate-400">Tercihlerin ve kişiselleştirme özetin.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="surface-panel p-8">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-slate-900 text-2xl font-black text-white">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <h2 className="text-2xl font-black text-white">{user?.name || 'Demo User'}</h2>
          <p className="mt-2 text-sm text-slate-400">{user?.email || 'demo@mypress.ai'}</p>

          <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Meslek / rol</p>
              <p className="mt-1 text-sm font-bold text-white">{getProfessionLabel(user?.preference?.profession)}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Okuma tarzı</p>
              <p className="mt-1 text-sm font-bold text-white">
                {getReadingDepthLabel(user?.preference?.preferredReadingDepth)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Ton</p>
              <p className="mt-1 text-sm font-bold text-white">{getToneLabel(user?.preference?.preferredTone)}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
            <div className="surface-subtle p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Bookmark</p>
              <p className="mt-2 text-2xl font-black text-white">{bookmarkCount}</p>
            </div>
            <div className="surface-subtle p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Okuma geçmişi</p>
              <p className="mt-2 text-2xl font-black text-white">{readingHistoryCount}</p>
            </div>
          </div>

          <Link href="/settings" className="ui-button-primary mt-8">
            Tercihleri düzenle
          </Link>
        </section>

        <div className="space-y-8">
          <section className="surface-panel p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">İlgi kategorileri</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <span key={category} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white">
                    {getCategoryLabel(category)}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">Henüz kategori seçilmemiş.</p>
              )}
            </div>
          </section>

          <section className="surface-panel p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Konu ve etiketler</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <span key={topic} className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-100">
                    {getCategoryLabel(topic) || topic}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">Ek konu tercihi bulunmuyor.</p>
              )}
            </div>
          </section>

          <section className="surface-panel p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Kaçınılan konular</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {blockedTopics.length > 0 ? (
                blockedTopics.map((topic) => (
                  <span key={topic} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-red-200">
                    {getCategoryLabel(topic) || topic}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">Kaçınılan konu seçimi bulunmuyor.</p>
              )}
            </div>
          </section>

          {bookmarkCount === 0 ? (
            <EmptyState
              title="Henüz kayıtlı haber yok"
              description="Haber kartlarındaki Kaydet aksiyonunu kullanarak kişisel arşivini oluşturmaya başlayabilirsin."
              icon="bookmark"
              actionLabel="Akışı aç"
              actionHref="/dashboard"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
