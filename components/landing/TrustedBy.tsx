'use client'

import { ExternalLink } from 'lucide-react'

const clients = [
  'France Evasions', 'Boucherie de l\'Avenue', 'Net Renovation', 'Philippe Reynaud',
  'Grand Cafe du Commerce', 'Art Scenic', 'Resacar', 'Kayzen Lyon',
]

export function TrustedBy() {
  const doubled = [...clients, ...clients]

  return (
    <section className="py-16 bg-surface-50 dark:bg-surface-900/50 border-y border-surface-200 dark:border-surface-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <p className="text-center text-sm font-medium text-surface-700 dark:text-surface-400 mb-8 uppercase tracking-widest">
          Sites optimisés par Kayzen Web — Lyon
        </p>

        {/* Marquee */}
        <div className="relative overflow-hidden mask-fade-x mb-10">
          <div className="flex animate-marquee whitespace-nowrap">
            {doubled.map((name, i) => (
              <div key={i} className="flex items-center mx-8 shrink-0">
                <span className="text-sm font-semibold text-surface-700 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-300 transition-colors cursor-default">
                  {name}
                </span>
                <span className="mx-8 text-surface-200 dark:text-surface-700">&middot;</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kayzen badge */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://internet.kayzen-lyon.fr/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm hover:border-brand-400 transition-colors"
          >
            <div>
              <p className="text-sm font-bold text-surface-900 dark:text-white">Kayzen Web</p>
              <p className="text-xs text-surface-600 dark:text-surface-400">Voir le portfolio</p>
            </div>
            <ExternalLink className="w-4 h-4 text-brand-500" />
          </a>
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm">
            <div>
              <p className="text-sm font-bold text-surface-900 dark:text-white">100% gratuit</p>
              <p className="text-xs text-surface-600 dark:text-surface-400">Aucune carte bancaire</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm">
            <div>
              <p className="text-sm font-bold text-surface-900 dark:text-white">50+ outils</p>
              <p className="text-xs text-surface-600 dark:text-surface-400">SEO, GEO, AEO, LLMO</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
