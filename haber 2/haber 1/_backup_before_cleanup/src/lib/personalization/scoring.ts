import { Article, UserPreference } from '@prisma/client'

// Helper function to safely parse JSON arrays from DB
function parseJsonArray(jsonString: string | null | undefined): string[] {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function calculatePersonalizedScore(article: Article, preference: UserPreference | null): number {
  if (!preference) return article.importanceScore;

  let score = article.importanceScore;

  const interests = parseJsonArray(preference.interests);
  const blockedTopics = parseJsonArray(preference.blockedTopics);
  const articleTags = parseJsonArray(article.tags);
  const contentSensitivity = parseJsonArray(preference.contentSensitivity);

  // 1. Blocked topics penalty
  if (article.category && blockedTopics.includes(article.category)) {
    score -= 100;
  }
  if (articleTags.some(tag => blockedTopics.includes(tag))) {
    score -= 50;
  }

  // 2. Interests boost
  if (article.category && interests.includes(article.category)) {
    score += 30;
  }
  if (articleTags.some(tag => interests.includes(tag))) {
    score += 15;
  }

  // 3. Profession alignment boost
  if (preference.profession && articleTags.includes(preference.profession)) {
    score += 20;
  }

  // 4. Location match
  if (preference.location && article.location === preference.location) {
    score += 10;
  }

  // 5. Trust Score boost
  if (article.trustScore >= 80) {
    score += 10;
  } else if (article.trustScore < 50) {
    score -= 20;
  }

  // 6. Reading Depth optimization
  if (preference.preferredReadingDepth === 'quick' && article.readingTime && article.readingTime <= 3) {
    score += 10;
  } else if (preference.preferredReadingDepth === 'deep' && article.readingTime && article.readingTime > 5) {
    score += 10;
  }

  // 7. Content Sensitivity penalty (if negative sentiment and sensitive)
  if (contentSensitivity.includes('Negatif Haberler') && article.sentiment !== null && article.sentiment < -0.2) {
    score -= 30;
  }

  return score;
}

export function buildPersonalizedFeed(articles: Article[], preference: UserPreference | null): Article[] {
  const scoredArticles = articles.map(article => ({
    article,
    score: calculatePersonalizedScore(article, preference)
  }));

  // Sort by highest score first
  scoredArticles.sort((a, b) => b.score - a.score);

  // Return only articles with a positive score (filter out strongly blocked)
  return scoredArticles.filter(item => item.score > 0).map(item => item.article);
}

export function createProfileSignature(preference: UserPreference | null): any {
  if (!preference) return { status: 'new' };

  return {
    interests: parseJsonArray(preference.interests),
    readingStyle: preference.preferredReadingDepth || 'balanced',
    blockedCount: parseJsonArray(preference.blockedTopics).length
  }
}
