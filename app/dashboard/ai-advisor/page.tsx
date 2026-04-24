'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Area,
  AreaChart,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  Clock,
  Gauge,
  Brain,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
  Award,
  Flame,
  AlertTriangle,
  Check,
  Circle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Settings,
  Loader2,
  AlertOctagon,
} from 'lucide-react'
import { useWebsite } from '@/contexts/WebsiteContext'

// ============= TYPES =============

type Priority = 'critique' | 'haute' | 'moyenne' | 'basse'
type Effort = 'faible' | 'moyen' | 'eleve'
type Category =
  | 'technique'
  | 'contenu'
  | 'performance'
  | 'backlinks'
  | 'ai-visibility'
  | 'securite'
  | 'mobile'
  | 'ux'

interface CategoryScore {
  id: Category
  label: string
  score: number
  status: 'excellent' | 'bon' | 'correct' | 'faible' | 'critique'
  change: number
}

interface Recommendation {
  id: string
  category: string
  priority: Priority
  title: string
  description: string
  impact: string
  effort: Effort
  estimatedTime: string
  howTo: string
  actionSteps?: string[]
  expectedImpact?: string
  timelineWeeks?: number
}

interface ChecklistItem {
  id: string
  category: Category
  title: string
  description: string
  priority: Priority
  impact: number
  estimatedTime: string
  done: boolean
}

interface ActionItem {
  id: string
  title: string
  priority: Priority
  effort: Effort
  impact: number
  deadline: string
  category: Category
}

interface AdvisorData {
  empty: boolean
  message?: string
  scoreBreakdown?: {
    totalScore: number
    grade: string
    trend: 'improving' | 'stable' | 'declining'
    categoryScores: Record<string, number>
    strengths: string[]
    weaknesses: string[]
    benchmarkPercentile: number
  }
  recommendations?: any[]
  checklist?: any[]
  actionPlan?: {
    quickWins: any[]
    shortTerm: any[]
    mediumTerm: any[]
    longTerm: any[]
    estimatedTotalTime: number
    estimatedScoreGain: number
  }
  goals?: any[]
  timeline?: {
    weeksEstimate: number
    monthsEstimate: number
    expectedDate: string
    quarterlyMilestones: any[]
  }
  benchmarks?: Record<string, any>
  evolutionData?: any[]
  lastAuditDate?: string
  websiteDomain?: string
}

// ============= HELPER: Transform API data to UI types =============

const categoryLabelsMap: Record<string, string> = {
  technique: 'Technique',
  contenu: 'Contenu',
  performance: 'Performance',
  backlinks: 'Backlinks',
  'ai-visibility': 'Visibilité IA',
  securite: 'Sécurité',
  mobile: 'Mobile',
  ux: 'UX',
}

function getStatus(score: number): CategoryScore['status'] {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'bon'
  if (score >= 60) return 'correct'
  if (score >= 40) return 'faible'
  return 'critique'
}

function transformCategoryScores(
  categoryScores: Record<string, number>
): CategoryScore[] {
  const displayCategories: Category[] = [
    'technique',
    'contenu',
    'performance',
    'backlinks',
    'ai-visibility',
    'ux',
  ]
  return displayCategories
    .filter(cat => categoryScores[cat] !== undefined)
    .map(cat => ({
      id: cat,
      label: categoryLabelsMap[cat] || cat,
      score: Math.round(categoryScores[cat]),
      status: getStatus(categoryScores[cat]),
      change: 0,
    }))
}

function transformRecommendations(recs: any[]): Recommendation[] {
  return recs.map(r => ({
    id: r.id,
    category: r.category,
    priority: r.priority,
    title: r.title,
    description: r.description,
    impact: r.expectedImpact || '',
    effort: r.effort,
    estimatedTime: r.timelineWeeks ? `${r.timelineWeeks} semaines` : '',
    howTo: r.actionSteps ? r.actionSteps.join('\n') : '',
    actionSteps: r.actionSteps,
    expectedImpact: r.expectedImpact,
    timelineWeeks: r.timelineWeeks,
  }))
}

function transformChecklist(items: any[]): ChecklistItem[] {
  return items.map(item => ({
    id: item.id,
    category: item.category as Category,
    title: item.title,
    description: item.description,
    priority: item.priority,
    impact: item.impactScore || 0,
    estimatedTime: item.estimatedTime || '',
    done: item.status === 'termine',
  }))
}

function transformActionPlan(
  plan: AdvisorData['actionPlan']
): Record<string, ActionItem[]> {
  if (!plan) return { quickWins: [], shortTerm: [], mediumTerm: [], longTerm: [] }

  const transform = (items: any[], deadlineLabel: string): ActionItem[] =>
    items.map(item => ({
      id: item.id,
      title: item.title,
      priority: item.priority,
      effort: item.effort,
      impact: item.impactScore || 0,
      deadline: deadlineLabel,
      category: item.category as Category,
    }))

  return {
    quickWins: transform(plan.quickWins, 'Cette semaine'),
    shortTerm: transform(plan.shortTerm, '1-2 semaines'),
    mediumTerm: transform(plan.mediumTerm, '1-3 mois'),
    longTerm: transform(plan.longTerm, '3-12 mois'),
  }
}

// ============= COMPONENTS =============

interface HealthGaugeProps {
  score: number
  maxScore?: number
  size?: 'sm' | 'md' | 'lg'
}

const HealthGauge: React.FC<HealthGaugeProps> = ({
  score,
  maxScore = 100,
  size = 'md',
}) => {
  const percentage = (score / maxScore) * 100
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 70) return 'from-blue-500 to-cyan-600'
    if (score >= 60) return 'from-yellow-500 to-amber-600'
    return 'from-red-500 to-rose-600'
  }

  const getGrade = () => {
    if (score >= 90) return 'A+'
    if (score >= 80) return 'A'
    if (score >= 70) return 'B'
    if (score >= 60) return 'C'
    return 'D'
  }

  const sizeMap = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  }

  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700"
        />
        <defs>
          <linearGradient id={`gradient-${score}`}>
            <stop
              offset="0%"
              stopColor={score >= 80 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 60 ? '#f59e0b' : '#ef4444'}
            />
            <stop
              offset="100%"
              stopColor={score >= 80 ? '#059669' : score >= 70 ? '#0891b2' : score >= 60 ? '#d97706' : '#dc2626'}
            />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={`url(#gradient-${score})`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={`text-3xl font-bold bg-gradient-to-r ${getColor()} bg-clip-text text-transparent`}
        >
          {score}
        </div>
        <div className="text-xs text-slate-400 font-semibold">/{maxScore}</div>
        <div className="text-lg font-bold text-slate-300 mt-1">{getGrade()}</div>
      </div>
    </div>
  )
}

interface CategoryScoreCardProps {
  category: CategoryScore
}

const CategoryScoreCard: React.FC<CategoryScoreCardProps> = ({ category }) => {
  const getStatusColor = () => {
    switch (category.status) {
      case 'excellent':
        return 'text-green-400'
      case 'bon':
        return 'text-emerald-400'
      case 'correct':
        return 'text-blue-400'
      case 'faible':
        return 'text-yellow-400'
      case 'critique':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const getStatusLabel = () => {
    switch (category.status) {
      case 'excellent':
        return 'Excellent'
      case 'bon':
        return 'Bon'
      case 'correct':
        return 'Correct'
      case 'faible':
        return 'Faible'
      case 'critique':
        return 'Critique'
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{category.label}</h3>
          <p className={`text-xs font-medium mt-1 ${getStatusColor()}`}>
            {getStatusLabel()}
          </p>
        </div>
        {category.change > 0 ? (
          <div className="flex items-center gap-1 text-green-400">
            <ArrowUpRight size={16} />
            <span className="text-xs font-medium">+{category.change}</span>
          </div>
        ) : category.change < 0 ? (
          <div className="flex items-center gap-1 text-red-400">
            <ArrowDownRight size={16} />
            <span className="text-xs font-medium">{category.change}</span>
          </div>
        ) : null}
      </div>

      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 ${
            category.score >= 80
              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
              : category.score >= 70
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                : category.score >= 60
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
                  : 'bg-gradient-to-r from-red-500 to-rose-600'
          }`}
          style={{ width: `${category.score}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-slate-100">{category.score}</span>
        <span className="text-xs text-slate-400">/100</span>
      </div>
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: Recommendation
  isExpanded: boolean
  onToggleExpand: (id: string) => void
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  isExpanded,
  onToggleExpand,
}) => {
  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'critique':
        return 'bg-red-900/30 border-red-700 text-red-200'
      case 'haute':
        return 'bg-orange-900/30 border-orange-700 text-orange-200'
      case 'moyenne':
        return 'bg-yellow-900/30 border-yellow-700 text-yellow-200'
      case 'basse':
        return 'bg-blue-900/30 border-blue-700 text-blue-200'
    }
  }

  const getPriorityLabel = () => {
    switch (recommendation.priority) {
      case 'critique':
        return 'Critique'
      case 'haute':
        return 'Haute'
      case 'moyenne':
        return 'Moyenne'
      case 'basse':
        return 'Basse'
    }
  }

  const getEffortColor = () => {
    switch (recommendation.effort) {
      case 'faible':
        return 'text-green-400'
      case 'moyen':
        return 'text-yellow-400'
      case 'eleve':
        return 'text-red-400'
    }
  }

  const getEffortLabel = () => {
    switch (recommendation.effort) {
      case 'faible':
        return 'Faible'
      case 'moyen':
        return 'Moyen'
      case 'eleve':
        return 'Eleve'
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors">
      <button
        onClick={() => onToggleExpand(recommendation.id)}
        className="w-full p-4 text-left hover:bg-slate-700/50 transition-colors flex items-start justify-between"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor()}`}
            >
              {getPriorityLabel()}
            </span>
            {recommendation.priority === 'critique' && (
              <AlertTriangle size={16} className="text-red-400" />
            )}
            {recommendation.priority === 'haute' && (
              <Flame size={16} className="text-orange-400" />
            )}
          </div>
          <h3 className="font-semibold text-slate-100 mb-1">
            {recommendation.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2">
            {recommendation.description}
          </p>
        </div>
        {isExpanded ? (
          <ChevronDown size={20} className="text-slate-400 ml-4 flex-shrink-0" />
        ) : (
          <ChevronRight size={20} className="text-slate-400 ml-4 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-700 px-4 py-4 bg-slate-700/30 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
              Description détaillée
            </h4>
            <p className="text-sm text-slate-300">{recommendation.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Impact estime</p>
              <p className="font-semibold text-green-400">{recommendation.impact}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Effort</p>
              <p className={`font-semibold ${getEffortColor()}`}>
                {getEffortLabel()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Temps estime</p>
              <p className="font-semibold text-blue-400">{recommendation.estimatedTime}</p>
            </div>
          </div>

          {recommendation.howTo && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Settings size={14} />
                Comment faire
              </h4>
              <div className="bg-slate-900/50 rounded p-3 text-sm text-slate-300 space-y-1 whitespace-pre-line">
                {recommendation.howTo}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ChecklistSectionProps {
  items: ChecklistItem[]
  onToggleDone: (id: string) => void
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ items, onToggleDone }) => {
  const [activeCategory, setActiveCategory] = useState<string>('technique')

  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(items.map(i => i.category)))
    return cats
  }, [items])

  const filteredItems = items.filter(item => item.category === activeCategory)
  const completedItems = filteredItems.filter(item => item.done).length
  const progress =
    filteredItems.length > 0 ? (completedItems / filteredItems.length) * 100 : 0

  const totalCompleted = items.filter(item => item.done).length
  const totalProgress = items.length > 0 ? (totalCompleted / items.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-100">Progression globale</h3>
          <span className="text-sm font-bold text-blue-400">
            {totalCompleted}/{items.length} items
          </span>
        </div>
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {Math.round(totalProgress)}% complete
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {availableCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {categoryLabelsMap[cat] || cat}
          </button>
        ))}
      </div>

      {/* Category progress */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">
            {categoryLabelsMap[activeCategory] || activeCategory}
          </span>
          <span className="text-xs font-bold text-slate-400">
            {completedItems}/{filteredItems.length}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`border rounded-lg p-4 transition-colors ${
              item.done
                ? 'bg-slate-700/40 border-slate-700/50'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => onToggleDone(item.id)}
                className="mt-1 flex-shrink-0"
              >
                {item.done ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  <Circle size={20} className="text-slate-500 hover:text-slate-400" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4
                    className={`font-medium ${
                      item.done
                        ? 'text-slate-500 line-through'
                        : 'text-slate-100'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.priority === 'critique'
                        ? 'bg-red-900/30 text-red-300'
                        : item.priority === 'haute'
                          ? 'bg-orange-900/30 text-orange-300'
                          : 'bg-yellow-900/30 text-yellow-300'
                    }`}
                  >
                    {item.priority.charAt(0).toUpperCase() +
                      item.priority.slice(1)}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    item.done ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {item.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {item.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award size={14} />
                    {item.impact} pts d&apos;impact
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ActionPlanTabProps {
  plans: Record<string, ActionItem[]>
}

const ActionPlanTab: React.FC<ActionPlanTabProps> = ({ plans }) => {
  const [activeTab, setActiveTab] = useState<
    'quickWins' | 'shortTerm' | 'mediumTerm' | 'longTerm'
  >('quickWins')

  const tabLabels = {
    quickWins: 'Quick Wins',
    shortTerm: 'Court terme (1-2 sem)',
    mediumTerm: 'Moyen terme (1-3 mois)',
    longTerm: 'Long terme (3-12 mois)',
  }

  const currentPlan = plans[activeTab] || []

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'critique':
        return <AlertTriangle size={16} className="text-red-400" />
      case 'haute':
        return <Flame size={16} className="text-orange-400" />
      case 'moyenne':
        return <AlertCircle size={16} className="text-yellow-400" />
      default:
        return <Circle size={16} className="text-blue-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-700">
        {(Object.keys(tabLabels) as Array<keyof typeof tabLabels>).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Actions list */}
      <div className="space-y-3">
        {currentPlan.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Aucune action pour cette periode</p>
          </div>
        ) : (
          currentPlan.map(action => (
            <div
              key={action.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {getPriorityIcon(action.priority)}
                  <div>
                    <h4 className="font-medium text-slate-100">
                      {action.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {categoryLabelsMap[action.category] || action.category}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Effort</p>
                  <p className="font-medium text-slate-200">
                    {action.effort === 'faible'
                      ? 'Faible'
                      : action.effort === 'moyen'
                        ? 'Moyen'
                        : 'Eleve'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Impact</p>
                  <p className="font-medium text-green-400">{action.impact}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Delai</p>
                  <p className="font-medium text-blue-400">{action.deadline}</p>
                </div>
                <div className="text-right">
                  <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-medium text-slate-200 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ============= LOADING SKELETON =============

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <Brain size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Conseiller IA Nexus</h1>
              <p className="text-sm text-slate-400 mt-1">Chargement de l&apos;analyse...</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <Loader2 size={48} className="text-blue-500 animate-spin mx-auto" />
            <p className="text-slate-400 text-lg">Analyse en cours...</p>
            <p className="text-slate-500 text-sm">
              Génération des recommandations personnalisées
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============= EMPTY STATE =============

function EmptyState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <Brain size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Conseiller IA Nexus</h1>
              <p className="text-sm text-slate-400 mt-1">
                Optimisation SEO intelligente et recommandations personnalisées
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-4 max-w-md">
            <AlertOctagon size={48} className="text-slate-500 mx-auto" />
            <h2 className="text-xl font-semibold text-slate-200">
              Aucune donnee disponible
            </h2>
            <p className="text-slate-400">{message}</p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Lancer un audit
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============= MAIN PAGE COMPONENT =============

export default function AIAdvisorPage() {
  const { selectedWebsite, isLoading: websiteLoading } = useWebsite()
  const [data, setData] = useState<AdvisorData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set())
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])

  // Fetch data from API
  useEffect(() => {
    if (!selectedWebsite?.id) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/ai-advisor?websiteId=${selectedWebsite.id}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
          throw new Error(err.error || `Erreur ${res.status}`)
        }
        const json = await res.json()
        setData(json)

        // Transform checklist for local state (toggle done)
        if (json.checklist) {
          setChecklist(transformChecklist(json.checklist))
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedWebsite?.id])

  const handleRefresh = async () => {
    if (!selectedWebsite?.id) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ai-advisor?websiteId=${selectedWebsite.id}`)
      if (!res.ok) throw new Error('Erreur lors du rafraichissement')
      const json = await res.json()
      setData(json)
      if (json.checklist) {
        setChecklist(transformChecklist(json.checklist))
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRecommendations)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRecommendations(newExpanded)
  }

  const handleToggleDone = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, done: !item.done } : item))
    )
  }

  // Plan gating - require at least explorer plan
  // Loading states
  if (websiteLoading || isLoading) {
    return <LoadingSkeleton />
  }

  // No website selected
  if (!selectedWebsite) {
    return (
      <EmptyState message="Sélectionnez un site web dans le menu pour commencer l'analyse." />
    )
  }

  // Error state
  if (error) {
    return (
      <EmptyState message={error} />
    )
  }

  // No data / empty audit
  if (!data || data.empty) {
    return (
      <EmptyState
        message={
          data?.message ||
          'Aucun audit disponible. Lancez un audit pour obtenir des recommandations personnalisées.'
        }
      />
    )
  }

  // Transform data for display
  const scoreBreakdown = data.scoreBreakdown!
  const overallScore = scoreBreakdown.totalScore
  const industryAverage = 68 // default benchmark
  const trend = scoreBreakdown.trend
  const categoryScores = transformCategoryScores(scoreBreakdown.categoryScores)
  const recommendations = transformRecommendations(data.recommendations || [])
  const actionPlans = transformActionPlan(data.actionPlan)
  const evolutionData = data.evolutionData || []

  const groupedRecommendations = recommendations.reduce(
    (acc, rec) => {
      if (!acc[rec.category]) {
        acc[rec.category] = []
      }
      acc[rec.category].push(rec)
      return acc
    },
    {} as Record<string, Recommendation[]>
  )

  // Build benchmark comparison data
  const benchmarkChartData = categoryScores.map(cat => ({
    name: cat.label,
    yours: cat.score,
    industry: (data.benchmarks as any)?.saas
      ? Math.round(
          ((data.benchmarks as any).saas[`avg${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}Score`] || 68)
        )
      : 68,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <Brain size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Conseiller IA Nexus
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {data.websiteDomain
                    ? `Analyse de ${data.websiteDomain}`
                    : 'Optimisation SEO intelligente et recommandations personnalisées'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Actualiser l&apos;analyse
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Section 1: Overall Health Score */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Gauge size={28} className="text-blue-400" />
            Etat de sante SEO
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main gauge */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center">
              <HealthGauge
                score={overallScore}
                maxScore={100}
                size="lg"
              />
              <div className="mt-6 text-center">
                <p className="text-slate-300 text-sm">Score global</p>
                <p className="text-slate-400 text-xs mt-2">
                  {trend === 'improving'
                    ? 'En amelioration'
                    : trend === 'stable'
                      ? 'Stable'
                      : 'En declin'}
                </p>
              </div>
            </div>

            {/* Comparison and stats */}
            <div className="lg:col-span-2 space-y-4">
              {/* Industry comparison */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="font-semibold text-slate-100 mb-4">
                  Comparaison secteur
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">Votre score</span>
                      <span className="font-bold text-blue-400">
                        {overallScore}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
                        style={{ width: `${overallScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">
                        Moyenne secteur
                      </span>
                      <span className="font-bold text-slate-400">
                        {industryAverage}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-600"
                        style={{ width: `${industryAverage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-sm text-slate-300">
                      {overallScore >= industryAverage ? (
                        <>
                          <span className="text-green-400 font-bold">
                            +{overallScore - industryAverage}
                          </span>{' '}
                          points au-dessus de la moyenne
                        </>
                      ) : (
                        <>
                          <span className="text-red-400 font-bold">
                            {overallScore - industryAverage}
                          </span>{' '}
                          points en dessous de la moyenne
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key metrics */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="font-semibold text-slate-100 mb-4">
                  Métriques clés
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded p-3">
                    <p className="text-xs text-slate-400">Tendance</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">
                      {trend === 'improving'
                        ? 'Amelioration'
                        : trend === 'stable'
                          ? 'Stable'
                          : 'Declin'}
                    </p>
                  </div>
                  <div className="bg-slate-700/50 rounded p-3">
                    <p className="text-xs text-slate-400">Percentile</p>
                    <p className="text-sm font-bold text-blue-400 mt-1">
                      {scoreBreakdown.benchmarkPercentile}e percentile
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Category Scores Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 size={28} className="text-emerald-400" />
            Scores par categorie
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryScores.map(category => (
              <CategoryScoreCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Section 3: Recommendations */}
        {recommendations.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Zap size={28} className="text-yellow-400" />
              Recommandations prioritaires
            </h2>

            <div className="space-y-8">
              {Object.entries(groupedRecommendations).map(([category, recs]) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full" />
                    {categoryLabelsMap[category] || category}
                  </h3>

                  <div className="space-y-3">
                    {recs.map(rec => (
                      <RecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        isExpanded={expandedRecommendations.has(rec.id)}
                        onToggleExpand={handleToggleExpand}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Checklist */}
        {checklist.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <CheckCircle2 size={28} className="text-green-400" />
              Liste de controle d&apos;optimisation
            </h2>

            <ChecklistSection items={checklist} onToggleDone={handleToggleDone} />
          </section>
        )}

        {/* Section 5: Action Plan */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target size={28} className="text-purple-400" />
            Plan d&apos;action
          </h2>

          <ActionPlanTab plans={actionPlans} />
        </section>

        {/* Section 6: Evolution Chart */}
        {evolutionData.length > 1 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp size={28} className="text-rose-400" />
              Evolution du score SEO
            </h2>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={evolutionData}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGoal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorActual)"
                    name="Score actuel"
                  />
                  <Area
                    type="monotone"
                    dataKey="goal"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorGoal)"
                    name="Objectif"
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="industry"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    name="Moyenne secteur"
                    strokeDasharray="3 3"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2">Gain estime</p>
                <p className="text-2xl font-bold text-green-400">
                  +{data.actionPlan?.estimatedScoreGain || 0} pts
                </p>
                <p className="text-xs text-slate-500 mt-1">Potentiel d&apos;amelioration</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2">Objectif</p>
                <p className="text-2xl font-bold text-blue-400">
                  {Math.min(100, overallScore + 20)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Score cible</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2">Temps estime</p>
                <p className="text-2xl font-bold text-purple-400">
                  {data.timeline?.monthsEstimate || '?'} mois
                </p>
                <p className="text-xs text-slate-500 mt-1">Pour atteindre l&apos;objectif</p>
              </div>
            </div>
          </section>
        )}

        {/* Section 7: Industry Benchmarks */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Award size={28} className="text-amber-400" />
            Comparaison secteur
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths and Weaknesses */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold text-slate-100 mb-4">
                Forces et faiblesses
              </h3>
              <div className="space-y-4">
                {scoreBreakdown.strengths.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Forces</p>
                    <div className="space-y-1">
                      {scoreBreakdown.strengths.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle2 size={14} />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {scoreBreakdown.weaknesses.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Faiblesses</p>
                    <div className="space-y-1">
                      {scoreBreakdown.weaknesses.map((w, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-red-400">
                          <AlertTriangle size={14} />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category comparison chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold text-slate-100 mb-4">
                Scores par categorie vs secteur
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={benchmarkChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" angle={-45} height={80} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="yours" fill="#3b82f6" name="Votre score" />
                  <Bar dataKey="industry" fill="#94a3b8" name="Moyenne secteur" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Section 8: Export & Actions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Download size={28} className="text-indigo-400" />
            Exporter
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Download size={18} />
              Exporter le plan d&apos;action (PDF)
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Download size={18} />
              Exporter la checklist (CSV)
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Download size={18} />
              Rapport complet (PDF)
            </button>
          </div>
        </section>

        {/* Footer */}
        <section className="border-t border-slate-800 pt-12">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Pret a optimiser votre SEO ?
            </h3>
            <p className="text-slate-300 mb-6">
              Commencez par les recommandations critiques pour des gains immediats
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105">
              Demarrer l&apos;optimisation
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
