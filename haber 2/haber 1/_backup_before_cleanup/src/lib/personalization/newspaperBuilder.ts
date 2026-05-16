import { Article, UserPreference } from '@prisma/client'
import { calculatePersonalizedScore } from './scoring'

export interface NewspaperSection {
  title: string
  articles: Article[]
}

export interface Newspaper {
  headline: Article | null
  sections: NewspaperSection[]
}

export function buildDailyNewspaper(user: { name?: string | null }, preference: UserPreference | null, articles: Article[]): Newspaper {
  const scoredArticles = articles.map(article => ({
    article,
    score: calculatePersonalizedScore(article, preference)
  })).sort((a, b) => b.score - a.score);

  // Filter out strongly blocked articles
  const validArticles = scoredArticles.filter(a => a.score > 0).map(a => a.article);

  const usedArticleIds = new Set<string>();

  const getUnusedArticles = (count: number, filterFn?: (a: Article) => boolean): Article[] => {
    let available = validArticles.filter(a => !usedArticleIds.has(a.id));
    if (filterFn) {
      available = available.filter(filterFn);
    }
    const selected = available.slice(0, count);
    selected.forEach(a => usedArticleIds.add(a.id));
    return selected;
  };

  // 1. Benim Manşetim (Highest score overall)
  const headline = getUnusedArticles(1)[0] || null;

  // 2. 5 Dakikada Gündem (Quick reading depth, top general news)
  const fiveMinuteNews = getUnusedArticles(3, a => (a.readingTime || 0) <= 3);

  // 3. Mesleğine Göre Önemli Haberler
  let professionNews: Article[] = [];
  if (preference?.profession) {
    const prof = preference.profession;
    professionNews = getUnusedArticles(3, a => a.tags?.includes(prof) || false);
  }

  // 4. Derin Okuma (Deep reading depth, high reading time)
  const deepReading = getUnusedArticles(2, a => (a.readingTime || 0) > 4);

  // 5. Günün Özeti (Remaining high score articles)
  const summaryNews = getUnusedArticles(4);

  const sections: NewspaperSection[] = [];

  if (fiveMinuteNews.length > 0) {
    sections.push({ title: '5 Dakikada Gündem', articles: fiveMinuteNews });
  }
  if (professionNews.length > 0) {
    sections.push({ title: `${preference?.profession} Olarak Önemli Olanlar`, articles: professionNews });
  }
  if (deepReading.length > 0) {
    sections.push({ title: 'Derin Okuma', articles: deepReading });
  }
  if (summaryNews.length > 0) {
    sections.push({ title: 'Günün Özeti', articles: summaryNews });
  }

  return {
    headline,
    sections
  };
}
