import { TURKISH_STOPWORDS } from './stopwords.tr';
import { normalizeTurkishText, slugifyTurkish, tokenizeTurkishText } from './textNormalization';

interface KeywordInput {
  title?: string | null;
  summary?: string | null;
  content?: string | null;
  rssTags?: string[];
  categorySlug?: string;
}

function isValidToken(token: string): boolean {
  if (!token) return false;
  if (token.length < 3) return false;
  if (/^\d+$/.test(token)) return false;
  return !TURKISH_STOPWORDS.has(token);
}

export function rankKeywords(tokens: string[]): string[] {
  const scores = new Map<string, number>();

  for (const token of tokens) {
    if (!isValidToken(token)) continue;
    scores.set(token, (scores.get(token) || 0) + 1);
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'))
    .map(([token]) => token);
}

export function mergeTags(...tagGroups: Array<string[] | undefined>): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const group of tagGroups) {
    for (const tag of group || []) {
      const normalized = normalizeTurkishText(tag);
      if (!isValidToken(normalized) && normalized.includes(' ') === false) continue;
      const key = slugifyTurkish(normalized);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(normalized);
    }
  }

  return merged;
}

export function extractKeywords(input: KeywordInput): string[] {
  const weightedTokens: string[] = [];
  const pushWeighted = (tokens: string[], weight: number) => {
    for (const token of tokens) {
      for (let i = 0; i < weight; i++) weightedTokens.push(token);
    }
  };

  pushWeighted(tokenizeTurkishText(input.title || ''), 5);
  pushWeighted(tokenizeTurkishText(input.summary || ''), 3);
  pushWeighted(tokenizeTurkishText(input.content || ''), 1);

  const ranked = rankKeywords(weightedTokens).slice(0, 8);
  const normalizedRssTags = (input.rssTags || [])
    .map((tag) => normalizeTurkishText(tag))
    .filter((tag) => tag.length >= 3);

  const categoryTag = input.categorySlug ? [input.categorySlug.replace(/-/g, ' ')] : [];
  return mergeTags(normalizedRssTags, categoryTag, ranked).slice(0, 10);
}
