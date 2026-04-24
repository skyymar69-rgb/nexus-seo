'use client'

import { useState, useEffect } from 'react'
import {
  Zap, AlertCircle, TrendingUp, Download, Share2, Loader2, Globe, BarChart3,
  ArrowUpRight, ArrowDownRight, Gauge, Activity, Smartphone, Monitor, TrendingDown, CheckCircle
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { useWebsite } from '@/contexts/WebsiteContext'
import { UrlInput } from '@/components/shared/UrlInput'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'

// Types
interface CoreWebVital {
  value: number
  unit: string
  rating: 'good' | 'needs-improvement' | 'poor'
  threshold: { good: number; needsImprovement: number }
  trend: number
}

interface PerformanceData {
  url: string
  score: number
  grade: string
  device: 'mobile' | 'desktop'
  timestamp: string
  coreWebVitals: {
    lcp: CoreWebVital
    inp: CoreWebVital
    cls: CoreWebVital
    fcp: CoreWebVital
    ttfb: CoreWebVital
    tbt: CoreWebVital
  }
  resources: {
    scripts: { size: number; loadTime: number; blocking: boolean }[]
    stylesheets: { size: number; loadTime: number; blocking: boolean }[]
    images: { size: number; loadTime: number; blocking: boolean }[]
    fonts: { size: number; loadTime: number; blocking: boolean }[]
    other: { size: number; loadTime: number; blocking: boolean }[]
    totalSize: number
  }
  opportunities: Array<{
    title: string
    description: string
    savings: { value: number; unit: string }
    severity: 'high' | 'medium' | 'low'
  }>
  diagnostics: Array<{
    title: string
    description: string
    severity: 'high' | 'medium' | 'low'
  }>
  competitors: Array<{
    name: string
    score: number
    lcp: number
    inp: number
    cls: number
  }>
}

interface HistoryPoint {
  date: string
  lcp: number
  inp: number
  cls: number
  fcp: number
  ttfb: number
  tbt: number
}

// Utility functions
function getRatingInfo(rating: string) {
  if (rating === 'good') return { label: 'Bon', color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' }
  if (rating === 'needs-improvement') return { label: 'À améliorer', color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' }
  return { label: 'Faible', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' }
}

function getScoreInfo(score: number) {
  if (score >= 90) return { label: 'Excellent', color: 'text-green-500', bgColor: 'bg-green-500' }
  if (score >= 70) return { label: 'Bon', color: 'text-emerald-500', bgColor: 'bg-emerald-500' }
  if (score >= 50) return { label: 'À améliorer', color: 'text-amber-500', bgColor: 'bg-amber-500' }
  return { label: 'Faible', color: 'text-red-500', bgColor: 'bg-red-500' }
}

function getSeverityColor(severity: string) {
  if (severity === 'high') return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
  if (severity === 'medium') return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
  return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
}

// Overall Performance Gauge Component
function PerformanceGauge({ score, grade }: { score: number; grade: string }) {
  const circumference = 2 * Math.PI * 60
  const offset = circumference - (score / 100) * circumference
  const info = getScoreInfo(score)

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-56 h-56">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="33%" stopColor="#f59e0b" />
              <stop offset="66%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="10" className="text-white/10" />
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-white">{score}</div>
          <div className="text-sm text-white/50 mt-2">Grade {grade}</div>
        </div>
      </div>
      <div className={cn('text-lg font-semibold px-4 py-2 rounded-full', info.color)}>{info.label}</div>
    </div>
  )
}

// Core Web Vital Card Component
function VitalCard({
  label,
  value,
  unit,
  status,
  threshold,
  trend,
}: {
  label: string
  value: number
  unit: string
  status: 'good' | 'needs-improvement' | 'poor'
  threshold: { good: number; needsImprovement: number }
  trend: number
}) {
  const ratingInfo = getRatingInfo(status)
  const displayValue = value < 10 ? value.toFixed(2) : Math.round(value)
  const trendIsPositive = trend < 0

  return (
    <div className={cn('rounded-lg p-6 border transition-all', ratingInfo.bgColor, ratingInfo.borderColor)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-white/50 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">
            {displayValue}
            <span className="text-lg font-normal text-white/40 ml-1">{unit}</span>
          </p>
        </div>
        <div className={cn('px-3 py-1.5 rounded-full text-xs font-semibold', ratingInfo.color, ratingInfo.bgColor)}>
          {ratingInfo.label}
        </div>
      </div>

      <div className="space-y-2 text-xs text-white/50 mb-3 pt-3 border-t border-white/5">
        <div className="flex justify-between">
          <span>Bon: &lt; {threshold.good}{unit}</span>
          <span>À améliorer: &lt; {threshold.needsImprovement}{unit}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs font-medium">
        {trendIsPositive ? (
          <ArrowDownRight className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowUpRight className="w-4 h-4 text-red-500" />
        )}
        <span className={trendIsPositive ? 'text-green-400' : 'text-red-400'}>
          {Math.abs(trend)}% {trendIsPositive ? 'amélioration' : 'dégradation'}
        </span>
      </div>
    </div>
  )
}

// Resource Table Component
function ResourceTable({ resources }: { resources: PerformanceData['resources'] }) {
  const allResources = [
    ...resources.scripts.map(r => ({ ...r, type: 'JS', typeLabel: 'JavaScript' })),
    ...resources.stylesheets.map(r => ({ ...r, type: 'CSS', typeLabel: 'Feuille de style' })),
    ...resources.images.map(r => ({ ...r, type: 'Image', typeLabel: 'Image' })),
    ...resources.fonts.map(r => ({ ...r, type: 'Font', typeLabel: 'Police' })),
    ...resources.other.map(r => ({ ...r, type: 'Autre', typeLabel: 'Autre' })),
  ].sort((a, b) => b.size - a.size).slice(0, 10)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-3 px-4 font-semibold text-white/70">Type</th>
            <th className="text-right py-3 px-4 font-semibold text-white/70">Taille</th>
            <th className="text-right py-3 px-4 font-semibold text-white/70">Temps chargement</th>
            <th className="text-center py-3 px-4 font-semibold text-white/70">Bloquant</th>
          </tr>
        </thead>
        <tbody>
          {allResources.map((resource, idx) => (
            <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
              <td className="py-3 px-4 font-medium text-white">{resource.typeLabel}</td>
              <td className="text-right py-3 px-4 text-white/50">{(resource.size / 1024).toFixed(1)} KB</td>
              <td className="text-right py-3 px-4 text-white/50">{Math.round(resource.loadTime)}ms</td>
              <td className="text-center py-3 px-4">
                {resource.blocking ? (
                  <span className="inline-flex items-center gap-1 text-red-400">
                    <AlertCircle className="w-4 h-4" /> Oui
                  </span>
                ) : (
                  <span className="text-green-400">Non</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Competitors Comparison Component
function CompetitorComparison({ competitors }: { competitors: PerformanceData['competitors'] }) {
  return (
    <div className="space-y-4">
      {competitors.map((competitor, idx) => (
        <div key={idx} className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white">{competitor.name}</h4>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{competitor.score}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-white/50 text-xs">LCP</p>
              <p className="font-semibold text-white">{competitor.lcp.toFixed(2)}s</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">INP</p>
              <p className="font-semibold text-white">{Math.round(competitor.inp)}ms</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">CLS</p>
              <p className="font-semibold text-white">{competitor.cls.toFixed(3)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper: get rating from value + thresholds
function getRating(value: number, good: number, poor: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

// Map API response (PerformanceMetrics) to component state (PerformanceData)
function mapApiResponse(apiData: any, device: 'mobile' | 'desktop'): PerformanceData {
  const cwv = apiData.coreWebVitals
  const m = apiData.metrics
  const res = apiData.resources

  // Build resource arrays from breakdown
  const breakdown: Array<{ type: string; size: number; percentage: number }> = res.breakdown || []
  const buildResourceArray = (type: string, count: number, avgSize: number): { size: number; loadTime: number; blocking: boolean }[] =>
    Array.from({ length: count }, () => ({
      size: avgSize,
      loadTime: Math.round(avgSize / 500),
      blocking: type === 'CSS',
    }))

  const totalSize = res.totalSize || apiData.technical?.contentLength || 0

  return {
    url: apiData.url,
    score: apiData.score,
    grade: apiData.grade,
    device,
    timestamp: new Date().toISOString(),
    coreWebVitals: {
      lcp: {
        value: cwv.lcp.value,
        unit: cwv.lcp.unit,
        rating: cwv.lcp.rating,
        threshold: { good: 2.5, needsImprovement: 4 },
        trend: 0,
      },
      inp: {
        value: cwv.inp.value,
        unit: cwv.inp.unit,
        rating: cwv.inp.rating,
        threshold: { good: 200, needsImprovement: 500 },
        trend: 0,
      },
      cls: {
        value: cwv.cls.value,
        unit: cwv.cls.unit,
        rating: cwv.cls.rating,
        threshold: { good: 0.1, needsImprovement: 0.25 },
        trend: 0,
      },
      fcp: {
        value: m.fcp / 1000,
        unit: 's',
        rating: getRating(m.fcp, 1800, 3000),
        threshold: { good: 1.8, needsImprovement: 3 },
        trend: 0,
      },
      ttfb: {
        value: m.ttfb,
        unit: 'ms',
        rating: getRating(m.ttfb, 600, 1800),
        threshold: { good: 600, needsImprovement: 1800 },
        trend: 0,
      },
      tbt: {
        value: m.tbt,
        unit: 'ms',
        rating: getRating(m.tbt, 200, 600),
        threshold: { good: 200, needsImprovement: 600 },
        trend: 0,
      },
    },
    resources: {
      scripts: buildResourceArray('JS', res.scripts || 0, 85000),
      stylesheets: buildResourceArray('CSS', res.stylesheets || 0, 45000),
      images: buildResourceArray('Image', res.images || 0, 200000),
      fonts: buildResourceArray('Font', res.fonts || 0, 80000),
      other: [],
      totalSize,
    },
    opportunities: (apiData.opportunities || []).map((opp: any) => ({
      title: opp.title,
      description: opp.description,
      savings: { value: parseInt(opp.savings) || 0, unit: 'ms' },
      severity: opp.savings && parseInt(opp.savings) > 500 ? 'high' as const : parseInt(opp.savings) > 200 ? 'medium' as const : 'low' as const,
    })),
    diagnostics: [],
    competitors: [],
  }
}

// Main Component
export default function PerformancePage() {
  const { selectedWebsite } = useWebsite()
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop')
  const [urlInput, setUrlInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PerformanceData | null>(null)
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([])
  const [error, setError] = useState('')

  // Pre-fill URL from selected website
  useEffect(() => {
    if (selectedWebsite?.domain && !urlInput) {
      const domain = selectedWebsite.domain
      setUrlInput(domain.startsWith('http') ? domain : `https://${domain}`)
    }
  }, [selectedWebsite])

  // Auto-load latest scan results
  useEffect(() => {
    if (!selectedWebsite?.id || data) return

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
        const perf = results?.performance
        if (!perf || cancelled) return

        const score = perf.score ?? 0
        const grade = perf.grade ?? 'N/A'
        const scanUrl = scan.url || `https://${selectedWebsite!.domain}`

        setData({
          url: scanUrl,
          score,
          grade,
          device,
          timestamp: new Date().toISOString(),
          coreWebVitals: {
            lcp: {
              value: perf.lcp ?? 0,
              unit: 's',
              rating: getRating((perf.lcp ?? 0) * 1000, 2500, 4000),
              threshold: { good: 2.5, needsImprovement: 4 },
              trend: 0,
            },
            inp: {
              value: perf.fid ?? 0,
              unit: 'ms',
              rating: getRating(perf.fid ?? 0, 200, 500),
              threshold: { good: 200, needsImprovement: 500 },
              trend: 0,
            },
            cls: {
              value: perf.cls ?? 0,
              unit: '',
              rating: getRating(perf.cls ?? 0, 0.1, 0.25),
              threshold: { good: 0.1, needsImprovement: 0.25 },
              trend: 0,
            },
            fcp: {
              value: 0,
              unit: 's',
              rating: 'good',
              threshold: { good: 1.8, needsImprovement: 3 },
              trend: 0,
            },
            ttfb: {
              value: perf.ttfb ?? 0,
              unit: 'ms',
              rating: getRating(perf.ttfb ?? 0, 600, 1800),
              threshold: { good: 600, needsImprovement: 1800 },
              trend: 0,
            },
            tbt: {
              value: 0,
              unit: 'ms',
              rating: 'good',
              threshold: { good: 200, needsImprovement: 600 },
              trend: 0,
            },
          },
          resources: {
            scripts: [],
            stylesheets: [],
            images: [],
            fonts: [],
            other: [],
            totalSize: 0,
          },
          opportunities: [],
          diagnostics: [],
          competitors: [],
        })
      } catch {
        // Silent fail — user can still trigger manual analysis
      }
    }

    loadLatestScan()
    return () => { cancelled = true }
  }, [selectedWebsite?.id])

  const handleAnalyze = async () => {
    if (!urlInput.trim()) {
      setError('Veuillez entrer une URL')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput, device }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || `Erreur ${res.status}`)
      }

      setData(mapApiResponse(json, device))
      setHistoryData([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!data) return
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-${data.url}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-white/[0.02]">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <PageHeader
              title="Performance Web"
              description="Core Web Vitals et vitesse de chargement"
              icon={<Gauge className="w-6 h-6 text-cyan-400" />}
              iconBg="bg-cyan-500/10"
            />
            {data && (
              <div className="flex gap-3">
                <button
                  onClick={handleAnalyze}
                  className="px-4 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors inline-flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Analyser de nouveau
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2.5 rounded-lg border border-white/5 text-white/70 font-medium hover:bg-white/[0.03] transition-colors inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Exporter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* URL Input */}
        {!data && (
          <div className="bg-white/[0.03] rounded-lg border border-white/5 p-8">
            <label className="block text-sm font-medium text-white mb-4">URL à analyser</label>
            <UrlInput
              value={urlInput}
              onChange={setUrlInput}
              onSubmit={handleAnalyze}
              loading={loading}
              submitLabel="Analyser"
            />
            {error && (
              <div className="text-red-500 text-sm mt-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/[0.03] rounded-lg border border-white/5 p-16 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-brand-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white/70">Analyse en cours...</p>
            <p className="text-sm text-white/40 mt-2">Chargement et analyse de la page</p>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            {/* Device Toggle */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDevice('desktop')
                }}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors',
                  device === 'desktop'
                    ? 'bg-brand-500 text-white'
                    : 'bg-white/[0.03] text-white/70 hover:bg-white/[0.06]'
                )}
              >
                <Monitor className="w-4 h-4" /> Desktop
              </button>
              <button
                onClick={() => {
                  setDevice('mobile')
                }}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors',
                  device === 'mobile'
                    ? 'bg-brand-500 text-white'
                    : 'bg-white/[0.03] text-white/70 hover:bg-white/[0.06]'
                )}
              >
                <Smartphone className="w-4 h-4" /> Mobile
              </button>
            </div>

            {/* Overall Score + Core Web Vitals */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 bg-white/[0.03] rounded-lg border border-white/5 p-8 flex items-center justify-center">
                <PerformanceGauge score={data.score} grade={data.grade} />
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <VitalCard
                  label="LCP"
                  value={data.coreWebVitals.lcp.value}
                  unit={data.coreWebVitals.lcp.unit}
                  status={data.coreWebVitals.lcp.rating}
                  threshold={data.coreWebVitals.lcp.threshold}
                  trend={data.coreWebVitals.lcp.trend}
                />
                <VitalCard
                  label="INP"
                  value={data.coreWebVitals.inp.value}
                  unit={data.coreWebVitals.inp.unit}
                  status={data.coreWebVitals.inp.rating}
                  threshold={data.coreWebVitals.inp.threshold}
                  trend={data.coreWebVitals.inp.trend}
                />
                <VitalCard
                  label="CLS"
                  value={data.coreWebVitals.cls.value}
                  unit={data.coreWebVitals.cls.unit}
                  status={data.coreWebVitals.cls.rating}
                  threshold={data.coreWebVitals.cls.threshold}
                  trend={data.coreWebVitals.cls.trend}
                />
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'FCP', value: data.coreWebVitals.fcp.value, unit: 's' },
                { label: 'TTFB', value: data.coreWebVitals.ttfb.value, unit: 'ms' },
                { label: 'TBT', value: data.coreWebVitals.tbt.value, unit: 'ms' },
              ].map(metric => (
                <div key={metric.label} className="bg-white/[0.03] rounded-lg border border-white/5 p-4">
                  <p className="text-xs font-medium text-white/50 uppercase">{metric.label}</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {metric.value < 10 ? metric.value.toFixed(2) : Math.round(metric.value)}
                  </p>
                  <p className="text-xs text-white/40 mt-1">{metric.unit}</p>
                </div>
              ))}
            </div>

            {/* Performance Evolution Chart */}
            {historyData.length > 0 && (
              <div className="bg-white/[0.03] rounded-lg border border-white/5 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Évolution des Performances (30 jours)</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="lcp" stroke="#10b981" strokeWidth={2} name="LCP (s)" dot={false} />
                    <Line type="monotone" dataKey="inp" stroke="#f59e0b" strokeWidth={2} name="INP (ms, /100)" dot={false} />
                    <Line type="monotone" dataKey="cls" stroke="#3b82f6" strokeWidth={2} name="CLS (*10)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Resource Breakdown */}
            <div className="bg-white/[0.03] rounded-lg border border-white/5 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Répartition des Ressources</h2>
              <p className="text-sm text-white/50 mb-4">
                Taille totale: {(data.resources.totalSize / 1024 / 1024).toFixed(2)} MB
              </p>
              <ResourceTable resources={data.resources} />
            </div>

            {/* Opportunities */}
            <div className="bg-white/[0.03] rounded-lg border border-white/5 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" /> Opportunités d'Optimisation
              </h2>
              <div className="space-y-4">
                {data.opportunities.map((opp, idx) => (
                  <div key={idx} className={cn('rounded-lg p-4 border', getSeverityColor(opp.severity).bg, getSeverityColor(opp.severity).border)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{opp.title}</h4>
                        <p className="text-sm text-white/50 mt-1">{opp.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-green-400">
                          -{opp.savings.value}
                          {opp.savings.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostics */}
            {data.diagnostics.length > 0 && (
              <div className="bg-white/[0.03] rounded-lg border border-white/5 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" /> Diagnostics Techniques
                </h2>
                <div className="space-y-4">
                  {data.diagnostics.map((diag, idx) => {
                    const severityInfo = getSeverityColor(diag.severity)
                    return (
                      <div key={idx} className={cn('rounded-lg p-4 border', severityInfo.bg, severityInfo.border)}>
                        <div className="flex items-start gap-3">
                          <AlertCircle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', severityInfo.color)} />
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{diag.title}</h4>
                            <p className="text-sm text-white/50 mt-1">{diag.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Competitor Comparison */}
            {data.competitors.length > 0 && (
              <div className="bg-white/[0.03] rounded-lg border border-white/5 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" /> Comparaison avec les Concurrents
                </h2>
                <CompetitorComparison competitors={data.competitors} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors inline-flex items-center gap-2">
                <Download className="w-4 h-4" /> Télécharger le Rapport PDF
              </button>
              <button className="px-6 py-3 rounded-lg border border-brand-500 text-brand-400 font-medium hover:bg-brand-500/10 transition-colors inline-flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Partager les Résultats
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!data && !loading && !error && (
          <div className="text-center py-24">
            <Gauge className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Analysez les performances de votre site</h3>
            <p className="text-white/50 max-w-md mx-auto">
              Entrez une URL ci-dessus pour obtenir un audit détaillé des Core Web Vitals, des recommandations d'optimisation et une comparaison avec vos concurrents.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
