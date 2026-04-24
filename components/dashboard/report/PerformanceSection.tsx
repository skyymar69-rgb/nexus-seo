'use client'

import Link from 'next/link'
import { Gauge, ArrowRight } from 'lucide-react'

interface PerformanceSectionProps {
  score: number | null
  grade: string | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

function MetricCard({ label, value, unit, thresholds }: {
  label: string
  value: number | null
  unit: string
  thresholds: [number, number] // [good, needs-improvement]
}) {
  if (value === null) return null

  const status = value <= thresholds[0] ? 'good' : value <= thresholds[1] ? 'needs-improvement' : 'poor'
  const color = status === 'good' ? 'text-emerald-400 bg-emerald-500/10' : status === 'needs-improvement' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'
  const statusLabel = status === 'good' ? 'Bon' : status === 'needs-improvement' ? 'À améliorer' : 'Insuffisant'

  const displayValue = unit === 'ms' ? (value > 1000 ? `${(value / 1000).toFixed(1)}s` : `${Math.round(value)}ms`) : value.toFixed(3)

  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="text-xs text-white/40 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color.split(' ')[0]}`}>{displayValue}</div>
      <div className={`inline-flex mt-2 px-2 py-0.5 rounded text-[10px] font-medium ${color}`}>
        {statusLabel}
      </div>
    </div>
  )
}

export function PerformanceSection({ score, grade, lcp, fid, cls, ttfb }: PerformanceSectionProps) {
  if (score === null && lcp === null && cls === null) return null

  return (
    <section id="performance" className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <Gauge className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Performance</h2>
            <p className="text-xs text-white/40">Core Web Vitals & PageSpeed</p>
          </div>
        </div>
        {score !== null && (
          <div className="text-right">
            <div className={`text-2xl font-bold ${score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
              {score}/100
            </div>
            <div className="text-xs text-white/40">Note {grade}</div>
          </div>
        )}
        <Link href="/dashboard/performance" className="hidden sm:flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          Détail <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="LCP" value={lcp} unit="ms" thresholds={[2500, 4000]} />
          <MetricCard label="FID / INP" value={fid} unit="ms" thresholds={[100, 300]} />
          <MetricCard label="CLS" value={cls} unit="" thresholds={[0.1, 0.25]} />
          <MetricCard label="TTFB" value={ttfb} unit="ms" thresholds={[800, 1800]} />
        </div>

        {score === null && (
          <p className="text-xs text-white/30 mt-4 text-center">
            Configurez PAGESPEED_API_KEY pour des métriques détaillées
          </p>
        )}
      </div>
    </section>
  )
}
