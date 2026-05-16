import { prisma } from '@/lib/db'

export interface ArticleScoreUpdate {
  articleId: string
  score: number
}

export interface UpdateArticlePersonalizationScoresOptions {
  dryRun?: boolean
}

// User-personalized scores are not written in the default production flow.
// This helper is reserved for an explicit demo/global cache job if needed later.
export async function updateArticlePersonalizationScores(
  scoredArticles: ArticleScoreUpdate[],
  options: UpdateArticlePersonalizationScoresOptions = {}
) {
  const uniqueScores = Array.from(
    new Map(scoredArticles.map((item) => [item.articleId, Math.max(0, Math.min(100, item.score))])).entries()
  )

  if (options.dryRun) {
    return { updatedCount: 0, plannedCount: uniqueScores.length }
  }

  let updatedCount = 0
  for (const [articleId, score] of uniqueScores) {
    await prisma.article.update({
      where: { id: articleId },
      data: { personalizationScore: score },
    })
    updatedCount++
  }

  return { updatedCount, plannedCount: uniqueScores.length }
}
