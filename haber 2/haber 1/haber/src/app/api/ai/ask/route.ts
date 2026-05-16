import { NextResponse } from 'next/server'
import { z } from 'zod'
import { answerNewspaperQuestion } from '@/lib/ai/answerNewspaperQuestion'
import { getCurrentUser } from '@/lib/user/getCurrentUser'

const bodySchema = z.object({
  question: z.string().min(1).max(500),
  userId: z.string().optional().nullable(),
  dateRange: z
    .object({
      from: z.string().optional().nullable(),
      to: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json())
    const currentUser = await getCurrentUser()
    const userId = body.userId || currentUser?.id

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const result = await answerNewspaperQuestion({
      question: body.question,
      userId,
      dateRange: body.dateRange || undefined,
    })

    return NextResponse.json({
      success: true,
      result,
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
