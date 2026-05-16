import Link from 'next/link'
import type { StoryClusterResult } from '@/lib/news/storyClustering'
import Icon from '@/components/ui/Icon'

function formatArticleDate(value: Date) {
  return new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function StoryClusterPanel({ cluster }: { cluster: StoryClusterResult | null }) {
  if (!cluster || cluster.relatedArticles.length === 0) return null

  return (
    <section className="surface-panel p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-sky-200">Kaynak karşılaştırma</p>
          <h3 className="font-serif text-2xl font-black text-white">Bu konuyu farklı kaynaklardan oku</h3>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300">
          <Icon name="globe" className="h-5 w-5" />
        </span>
      </div>

      <p className="mb-5 text-sm leading-6 text-slate-400">{cluster.clusterReason}</p>

      {cluster.sharedConcepts.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {cluster.sharedConcepts.slice(0, 5).map((concept) => (
            <span key={concept} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              {concept}
            </span>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {cluster.relatedArticles.slice(0, 5).map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.id}`}
            className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-sky-400/40 hover:bg-white/[0.06]"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
              <span>{article.source?.name || article.sourceId}</span>
              <span>•</span>
              <span>{formatArticleDate(article.publishedAt)}</span>
            </div>
            <p className="line-clamp-2 text-sm font-bold leading-6 text-slate-100">{article.title}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        {cluster.sources.slice(0, 5).map((source) => (
          <span key={source.id} className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {source.name}
          </span>
        ))}
      </div>
    </section>
  )
}
