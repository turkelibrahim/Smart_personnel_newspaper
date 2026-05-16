import { Prisma } from '@prisma/client';
import slugify from 'slugify';
import type { analyzeArticle } from '@/lib/classification/analyzeArticle';
import type { NormalizedArticle } from './rssFetcher';

function buildArticleSlug(article: NormalizedArticle): string {
  const fallbackTitle = article.title || article.originalUrl || article.id;
  const baseSlug = slugify(fallbackTitle, { lower: true, strict: true, locale: 'tr' }) || article.id;
  return `${baseSlug}-${article.id.slice(0, 8)}`;
}

type ArticleAnalysis = ReturnType<typeof analyzeArticle>;

export function mapNormalizedArticleToCreateInput(
  article: NormalizedArticle,
  options?: { categoryId?: string | null; isDuplicate?: boolean; analysis?: ArticleAnalysis }
): Prisma.ArticleUncheckedCreateInput {
  const analysis = options?.analysis;
  return {
    id: article.id,
    sourceId: article.sourceSlug,
    title: article.title,
    slug: buildArticleSlug(article),
    summary: article.summary,
    content: article.content,
    originalUrl: article.originalUrl,
    url: article.originalUrl,
    imageUrl: article.imageUrl,
    author: article.author,
    language: analysis?.language || article.language,
    publishedAt: article.publishedAt,
    fetchedAt: article.fetchedAt,
    categoryId: options?.categoryId ?? null,
    category: analysis?.categorySlug || article.category,
    reliabilityScore: 70,
    trustScore: 70,
    popularityScore: article.popularityScore,
    personalizationScore: article.personalizationScore,
    duplicateHash: article.duplicateHash,
    isDuplicate: options?.isDuplicate ?? article.isDuplicate,
    isActive: true,
    importanceScore: (analysis?.categorySlug || article.category) === 'son-dakika' ? 90 : 50,
    tags: JSON.stringify(analysis?.tags || article.tags),
    relatedProfessions: null,
  };
}

export function mapNormalizedArticleToUpdateInput(
  article: NormalizedArticle,
  options?: { categoryId?: string | null; isDuplicate?: boolean; analysis?: ArticleAnalysis }
): Prisma.ArticleUncheckedUpdateInput {
  const analysis = options?.analysis;
  return {
    title: article.title,
    slug: buildArticleSlug(article),
    summary: article.summary,
    content: article.content,
    originalUrl: article.originalUrl,
    url: article.originalUrl,
    imageUrl: article.imageUrl,
    author: article.author,
    language: analysis?.language || article.language,
    publishedAt: article.publishedAt,
    fetchedAt: article.fetchedAt,
    categoryId: options?.categoryId ?? null,
    category: analysis?.categorySlug || article.category,
    reliabilityScore: 70,
    trustScore: 70,
    popularityScore: article.popularityScore,
    personalizationScore: article.personalizationScore,
    duplicateHash: article.duplicateHash,
    isDuplicate: options?.isDuplicate ?? article.isDuplicate,
    isActive: true,
    importanceScore: (analysis?.categorySlug || article.category) === 'son-dakika' ? 90 : 50,
    tags: JSON.stringify(analysis?.tags || article.tags),
  };
}
