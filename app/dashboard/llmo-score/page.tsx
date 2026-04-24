'use client'

import { useState } from 'react'
import { cn, getScoreColor } from '@/lib/utils'
import {
  Brain,
  Loader2,
  Send,
  Lightbulb,
  TrendingUp,
  Target,
  BarChart3,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useWebsite } from '@/contexts/WebsiteContext'

// ---- Types ----

interface QueryResult {
  query: string
  provider: string
  mentioned: boolean
  position: number | null
  sentiment: string
  competitors: string[]
  simulated: boolean
  responseSnippet: string
}

interface TopCompetitor {
  name: string
  mentions: number
}

interface LLMOResult {
  success: boolean
  overallScore: number
  mentionRate: number
  avgPosition: number | null
  sentimentScore: number
  competitivePosition: number
  queryResults: QueryResult[]
  topCompetitors: TopCompetitor[]
  recommendations: string[]
}

// ---- Constants ----

const PROVIDER_OPTIONS = [
  { value: 'chatgpt', label: 'ChatGPT', color: 'bg-green-500' },
  { value: 'claude', label: 'Claude', color: 'bg-amber-500' },
  { value: 'gemini', label: 'Gemini', color: 'bg-cyan-500' },
  { value: 'perplexity', label: 'Perplexity', color: 'bg-purple-500' },
]

// ---- Score Gauge ----

function ScoreGauge({ score, label, size = 160 }: { score: number; label: string; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const strokeColor =
    score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-surface-200 dark:text-surface-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-3xl font-bold', getScoreColor(score))}>{score}</span>
          <span className="text-xs font-medium text-white/50">{label}</span>
        </div>
      </div>
    </div>
  )
}

// ---- Metric Card ----

function MetricCard({
  icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  suffix?: string
  color: string
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('p-2 rounded-lg bg-gradient-to-br text-white', color)}>
          {icon}
        </div>
        <p className="text-sm font-medium text-white/50">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">
        {value}
        {suffix && <span className="text-sm text-surface-400 font-normal ml-1">{suffix}</span>}
      </p>
    </div>
  )
}

// ---- Sentiment helpers ----

function getSentimentLabel(sentiment: string) {
  switch (sentiment) {
    case 'positive': return 'Positif'
    case 'negative': return 'Negatif'
    default: return 'Neutre'
  }
}

function getSentimentBadge(sentiment: string) {
  switch (sentiment) {
    case 'positive': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
    case 'negative': return 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
    default: return 'bg-surface-200 dark:bg-surface-700 text-white/70 border border-surface-300 dark:border-surface-600'
  }
}

function getProviderLabel(provider: string) {
  return PROVIDER_OPTIONS.find((p) => p.value === provider)?.label || provider
}

function getProviderDot(provider: string) {
  return PROVIDER_OPTIONS.find((p) => p.value === provider)?.color || 'bg-surface-400'
}

// ---- Loading Skeleton ----

function LoadingSkeleton() {
  return (
    <div className="space-y-8 pb-8 animate-pulse">
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-8">
        <div className="h-40 w-40 mx-auto bg-surface-200 dark:bg-surface-700 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/5 bg-white/[0.02] p-6"
          >
            <div className="h-4 w-28 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
            <div className="h-8 w-20 bg-surface-200 dark:bg-surface-700 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
        <div className="h-5 w-40 bg-surface-200 dark:bg-surface-700 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface-200 dark:bg-surface-700 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Main Page ----

export default function LLMOScorePage() {
  const { selectedWebsite } = useWebsite()

  const [brand, setBrand] = useState('')
  const [domain, setDomain] = useState('')
  const [queriesText, setQueriesText] = useState('')
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['chatgpt', 'claude'])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LLMOResult | null>(null)
  const [formInitialized, setFormInitialized] = useState(false)

  // Pre-fill from website when available
  if (selectedWebsite && !formInitialized) {
    setBrand(selectedWebsite.name || selectedWebsite.domain)
    setDomain(selectedWebsite.domain)
    setFormInitialized(true)
  }

  if (!selectedWebsite) {
    return (
      <div className="space-y-8 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Score LLMO</h1>
          </div>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-12 text-center">
          <p className="text-surface-500">
            Veuillez selectionner un site web pour lancer l&apos;analyse LLMO.
          </p>
        </div>
      </div>
    )
  }

  const toggleProvider = (provider: string) => {
    setSelectedProviders((prev) =>
      prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const queries = queriesText
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean)

    if (queries.length === 0) {
      setError('Veuillez saisir au moins une requete.')
      return
    }
    if (queries.length > 5) {
      setError('Maximum 5 requetes autorisees.')
      return
    }
    if (selectedProviders.length === 0) {
      setError('Veuillez selectionner au moins un fournisseur LLM.')
      return
    }
    if (!brand.trim()) {
      setError('Veuillez saisir le nom de votre marque.')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/llmo-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand.trim(),
          domain: domain.trim() || selectedWebsite.domain,
          queries,
          providers: selectedProviders,
          websiteId: selectedWebsite.id,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(err.error || `Erreur ${res.status}`)
      }
      const data: LLMOResult = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Impossible de lancer l\'analyse LLMO')
    } finally {
      setIsLoading(false)
    }
  }

  // Max mentions for bar chart
  const maxMentions = result?.topCompetitors
    ? Math.max(...result.topCompetitors.map((c) => c.mentions), 1)
    : 1

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Score LLMO</h1>
        </div>
        <p className="text-white/50">
          Mesurez et optimisez la présence de votre marque dans les réponses des LLM (Large Language Model Optimization)
        </p>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Nom de la marque
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Votre marque"
                className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.03] text-sm outline-none text-white placeholder-surface-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Domaine
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder={selectedWebsite.domain}
                className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.03] text-sm outline-none text-white placeholder-surface-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Requetes a analyser <span className="text-surface-400 font-normal">(une par ligne, max 5)</span>
            </label>
            <textarea
              value={queriesText}
              onChange={(e) => setQueriesText(e.target.value)}
              placeholder={"meilleur outil SEO\ncomment optimiser son référencement\noutil analyse de backlinks"}
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.03] text-sm outline-none text-white placeholder-surface-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Fournisseurs LLM
            </label>
            <div className="flex flex-wrap gap-3">
              {PROVIDER_OPTIONS.map((provider) => {
                const isSelected = selectedProviders.includes(provider.value)
                return (
                  <button
                    key={provider.value}
                    type="button"
                    onClick={() => toggleProvider(provider.value)}
                    disabled={isLoading}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                        : 'border-white/5 bg-white/[0.03] text-white/50 hover:border-surface-300 dark:hover:border-surface-600'
                    )}
                  >
                    <span className={cn('w-2.5 h-2.5 rounded-full', provider.color)} />
                    {provider.label}
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all',
              isLoading
                ? 'bg-surface-200 dark:bg-surface-700 text-surface-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:from-purple-600 hover:to-purple-700'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Lancer l&apos;analyse LLMO
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && <LoadingSkeleton />}

      {/* Results */}
      {result && !isLoading && (
        <>
          {/* Overall Score */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-8">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-white">
                Score LLMO global
              </h2>
            </div>
            <ScoreGauge score={result.overallScore} label="LLMO" size={180} />
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={<Eye className="h-5 w-5" />}
              label="Taux de mention"
              value={Math.round(result.mentionRate)}
              suffix="%"
              color="from-emerald-500 to-emerald-600"
            />
            <MetricCard
              icon={<Target className="h-5 w-5" />}
              label="Position moyenne"
              value={result.avgPosition != null ? result.avgPosition.toFixed(1) : 'N/A'}
              color="from-blue-500 to-blue-600"
            />
            <MetricCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Score sentiment"
              value={Math.round(result.sentimentScore)}
              suffix="/100"
              color="from-amber-500 to-amber-600"
            />
            <MetricCard
              icon={<BarChart3 className="h-5 w-5" />}
              label="Position competitive"
              value={Math.round(result.competitivePosition)}
              suffix="/100"
              color="from-purple-500 to-purple-600"
            />
          </div>

          {/* Query Results Table */}
          <div className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">
                Resultats par requete
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-100 dark:bg-surface-800/50">
                    <th className="text-left px-5 py-3 font-medium text-white/50">
                      Requete
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-white/50">
                      Fournisseur
                    </th>
                    <th className="text-center px-5 py-3 font-medium text-white/50">
                      Mentionne
                    </th>
                    <th className="text-center px-5 py-3 font-medium text-white/50">
                      Position
                    </th>
                    <th className="text-center px-5 py-3 font-medium text-white/50">
                      Sentiment
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                  {result.queryResults.map((qr, i) => (
                    <tr key={i} className="hover:bg-surface-100/50 dark:hover:bg-surface-800/30 transition-colors">
                      <td className="px-5 py-3 text-white max-w-xs truncate">
                        {qr.query}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn('w-2 h-2 rounded-full', getProviderDot(qr.provider))} />
                          <span className="text-white/70">
                            {getProviderLabel(qr.provider)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {qr.mentioned ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-5 py-3 text-center text-white/70">
                        {qr.position != null ? `#${qr.position}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-medium', getSentimentBadge(qr.sentiment))}>
                          {getSentimentLabel(qr.sentiment)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Competitors */}
          {result.topCompetitors && result.topCompetitors.length > 0 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
              <h2 className="text-lg font-bold text-white mb-4">
                Principaux concurrents mentionnes
              </h2>
              <div className="space-y-3">
                {result.topCompetitors.map((comp, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-white/70 w-32 truncate">
                      {comp.name}
                    </span>
                    <div className="flex-1 h-6 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-700"
                        style={{ width: `${(comp.mentions / maxMentions) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-white w-12 text-right">
                      {comp.mentions}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-white">
                  Recommandations
                </h2>
              </div>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/70">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
