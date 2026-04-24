'use client'

import { useState, useEffect } from 'react'
import { cn, getScoreColor } from '@/lib/utils'
import {
  FileSearch,
  Loader2,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Mic,
  MessageSquare,
  LayoutList,
  Zap,
} from 'lucide-react'
import { useWebsite } from '@/contexts/WebsiteContext'
import { UrlInput } from '@/components/shared/UrlInput'

// ---- Types ----

interface AEOCheck {
  name: string
  passed: boolean
  score: number
  maxScore: number
  details: string
}

interface AEOCategory {
  score: number
  checks: AEOCheck[]
}

interface AEOResult {
  success: boolean
  url: string
  overallScore: number
  grade: string
  snippetReadiness: AEOCategory
  qaPatterns: AEOCategory
  voiceReadiness: AEOCategory
  contentStructure: AEOCategory
  recommendations: string[]
}

// ---- Score Gauge ----

function ScoreGauge({ score, grade, size = 160 }: { score: number; grade: string; size?: number }) {
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
          <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{grade}</span>
        </div>
      </div>
    </div>
  )
}

// ---- Category Card ----

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  snippetReadiness: {
    label: 'Snippet Readiness',
    icon: <Zap className="h-5 w-5" />,
    color: 'from-indigo-500 to-indigo-600',
  },
  qaPatterns: {
    label: 'Q&A Patterns',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'from-brand-500 to-brand-600',
  },
  voiceReadiness: {
    label: 'Voice Readiness',
    icon: <Mic className="h-5 w-5" />,
    color: 'from-purple-500 to-purple-600',
  },
  contentStructure: {
    label: 'Content Structure',
    icon: <LayoutList className="h-5 w-5" />,
    color: 'from-cyan-500 to-cyan-600',
  },
}

function CategoryCard({
  categoryKey,
  category,
}: {
  categoryKey: string
  category: AEOCategory
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = CATEGORY_META[categoryKey]
  if (!meta) return null

  return (
    <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-gradient-to-br text-white', meta.color)}>
            {meta.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{meta.label}</p>
            <p className={cn('text-2xl font-bold', getScoreColor(category.score))}>
              {category.score}<span className="text-sm text-surface-400 font-normal">/100</span>
            </p>
          </div>
        </div>
        <span className="text-surface-400 text-sm">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="border-t border-surface-200 dark:border-surface-800 px-5 py-4 space-y-3">
          {category.checks.map((check, i) => (
            <div key={i} className="flex items-start gap-3">
              {check.passed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                    {check.name}
                  </p>
                  <span className="text-xs text-surface-500 whitespace-nowrap">
                    {check.score}/{check.maxScore}
                  </span>
                </div>
                {check.details && (
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                    {check.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Loading Skeleton ----

function LoadingSkeleton() {
  return (
    <div className="space-y-8 pb-8 animate-pulse">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-200 dark:bg-surface-800 rounded" />
          <div className="h-4 w-72 bg-surface-200 dark:bg-surface-800 rounded" />
        </div>
      </div>
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6">
        <div className="h-40 w-40 mx-auto bg-surface-200 dark:bg-surface-700 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6"
          >
            <div className="h-4 w-32 bg-surface-200 dark:bg-surface-700 rounded mb-3" />
            <div className="h-8 w-20 bg-surface-200 dark:bg-surface-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Main Page ----

export default function AEOScorePage() {
  const { selectedWebsite } = useWebsite()

  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AEOResult | null>(null)

  // Pre-fill URL from selected website
  useEffect(() => {
    if (selectedWebsite?.domain && !url) {
      setUrl(`https://${selectedWebsite.domain}`)
    }
  }, [selectedWebsite])

  // Auto-load latest scan results
  useEffect(() => {
    if (!selectedWebsite?.id || result) return

    let cancelled = false

    async function loadLatestScan() {
      try {
        const statsRes = await fetch(`/api/dashboard/stats?websiteId=${selectedWebsite!.id}`)
        if (!statsRes.ok) return
        const stats = await statsRes.json()
        if (!stats.latestScanId) return

        const scanRes = await fetch(`/api/scan/${stats.latestScanId}`)
        if (!scanRes.ok) return
        const scan = await scanRes.json()

        const scanData = scan.data || scan
        const results = typeof scanData.results === 'string' ? JSON.parse(scanData.results) : scanData.results
        const aeo = results?.aeo
        if (!aeo || cancelled) return

        setResult({
          success: true,
          url: scan.url || `https://${selectedWebsite!.domain}`,
          overallScore: aeo.overallScore ?? 0,
          grade: aeo.grade ?? 'N/A',
          snippetReadiness: aeo.snippetReadiness ?? { score: 0, checks: [] },
          qaPatterns: aeo.qaPatterns ?? { score: 0, checks: [] },
          voiceReadiness: aeo.voiceReadiness ?? { score: 0, checks: [] },
          contentStructure: aeo.contentStructure ?? { score: 0, checks: [] },
          recommendations: aeo.recommendations ?? [],
        })
      } catch {
        // Silent fail — user can still trigger manual analysis
      }
    }

    loadLatestScan()
    return () => { cancelled = true }
  }, [selectedWebsite?.id])

  if (!selectedWebsite) {
    return (
      <div className="space-y-8 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg">
              <FileSearch className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-surface-950 dark:text-surface-50">Score AEO</h1>
          </div>
        </div>
        <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-12 text-center">
          <p className="text-surface-500">
            Veuillez selectionner un site web pour analyser le score AEO.
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    const targetUrl = url.trim() || `https://${selectedWebsite.domain}`
    if (!targetUrl) return

    setIsLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/aeo-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(err.error || `Erreur ${res.status}`)
      }
      const data: AEOResult = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Impossible d\'analyser cette URL')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg">
            <FileSearch className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-surface-950 dark:text-surface-50">Score AEO</h1>
        </div>
        <p className="text-surface-600 dark:text-surface-400">
          Analysez la préparation de vos pages pour les moteurs de réponses IA (Answer Engine Optimization)
        </p>
      </div>

      {/* URL Input Form */}
      <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6">
        <UrlInput
          value={url}
          onChange={setUrl}
          onSubmit={handleSubmit}
          loading={isLoading}
          submitLabel="Analyser AEO"
        />
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
          <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-8">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50 mb-1">
                Score AEO global
              </h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 break-all">
                {result.url}
              </p>
            </div>
            <ScoreGauge score={result.overallScore} grade={result.grade} size={180} />
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['snippetReadiness', 'qaPatterns', 'voiceReadiness', 'contentStructure'] as const).map(
              (key) => (
                <CategoryCard key={key} categoryKey={key} category={result[key]} />
              )
            )}
          </div>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-surface-900 dark:text-surface-50">
                  Recommandations
                </h2>
              </div>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-surface-700 dark:text-surface-300">{rec}</p>
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
