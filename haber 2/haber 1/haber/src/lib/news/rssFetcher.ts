import Parser from 'rss-parser';
import pLimit from 'p-limit';
import { NEWS_SOURCES, NewsSource } from './sources';
import { healthCache, rssCache, getCacheKey } from './cache';
import {
  cleanHtml,
  extractContent,
  extractImage,
  extractTags,
  generateNewsId,
  normalizeCategory,
  normalizeUrl,
  parsePublishedDate,
} from './normalizeNews';
import { createDuplicateHash } from './duplicateDetection';
import { failFetchLog, finishFetchLog, startFetchLog } from './fetchLogging';

type RssItem = {
  title?: string;
  link?: string;
  guid?: string;
  isoDate?: string;
  pubDate?: string;
  author?: string;
  creator?: string;
  contentSnippet?: string;
  description?: string;
  content?: string;
  categories?: unknown[];
  [key: string]: unknown;
};

type ParsedFeed = {
  items?: RssItem[];
};

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['image', 'image'],
      ['enclosure', 'enclosure']
    ]
  }
});

const limit = pLimit(4); // Concurrency limit

export interface NormalizedArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  originalUrl: string;
  imageUrl: string | null;
  image: string | null;
  url: string;
  sourceName: string;
  sourceUrl: string;
  source: string;
  sourceSlug: string;
  category: string;
  tags: string[];
  language: string;
  publishedAt: Date;
  fetchedAt: Date;
  author: string | null;
  duplicateHash: string;
  isDuplicate: boolean;
  popularityScore: number;
  personalizationScore: number;
}

interface FeedFetchResult {
  articles: NormalizedArticle[];
  failedSources: string[];
}

interface FeedHealth {
  source: string;
  feedUrl: string;
  status: string;
  lastFetchedAt: string | null;
  lastSuccessAt: string | null;
  error: string | null;
  itemCount: number;
}

async function fetchWithTimeout(url: string, timeout = 8000): Promise<ParsedFeed> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const xml = await response.text();
    return (await parser.parseString(xml)) as unknown as ParsedFeed;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function fetchWithRetry(url: string, retries = 2): Promise<ParsedFeed> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url);
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw new Error(`Failed to fetch feed after ${retries + 1} attempts: ${url}`);
}

export async function fetchFeed(source: NewsSource, feed: { category: string, url: string }): Promise<FeedFetchResult> {
  const cacheKey = getCacheKey('rss', source.slug, feed.category, feed.url);
  const cached = rssCache.get<NormalizedArticle[]>(cacheKey);
  if (cached) return { articles: cached, failedSources: [] };

  const healthKey = getCacheKey('health', source.slug, feed.url);
  const health: FeedHealth = healthCache.get<FeedHealth>(healthKey) || {
    source: source.name, 
    feedUrl: feed.url, 
    status: 'ok', 
    lastFetchedAt: null, 
    lastSuccessAt: null,
    error: null,
    itemCount: 0 
  };
  const logId = await startFetchLog(source.slug, `Fetching ${feed.url}`);

  try {
    const feedData = await fetchWithRetry(feed.url);
    const articles: NormalizedArticle[] = (feedData.items || []).map((item: RssItem) => {
      const title = cleanHtml(item.title || '').trim() || 'Baslik yok';
      const originalUrl = normalizeUrl(item.link || item.guid || source.homepage);
      const publishedAt = parsePublishedDate(item.isoDate, item.pubDate);
      const category = normalizeCategory(feed.category);
      const content = extractContent(item);
      const summary = cleanHtml(item.contentSnippet || item.description || content);
      const duplicateHash = createDuplicateHash({ title, originalUrl, publishedAt });
      const imageUrl = extractImage(item);

      return {
        id: generateNewsId(source.slug, originalUrl, title),
        title,
        summary,
        content,
        originalUrl,
        imageUrl,
        image: imageUrl,
        url: originalUrl,
        sourceName: source.name,
        sourceUrl: source.homepage,
        source: source.name,
        sourceSlug: source.slug,
        category,
        tags: extractTags(item, category),
        language: source.language || 'tr',
        publishedAt,
        fetchedAt: new Date(),
        author: cleanHtml(item.author || item.creator || '').trim() || null,
        duplicateHash,
        isDuplicate: false,
        popularityScore: 0,
        personalizationScore: 0,
      };
    });

    health.status = 'ok';
    health.lastFetchedAt = new Date().toISOString();
    health.lastSuccessAt = new Date().toISOString();
    health.itemCount = articles.length;
    health.error = null;
    
    rssCache.set(cacheKey, articles);
    healthCache.set(healthKey, health);
    await finishFetchLog(logId, source.slug, {
      message: `${articles.length} articles fetched from ${feed.url}`,
      fetchedCount: articles.length,
      errorCount: 0,
    });
    
    return { articles, failedSources: [] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown RSS fetch error';
    health.status = 'failed';
    health.error = message;
    health.lastFetchedAt = new Date().toISOString();
    healthCache.set(healthKey, health);
    await failFetchLog(logId, source.slug, {
      message: `${feed.url} failed: ${message}`,
      fetchedCount: 0,
      errorCount: 1,
    });
    console.error(`[RSS FETCH ERROR] ${source.name} (${feed.url}): ${message}`);
    return { articles: [], failedSources: [`${source.name} (${feed.url})`] };
  }
}

export async function fetchAllFeeds(): Promise<FeedFetchResult> {
  const tasks = NEWS_SOURCES.filter(s => s.active).flatMap(source => 
    source.feeds.map(feed => limit(() => fetchFeed(source, feed)))
  );
  
  const results = await Promise.all(tasks);
  return {
    articles: results.flatMap((result) => result.articles),
    failedSources: results.flatMap((result) => result.failedSources),
  };
}
