'use client'

import { useMemo, useCallback } from 'react'
import { useSession } from '@/hooks/useSession'
import { type PlanId, canAccess, getLimit, isFeatureLocked, getMinPlanForFeature, type PlanConfig } from '@/lib/plans'

const VALID_PLANS: PlanId[] = ['free']

function isValidPlan(plan: unknown): plan is PlanId {
  return typeof plan === 'string' && VALID_PLANS.includes(plan as PlanId)
}

export function usePlan() {
  const { user, isLoading } = useSession()

  const currentPlan: PlanId = useMemo(() => {
    if (user?.plan && isValidPlan(user.plan)) return user.plan
    return 'free'
  }, [user?.plan])

  const checkAccess = useCallback(
    (feature: keyof PlanConfig['limits']) => canAccess(currentPlan, feature),
    [currentPlan]
  )

  const checkLimit = useCallback(
    (feature: keyof PlanConfig['limits']) => getLimit(currentPlan, feature),
    [currentPlan]
  )

  const checkLocked = useCallback(
    (feature: string) => isFeatureLocked(currentPlan, feature),
    [currentPlan]
  )

  const getRequiredPlan = useCallback(
    (feature: keyof PlanConfig['limits']) => getMinPlanForFeature(feature),
    []
  )

  return {
    currentPlan,
    isLoading,
    checkAccess,
    checkLimit,
    checkLocked,
    getRequiredPlan,
  }
}
