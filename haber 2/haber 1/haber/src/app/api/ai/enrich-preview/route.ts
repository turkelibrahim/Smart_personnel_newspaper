import { NextResponse } from 'next/server'
import { z } from 'zod'
import { enrichArticle } from '@/lib/ai/enrichArticle'

const bodySchema = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.parse(await req.json())
    const enrichment = await enrichArticle(parsed)

    return NextResponse.json({
      success: true,
      enrichment,
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
