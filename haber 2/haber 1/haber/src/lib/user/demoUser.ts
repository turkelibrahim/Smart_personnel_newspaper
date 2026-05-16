import { prisma } from '@/lib/db'

export const DEMO_EMAIL = 'demo@mypress.ai'

export async function getDemoUser() {
  return prisma.user.findUnique({ where: { email: DEMO_EMAIL } })
}
