import { prisma } from '@/lib/db';
import { analyzeArticle } from '@/lib/classification/analyzeArticle';
import { getCategoryDisplayName } from '@/lib/classification/categoryRules';
import { slugifyTurkish } from '@/lib/classification/textNormalization';
import { fetchAllFeeds } from './rssFetcher';
import { NEWS_SOURCES } from './sources';
import { mapNormalizedArticleToCreateInput, mapNormalizedArticleToUpdateInput } from './articleMapper';

export interface SyncNewsResult {
  fetchedCount: number;
  insertedCount: number;
  updatedCount: number;
  duplicateCount: number;
  failedSources: string[];
  durationMs: number;
}

async function syncArticleTags(articleId: string, tags: string[]) {
  const normalizedTags = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean))).slice(0, 10);
  if (normalizedTags.length === 0) {
    return;
  }

  const tagIds: string[] = [];
  for (const tagName of normalizedTags) {
    const slug = slugifyTurkish(tagName);
    if (!slug) continue;

    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name: tagName },
      create: { name: tagName, slug },
      select: { id: true },
    });

    tagIds.push(tag.id);
    await prisma.articleTag.upsert({
      where: {
        articleId_tagId: {
          articleId,
          tagId: tag.id,
        },
      },
      update: {},
      create: {
        articleId,
        tagId: tag.id,
      },
    });
  }

  if (tagIds.length > 0) {
    await prisma.articleTag.deleteMany({
      where: {
        articleId,
        tagId: { notIn: tagIds },
      },
    });
  }
}

export async function syncNews() {
  const startedAt = Date.now();
  console.log('[SYNC] Starting news synchronization...');
  const { articles, failedSources } = await fetchAllFeeds();
  
  // Deduplicate in memory before DB operations
  const uniqueArticles = Array.from(new Map(articles.map(item => [item.id, item])).values());
  
  console.log(`[SYNC] Fetched ${articles.length} items, ${uniqueArticles.length} unique items.`);

  // Ensure Sources exist in DB
  for (const source of NEWS_SOURCES) {
    await prisma.newsSource.upsert({
      where: { id: source.slug }, // We use slug as ID for consistency
      update: {
        name: source.name,
        baseUrl: source.homepage,
        url: source.homepage,
        rssUrl: source.feeds[0]?.url,
        type: 'NEWS_PORTAL',
        isActive: source.active,
        lastFetchedAt: new Date(),
      },
      create: {
        id: source.slug,
        name: source.name,
        type: 'NEWS_PORTAL',
        baseUrl: source.homepage,
        rssUrl: source.feeds[0]?.url,
        url: source.homepage,
        language: 'tr',
        country: 'TR',
        reliabilityScore: 70,
        trustScore: 70,
        isActive: source.active,
        lastFetchedAt: new Date(),
      }
    });
  }

  let insertedCount = 0;
  let updatedCount = 0;
  let duplicateCount = 0;
  for (const article of uniqueArticles) {
    try {
      const analysis = analyzeArticle({
        title: article.title,
        summary: article.summary,
        content: article.content,
        rssCategory: article.category,
        rssTags: article.tags,
        language: article.language,
        sourceName: article.sourceName,
      });

      const category = await prisma.category.upsert({
        where: { slug: analysis.categorySlug },
        update: {
          name: getCategoryDisplayName(analysis.categorySlug),
          isActive: true,
        },
        create: {
          name: getCategoryDisplayName(analysis.categorySlug),
          slug: analysis.categorySlug,
          description: `${getCategoryDisplayName(analysis.categorySlug)} kategorisi`,
          isActive: true,
        },
        select: { id: true },
      });

      const existingById = await prisma.article.findUnique({
        where: { id: article.id },
        select: { id: true, duplicateHash: true }
      });

      const existingByHash = article.duplicateHash
        ? await prisma.article.findFirst({
            where: { duplicateHash: article.duplicateHash },
            orderBy: { createdAt: 'asc' },
            select: { id: true, duplicateHash: true }
          })
        : null;

      if (!existingById && existingByHash) {
        await prisma.article.update({
          where: { id: existingByHash.id },
          data: mapNormalizedArticleToUpdateInput(article, {
            isDuplicate: false,
            categoryId: category.id,
            analysis,
          })
        });

        await syncArticleTags(existingByHash.id, analysis.tags);

        await prisma.article.updateMany({
          where: {
            duplicateHash: article.duplicateHash,
            id: { not: existingByHash.id }
          },
          data: { isDuplicate: true }
        });

        duplicateCount++;
        updatedCount++;
        continue;
      }

      const existingBeforeUpsert = Boolean(existingById);
      const savedArticle = await prisma.article.upsert({
        where: { id: article.id },
        update: mapNormalizedArticleToUpdateInput(article, {
          isDuplicate: false,
          categoryId: category.id,
          analysis,
        }),
        create: mapNormalizedArticleToCreateInput(article, {
          isDuplicate: false,
          categoryId: category.id,
          analysis,
        }),
        select: { id: true },
      });

      await syncArticleTags(savedArticle.id, analysis.tags);

      if (article.duplicateHash) {
        await prisma.article.updateMany({
          where: {
            duplicateHash: article.duplicateHash,
            id: { not: article.id }
          },
          data: { isDuplicate: true }
        });
      }

      if (existingBeforeUpsert) {
        updatedCount++;
      } else {
        insertedCount++;
      }
    } catch {
      // Silently fail for individual articles (e.g. unique constraint if hash collision)
    }
  }

  const result: SyncNewsResult = {
    fetchedCount: uniqueArticles.length,
    insertedCount,
    updatedCount,
    duplicateCount,
    failedSources,
    durationMs: Date.now() - startedAt,
  };

  console.log(
    `[SYNC] Completed fetched=${result.fetchedCount} inserted=${result.insertedCount} updated=${result.updatedCount} duplicates=${result.duplicateCount}.`
  );
  return result;
}
