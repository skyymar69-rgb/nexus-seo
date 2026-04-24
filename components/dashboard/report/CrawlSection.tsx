'use client'

import Link from 'next/link'
import { Search, FileWarning, CheckCircle2, ArrowRight } from 'lucide-react'

interface CrawlSectionProps {
  pagesFound: number | null
  pagesCrawled: number | null
  statusCodes: Record<string, number> | null
  issues: Array<{ url: string; issue: string }> | null
}

export function CrawlSection({ pagesFound, pagesCrawled, statusCodes, issues }: CrawlSectionProps) {
  if (pagesCrawled === null || pagesCrawled === 0) return null

  const ok = statusCodes?.['200'] || 0
  const redirects = (statusCodes?.['301'] || 0) + (statusCodes?.['302'] || 0)
  const errors = Object.entries(statusCodes || {})
    .filter(([code]) => parseInt(code) >= 400)
    .reduce((sum, [_, count]) => sum + count, 0)

  return (
    <section id="crawl" className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <Search className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Crawl du site</h2>
            <p className="text-xs text-white/40">{pagesCrawled} pages analysées sur {pagesFound} trouvées</p>
          </div>
        </div>
        <Link href="/dashboard/crawl" className="hidden sm:flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          Détail <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-6 space-y-5">
        {/* Status code distribution */}
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
            <div className="text-xl font-bold text-emerald-400">{ok}</div>
            <div className="text-xs text-white/40">200 OK</div>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
            <div className="text-xl font-bold text-amber-400">{redirects}</div>
            <div className="text-xs text-white/40">Redirections</div>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-center">
            <div className="text-xl font-bold text-rose-400">{errors}</div>
            <div className="text-xs text-white/40">Erreurs</div>
          </div>
        </div>

        {/* Issues list */}
        {issues && issues.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-white/70 mb-2">Problèmes détectés</h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {issues.slice(0, 20).map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <FileWarning className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-white/60 block truncate">{issue.url.replace(/^https?:\/\//, '')}</span>
                    <span className="text-white/40">{issue.issue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Aucun problème majeur détecté
          </div>
        )}
      </div>
    </section>
  )
}
