'use client'

import { type ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: string | number
  delta?: number | null
  deltaLabel?: string
  subtitle?: string
}

export function KpiCard({ icon, label, value, delta, deltaLabel, subtitle }: KpiCardProps) {
  const hasDelta = delta !== undefined && delta !== null
  const isPositive = hasDelta && delta > 0
  const isNegative = hasDelta && delta < 0
  const isNeutral = hasDelta && delta === 0

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
          {icon}
        </div>
        {hasDelta && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${
            isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-white/30'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {isPositive && '+'}{delta}{deltaLabel || ''}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
      {subtitle && <div className="text-[10px] text-white/25 mt-1">{subtitle}</div>}
    </div>
  )
}
