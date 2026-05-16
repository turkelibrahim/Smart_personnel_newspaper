import slugify from 'slugify';

export function stripHtml(input: string): string {
  if (!input) return '';

  return input
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
}

export function removeExtraWhitespace(input: string): string {
  if (!input) return '';
  return input.replace(/\s+/g, ' ').trim();
}

export function stripPunctuation(input: string): string {
  if (!input) return '';
  return input.replace(/[^\p{L}\p{N}\s-]/gu, ' ');
}

export function normalizeTurkishText(input: string): string {
  if (!input) return '';

  const text = removeExtraWhitespace(stripPunctuation(stripHtml(input)));
  return text.normalize('NFKC').toLocaleLowerCase('tr-TR');
}

export function tokenizeTurkishText(input: string): string[] {
  const normalized = normalizeTurkishText(input);
  if (!normalized) return [];
  return normalized.split(' ').map((token) => token.trim()).filter(Boolean);
}

export function slugifyTurkish(input: string): string {
  if (!input) return '';
  return slugify(input, { lower: true, strict: true, locale: 'tr' });
}
