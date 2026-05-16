import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Temporary static demo user for MVP
const DEMO_EMAIL = 'demo@mypress.ai'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
      include: { preference: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user.preference)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedPreference = await prisma.userPreference.upsert({
      where: { userId: user.id },
      update: {
        profession: data.profession,
        interests: data.interests ? JSON.stringify(data.interests) : undefined,
        blockedTopics: data.blockedTopics ? JSON.stringify(data.blockedTopics) : undefined,
        preferredReadingDepth: data.preferredReadingDepth,
        location: data.location
      },
      create: {
        userId: user.id,
        profession: data.profession,
        interests: data.interests ? JSON.stringify(data.interests) : undefined,
        blockedTopics: data.blockedTopics ? JSON.stringify(data.blockedTopics) : undefined,
        preferredReadingDepth: data.preferredReadingDepth || 'balanced',
        location: data.location
      }
    })

    return NextResponse.json(updatedPreference)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
