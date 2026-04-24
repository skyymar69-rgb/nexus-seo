// ============================================
// NEXUS SEO - Tools Type Definitions
// ============================================

// ===== Tool Definitions =====
export type ToolCategory =
  | 'technical-seo'
  | 'on-page-seo'
  | 'keywords'
  | 'backlinks'
  | 'content'
  | 'competitors'
  | 'local-seo'
  | 'ai-geo'
  | 'analytics'
  | 'utilities'

export interface ToolDefinition {
  id: string
  name: string
  description: string
  category: ToolCategory
  icon: string // Lucide icon name
  route: string
  isPro: boolean
  isNew: boolean
  comingSoon: boolean
  features?: string[]
  limitations?: string[]
}

export interface ToolResult {
  id: string
  toolId: string
  websiteId: string
  data: Record<string, any>
  createdAt: string
  completedAt?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  error?: string
  duration?: number // in milliseconds
}

// ===== Report Types =====
export interface ReportSection {
  id: string
  title: string
  description?: string
  content: string
  icon?: string
  priority?: 'high' | 'medium' | 'low'
  isExpanded?: boolean
}

export interface ReportChart {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  title: string
  data: ChartDataPoint[]
  xAxis?: string
  yAxis?: string
  colors?: string[]
  showLegend?: boolean
}

export interface ChartDataPoint {
  label: string
  value: number
  metadata?: Record<string, any>
}

export interface ReportTable {
  id: string
  title: string
  headers: string[]
  rows: (string | number | boolean)[][]
  sortable?: boolean
  filterable?: boolean
}

export interface Report {
  id: string
  toolId: string
  websiteId: string
  title: string
  summary: string
  overallScore?: number
  sections: ReportSection[]
  charts: ReportChart[]
  tables: ReportTable[]
  recommendations: Recommendation[]
  createdAt: string
  generatedAt: string
  exportedAt?: string
}

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  estimatedImpact?: number // percentage
  estimatedEffort?: 'easy' | 'medium' | 'hard'
  resources?: string[]
  actionItems?: string[]
}

// ===== Export Types =====
export enum ExportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  MARKDOWN = 'markdown',
  TEXT = 'text',
  HTML = 'html',
  JSON = 'json',
}

export interface ExportConfig {
  format: ExportFormat
  includeCharts?: boolean
  includeRecommendations?: boolean
  includeMetadata?: boolean
  pageSize?: 'A4' | 'Letter'
  orientation?: 'portrait' | 'landscape'
  watermark?: boolean
  compression?: boolean
}

export interface ExportedReport {
  id: string
  reportId: string
  format: ExportFormat
  filename: string
  size: number
  createdAt: string
  expiresAt?: string
  downloadUrl?: string
}

// ===== AI Advisor Types =====
export interface AIRecommendation {
  id: string
  title: string
  description: string
  category: 'technical' | 'content' | 'backlinks' | 'keywords' | 'user-experience'
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedTrafficGain?: number // percentage
  estimatedTimeToImplement?: number // hours
  difficulty: 'easy' | 'medium' | 'hard'
  resources?: string[]
  actionItems: string[]
}

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  relatedTools?: string[]
  estimatedTime?: number // minutes
}

export interface Goal {
  id: string
  title: string
  description: string
  category: 'traffic' | 'conversions' | 'rankings' | 'authority'
  target: number
  current: number
  unit: string
  targetDate: string
  progress: number // percentage
  status: 'on-track' | 'behind' | 'at-risk' | 'completed'
  relatedMetrics?: string[]
}

export interface Priority {
  id: string
  toolId: string
  rank: number
  justification: string
  expectedImpact: 'high' | 'medium' | 'low'
  expectedEffort: 'easy' | 'medium' | 'hard'
  synergies?: string[] // other tools this relates to
}

export interface AIAdvisor {
  id: string
  websiteId: string
  recommendations: AIRecommendation[]
  checklist: ChecklistItem[]
  goals: Goal[]
  priorities: Priority[]
  updatedAt: string
  lastAnalyzedAt: string
}

// ===== Evolution & Tracking Types =====
export interface HistoryPoint {
  date: string
  value: number
  metadata?: Record<string, any>
}

export interface Trend {
  metric: string
  current: number
  previous: number
  change: number // percentage
  direction: 'up' | 'down' | 'stable'
  history: HistoryPoint[]
}

export interface Comparison {
  id: string
  metric: string
  yourSite: number
  competitor: string
  competitorValue: number
  difference: number
  percentageDifference: number
  rank?: number
  category?: string
}

export interface Evolution {
  toolId: string
  websiteId: string
  trends: Trend[]
  comparisons: Comparison[]
  periodStart: string
  periodEnd: string
  generatedAt: string
}

// ===== Website Management Types =====
export interface SavedWebsite {
  id: string
  userId: string
  domain: string
  name?: string
  description?: string
  urls: WebsiteURL[]
  verified: boolean
  verificationToken?: string
  verifiedAt?: string
  createdAt: string
  updatedAt: string
  isArchived: boolean
  archivedAt?: string
}

export interface WebsiteURL {
  url: string
  type: 'homepage' | 'canonical' | 'sitemap' | 'robots'
  isPrimary: boolean
  addedAt: string
}

export interface WebsiteMetadata {
  websiteId: string
  title: string
  description: string
  keywords: string[]
  language: string
  country?: string
  industry?: string
  competitors?: string[]
  lastUpdated: string
}

// ===== Alert & Monitoring Types =====
export interface Alert {
  id: string
  websiteId: string
  type: 'ranking-drop' | 'backlink-lost' | 'crawl-error' | 'security' | 'performance' | 'indexing'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  affectedUrls?: string[]
  detectedAt: string
  resolvedAt?: string
  acknowledged: boolean
  acknowledgedAt?: string
  acknowledgedBy?: string
}

export interface MonitoringConfig {
  websiteId: string
  emailNotifications: boolean
  slackNotifications?: boolean
  checkFrequency: 'hourly' | 'daily' | 'weekly'
  rankingDropThreshold: number // percentage
  backlinksLostThreshold: number
  crawlErrorThreshold: number
  performanceThreshold: number // seconds
  enabled: boolean
}

// ===== Batch Operations =====
export interface BatchOperation {
  id: string
  websiteId: string
  toolIds: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  totalTools: number
  completedTools: number
  failedTools: number
  createdAt: string
  completedAt?: string
}

// ===== API Response Types =====
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  metadata?: {
    timestamp: string
    requestId: string
    duration: number // milliseconds
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
}

// ===== User Preferences =====
export interface ToolPreferences {
  userId: string
  favoriteTools: string[]
  hiddenTools: string[]
  toolOrder: string[]
  defaultExportFormat: ExportFormat
  autoRefreshEnabled: boolean
  refreshInterval: number // seconds
}

export interface NotificationPreference {
  userId: string
  toolId: string
  emailEnabled: boolean
  slackEnabled: boolean
  frequency: 'instant' | 'daily' | 'weekly'
  severityFilter: ('critical' | 'high' | 'medium' | 'low')[]
}

// ===== Audit & Activity =====
export interface ToolAuditLog {
  id: string
  userId: string
  websiteId: string
  toolId: string
  action: 'accessed' | 'ran' | 'exported' | 'deleted' | 'configured'
  metadata: Record<string, any>
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

export interface ToolUsage {
  toolId: string
  websiteId: string
  totalRuns: number
  lastRun: string
  averageRunTime: number // milliseconds
  successRate: number // percentage
  mostCommonExportFormat?: ExportFormat
}
