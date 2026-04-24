'use client'

import { useState, useEffect } from 'react'
import { cn, formatNumber } from '@/lib/utils'
import { useWebsite } from '@/contexts/WebsiteContext'
import {
  TrendingUp,
  Award,
  Target,
  Loader2,
  BarChart3,
  Link2,
  AlertCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface AuditPoint {
  date: string
  score: number
}

interface KeywordPoint {
  date: string
  avgPosition: number
}

interface BacklinkPoint {
  date: string
  count: number
}

interface EvolutionData {
  audits: AuditPoint[]
  keywords: KeywordPoint[]
  backlinks: BacklinkPoint[]
}

type DateRange = '7d' | '30d' | '90d'

function filterByRange<T extends { date: string }>(data: T[], range: DateRange): T[] {
  const now = new Date()
  const daysMap: Record<DateRange, number> = { '7d': 7, '30d': 30, '90d': 90 }
  const cutoff = new Date(now.getTime() - daysMap[range] * 24 * 60 * 60 * 1000)
  return data.filter((d) => new Date(d.date) >= cutoff)
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-white/30">
      <AlertCircle className="h-10 w-10 mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default function EvolutionPage() {
  const { selectedWebsite } = useWebsite()
  const [dateRange, setDateRange] = useState<DateRange>('90d')
  const [data, setData] = useState<EvolutionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [scanHistory, setScanHistory] = useState<any[]>([])

  useEffect(() => {
    if (!selectedWebsite?.id) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch evolution data
        const res = await fetch(`/api/evolution?websiteId=${selectedWebsite.id}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
          throw new Error(err.error || `Erreur ${res.status}`)
        }
        const json = await res.json()
        setData(json)

        // Also fetch scan history for AEO/GEO/Performance trends
        try {
          const histRes = await fetch(`/api/dashboard/scan-history?websiteId=${selectedWebsite.id}&limit=20`)
          if (histRes.ok) {
            const histJson = await histRes.json()
            if (histJson.success) setScanHistory(histJson.data?.reverse() || [])
          }
        } catch { /* optional */ }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedWebsite?.id])

  const audits = data ? filterByRange(data.audits, dateRange) : []
  const keywords = data ? filterByRange(data.keywords, dateRange) : []
  const backlinks = data ? filterByRange(data.backlinks, dateRange) : []

  const hasAnyData = audits.length > 0 || keywords.length > 0 || backlinks.length > 0

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Date Range Selector */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Suivi d&apos;Evolution
            </h1>
          </div>
          <p className="text-white/40 mt-1 max-w-xl">
            Suivez l&apos;évolution de vos métriques SEO et identifiez les tendances
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/[0.03] text-white/40 hover:text-white/70'
              )}
            >
              {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-white/40">Chargement des données...</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && !selectedWebsite && (
        <EmptyState message="Sélectionnez un site pour voir son évolution." />
      )}

      {!loading && !error && selectedWebsite && !hasAnyData && (
        <EmptyState message="Aucune donnée historique disponible. Lancez des audits et suivez des mots-clés pour voir l'évolution." />
      )}

      {!loading && !error && hasAnyData && (
        <>
          {/* Score Evolution Chart */}
          {audits.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Evolution du Score SEO
                </h2>
                <p className="text-sm text-white/40 mt-1">
                  Progression de votre score global au fil des audits
                </p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={audits}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#2563eb' }}
                    name="Score SEO"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Keyword Position Evolution */}
          {keywords.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Evolution de la Position des Mots-clés
                </h2>
                <p className="text-sm text-white/40 mt-1">
                  Position moyenne en baisse = amélioration (plus proche du top)
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={keywords}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    reversed
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgPosition"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#16a34a' }}
                    name="Position Moyenne"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Backlink Growth */}
          {backlinks.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-blue-600" />
                  Croissance des Backlinks
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={backlinks}>
                  <defs>
                    <linearGradient id="colorBacklinks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorBacklinks)"
                    name="Backlinks Totaux"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
