// ============================================
// NEXUS SEO - Core Type Definitions
// ============================================

// User & Auth
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  company?: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  plan: PlanType
  createdAt: string
}

export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise'

// SEO Audit
export interface AuditResult {
  id: string
  url: string
  score: number
  date: string
  status: 'completed' | 'running' | 'failed'
  categories: AuditCategory[]
  issues: AuditIssue[]
}

export interface AuditCategory {
  name: string
  score: number
  icon: string
  issues: number
  passed: number
}

export interface AuditIssue {
  id: string
  severity: 'critical' | 'warning' | 'info' | 'passed'
  category: string
  title: string
  description: string
  howToFix?: string
  affectedUrls?: string[]
}

// Keywords
export interface Keyword {
  id: string
  term: string
  volume: number
  difficulty: number
  cpc: number
  trend: number[]
  position?: number
  positionChange?: number
  url?: string
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional'
}

export interface KeywordGroup {
  id: string
  name: string
  keywords: Keyword[]
  avgDifficulty: number
  totalVolume: number
}

// Backlinks
export interface Backlink {
  id: string
  sourceUrl: string
  sourceDomain: string
  targetUrl: string
  anchorText: string
  domainAuthority: number
  status: 'active' | 'lost' | 'broken'
  type: 'dofollow' | 'nofollow' | 'ugc' | 'sponsored'
  firstSeen: string
  lastSeen: string
}

export interface BacklinkProfile {
  totalBacklinks: number
  referringDomains: number
  domainAuthority: number
  trustFlow: number
  citationFlow: number
  newBacklinks: number
  lostBacklinks: number
  toxicLinks: number
}

// Rank Tracking
export interface RankPosition {
  keyword: string
  position: number
  previousPosition: number
  change: number
  url: string
  volume: number
  date: string
}

export interface RankHistory {
  date: string
  position: number
}

// Competitors
export interface Competitor {
  id: string
  domain: string
  name: string
  overlapScore: number
  domainAuthority: number
  organicTraffic: number
  keywords: number
  backlinks: number
  commonKeywords: number
}

// AI Visibility (GEO)
export interface AIVisibilityResult {
  id: string
  query: string
  llm: 'chatgpt' | 'perplexity' | 'claude' | 'gemini' | 'copilot'
  mentioned: boolean
  position?: number
  context?: string
  sentiment: 'positive' | 'neutral' | 'negative'
  date: string
  competitors: string[]
}

export interface AIVisibilityScore {
  overall: number
  byLLM: { llm: string; score: number; mentions: number }[]
  trending: 'up' | 'down' | 'stable'
  topQueries: string[]
}

// Content
export interface ContentPage {
  id: string
  url: string
  title: string
  score: number
  wordCount: number
  readability: number
  keywords: string[]
  recommendations: ContentRecommendation[]
  lastAnalyzed: string
}

export interface ContentRecommendation {
  type: 'add_keyword' | 'improve_heading' | 'add_internal_link' | 'optimize_meta' | 'add_schema' | 'improve_readability'
  priority: 'high' | 'medium' | 'low'
  description: string
}

// Dashboard
export interface DashboardStats {
  seoScore: number
  seoScoreChange: number
  organicTraffic: number
  trafficChange: number
  keywordsTracked: number
  keywordsUp: number
  keywordsDown: number
  backlinks: number
  backlinksChange: number
  aiVisibilityScore: number
  aiVisibilityChange: number
  crawlErrors: number
  indexedPages: number
}

// Notifications
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  date: string
  action?: { label: string; href: string }
}

// Pricing
export interface PricingPlan {
  id: PlanType
  name: string
  description: string
  price: { monthly: number; annual: number }
  popular?: boolean
  features: string[]
  limits: {
    websites: number
    keywords: number
    backlinks: number
    auditsPerMonth: number
    aiQueries: number
    users: number
  }
}
