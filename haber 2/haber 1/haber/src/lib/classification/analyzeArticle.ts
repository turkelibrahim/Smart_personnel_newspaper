import { classifyArticle } from './classifyArticle';
import { extractKeywords } from './extractKeywords';

interface AnalyzeArticleInput {
  title?: string | null;
  summary?: string | null;
  content?: string | null;
  rssCategory?: string | null;
  rssTags?: string[];
  language?: string | null;
  sourceName?: string | null;
}

export function analyzeArticle(input: AnalyzeArticleInput) {
  const classification = classifyArticle(input);
  const keywords = extractKeywords({
    title: input.title,
    summary: input.summary,
    content: input.content,
    rssTags: input.rssTags,
    categorySlug: classification.categorySlug,
  });

  return {
    normalizedCategoryName: classification.categoryName,
    categorySlug: classification.categorySlug,
    confidenceScore: classification.confidenceScore,
    keywords,
    tags: keywords,
    language: input.language || 'tr',
    analysisVersion: 'rule-based-tr-v1',
  };
}
