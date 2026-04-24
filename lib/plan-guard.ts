import { prisma } from '@/lib/prisma'
import { type PlanId, getPlan, canAccess, getLimit, type PlanConfig } from '@/lib/plans'

export interface PlanCheckResult {
  allowed: boolean
  limit: number
  used: number
  remaining: number
  upgradeRequired: PlanId | null
}

const PLAN_ORDER: PlanId[] = ['free']

function isValidPlan(plan: unknown): plan is PlanId {
  return typeof plan === 'string' && PLAN_ORDER.includes(plan as PlanId)
}

function getNextPlan(currentPlan: PlanId): PlanId | null {
  const idx = PLAN_ORDER.indexOf(currentPlan)
  if (idx === -1 || idx >= PLAN_ORDER.length - 1) return null
  return PLAN_ORDER[idx + 1]
}

async function countMonthlyAudits(userId: string): Promise<number> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Count audits across all user's websites
  const websites = await prisma.website.findMany({
    where: { userId },
    select: { id: true },
  })

  if (websites.length === 0) return 0

  return prisma.audit.count({
    where: {
      websiteId: { in: websites.map((w) => w.id) },
      createdAt: { gte: startOfMonth },
    },
  })
}

async function countTrackedKeywords(userId: string): Promise<number> {
  return prisma.keyword.count({
    where: { userId },
  })
}

async function countWebsites(userId: string): Promise<number> {
  return prisma.website.count({
    where: { userId },
  })
}

async function countBacklinkChecks(userId: string): Promise<number> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const websites = await prisma.website.findMany({
    where: { userId },
    select: { id: true },
  })

  if (websites.length === 0) return 0

  return prisma.backlink.count({
    where: {
      websiteId: { in: websites.map((w) => w.id) },
      lastChecked: { gte: startOfMonth },
    },
  })
}

type CountableFeature = 'auditsPerMonth' | 'keywordsTracked' | 'sitesMax' | 'backlinkChecks' | 'competitorAnalysis' | 'llmMonitoring'

const featureCounters: Record<CountableFeature, (userId: string) => Promise<number>> = {
  auditsPerMonth: countMonthlyAudits,
  keywordsTracked: countTrackedKeywords,
  sitesMax: countWebsites,
  backlinkChecks: countBacklinkChecks,
  competitorAnalysis: async () => 0, // TODO: implement when competitor tracking is stored
  llmMonitoring: async () => 0, // TODO: implement when LLM monitoring is stored
}

export async function checkPlanLimit(
  userId: string,
  feature: keyof PlanConfig['limits'],
  sessionPlan?: string
): Promise<PlanCheckResult> {
  let planId: PlanId = 'free'

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    })
    if (user?.plan && isValidPlan(user.plan)) {
      planId = user.plan
    }
  } catch {
    // DB not available (e.g. demo user) — fallback to session plan
  }

  // Fallback to session plan if DB returned nothing useful
  if (planId === 'free' && sessionPlan && isValidPlan(sessionPlan)) {
    planId = sessionPlan
  }

  const limit = getLimit(planId, feature)

  // Boolean features
  if (typeof limit === 'boolean') {
    return {
      allowed: limit,
      limit: limit ? 1 : 0,
      used: 0,
      remaining: limit ? 1 : 0,
      upgradeRequired: limit ? null : getNextPlan(planId),
    }
  }

  // String features (supportLevel)
  if (typeof limit === 'string') {
    return {
      allowed: true,
      limit: 0,
      used: 0,
      remaining: 0,
      upgradeRequired: null,
    }
  }

  // Unlimited (-1)
  if (limit === -1) {
    return {
      allowed: true,
      limit: -1,
      used: 0,
      remaining: -1,
      upgradeRequired: null,
    }
  }

  // Zero = not available
  if (limit === 0) {
    return {
      allowed: false,
      limit: 0,
      used: 0,
      remaining: 0,
      upgradeRequired: getNextPlan(planId),
    }
  }

  // Countable numeric feature
  const counter = featureCounters[feature as CountableFeature]
  const used = counter ? await counter(userId) : 0
  const allowed = used < limit

  return {
    allowed,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    upgradeRequired: allowed ? null : getNextPlan(planId),
  }
}

export async function requirePlanAccess(
  userId: string,
  feature: keyof PlanConfig['limits']
): Promise<PlanCheckResult> {
  const result = await checkPlanLimit(userId, feature)
  return result
}
