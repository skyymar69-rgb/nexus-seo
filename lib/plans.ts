/**
 * Nexus SEO — 100% Gratuit
 * Tous les outils sont accessibles sans limitation.
 * Les plans payants seront ajoutés quand il y aura des clients.
 */

export type PlanId = 'free'

export interface PlanConfig {
  id: PlanId
  name: string
  price: number | null
  priceAnnual: number | null
  tagline: string
  limits: {
    auditsPerMonth: number
    keywordsTracked: number
    backlinkChecks: number
    sitesMax: number
    aiVisibility: boolean
    geoReports: boolean
    aeoReports: boolean
    llmoReports: boolean
    competitorAnalysis: number
    exportPDF: boolean
    apiAccess: boolean
    whiteLabel: boolean
    llmMonitoring: number
    supportLevel: 'community' | 'email' | 'priority' | 'dedicated'
    customDashboard: boolean
    aiChat: boolean
    agencyAccess: boolean
  }
}

const plansConfig: Record<PlanId, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    priceAnnual: 0,
    tagline: 'Tous les outils SEO, 100% gratuit',
    limits: {
      auditsPerMonth: -1,
      keywordsTracked: -1,
      backlinkChecks: -1,
      sitesMax: -1,
      aiVisibility: true,
      geoReports: true,
      aeoReports: true,
      llmoReports: true,
      competitorAnalysis: -1,
      exportPDF: true,
      apiAccess: true,
      whiteLabel: false,
      llmMonitoring: -1,
      supportLevel: 'email',
      customDashboard: false,
      aiChat: true,
      agencyAccess: false,
    },
  },
}

export function getPlan(planId: PlanId): PlanConfig {
  return plansConfig.free
}

export function canAccess(_planId: PlanId, _feature: keyof PlanConfig['limits']): boolean {
  return true // Tout est gratuit
}

export function getLimit(_planId: PlanId, feature: keyof PlanConfig['limits']): number | boolean | string {
  return plansConfig.free.limits[feature]
}

export function isFeatureLocked(_planId: PlanId, _feature: string): boolean {
  return false // Rien n'est verrouillé
}

export function getMinPlanForFeature(_feature: keyof PlanConfig['limits']): PlanId {
  return 'free'
}

export const allPlans: PlanConfig[] = Object.values(plansConfig)
