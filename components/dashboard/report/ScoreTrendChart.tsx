'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ScanHistoryItem {
  id: string
  completedAt: string
  auditScore: number | null
  aeoScore: number | null
  geoScore: number | null
  perfScore: number | null
}

interface ScoreTrendChartProps {
  websiteId: string | null
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-900 border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-white/50 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white/60">{entry.name}</span>
          <span className="text-white font-medium ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ScoreTrendChart({ websiteId }: ScoreTrendChartProps) {
  const [data, setData] = useState<ScanHistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!websiteId) return

    setLoading(true)
    fetch(`/api/dashboard/scan-history?websiteId=${websiteId}&limit=10`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data.reverse()) // oldest first for chart
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [websiteId])

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-white/20" />
      </div>
    )
  }

  if (data.length < 2) return null // Need at least 2 points for a trend

  const chartData = data.map(scan => ({
    date: format(new Date(scan.completedAt), 'd MMM', { locale: fr }),
    SEO: scan.auditScore,
    AEO: scan.aeoScore,
    GEO: scan.geoScore,
    Perf: scan.perfScore,
  }))

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Evolution des scores</h3>
          <p className="text-xs text-white/40">{data.length} derniers scans</p>
        </div>
      </div>
      <div className="p-4 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradSEO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradAEO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradGEO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPerf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="SEO" stroke="#3b82f6" fill="url(#gradSEO)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="AEO" stroke="#8b5cf6" fill="url(#gradAEO)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="GEO" stroke="#34d399" fill="url(#gradGEO)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="Perf" stroke="#22d3ee" fill="url(#gradPerf)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="px-6 pb-4 flex items-center gap-4">
        {[
          { label: 'SEO', color: '#3b82f6' },
          { label: 'AEO', color: '#8b5cf6' },
          { label: 'GEO', color: '#34d399' },
          { label: 'Perf', color: '#22d3ee' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-white/40">
            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
