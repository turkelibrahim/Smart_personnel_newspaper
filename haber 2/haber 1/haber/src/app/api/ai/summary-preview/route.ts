import { NextResponse } from 'next/server'
import { z } from 'zod'
import { summarizeArticle } from '@/lib/ai/summarizeArticle'

const articleSchema = z.object({
  title: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.union([z.array(z.string()), z.string()]).optional().nullable(),
})

const bodySchema = z.union([
  articleSchema,
  z.object({
    article: articleSchema,
  }),
])

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.parse(await req.json())
    const article = 'article' in parsed ? parsed.article : parsed
    const summary = await summarizeArticle(article)

    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request'
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    )
  }
}
