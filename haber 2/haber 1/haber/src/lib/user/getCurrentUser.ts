import { prisma } from '@/lib/db'
import type { User, UserPreference } from '@prisma/client'
import { getDemoUser, DEMO_EMAIL } from './demoUser'

type GetCurrentUserOptions = {
  includePreference?: boolean
}

// This remains the single user-resolution entry point until request-aware auth is added.
async function ensureDemoUser(includePreference: boolean) {
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: 'Demo User',
      role: 'USER',
    },
    include: includePreference ? { preference: true } : undefined,
  })

  return user
}

export async function getCurrentUser(): Promise<User | null>
export async function getCurrentUser(
  options: { includePreference: true }
): Promise<(User & { preference: UserPreference | null }) | null>
export async function getCurrentUser(
  options: GetCurrentUserOptions = {}
): Promise<User | (User & { preference: UserPreference | null }) | null> {
  const includePreference = Boolean(options.includePreference)

  try {
    const demoUser = includePreference
      ? await prisma.user.findUnique({
          where: { email: DEMO_EMAIL },
          include: { preference: true },
        })
      : await getDemoUser()

    return demoUser || ensureDemoUser(includePreference)
  } catch {
    return ensureDemoUser(includePreference)
  }
}
