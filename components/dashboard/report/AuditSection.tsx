'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ArrowRight } from 'lucide-react'

interface AuditCheck {
  id: string
  category: string
  name: string
  status: 'passed' | 'warning' | 'error'
  score: number
  value: string
  summary: string
  impact?: string
}

interface AuditSectionProps {
  score: number | null
  grade: string | null
  checks: AuditCheck[]
  summary: { passed: number; warnings: number; errors: number; total: number } | null
}

const CATEGORY_LABELS: Record<string, string> = {
  meta: 'Meta & SEO',
  content: 'Contenu',
  technical: 'Technique',
  performance: 'Performance',
  security: 'Sécurité',
  mobile: 'Mobile',
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'passed': return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
    case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
    case 'error': return <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
    default: return null
  }
}

export function AuditSection({ score, grade, checks, summary }: AuditSectionProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  if (!checks.length) return null

  // Group checks by category
  const grouped = checks.reduce((acc, check) => {
    const cat = check.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(check)
    return acc
  }, {} as Record<string, AuditCheck[]>)

  return (
    <section id="audit" className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Audit Technique SEO</h2>
            {summary && (
              <div className="flex items-center gap-3 mt-0.5 text-xs">
                <span className="text-emerald-400">{summary.passed} OK</span>
                <span className="text-amber-400">{summary.warnings} avertissements</span>
                <span className="text-rose-400">{summary.errors} erreurs</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {score !== null && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {score}/100
              </div>
              <div className="text-xs text-white/40">Note {grade}</div>
            </div>
          )}
          <Link href="/dashboard/audit" className="hidden sm:flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Détail <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Categories */}
      <div className="divide-y divide-white/5">
        {Object.entries(grouped).map(([category, categoryChecks]) => {
          const isExpanded = expandedCategory === category
          const catErrors = categoryChecks.filter(c => c.status === 'error').length
          const catWarnings = categoryChecks.filter(c => c.status === 'warning').length
          const catPassed = categoryChecks.filter(c => c.status === 'passed').length

          return (
            <div key={category}>
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full px-6 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-white">{CATEGORY_LABELS[category] || category}</span>
                  <div className="flex items-center gap-1.5">
                    {catPassed > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">{catPassed}</span>}
                    {catWarnings > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400">{catWarnings}</span>}
                    {catErrors > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400">{catErrors}</span>}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-6 pb-4 space-y-2">
                  {categoryChecks.map((check) => (
                    <div key={check.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02]">
                      <StatusIcon status={check.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-white font-medium">{check.name}</span>
                          <span className={`text-xs font-mono ${check.score >= 75 ? 'text-emerald-400' : check.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {check.score}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5 truncate">{check.value}</p>
                        {check.status !== 'passed' && check.summary && (
                          <p className="text-xs text-white/50 mt-1">{check.summary}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
