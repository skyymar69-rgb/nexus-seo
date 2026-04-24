'use client'

import { motion } from 'framer-motion'

interface ScoreRingProps {
  score: number | null
  label?: string
  size?: number
  strokeWidth?: number
  showGrade?: boolean
  className?: string
}

function gradeFromScore(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 55) return 'C'
  if (score >= 35) return 'D'
  return 'F'
}

function colorFromScore(score: number): { text: string; stroke: string } {
  if (score >= 75) return { text: 'text-emerald-400', stroke: '#34d399' }
  if (score >= 50) return { text: 'text-amber-400', stroke: '#fbbf24' }
  return { text: 'text-rose-400', stroke: '#fb7185' }
}

export function ScoreRing({
  score,
  label,
  size = 100,
  strokeWidth = 5,
  showGrade = false,
  className = '',
}: ScoreRingProps) {
  if (score === null) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`} role="img" aria-label={`${label ? label + ' : ' : ''}Score non disponible`}>
        <div
          style={{ width: size, height: size }}
          className="rounded-full bg-white/5 flex items-center justify-center"
        >
          <span className="text-white/20 text-sm" aria-hidden="true">—</span>
        </div>
        {label && <span className="text-xs text-white/40">{label}</span>}
      </div>
    )
  }

  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const { text, stroke } = colorFromScore(score)

  const grade = gradeFromScore(score)
  const ariaLabel = `${label ? label + ' : ' : ''}Score ${score} sur 100${showGrade ? ', grade ' + grade : ''}`

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`} role="img" aria-label={ariaLabel}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${text}`}>{score}</span>
          {showGrade && (
            <span className={`text-[10px] font-medium ${text}`}>{gradeFromScore(score)}</span>
          )}
        </div>
      </div>
      {label && <span className="text-xs text-white/50 font-medium">{label}</span>}
    </div>
  )
}
