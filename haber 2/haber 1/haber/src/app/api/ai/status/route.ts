import { NextResponse } from 'next/server'
import { getAIConfig } from '@/lib/ai/aiConfig'

export const dynamic = 'force-dynamic'

export async function GET() {
  const config = getAIConfig()

  return NextResponse.json({
    enabled: config.enabled,
    provider: config.provider,
    hasApiKey: config.hasApiKey,
    mode: config.mode,
  })
}
