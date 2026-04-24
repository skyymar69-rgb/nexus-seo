'use client'

import Link from 'next/link'
import { MessageSquare, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

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

interface AEOSectionProps {
  score: number | null
  grade: string | null
  snippetReadiness: AEOCategory | null
  qaPatterns: AEOCategory | null
  voiceReadiness: AEOCategory | null
  contentStructure: AEOCategory | null
  recommendations: string[]
}

function CategoryBar({ label, score, checks }: { label: string; score: number; checks: AEOCheck[] }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
  const textColor = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white font-medium">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>{score}/100</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-label={label} aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <div className="space-y-1">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {check.passed ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />
            )}
            <span className={check.passed ? 'text-white/50' : 'text-white/70'}>{check.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AEOSection({ score, grade, snippetReadiness, qaPatterns, voiceReadiness, contentStructure, recommendations }: AEOSectionProps) {
  if (score === null) return null

  return (
    <section id="aeo" className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Score AEO</h2>
            <p className="text-xs text-white/40">Answer Engine Optimization</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {score}/100
          </div>
          <div className="text-xs text-white/40">Note {grade}</div>
        </div>
        <Link href="/dashboard/aeo-score" className="hidden sm:flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          Detail <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {snippetReadiness && <CategoryBar label="Featured Snippets" score={snippetReadiness.score} checks={snippetReadiness.checks} />}
          {qaPatterns && <CategoryBar label="Patterns Q&A" score={qaPatterns.score} checks={qaPatterns.checks} />}
          {voiceReadiness && <CategoryBar label="Recherche vocale" score={voiceReadiness.score} checks={voiceReadiness.checks} />}
          {contentStructure && <CategoryBar label="Structure contenu" score={contentStructure.score} checks={contentStructure.checks} />}
        </div>

        {recommendations.length > 0 && (
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-sm font-medium text-white/70 mb-2">Recommandations</h3>
            <ul className="space-y-1.5">
              {recommendations.slice(0, 5).map((rec, i) => (
                <li key={i} className="text-xs text-white/50 flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
