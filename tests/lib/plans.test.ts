import { describe, it, expect } from 'vitest'
import { getPlan, canAccess, getLimit, isFeatureLocked, getMinPlanForFeature, allPlans } from '@/lib/plans'

describe('Plans configuration', () => {
  it('should have 3 plans defined', () => {
    expect(allPlans).toHaveLength(3)
  })

  it('should return correct plan by ID', () => {
    const free = getPlan('free')
    expect(free.id).toBe('free')
    expect(free.name).toBe('Gratuit')
    expect(free.price).toBe(0)

    const pro = getPlan('pro')
    expect(pro.id).toBe('pro')
    expect(pro.price).toBe(49.99)
  })

  it('should have ascending prices', () => {
    const prices = allPlans.map(p => p.price ?? 0)
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1])
    }
  })
})

describe('canAccess', () => {
  it('free plan can access aiVisibility', () => {
    expect(canAccess('free', 'aiVisibility')).toBe(true)
  })

  it('free plan has 5 audits per month', () => {
    expect(canAccess('free', 'auditsPerMonth')).toBe(true)
  })

  it('free plan can access geoReports', () => {
    expect(canAccess('free', 'geoReports')).toBe(true)
  })

  it('free plan can access aeoReports', () => {
    expect(canAccess('free', 'aeoReports')).toBe(true)
  })

  it('free plan cannot access llmoReports', () => {
    expect(canAccess('free', 'llmoReports')).toBe(false)
  })

  it('pro can access llmoReports', () => {
    expect(canAccess('pro', 'llmoReports')).toBe(true)
  })

  it('pro cannot access apiAccess', () => {
    expect(canAccess('pro', 'apiAccess')).toBe(false)
  })

  it('expert can access apiAccess', () => {
    expect(canAccess('expert', 'apiAccess')).toBe(true)
  })
})

describe('getLimit', () => {
  it('free plan has 5 audits per month', () => {
    expect(getLimit('free', 'auditsPerMonth')).toBe(5)
  })

  it('pro plan has unlimited audits', () => {
    expect(getLimit('pro', 'auditsPerMonth')).toBe(-1)
  })

  it('free plan has 1 site max', () => {
    expect(getLimit('free', 'sitesMax')).toBe(1)
  })

  it('expert plan has unlimited sites', () => {
    expect(getLimit('expert', 'sitesMax')).toBe(-1)
  })

  it('free tracks 10 keywords', () => {
    expect(getLimit('free', 'keywordsTracked')).toBe(10)
  })
})

describe('isFeatureLocked', () => {
  it('free plan does not lock aiVisibility', () => {
    expect(isFeatureLocked('free', 'aiVisibility')).toBe(false)
  })

  it('free plan locks exportPDF', () => {
    expect(isFeatureLocked('free', 'exportPDF')).toBe(true)
  })

  it('free plan locks whiteLabel', () => {
    expect(isFeatureLocked('free', 'whiteLabel')).toBe(true)
  })

  it('returns false for unknown features', () => {
    expect(isFeatureLocked('free', 'nonExistentFeature')).toBe(false)
  })
})

describe('getMinPlanForFeature', () => {
  it('auditsPerMonth available from free', () => {
    expect(getMinPlanForFeature('auditsPerMonth')).toBe('free')
  })

  it('aiVisibility available from free', () => {
    expect(getMinPlanForFeature('aiVisibility')).toBe('free')
  })

  it('llmoReports requires pro', () => {
    expect(getMinPlanForFeature('llmoReports')).toBe('pro')
  })

  it('whiteLabel requires expert', () => {
    expect(getMinPlanForFeature('whiteLabel')).toBe('expert')
  })

  it('agencyAccess requires expert', () => {
    expect(getMinPlanForFeature('agencyAccess')).toBe('expert')
  })
})
