import { prisma } from '@/lib/db'
import { buildDailyNewspaper } from '@/lib/personalization/newspaperBuilder'
import NewsCard from '@/components/news/NewsCard'

const DEMO_EMAIL = 'demo@mypress.ai'
export const dynamic = 'force-dynamic'

export default async function NewspaperPage() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    include: { preference: true }
  })

  const articles = await prisma.article.findMany({
    include: { source: true },
    take: 100,
    orderBy: { publishedAt: 'desc' }
  })

  const newspaper = buildDailyNewspaper(user || {}, user?.preference || null, articles)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-16 border-b border-white/10 pb-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-yellow-500/10 blur-[100px] pointer-events-none" />
        <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tighter uppercase mb-4 relative z-10">
          MYPRESS<span className="text-red-500">AI</span>
        </h1>
        <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-xs text-yellow-500 mt-2 font-black uppercase tracking-widest">
          {user?.name} İçin Özel Basım
        </p>
      </div>

      {newspaper.headline && (
        <div className="mb-16">
          <h2 className="text-xs font-black text-red-500 uppercase tracking-widest mb-6 flex items-center">
            <span className="w-8 h-[2px] bg-red-500 mr-3"></span> Günün Manşeti
          </h2>
          <div className="glass-panel rounded-3xl overflow-hidden relative group">
            {newspaper.headline.imageUrl && (
              <div className="absolute inset-0 z-0">
                <img src={newspaper.headline.imageUrl} alt={newspaper.headline.title} className="w-full h-full object-cover opacity-30 transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
              </div>
            )}
            <div className="relative z-10 p-8 md:p-16 flex flex-col items-center text-center max-w-4xl mx-auto min-h-[400px] justify-center">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded mb-6">
                {newspaper.headline.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight tracking-tight mb-6 group-hover:text-red-400 transition-colors">
                {newspaper.headline.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                {newspaper.headline.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {newspaper.sections.map((section, idx) => (
        <div key={idx} className="mb-16">
          <h2 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center">
            <span className="w-8 h-[2px] bg-white/20 mr-3"></span> {section.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.articles.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
