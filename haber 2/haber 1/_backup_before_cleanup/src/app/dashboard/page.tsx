import { prisma } from '@/lib/db'
import { buildPersonalizedFeed } from '@/lib/personalization/scoring'
import NewsCard from '@/components/news/NewsCard'

const DEMO_EMAIL = 'demo@mypress.ai'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    include: { preference: true }
  })

  const articles = await prisma.article.findMany({
    include: { source: true },
    take: 100,
    orderBy: { publishedAt: 'desc' }
  })

  const feedArticles = buildPersonalizedFeed(articles, user?.preference || null).slice(0, 20)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-white tracking-tight mb-2">
            Özel Akışınız
          </h1>
          <p className="text-sm text-gray-400 font-bold">
            {user?.name || 'Kullanıcı'} için ilgi alanlarına ve mesleğine göre filtrelenmiş en önemli haberler.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="bg-slate-800 text-gray-300 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/5">
            <i className="fas fa-filter mr-1 text-red-500"></i> {user?.preference?.profession || 'Genel'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {feedArticles.map(article => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
      
      {feedArticles.length === 0 && (
        <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <i className="fas fa-satellite-dish text-4xl text-red-500/50 mb-4"></i>
          <h3 className="text-lg font-bold text-white mb-2">Henüz haber bulunmuyor</h3>
          <p className="text-sm text-gray-400">
            Tercihlerinize uygun haberler sisteme düştükçe burada listelenecektir.
          </p>
        </div>
      )}
    </div>
  )
}
