import { NextResponse } from 'next/server'
import { findRelatedStoryCluster } from '@/lib/news/storyClustering'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cluster = await findRelatedStoryCluster(id)

    if (!cluster) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      cluster,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown story cluster error'
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
