'use client'

import { useState, useEffect } from 'react'
import { useWebsite } from '@/contexts/WebsiteContext'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  FileSearch,
  Key,
  Link2,
  Bot,
  Gauge,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface AnalyticsData {
  kpis: {
    totalAudits: number
    avgAuditScore: number | null
    totalKeywords: number
    totalBacklinks: number
    dofollowRatio: number
    mentionRate: number | null
    avgPerformanceScore: number | null
    totalAIQueries: number
  }
  bestKeyword: { term: string; position: number } | null
  worstKeyword: { term: string; position: number } | null
  charts: {
    auditScoresOverTime: { date: string; score: number; grade: string }[]
    keywordPositionsOverTime: { date: string; avgPosition: number }[]
    backlinksGrowth: { month: string; newLinks: number; total: number }[]
    performanceOverTime: {
      date: string
      score: number
      lcp: number | null
      cls: number | null
      fcp: number | null
    }[]
  }
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<any>
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/40">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-white/30">{sub}</p>}
        </div>
        <div className="rounded-lg bg-blue-50 p-2.5">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { selectedWebsite } = useWebsite()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedWebsite) {
      setData(null)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/analytics?websiteId=${selectedWebsite.id}`
        )
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des analytics')
        }
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message || 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedWebsite])

  // No website selected
  if (!selectedWebsite) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-white/30" />
          <h2 className="mt-4 text-lg font-semibold text-white">
            Aucun site sélectionné
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Sélectionnez un site web pour voir les analytics internes.
          </p>
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-white/50">Chargement des analytics...</span>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h2 className="mt-4 text-lg font-semibold text-white">Erreur</h2>
          <p className="mt-1 text-sm text-white/40">{error}</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data || allZero(data.kpis)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-white/30" />
          <h2 className="mt-4 text-lg font-semibold text-white">
            Aucune donnée disponible
          </h2>
          <p className="mt-1 max-w-md text-sm text-white/40">
            Lancez un audit, ajoutez des mots-clés ou vérifiez la visibilité IA
            pour commencer a voir vos analytics internes.
          </p>
        </div>
      </div>
    )
  }

  const { kpis, charts, bestKeyword, worstKeyword } = data

  return (
    <div className="min-h-screen bg-white/[0.02]">
      {/* Header */}
      <div className="border-b border-white/5 bg-white/[0.03] px-8 py-6">
        <h1 className="text-2xl font-bold text-white">Analytics internes</h1>
        <p className="mt-1 text-sm text-white/40">
          Vue d&apos;ensemble des données collectées pour{' '}
          <span className="font-medium text-white/70">
            {selectedWebsite.domain}
          </span>
        </p>
      </div>

      <div className="p-8">
        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            icon={FileSearch}
            label="Audits réalisés"
            value={String(kpis.totalAudits)}
            sub={
              kpis.avgAuditScore != null
                ? `Score moyen : ${kpis.avgAuditScore}/100`
                : undefined
            }
          />
          <KpiCard
            icon={Key}
            label="Mots-clés suivis"
            value={String(kpis.totalKeywords)}
            sub={
              bestKeyword
                ? `Meilleur : #${bestKeyword.position} "${bestKeyword.term}"`
                : undefined
            }
          />
          <KpiCard
            icon={Link2}
            label="Backlinks"
            value={String(kpis.totalBacklinks)}
            sub={`${kpis.dofollowRatio}% dofollow`}
          />
          <KpiCard
            icon={Bot}
            label="Taux de mention IA"
            value={kpis.mentionRate != null ? `${kpis.mentionRate}%` : '-'}
            sub={`${kpis.totalAIQueries} requetes analysees`}
          />
          <KpiCard
            icon={Gauge}
            label="Score performance"
            value={
              kpis.avgPerformanceScore != null
                ? `${kpis.avgPerformanceScore}/100`
                : '-'
            }
          />
        </div>

        {/* Charts */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Audit Scores Over Time */}
          {charts.auditScoresOverTime.length > 0 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-white">
                Scores d&apos;audit dans le temps
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={charts.auditScoresOverTime}>
                  <defs>
                    <linearGradient
                      id="auditGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="url(#auditGrad)"
                    name="Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Keyword Positions Trend */}
          {charts.keywordPositionsOverTime.length > 0 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-white">
                Position moyenne des mots-clés
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={charts.keywordPositionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis reversed tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgPosition"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Position moy."
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Backlinks Growth */}
          {charts.backlinksGrowth.length > 0 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-white">
                Croissance des backlinks
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={charts.backlinksGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Bar
                    dataKey="newLinks"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    name="Nouveaux liens"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    name="Total cumule"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Performance Over Time */}
          {charts.performanceOverTime.length > 0 && (
            <div className="rounded-lg border border-white/5 bg-white/[0.03] p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-white">
                Score de performance
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={charts.performanceOverTime}>
                  <defs>
                    <linearGradient
                      id="perfGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    fill="url(#perfGrad)"
                    name="Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Best / Worst keywords */}
        {(bestKeyword || worstKeyword) && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {bestKeyword && (
              <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-green-800">Meilleur mot-clé</p>
                  <p className="font-semibold text-green-900">
                    &quot;{bestKeyword.term}&quot; — position #{bestKeyword.position}
                  </p>
                </div>
              </div>
            )}
            {worstKeyword && (
              <div className="flex items-center gap-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <TrendingDown className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-800">Mot-cle à améliorer</p>
                  <p className="font-semibold text-orange-900">
                    &quot;{worstKeyword.term}&quot; — position #{worstKeyword.position}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function allZero(kpis: AnalyticsData['kpis']): boolean {
  return (
    kpis.totalAudits === 0 &&
    kpis.totalKeywords === 0 &&
    kpis.totalBacklinks === 0 &&
    kpis.totalAIQueries === 0
  )
}
