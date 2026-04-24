'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn, formatNumber, getScoreColor } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  Calendar,
  Loader2,
  Send,
  RefreshCw,
} from 'lucide-react'
import { useWebsite } from '@/contexts/WebsiteContext'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// ---- Types ----

interface AIVisibilityData {
  overallMentionRate: number
  totalQueries: number
  mentionedQueries: number
  mentionsByLlm: Record<string, number>
  sentimentBreakdown: { positive: number; neutral: number; negative: number }
  recentQueries: RecentQuery[]
  trends: TrendPoint[]
}

interface RecentQuery {
  id: string
  prompt: string
  llm: string
  mentioned: boolean
  position: number | null
  sentiment: string | null
  date: string
}

interface TrendPoint {
  date: string
  mentionRate: number
}

// ---- Period mapping ----

const PERIOD_MAP: Record<string, string> = {
  '7j': '7d',
  '30j': '30d',
  '90j': '90d',
  '6m': '180d',
  '12m': '365d',
}

// ---- Data fetching hook ----

function useAIVisibilityData(websiteId: string | undefined, period: string) {
  const [data, setData] = useState<AIVisibilityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!websiteId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const apiPeriod = PERIOD_MAP[period] || '30d'
      const res = await fetch(`/api/ai-visibility?websiteId=${websiteId}&period=${apiPeriod}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(err.error || `Erreur ${res.status}`)
      }
      const json: AIVisibilityData = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les données')
    } finally {
      setIsLoading(false)
    }
  }, [websiteId, period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

// ---- Helpers ----

const LLM_OPTIONS = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'gemini', label: 'Gemini' },
]

const LLM_META: Record<string, { label: string; color: string; dotClass: string; badgeClass: string }> = {
  chatgpt: {
    label: 'ChatGPT',
    color: '#22c55e',
    dotClass: 'bg-green-500',
    badgeClass: 'bg-green-100 text-green-700 border border-green-200',
  },
  perplexity: {
    label: 'Perplexity',
    color: '#a855f7',
    dotClass: 'bg-purple-500',
    badgeClass: 'bg-purple-100 text-purple-700 border border-purple-200',
  },
  claude: {
    label: 'Claude',
    color: '#f59e0b',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  gemini: {
    label: 'Gemini',
    color: '#06b6d4',
    dotClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
}

function getSentimentLabel(sentiment: string | null): { label: string; icon: string } {
  switch (sentiment) {
    case 'positive':
      return { label: 'Positif', icon: '\ud83d\udc4d' }
    case 'negative':
      return { label: 'Negatif', icon: '\ud83d\udc4e' }
    case 'neutral':
    default:
      return { label: 'Neutre', icon: '\u2192' }
  }
}

function getSentimentBadgeColor(sentiment: string | null) {
  switch (sentiment) {
    case 'positive':
      return 'bg-accent-500/20 text-accent-700 border border-accent-200'
    case 'negative':
      return 'bg-red-100 text-red-700 border border-red-200'
    case 'neutral':
    default:
      return 'bg-surface-200 text-surface-700 border border-surface-300'
  }
}

function formatRelativeDate(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr })
  } catch {
    return dateStr
  }
}

// AI recommendations (static, not from API)
const recommendations = [
  {
    priority: 'HIGH' as const,
    title: 'Creer du contenu FAQ structure pour augmenter vos citations dans ChatGPT',
    description:
      'ChatGPT cite souvent les FAQs structurées. Ciblez les 20 questions les plus fréquentes de votre audience.',
  },
  {
    priority: 'HIGH' as const,
    title: 'Ajouter des données structurées Schema.org sur vos pages clés',
    description:
      'Les LLM utilisent davantage les pages avec Schema.org. Commencez par Product, Article, et FAQPage.',
  },
  {
    priority: 'MEDIUM' as const,
    title: "Publier des études de cas avec des données chiffrées",
    description:
      'Les LLM adorent les statistiques concrètes. Créez 3 études de cas détaillées avec résultats mesurables.',
  },
  {
    priority: 'LOW' as const,
    title: 'Optimiser vos titres H1 pour repondre directement aux questions utilisateurs',
    description:
      'Structurez vos H1 sous forme de questions. Les LLM citent davantage les titres informatifs.',
  },
]

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-500/10 text-red-700 border-red-200'
    case 'MEDIUM':
      return 'bg-orange-500/10 text-orange-700 border-orange-200'
    case 'LOW':
      return 'bg-blue-500/10 text-blue-700 border-blue-200'
    default:
      return 'bg-surface-200 text-surface-700'
  }
}

// ---- Loading Skeleton ----

function LoadingSkeleton() {
  return (
    <div className="space-y-8 pb-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-200 dark:bg-surface-800 rounded" />
          <div className="h-4 w-72 bg-surface-200 dark:bg-surface-800 rounded" />
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/5 bg-white/[0.02] p-6"
          >
            <div className="h-4 w-24 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
            <div className="h-8 w-16 bg-surface-200 dark:bg-surface-700 rounded" />
          </div>
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
        <div className="h-5 w-48 bg-surface-200 dark:bg-surface-700 rounded mb-6" />
        <div className="h-[350px] bg-surface-200 dark:bg-surface-800 rounded" />
      </div>
    </div>
  )
}

// ---- Empty State ----

function EmptyState({ onNewQuery }: { onNewQuery?: () => void }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-12 text-center">
      <Sparkles className="h-12 w-12 text-surface-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">
        Aucune donnée disponible
      </h3>
      <p className="text-sm text-surface-500 mb-6 max-w-md mx-auto">
        Lancez votre première requête pour découvrir comment votre site est mentionné par les IA génératives.
      </p>
      {onNewQuery && (
        <button
          onClick={onNewQuery}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium hover:shadow-lg hover:from-brand-600 hover:to-brand-700 transition-all"
        >
          Lancer une analyse
        </button>
      )}
    </div>
  )
}

// ---- New Query Form ----

function NewQueryForm({
  websiteId,
  onSuccess,
}: {
  websiteId: string
  onSuccess: () => void
}) {
  const [prompt, setPrompt] = useState('')
  const [llm, setLlm] = useState('chatgpt')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/ai-visibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId, prompt: prompt.trim(), llm }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(err.error || `Erreur ${res.status}`)
      }
      setPrompt('')
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Impossible de soumettre la requête')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        Nouvelle requête
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            Requete / Prompt
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: meilleur outil SEO 2026"
            className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.03] text-sm outline-none text-white placeholder-surface-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            LLM cible
          </label>
          <select
            value={llm}
            onChange={(e) => setLlm(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.03] text-sm outline-none text-white cursor-pointer focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            disabled={isSubmitting}
          >
            {LLM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !prompt.trim()}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
            isSubmitting || !prompt.trim()
              ? 'bg-surface-200 dark:bg-surface-700 text-surface-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:from-brand-600 hover:to-brand-700'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Analyser
            </>
          )}
        </button>
      </form>
    </div>
  )
}

// ---- Main Page ----

export default function AIVisibilityPage() {
  const { selectedWebsite } = useWebsite()
  const [timeRange, setTimeRange] = useState('30j')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')

  const { data, isLoading, error, refetch } = useAIVisibilityData(
    selectedWebsite?.id,
    timeRange
  )

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!selectedWebsite) {
    return (
      <div className="space-y-8 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-surface-950 dark:text-surface-50">Visibilite IA</h1>
          </div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-12 text-center">
          <p className="text-surface-500">
            Veuillez sélectionner un site web pour afficher les données de visibilité IA.
          </p>
        </div>
      </div>
    )
  }

  // Derive display data from API response
  const totalQueries = data?.totalQueries ?? 0
  const mentionedCount = data?.mentionedQueries ?? 0
  const mentionRate = data?.overallMentionRate ?? 0
  const sentiment = data?.sentimentBreakdown ?? { positive: 0, neutral: 0, negative: 0 }
  const sentimentTotal = sentiment.positive + sentiment.neutral + sentiment.negative
  const positivePercent = sentimentTotal > 0 ? Math.round((sentiment.positive / sentimentTotal) * 100) : 0

  // LLM scores from mentionsByLlm
  const mentionsByLlm = data?.mentionsByLlm ?? {}
  const llmScores = Object.entries(LLM_META).map(([key, meta]) => {
    const mentions = mentionsByLlm[key] ?? 0
    const score = totalQueries > 0 ? Math.round((mentions / totalQueries) * 100) : 0
    return { key, ...meta, mentions, score }
  })

  // Chart data from trends
  const chartData = (data?.trends ?? []).map((t) => ({
    date: new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    mentionRate: Math.round(t.mentionRate * 100) / 100,
  }))

  // Queries table
  const recentQueries = data?.recentQueries ?? []
  const filteredQueries = recentQueries.filter(
    (q) =>
      q.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.llm.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const sortedQueries = [...filteredQueries].sort((a, b) => {
    if (sortBy === 'position') {
      if (!a.position) return 1
      if (!b.position) return -1
      return a.position - b.position
    }
    return 0 // default sort is by date (already sorted from API)
  })

  const hasData = totalQueries > 0

  // Count distinct LLMs with data
  const activeLlms = Object.values(mentionsByLlm).filter((v) => v > 0).length

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-surface-950 dark:text-surface-50">Visibilite IA</h1>
          </div>
          <p className="text-white/50">
            Surveillez et optimisez votre présence dans les réponses des moteurs IA
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
            <Calendar className="h-4 w-4 text-surface-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer"
            >
              <option value="7j">7 derniers jours</option>
              <option value="30j">30 derniers jours</option>
              <option value="90j">90 derniers jours</option>
              <option value="6m">6 derniers mois</option>
              <option value="12m">12 derniers mois</option>
            </select>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium hover:shadow-lg hover:from-brand-600 hover:to-brand-700 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {!hasData && !error ? (
        <EmptyState onNewQuery={() => {
          // Scroll to the new query form area (it's in the sidebar)
          document.getElementById('new-query-form')?.scrollIntoView({ behavior: 'smooth' })
        }} />
      ) : null}

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mention Rate Card */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <p className="text-sm font-medium text-white/50">Taux de mention</p>
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-surface-200 dark:text-surface-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${(mentionRate / 100) * 282.7} 282.7`}
                    strokeLinecap="round"
                    className="text-brand-500 transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {Math.round(mentionRate)}
                    </p>
                    <p className="text-xs text-surface-500">%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Queries Card */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/50">Requetes analysees</p>
            <p className="text-3xl font-bold text-white">
              {formatNumber(totalQueries)}
            </p>
            <p className="text-xs text-surface-500">
              {mentionedCount} mention{mentionedCount !== 1 ? 's' : ''} trouvée{mentionedCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Positive Sentiment Card */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/50">Sentiment Positif</p>
            <p className="text-3xl font-bold text-white">{positivePercent}%</p>
            <div className="w-full h-1.5 rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden" role="progressbar" aria-label="Sentiment Positif" aria-valuenow={positivePercent} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full bg-gradient-to-r from-accent-500 to-accent-600 rounded-full transition-all"
                style={{ width: `${positivePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* LLM Coverage Card */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6 hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <p className="text-sm font-medium text-white/50">LLM Couverts</p>
            <p className="text-3xl font-bold text-white">
              {activeLlms}/{Object.keys(LLM_META).length}
            </p>
            <div className="flex gap-1.5">
              {Object.entries(LLM_META).map(([key, meta]) => (
                <div
                  key={key}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    (mentionsByLlm[key] ?? 0) > 0 ? meta.dotClass : 'bg-surface-300 dark:bg-surface-600'
                  )}
                  title={meta.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evolution Chart Section */}
          {chartData.length > 0 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Évolution de la visibilité
                  </h2>
                  <p className="text-xs text-surface-500 mt-1">
                    Taux de mention au fil du temps
                  </p>
                </div>
                <div className="flex gap-2">
                  {['7j', '30j', '90j', '6m', '12m'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={cn(
                        'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                        timeRange === range
                          ? 'bg-brand-500 text-white'
                          : 'bg-surface-200 dark:bg-surface-800 text-white/70 hover:bg-surface-300 dark:hover:bg-surface-700'
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMentionRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-surface-200 dark:text-surface-700"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="currentColor"
                    className="text-white/50"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-white/50"
                    style={{ fontSize: '12px' }}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(255, 255, 255)',
                      border: '1px solid rgb(229, 229, 229)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: '#000' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taux de mention']}
                  />
                  <Area
                    type="monotone"
                    dataKey="mentionRate"
                    stroke="#6366f1"
                    fill="url(#colorMentionRate)"
                    name="Taux de mention"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Queries Table Section */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6 overflow-hidden">
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  Requetes recentes
                </h2>
                <span className="text-xs text-surface-500 bg-surface-200 dark:bg-surface-800 px-2.5 py-1 rounded-full font-medium">
                  {sortedQueries.length} requête{sortedQueries.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search and Filter Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.03]">
                  <Search className="h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une requête..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Rechercher une requête"
                    className="flex-1 bg-transparent text-sm outline-none text-white placeholder-surface-400"
                  />
                </div>
                <button className="p-2.5 rounded-lg border border-white/5 hover:bg-white/[0.03] transition-colors">
                  <Filter className="h-4 w-4 text-white/50" />
                </button>
              </div>
            </div>

            {/* Table */}
            {sortedQueries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left py-3 px-4 font-semibold text-white">
                        Requete
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-white">
                        LLM
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-white">
                        Mentionne
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-white">
                        Position
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-white">
                        Sentiment
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-white">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                    {sortedQueries.map((query) => {
                      const llmMeta = LLM_META[query.llm.toLowerCase()] ?? {
                        label: query.llm,
                        badgeClass: 'bg-surface-200 text-surface-700',
                      }
                      const sentimentInfo = getSentimentLabel(query.sentiment)
                      return (
                        <tr
                          key={query.id}
                          className="hover:bg-white/[0.03]/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium text-brand-600 dark:text-brand-400">
                              {query.prompt}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                                llmMeta.badgeClass
                              )}
                            >
                              {llmMeta.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {query.mentioned ? (
                              <span className="inline-flex items-center gap-1 text-accent-600 dark:text-accent-500 font-medium text-xs">
                                Oui
                              </span>
                            ) : (
                              <span className="text-surface-400 text-xs">Non</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {query.position != null ? (
                              <span className="font-semibold text-white">
                                #{query.position}
                              </span>
                            ) : (
                              <span className="text-surface-400">&mdash;</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {query.sentiment ? (
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                                  getSentimentBadgeColor(query.sentiment)
                                )}
                              >
                                {sentimentInfo.icon} {sentimentInfo.label}
                              </span>
                            ) : (
                              <span className="text-surface-400">&mdash;</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-surface-500">
                            {formatRelativeDate(query.date)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-surface-500 text-center py-8">
                Aucune requête trouvée.
              </p>
            )}
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* New Query Form */}
          <div id="new-query-form">
            <NewQueryForm websiteId={selectedWebsite.id} onSuccess={refetch} />
          </div>

          {/* Score par LLM */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Mentions par LLM
            </h3>
            <div className="space-y-4">
              {llmScores.map((llm) => (
                <div key={llm.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2.5 h-2.5 rounded-full', llm.dotClass)} />
                      <span className="font-medium text-white">
                        {llm.label}
                      </span>
                    </div>
                    <span className="text-sm text-white/50">
                      {llm.mentions} mention{llm.mentions !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', llm.dotClass)}
                      style={{ width: `${Math.min(llm.score, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment breakdown */}
          {sentimentTotal > 0 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Repartition des sentiments
              </h3>
              <div className="space-y-3">
                {[
                  { key: 'positive', label: 'Positif', color: 'bg-accent-500', count: sentiment.positive },
                  { key: 'neutral', label: 'Neutre', color: 'bg-surface-400', count: sentiment.neutral },
                  { key: 'negative', label: 'Negatif', color: 'bg-red-500', count: sentiment.negative },
                ].map((s) => {
                  const pct = sentimentTotal > 0 ? Math.round((s.count / sentimentTotal) * 100) : 0
                  return (
                    <div key={s.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{s.label}</span>
                        <span className="font-medium text-white">
                          {pct}% ({s.count})
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden" role="progressbar" aria-label={s.label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                        <div
                          className={cn('h-full rounded-full transition-all', s.color)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Recommandations IA
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-white/5 bg-white/[0.03]/50 p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold border',
                        getPriorityColor(rec.priority)
                      )}
                    >
                      {rec.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white leading-tight">
                        {rec.title}
                      </p>
                      <p className="text-xs text-white/50 mt-1.5 leading-snug">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
