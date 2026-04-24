'use client'

import Link from 'next/link'
import { Globe, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react'

interface GEOCheck {
  name: string
  status: 'passed' | 'warning' | 'error'
  value: string
  recommendation: string
}

interface GEOCategory {
  score: number
  checks: GEOCheck[]
}

interface EEATScore {
  total: number
  experience: number | { score: number }
  expertise: number | { score: number }
  authority: number | { score: number }
  trust: number | { score: number }
}

interface GEOSectionProps {
  score: number | null
  grade: string | null
  categories: {
    structuredData: GEOCategory | null
    entityClarity: GEOCategory | null
    citationReadiness: GEOCategory | null
    eeat: GEOCategory | null
    technicalAI: GEOCategory | null
  } | null
  eeat: EEATScore | null
  recommendations: string[]
}

function EEATBar({ label, score }: { label: string; score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="text-white/40">{Math.round(pct)}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'passed': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
    case 'error': return <XCircle className="w-3.5 h-3.5 text-rose-400" />
    default: return null
  }
}

export function GEOSection({ score, grade, categories, eeat, recommendations }: GEOSectionProps) {
  if (score === null) return null

  return (
    <section id="geo" className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Audit GEO</h2>
            <p className="text-xs text-white/40">Generative Engine Optimization</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
            {score}/100
          </div>
          <div className="text-xs text-white/40">Note {grade}</div>
        </div>
        <Link href="/dashboard/geo-audit" className="hidden sm:flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          Détail <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-6 space-y-6">
        {/* E-E-A-T */}
        {eeat && (
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Score E-E-A-T</h3>
            <div className="grid grid-cols-2 gap-3">
              <EEATBar label="Expérience" score={typeof eeat.experience === 'object' ? eeat.experience.score : eeat.experience} />
              <EEATBar label="Expertise" score={typeof eeat.expertise === 'object' ? eeat.expertise.score : eeat.expertise} />
              <EEATBar label="Autorité" score={typeof eeat.authority === 'object' ? eeat.authority.score : eeat.authority} />
              <EEATBar label="Fiabilité" score={typeof eeat.trust === 'object' ? eeat.trust.score : eeat.trust} />
            </div>
          </div>
        )}

        {/* GEO Categories */}
        {categories && (
          <div className="space-y-4">
            {Object.entries(categories).filter(([_, cat]) => cat !== null).map(([key, cat]) => {
              if (!cat) return null
              const labels: Record<string, string> = {
                structuredData: 'Données structurées',
                entityClarity: 'Clarté des entités',
                citationReadiness: 'Prêt pour citations',
                eeat: 'E-E-A-T',
                technicalAI: 'Technique IA',
              }
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">{labels[key] || key}</span>
                    <span className={`text-xs font-bold ${cat.score >= 75 ? 'text-emerald-400' : cat.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {cat.score}/100
                    </span>
                  </div>
                  <div className="space-y-1">
                    {cat.checks.slice(0, 4).map((check, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <StatusIcon status={check.status} />
                        <span className="text-white/50 flex-1 truncate">{check.name}</span>
                        <span className="text-white/30 truncate max-w-[120px]">{check.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-sm font-medium text-white/70 mb-2">Recommandations</h3>
            <ul className="space-y-1.5">
              {recommendations.slice(0, 5).map((rec, i) => (
                <li key={i} className="text-xs text-white/50 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
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
