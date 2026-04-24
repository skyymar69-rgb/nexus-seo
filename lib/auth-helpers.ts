import { type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export type PlanHierarchy = 'free'

export async function getCurrentUser(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return null
  }

  return {
    id: token.id as string,
    email: token.email as string,
    name: token.name as string,
    plan: 'free' as PlanHierarchy,
    role: token.role as string,
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new Error('Unauthorized: User must be authenticated')
  }

  return user
}

export async function requirePlan(
  request: NextRequest,
  _minPlan: PlanHierarchy
) {
  // Tout est gratuit — pas de restriction de plan
  return requireAuth(request)
}

export function getPlanHierarchy(_plan: string): number {
  return 0 // Tout le monde est au même niveau
}

export function comparePlans(_plan1: string, _plan2: string): number {
  return 0 // Tous les plans sont identiques
}

export const planLevels = {
  free: 0,
} as const
