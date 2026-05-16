import NewsCard from './NewsCard'
import type { NewsUiArticle } from '@/types/news-ui'
import EmptyState from '@/components/ui/EmptyState'

export default function RelatedArticles({ articles }: { articles: NewsUiArticle[] }) {
  return (
    <section className="mt-16 border-t border-white/10 pt-10">
      <div className="mb-8 flex items-center gap-5">
        <h2 className="shrink-0 font-serif text-2xl font-black text-white">İlgili haberler</h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="İlgili haber bulunamadı"
          description="Bu içerik için benzer başlıklar henüz eşleşmedi."
          icon="sparkles"
          actionLabel="Akışa dön"
          actionHref="/dashboard"
        />
      )}
    </section>
  )
}
