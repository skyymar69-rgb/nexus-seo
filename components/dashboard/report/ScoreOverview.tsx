'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ScoreGaugeProps {
  score: number | null
  previousScore?: number | null
  label: string
  size?: number
}

function DeltaBadge({ current, previous }: { current: number | null; previous?: number | null }) {
  if (current === null || previous === null || previous === undefined) return null
  const delta = current - previous
  if (delta === 0) return (
    <span className="flex items-center gap-0.5 text-[10px] text-white/30">
      <Minus className="w-2.5 h-2.5" /> 0
    </span>
  )
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
      {delta > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {delta > 0 ? '+' : ''}{delta}
    </span>
  )
}

function ScoreGauge({ score, previousScore, label, size = 100 }: ScoreGaugeProps) {
  if (score === null) return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: size, height: size }} className="rounded-full bg-white/5 flex items-center justify-center">
        <span className="text-white/20 text-sm">—</span>
      </div>
      <span className="text-xs text-white/40">{label}</span>
    </div>
  )

  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const scoreColor = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'
  const strokeColor = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#fb7185'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-label={`Score ${label}: ${score} sur 100`}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={strokeColor} strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${scoreColor}`}>{score}</span>
          <DeltaBadge current={score} previous={previousScore} />
        </div>
      </div>
      <span className="text-xs text-white/50 font-medium">{label}</span>
    </div>
  )
}

interface ScoreOverviewProps {
  auditScore: number | null
  aeoScore: number | null
  geoScore: number | null
  perfScore: number | null
  previousScores?: {
    audit?: number | null
    aeo?: number | null
    geo?: number | null
    performance?: number | null
  }
}

export function ScoreOverview({ auditScore, aeoScore, geoScore, perfScore, previousScores }: ScoreOverviewProps) {
  const scores = [auditScore, aeoScore, geoScore, perfScore].filter((s): s is number => s !== null)
  const combined = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  const prevScores = previousScores ? [previousScores.audit, previousScores.aeo, previousScores.geo, previousScores.performance].filter((s): s is number => s !== null && s !== undefined) : []
  const prevCombined = prevScores.length > 0 ? Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length) : null

  const combinedColor = combined === null ? 'text-white/20' : combined >= 75 ? 'text-emerald-400' : combined >= 50 ? 'text-amber-400' : 'text-rose-400'
  const combinedGrade = combined === null ? '—' : combined >= 90 ? 'A' : combined >= 75 ? 'B' : combined >= 55 ? 'C' : combined >= 35 ? 'D' : 'F'

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Combined score */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className={`text-5xl font-black ${combinedColor}`}>{combined ?? '—'}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-lg font-bold ${combinedColor}`}>Note {combinedGrade}</div>
            <DeltaBadge current={combined} previous={prevCombined} />
          </div>
          <div className="text-xs text-white/40">Score global</div>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-24 bg-white/5" />
        <div className="block sm:hidden h-px w-24 bg-white/5" />

        {/* Individual scores */}
        <div className="flex gap-6 sm:gap-8">
          <ScoreGauge score={auditScore} previousScore={previousScores?.audit} label="SEO Technique" />
          <ScoreGauge score={aeoScore} previousScore={previousScores?.aeo} label="AEO" />
          <ScoreGauge score={geoScore} previousScore={previousScores?.geo} label="GEO" />
          <ScoreGauge score={perfScore} previousScore={previousScores?.performance} label="Performance" />
        </div>
      </div>
    </div>
  )
}
