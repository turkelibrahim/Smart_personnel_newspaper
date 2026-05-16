import { Article } from '@prisma/client'
import Link from 'next/link'

export default function NewsCard({ article, score }: { article: Article, score?: number }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden group flex flex-col hover:border-red-500/30 transition-colors duration-300">
      {article.imageUrl ? (
        <div className="w-full h-48 overflow-hidden relative">
          <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10" />
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
          {article.category && (
            <span className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
              {article.category}
            </span>
          )}
        </div>
      ) : (
        <div className="w-full h-2 bg-red-600" />
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <i className="far fa-clock mr-1"></i>
            {new Date(article.publishedAt).toLocaleDateString('tr-TR')}
          </span>
          {score !== undefined && (
            <span className="text-[10px] text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20" title="Kişiselleştirme Skoru">
              +{score} Skor
            </span>
          )}
        </div>
        <h3 className="text-lg font-serif font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-1">
          {article.summary}
        </p>
        <Link 
          href={`/news/${article.id}`}
          className="text-xs font-black uppercase tracking-widest text-white/70 hover:text-red-500 transition-colors flex items-center mt-auto"
        >
          Detayı Oku <i className="fas fa-arrow-right ml-2"></i>
        </Link>
      </div>
    </div>
  )
}
