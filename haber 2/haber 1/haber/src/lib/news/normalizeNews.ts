import { decode } from 'entities';
import { createDuplicateHash } from './duplicateDetection';

export function cleanHtml(html: string | undefined, maxLength = 240): string {
  if (!html) return '';
  
  // Remove scripts, styles, iframes, tags
  let cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  cleaned = decode(cleaned);
  
  if (maxLength <= 0) return cleaned;
  return cleaned.length > maxLength ? cleaned.substring(0, maxLength - 3) + '...' : cleaned;
}

export function normalizeUrl(url: string | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    // Remove UTM parameters
    const params = new URLSearchParams(u.search);
    const toRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'];
    toRemove.forEach(p => params.delete(p));
    u.search = params.toString();
    
    // Normalize protocol and trailing slash
    let normalized = u.toString().toLowerCase();
    if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
    return normalized;
  } catch {
    return url || '';
  }
}

export function generateNewsId(sourceSlug: string, url: string, title: string): string {
  const normalizedUrl = normalizeUrl(url);
  return createDuplicateHash({
    title: `${sourceSlug}:${title.toLowerCase().trim()}`,
    originalUrl: normalizedUrl,
  });
}

type FeedItemLike = {
  enclosure?: { url?: string };
  image?: { url?: string } | { href?: string } | string | Array<{ url?: string; href?: string } | string>;
  'media:content'?: { $?: { url?: string } };
  'media:thumbnail'?: { $?: { url?: string } };
  'content:encoded'?: string;
  content?: string;
  description?: string;
  categories?: unknown[];
  [key: string]: unknown;
};

function normalizeImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('//')) return `https:${trimmed}`;

  try {
    return new URL(trimmed).toString();
  } catch {
    return null;
  }
}

function extractUrlFromUnknown(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === 'string') {
    return normalizeImageUrl(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = extractUrlFromUnknown(item);
      if (nested) return nested;
    }
    return null;
  }

  if (typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    return (
      normalizeImageUrl(candidate.url as string | undefined) ||
      normalizeImageUrl(candidate.href as string | undefined) ||
      normalizeImageUrl((candidate.$ as { url?: string } | undefined)?.url)
    );
  }

  return null;
}

export function extractImage(item: FeedItemLike): string | null {
  // Try enclosure
  const enclosureUrl = normalizeImageUrl(item.enclosure?.url);
  if (enclosureUrl) return enclosureUrl;

  // Try media:content or media:thumbnail
  const mediaContentUrl = normalizeImageUrl(item['media:content']?.$?.url);
  if (mediaContentUrl) return mediaContentUrl;

  const mediaThumbnailUrl = normalizeImageUrl(item['media:thumbnail']?.$?.url);
  if (mediaThumbnailUrl) return mediaThumbnailUrl;

  // Try generic image fields that some feeds expose
  const imageFieldUrl = extractUrlFromUnknown(item.image);
  if (imageFieldUrl) return imageFieldUrl;

  // Try content for <img>
  const content = String(item.content || item['content:encoded'] || item.description || '');
  const imgPatterns = [
    /<img[^>]+src="([^">]+)"/i,
    /<img[^>]+src='([^'>]+)'/i,
    /<img[^>]+data-src="([^">]+)"/i,
    /<img[^>]+data-original="([^">]+)"/i,
    /<meta[^>]+property="og:image"[^>]+content="([^">]+)"/i,
  ];

  for (const pattern of imgPatterns) {
    const match = content.match(pattern);
    const candidate = normalizeImageUrl(match?.[1]);
    if (candidate) return candidate;
  }

  const srcSetMatch = content.match(/<img[^>]+srcset="([^">]+)"/i);
  if (srcSetMatch?.[1]) {
    const firstSrcSet = srcSetMatch[1].split(',')[0]?.trim().split(/\s+/)[0];
    const normalizedSrcSet = normalizeImageUrl(firstSrcSet);
    if (normalizedSrcSet) return normalizedSrcSet;
  }

  return null;
}

export function parsePublishedDate(isoDate?: string, pubDate?: string): Date {
  const rawDate = isoDate || pubDate;
  const parsedDate = rawDate ? new Date(rawDate) : new Date();
  const date = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  // Some feeds publish malformed two-digit years that parse as future dates.
  return date.getTime() > Date.now() ? new Date() : date;
}

export function normalizeCategory(category: string | undefined): string {
  return (category || 'genel').trim().toLocaleLowerCase('tr-TR');
}

export function extractContent(item: FeedItemLike): string {
  return cleanHtml(
    String(item.content || item['content:encoded'] || item.description || item.contentSnippet || ''),
    0
  );
}

export function extractTags(item: FeedItemLike, fallbackCategory: string): string[] {
  const rawCategories = Array.isArray(item.categories) ? item.categories : [];
  const tags = rawCategories
    .map((value: unknown) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);

  const merged = [...tags, fallbackCategory].filter(Boolean);
  return Array.from(new Set(merged));
}
