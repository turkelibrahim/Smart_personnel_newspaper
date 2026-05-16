function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('//')) return `https:${trimmed}`

  try {
    return new URL(trimmed).toString()
  } catch {
    return null
  }
}

function extractFromHtml(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i,
    /<img[^>]+data-src=["']([^"']+)["']/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    const candidate = normalizeImageUrl(match?.[1])
    if (candidate) return candidate
  }

  const srcSetMatch = html.match(/<img[^>]+srcset=["']([^"']+)["']/i)
  if (srcSetMatch?.[1]) {
    const firstSrc = srcSetMatch[1].split(',')[0]?.trim().split(/\s+/)[0]
    return normalizeImageUrl(firstSrc)
  }

  return null
}

export async function resolveArticleImage(imageUrl?: string | null, pageUrl?: string | null) {
  const direct = normalizeImageUrl(imageUrl)
  if (direct) return direct

  const normalizedPageUrl = normalizeImageUrl(pageUrl)
  if (!normalizedPageUrl) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(normalizedPageUrl, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; MyPressAI/1.0; +https://localhost)',
      },
      next: { revalidate: 1800 },
    })

    if (!response.ok) return null

    const html = await response.text()
    return extractFromHtml(html)
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
