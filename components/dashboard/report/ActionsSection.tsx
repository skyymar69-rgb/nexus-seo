'use client'

import Link from 'next/link'
import { Lightbulb, AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react'

interface ActionsSectionProps {
  auditChecks: Array<{ name: string; status: string; summary: string; impact?: string; score: number }> | null
  aeoRecommendations: string[]
  geoRecommendations: string[]
}

interface Action {
  text: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  source: string
}

export function ActionsSection({ auditChecks, aeoRecommendations, geoRecommendations }: ActionsSectionProps) {
  // Build prioritized action list
  const actions: Action[] = []

  // From audit checks — errors and warnings become actions
  if (auditChecks) {
    auditChecks
      .filter(c => c.status === 'error')
      .forEach(c => actions.push({ text: c.summary || c.name, priority: 'critical', source: 'SEO' }))
    auditChecks
      .filter(c => c.status === 'warning')
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .forEach(c => actions.push({ text: c.summary || c.name, priority: 'high', source: 'SEO' }))
  }

  // From AEO
  aeoRecommendations.slice(0, 3).forEach(r =>
    actions.push({ text: r, priority: 'medium', source: 'AEO' })
  )

  // From GEO
  geoRecommendations.slice(0, 3).forEach(r =>
    actions.push({ text: r, priority: 'medium', source: 'GEO' })
  )

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  if (actions.length === 0) return null

  const PriorityIcon = ({ priority }: { priority: string }) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
      case 'high': return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
      default: return <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
    }
  }

  const priorityLabel = (p: string) => {
    switch (p) {
      case 'critical': return 'Critique'
      case 'high': return 'Important'
      case 'medium': return 'Moyen'
      default: return 'Faible'
    }
  }

  const priorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'bg-rose-500/10 text-rose-400'
      case 'high': return 'bg-amber-500/10 text-amber-400'
      default: return 'bg-blue-500/10 text-blue-400'
    }
  }

  return (
    <section id="actions" className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Actions prioritaires</h2>
          <p className="text-xs text-white/40">{actions.length} améliorations recommandées</p>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {actions.slice(0, 12).map((action, i) => {
          const detailHref = action.source === 'SEO' ? '/dashboard/audit'
            : action.source === 'AEO' ? '/dashboard/aeo-score'
            : action.source === 'GEO' ? '/dashboard/geo-audit'
            : '/dashboard/audit'
          return (
            <div key={i} className="px-6 py-3.5 flex items-start gap-3">
              <PriorityIcon priority={action.priority} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80">{action.text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priorityColor(action.priority)}`}>
                    {priorityLabel(action.priority)}
                  </span>
                  <span className="text-[10px] text-white/30">{action.source}</span>
                </div>
              </div>
              <Link
                href={detailHref}
                className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
              >
                Corriger <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
