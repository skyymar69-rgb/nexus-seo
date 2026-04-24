'use client'

import { Check, X, Minus } from 'lucide-react'

const features = [
  { label: 'Audit SEO technique', nexus: true,  semrush: true,  ahrefs: true,  moz: true  },
  { label: 'Suivi mots-clés',     nexus: true,  semrush: true,  ahrefs: true,  moz: true  },
  { label: 'Analyse backlinks',   nexus: true,  semrush: true,  ahrefs: true,  moz: true  },
  { label: 'GEO (Google SGE)',    nexus: true,  semrush: false, ahrefs: false, moz: false },
  { label: 'AEO (Featured Snippets IA)', nexus: true, semrush: 'partial', ahrefs: false, moz: false },
  { label: 'LLMO (ChatGPT/Claude/Gemini)', nexus: true, semrush: false, ahrefs: false, moz: false },
  { label: 'Monitoring LLMs (10+)', nexus: true, semrush: false, ahrefs: false, moz: false },
  { label: 'Score de visibilité IA', nexus: true, semrush: false, ahrefs: false, moz: false },
  { label: 'Alertes mentions LLM', nexus: true, semrush: false, ahrefs: false, moz: false },
  { label: 'Rapports white-label', nexus: true, semrush: true, ahrefs: false, moz: 'partial' },
  { label: 'API complète',         nexus: true, semrush: true,  ahrefs: true,  moz: true  },
  { label: 'On-premise (plan Enterprise)', nexus: true, semrush: false, ahrefs: false, moz: false },
]

const tools = [
  { name: 'Nexus',   price: 'Gratuit', highlight: true  },
  { name: 'Semrush', price: 'Dès 119€', highlight: false },
  { name: 'Ahrefs',  price: 'Dès 99€', highlight: false },
  { name: 'Moz',     price: 'Dès 99€', highlight: false },
]

function Cell({ val }: { val: boolean | 'partial' }) {
  if (val === true)
    return <Check className="w-5 h-5 text-brand-500 mx-auto" aria-label="Disponible" />
  if (val === 'partial')
    return <Minus className="w-5 h-5 text-amber-400 mx-auto" aria-label="Partiel" />
  return <X className="w-5 h-5 text-surface-300 dark:text-surface-700 mx-auto" aria-label="Non disponible" />
}

export function Comparison() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-950">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <div className="section-badge mx-auto mb-4">Pourquoi Nexus</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            La seule plateforme qui couvre{' '}
            <span className="gradient-text">l&apos;ère de l&apos;IA</span>
          </h2>
          <p className="text-lg text-surface-700 dark:text-surface-400">
            Semrush, Ahrefs, Moz — des outils pensés pour 2015. Nexus est conçu pour 2026.
          </p>
        </div>

        {/* Table */}
        <div className="card-gradient rounded-3xl overflow-hidden">
          <div className="relative">
            {/* Indicateur de scroll horizontal sur mobile */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-surface-900 to-transparent pointer-events-none z-10 md:hidden" aria-hidden="true" />
            <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full" role="table" aria-label="Comparaison des fonctionnalites entre Nexus et ses concurrents">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="text-left p-5 text-sm font-semibold text-surface-700 dark:text-surface-400 w-1/2">Fonctionnalité</th>
                  {tools.map((tool) => (
                    <th key={tool.name} className={`p-5 text-center ${tool.highlight ? 'bg-brand-50/40 dark:bg-brand-950/20 border-l-2 border-brand-400 dark:border-brand-500' : ''}`}>
                      {tool.highlight ? (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="text-sm font-black gradient-text">{tool.name}</span>
                          <span className="text-xs font-semibold text-brand-500">{tool.price}</span>
                          <span className="px-2 py-0.5 text-xs font-bold bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-full border border-brand-200 dark:border-brand-800/50">
                            Recommandé
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="text-sm font-bold text-surface-900 dark:text-surface-300">{tool.name}</span>
                          <span className="text-xs text-surface-600 dark:text-surface-400">{tool.price}</span>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr
                    key={f.label}
                    className={`border-b border-surface-100 dark:border-surface-800/60 last:border-0 ${
                      i % 2 === 0 ? '' : 'bg-surface-50/50 dark:bg-surface-900/20'
                    }`}
                  >
                    <td className="p-4 pl-5">
                      <span className="text-sm text-surface-700 dark:text-surface-300">{f.label}</span>
                    </td>
                    {[f.nexus, f.semrush, f.ahrefs, f.moz].map((val, j) => (
                      <td
                        key={j}
                        className={`p-4 text-center ${j === 0 ? 'bg-brand-50/40 dark:bg-brand-950/20 border-l-2 border-brand-400 dark:border-brand-500' : ''}`}
                      >
                        <Cell val={val as boolean | 'partial'} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>

          <div className="p-5 border-t border-surface-200 dark:border-surface-700 flex flex-wrap items-center gap-4 text-xs text-surface-600 dark:text-surface-400">
            <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-brand-500" /> Disponible</div>
            <div className="flex items-center gap-1.5"><Minus className="w-3.5 h-3.5 text-amber-400" /> Partiel</div>
            <div className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-surface-500 dark:text-surface-400" /> Non disponible</div>
          </div>
        </div>
      </div>
    </section>
  )
}
