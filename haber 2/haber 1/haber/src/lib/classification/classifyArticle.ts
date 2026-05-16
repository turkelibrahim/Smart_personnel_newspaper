import { CATEGORY_RULES, getCategoryDisplayName, isKnownCategory, normalizeCategoryName } from './categoryRules';
import { normalizeTurkishText, tokenizeTurkishText } from './textNormalization';

interface ClassifyArticleInput {
  title?: string | null;
  summary?: string | null;
  content?: string | null;
  rssCategory?: string | null;
  sourceName?: string | null;
}

export function scoreCategories(input: ClassifyArticleInput): Record<string, number> {
  const scores: Record<string, number> = Object.keys(CATEGORY_RULES).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<string, number>);

  const title = normalizeTurkishText(input.title || '');
  const summary = normalizeTurkishText(input.summary || '');
  const content = normalizeTurkishText(input.content || '');
  const rssCategory = normalizeTurkishText(input.rssCategory || '');
  const titleTokens = new Set(tokenizeTurkishText(input.title || ''));
  const summaryTokens = new Set(tokenizeTurkishText(input.summary || ''));
  const contentTokens = new Set(tokenizeTurkishText(input.content || ''));

  const matchesKeyword = (text: string, tokens: Set<string>, keyword: string) => {
    const normalizedKeyword = normalizeTurkishText(keyword);
    if (!normalizedKeyword) return false;

    if (normalizedKeyword.includes(' ')) {
      return text.includes(normalizedKeyword);
    }

    return tokens.has(normalizedKeyword);
  };

  const matchWeighted = (text: string, tokens: Set<string>, weight: number) => {
    for (const [slug, keywords] of Object.entries(CATEGORY_RULES)) {
      for (const keyword of keywords) {
        if (matchesKeyword(text, tokens, keyword)) {
          scores[slug] += weight;
        }
      }
    }
  };

  matchWeighted(title, titleTokens, 5);
  matchWeighted(summary, summaryTokens, 3);
  matchWeighted(content, contentTokens, 1);

  const normalizedRssCategory = normalizeCategoryName(rssCategory);
  if (isKnownCategory(normalizedRssCategory)) {
    scores[normalizedRssCategory] += 4;
  } else {
    matchWeighted(rssCategory, new Set(tokenizeTurkishText(rssCategory)), 4);
  }

  return scores;
}

function scoreCategoriesFromText(input: ClassifyArticleInput): Record<string, number> {
  const scores: Record<string, number> = Object.keys(CATEGORY_RULES).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<string, number>);

  const title = normalizeTurkishText(input.title || '');
  const summary = normalizeTurkishText(input.summary || '');
  const content = normalizeTurkishText(input.content || '');
  const titleTokens = new Set(tokenizeTurkishText(input.title || ''));
  const summaryTokens = new Set(tokenizeTurkishText(input.summary || ''));
  const contentTokens = new Set(tokenizeTurkishText(input.content || ''));

  const matchesKeyword = (text: string, tokens: Set<string>, keyword: string) => {
    const normalizedKeyword = normalizeTurkishText(keyword);
    if (!normalizedKeyword) return false;
    if (normalizedKeyword.includes(' ')) return text.includes(normalizedKeyword);
    return tokens.has(normalizedKeyword);
  };

  const matchWeighted = (text: string, tokens: Set<string>, weight: number) => {
    for (const [slug, keywords] of Object.entries(CATEGORY_RULES)) {
      for (const keyword of keywords) {
        if (matchesKeyword(text, tokens, keyword)) {
          scores[slug] += weight;
        }
      }
    }
  };

  matchWeighted(title, titleTokens, 5);
  matchWeighted(summary, summaryTokens, 3);
  matchWeighted(content, contentTokens, 1);

  return scores;
}

export function getBestCategory(scores: Record<string, number>): string {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [slug, score] = entries[0] || ['gundem', 0];
  return score > 0 ? slug : 'gundem';
}

export function getCategoryConfidence(scores: Record<string, number>): number {
  const values = Object.values(scores);
  const total = values.reduce((sum, value) => sum + value, 0);
  const best = Math.max(...values, 0);
  if (total <= 0) return 0;
  return Number((best / total).toFixed(4));
}

export function classifyArticle(input: ClassifyArticleInput) {
  const textOnlyScores = scoreCategoriesFromText(input);
  const scores = scoreCategories(input);
  const categorySlug = (() => {
    const textBest = getBestCategory(textOnlyScores);
    const textBestScore = textOnlyScores[textBest] || 0;

    // If the article body provides no evidence, don't let an unreliable RSS category
    // force the item into a narrow bucket like teknoloji.
    if (textBestScore <= 0) {
      return 'gundem';
    }

    return getBestCategory(scores);
  })();

  return {
    categorySlug,
    categoryName: getCategoryDisplayName(categorySlug),
    confidenceScore: getCategoryConfidence(scores),
    scores,
  };
}
