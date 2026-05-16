import crypto from 'crypto';

function normalizeUrlValue(value: string): string {
  if (!value) return '';

  try {
    const url = new URL(value);
    const params = new URLSearchParams(url.search);
    const toRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'];
    toRemove.forEach((param) => params.delete(param));
    url.search = params.toString();

    let normalized = url.toString().toLowerCase().trim();
    if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
    return normalized;
  } catch {
    return value.trim().toLowerCase();
  }
}

export function normalizeDuplicateInput(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ');
}

export function createDuplicateHash(input: {
  title: string;
  originalUrl?: string | null;
  publishedAt?: Date | string | null;
}): string {
  const normalizedTitle = normalizeDuplicateInput(input.title || '');
  const normalizedUrl = normalizeUrlValue(input.originalUrl || '');

  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
  const publishedPart =
    publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt.toISOString() : '';

  const payload = [normalizedTitle, normalizedUrl, publishedPart].join('::');
  return crypto.createHash('md5').update(payload).digest('hex');
}

export function isLikelyDuplicate(existingHash?: string | null, incomingHash?: string | null): boolean {
  if (!existingHash || !incomingHash) return false;
  return existingHash === incomingHash;
}
