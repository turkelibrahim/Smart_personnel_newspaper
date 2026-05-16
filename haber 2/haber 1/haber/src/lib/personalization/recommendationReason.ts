import type { PersonalizationArticle, PersonalizationScoreBreakdown } from './calculatePersonalizationScore'
import type { UserInterestProfile } from './userInterestProfile'

function humanizeToken(value: string | undefined): string {
  if (!value) return ''
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR') + part.slice(1))
    .join(' ')
}

export function generateRecommendationReason(
  _article: PersonalizationArticle,
  scoreBreakdown: PersonalizationScoreBreakdown,
  userProfile: UserInterestProfile
): string {
  void userProfile
  const strongest = [
    { key: 'category', value: scoreBreakdown.category },
    { key: 'tags', value: scoreBreakdown.tags },
    { key: 'readingHistory', value: scoreBreakdown.readingHistory },
    { key: 'bookmarks', value: scoreBreakdown.bookmarks },
    { key: 'freshness', value: scoreBreakdown.freshness },
    { key: 'reliability', value: scoreBreakdown.reliability },
    { key: 'popularity', value: scoreBreakdown.popularity },
  ].sort((a, b) => b.value - a.value)[0]

  if (!strongest || strongest.value <= 0) {
    return 'İlgi alanlarına ve güncelliğe göre önerildi'
  }

  if (strongest.key === 'category' && scoreBreakdown.matchedCategories[0]) {
    return `${humanizeToken(scoreBreakdown.matchedCategories[0])} kategorisini takip ettiğin için`
  }

  if (strongest.key === 'tags' && scoreBreakdown.matchedTags[0]) {
    return `${humanizeToken(scoreBreakdown.matchedTags[0])} etiketi ilgi alanlarınla eşleştiği için`
  }

  if (strongest.key === 'readingHistory') {
    return 'Benzer konuları son dönemde okuduğun için'
  }

  if (strongest.key === 'bookmarks') {
    return 'Kaydettiğin haberlere benzer olduğu için'
  }

  if (strongest.key === 'freshness') {
    return 'Son 24 saatte yayınlandığı için'
  }

  if (strongest.key === 'reliability') {
    return 'Güvenilir bir kaynaktan geldiği için'
  }

  if (strongest.key === 'popularity') {
    return 'Gündemde öne çıktığı için'
  }

  return 'İlgi alanlarına ve güncelliğe göre önerildi'
}
