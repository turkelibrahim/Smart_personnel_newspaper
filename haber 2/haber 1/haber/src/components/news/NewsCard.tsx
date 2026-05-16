import Link from 'next/link'
import {
  getArticleDate,
  getArticleImage,
  getArticleSourceName,
  getArticleSummary,
  safeParseTags,
  type NewsUiArticle,
} from '@/types/news-ui'
import SafeImage from '@/components/ui/SafeImage'
import Icon from '@/components/ui/Icon'
import { getCategoryMeta } from '@/lib/ui/categoryMeta'

export default function NewsCard({ article, score }: { article: NewsUiArticle; score?: number }) {
  const image = getArticleImage(article)
  const sourceName = getArticleSourceName(article)
  const displayScore = score ?? article.score
  const tags = safeParseTags(article.tags).slice(0, 3)
  const summary = getArticleSummary(article)
  const categoryMeta = getCategoryMeta(article.category)

  return (
    <Link
      href={`/news/${article.id}`}
      className="news-card-print group block h-full overflow-hidden rounded-[24px] border border-white/10 bg-[#121923] text-white shadow-[0_22px_60px_rgba(0,0,0,0.26)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200/35 hover:bg-[#151f2b] hover:shadow-[0_28px_90px_rgba(56,189,248,0.12)] print:rounded-none"
    >
      <article className="flex h-full flex-col">
        {image ? (
          <div className="print-card-image relative h-48 w-full overflow-hidden bg-slate-900 print:h-auto">
            <SafeImage
              src={image}
              alt={article.title}
              wrapperClassName="relative h-full w-full"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              fallbackLabel={categoryMeta?.label || 'Haber gorseli'}
            />
            <div className="print-image-overlay absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02),rgba(2,6,23,0.16),rgba(2,6,23,0.78))]" />
            {categoryMeta ? (
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-sky-200/25 bg-slate-950/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-sky-100 backdrop-blur-xl">
                <Icon name={categoryMeta.icon} className="h-3.5 w-3.5" />
                {categoryMeta.label}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-between bg-[linear-gradient(135deg,#1b2531,#0b1118)] px-5">
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-100">
              {categoryMeta?.label || 'Haber'}
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/40">
              <Icon name={categoryMeta?.icon || 'newspaper'} className="h-5 w-5" />
            </span>
          </div>
        )}

          <div className="flex flex-1 flex-col p-5 print:p-3">
          <div className="print-muted mb-3 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            <span className="truncate">{sourceName}</span>
            <span className="shrink-0">{getArticleDate(article)}</span>
          </div>

          <h3 className="mb-3 line-clamp-3 font-serif text-[1.08rem] font-black leading-7 text-white transition-colors group-hover:text-sky-200">
            {article.title}
          </h3>

          {summary ? (
            <p className="print-muted mb-5 line-clamp-3 flex-1 text-sm leading-6 text-slate-300 print:line-clamp-none">
              {summary}
            </p>
          ) : (
            <div className="mb-5 flex-1 rounded-2xl border border-dashed border-white/10 bg-white/[0.035] p-4 text-sm text-slate-400">
              Özet bulunmuyor. Haberin detay sayfasında tam içeriği inceleyebilirsin.
            </div>
          )}

          {article.reason ? (
            <div className="print-reason mb-4 rounded-2xl border border-sky-300/20 bg-sky-300/10 px-3.5 py-3 text-[11px] leading-6 text-sky-50/85">
              <span className="font-black uppercase tracking-[0.14em] text-sky-200">Neden önerildi</span>
              <span className="ml-2">{article.reason}</span>
            </div>
          ) : null}

          {tags.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold text-slate-400">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 print:hidden">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 group-hover:text-sky-200">
              Detayı oku <Icon name="arrow-right" className="h-3 w-3" />
            </span>
            {displayScore !== undefined && displayScore !== null ? (
              <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-sky-100">
                {Math.round(displayScore)} puan
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  )
}
