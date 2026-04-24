'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ChevronDown, ExternalLink, Copy, Check, Download, Printer,
  AlertTriangle, ArrowUp, Minus, ArrowDown, Code, Wrench, Globe,
  Sparkles, FileDown, FileText,
} from 'lucide-react'
import type { ActionableRec } from '@/lib/actionable-recommendations'

interface ActionPlanProps {
  recommendations: ActionableRec[]
  siteName: string
  onExportMD?: () => void
  onExportHTML?: () => void
  onPrint?: () => void
}

const priorityConfig = {
  critique: { label: 'Critique', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800', icon: AlertTriangle, dot: 'bg-red-500' },
  haute: { label: 'Haute', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800', icon: ArrowUp, dot: 'bg-orange-500' },
  moyenne: { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800', icon: Minus, dot: 'bg-yellow-500' },
  basse: { label: 'Basse', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: ArrowDown, dot: 'bg-blue-500' },
}

const toolIcons = { ai: Sparkles, platform: Globe, code: Code, manual: Wrench }

function CodeBlock({ snippet }: { snippet: { language: string; label: string; code: string; where: string } }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(snippet.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 mt-2">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-100 dark:bg-surface-800 text-xs">
        <div>
          <span className="font-semibold text-surface-700 dark:text-surface-300">{snippet.label}</span>
          <span className="text-surface-500 ml-2">({snippet.where})</span>
        </div>
        <button onClick={copy} className="flex items-center gap-1 text-surface-500 hover:text-surface-700 transition-colors">
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copie' : 'Copier'}
        </button>
      </div>
      <pre className="p-3 bg-surface-900 dark:bg-surface-950 text-surface-100 text-xs overflow-x-auto">
        <code>{snippet.code}</code>
      </pre>
    </div>
  )
}

function RecommendationCard({ rec }: { rec: ActionableRec }) {
  const [expanded, setExpanded] = useState(false)
  const config = priorityConfig[rec.priority]
  const PriorityIcon = config.icon

  return (
    <div className={cn(
      'rounded-xl border bg-white dark:bg-surface-900 overflow-hidden transition-all',
      rec.priority === 'critique' ? 'border-red-300 dark:border-red-800' : 'border-surface-200 dark:border-surface-800'
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
      >
        <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', config.dot)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn('px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border', config.color)}>
              {config.label}
            </span>
            <span className="text-[10px] text-surface-400">{rec.category} | {rec.estimatedTime}</span>
          </div>
          <span className="text-sm font-semibold text-surface-900 dark:text-white">{rec.title}</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-surface-400 transition-transform shrink-0', expanded && 'rotate-180')} />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-surface-100 dark:border-surface-800 px-4 py-4 space-y-4 bg-surface-50/50 dark:bg-surface-800/30">
          {/* Description + Impact */}
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">{rec.description}</p>
            <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mt-2">{rec.impact}</p>
          </div>

          {/* Steps */}
          {rec.steps.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-2">Etapes a suivre</h4>
              <ol className="space-y-1.5">
                {rec.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300">
                    <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tools */}
          {rec.tools.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-2">Outils recommandes</h4>
              <div className="flex flex-wrap gap-2">
                {rec.tools.map((tool, i) => {
                  const ToolIcon = toolIcons[tool.type]
                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-xs">
                      <ToolIcon className="w-3.5 h-3.5 text-surface-400" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-surface-900 dark:text-white">{tool.name}</span>
                          {tool.free && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold">GRATUIT</span>}
                        </div>
                        <p className="text-surface-500 mt-0.5">{tool.description}</p>
                      </div>
                      {tool.url && (
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 shrink-0">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Code Snippets */}
          {rec.codeSnippets.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500 mb-2">Code a implanter</h4>
              {rec.codeSnippets.map((snippet, i) => (
                <CodeBlock key={i} snippet={snippet} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ActionPlan({ recommendations, siteName, onExportMD, onExportHTML, onPrint }: ActionPlanProps) {
  if (recommendations.length === 0) return null

  const critiques = recommendations.filter(r => r.priority === 'critique').length
  const hautes = recommendations.filter(r => r.priority === 'haute').length
  const moyennes = recommendations.filter(r => r.priority === 'moyenne').length
  const basses = recommendations.filter(r => r.priority === 'basse').length

  return (
    <div className="space-y-4 print:space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 px-5 py-4">
        <div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">Plan d&apos;action SEO</h3>
          <div className="flex items-center gap-3 mt-1 text-xs">
            {critiques > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{critiques} critique{critiques > 1 ? 's' : ''}</span>}
            {hautes > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />{hautes} haute{hautes > 1 ? 's' : ''}</span>}
            {moyennes > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />{moyennes} moyenne{moyennes > 1 ? 's' : ''}</span>}
            {basses > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />{basses} basse{basses > 1 ? 's' : ''}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {onPrint && (
            <button onClick={onPrint} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Imprimer
            </button>
          )}
          {onExportMD && (
            <button onClick={onExportMD} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors">
              <FileDown className="w-3.5 h-3.5" /> Markdown
            </button>
          )}
          {onExportHTML && (
            <button onClick={onExportHTML} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300 transition-colors">
              <Globe className="w-3.5 h-3.5" /> HTML
            </button>
          )}
        </div>
      </div>

      {/* Recommendations list */}
      <div className="space-y-2">
        {recommendations.map(rec => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  )
}
