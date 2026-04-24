import { prisma } from '@/lib/prisma'

/**
 * Ensures the user exists in the database.
 * The demo user is hardcoded in auth but doesn't exist in DB.
 * This creates them on first use so foreign keys work.
 */
export async function ensureUserExists(userId: string, session: any): Promise<void> {
  if (!userId) return

  try {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!existing) {
      await prisma.user.create({
        data: {
          id: userId,
          email: session?.user?.email || `${userId}@nexus.local`,
          name: session?.user?.name || 'Utilisateur',
          plan: session?.user?.plan || 'free',
          role: session?.user?.role || 'user',
        },
      })
    }
  } catch {
    // User might already exist (race condition) — that's fine
  }
}
