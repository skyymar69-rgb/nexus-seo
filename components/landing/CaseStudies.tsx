'use client'

import { ArrowRight, Globe, ExternalLink } from 'lucide-react'

const cases = [
  {
    category: 'Transport & Tourisme',
    company: 'France Évasions',
    desc: 'Site vitrine optimisé pour le référencement local et national dans le secteur du transport touristique.',
    tags: ['SEO', 'Performance'],
  },
  {
    category: 'Commerce de proximité',
    company: 'Boucherie de l\'Avenue',
    desc: 'Site vitrine rapide et éco-responsable pour un commerce local lyonnais, optimisé pour le SEO local.',
    tags: ['SEO Local', 'Eco-web'],
  },
  {
    category: 'Bâtiment & Rénovation',
    company: 'Net Rénovation',
    desc: 'Site professionnel pour une entreprise de rénovation, avec structure SEO et pages de services optimisées.',
    tags: ['SEO Technique', 'Contenu'],
  },
  {
    category: 'Photographie',
    company: 'Philippe Reynaud',
    desc: 'Portfolio photographe avec optimisation des images WebP, lazy loading et performance maximale.',
    tags: ['Performance', 'Images'],
  },
  {
    category: 'Restauration',
    company: 'Grand Café du Commerce',
    desc: 'Site restaurant avec menu, horaires et référencement local Google My Business optimisé.',
    tags: ['SEO Local', 'Mobile'],
  },
  {
    category: 'Culture & Événementiel',
    company: 'Art Scenic',
    desc: 'Site événementiel avec gestion de contenu dynamique et SEO pour le secteur culturel.',
    tags: ['SEO', 'Contenu'],
  },
]

const tagColors: Record<string, string> = {
  'SEO':           'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 border-brand-200 dark:border-brand-800/50',
  'SEO Local':     'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 border-violet-200 dark:border-violet-800/50',
  'SEO Technique': 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50',
  'Performance':   'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400 border-accent-200 dark:border-accent-800/50',
  'Eco-web':       'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400 border-green-200 dark:border-green-800/50',
  'Contenu':       'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  'Images':        'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border-pink-200 dark:border-pink-800/50',
  'Mobile':        'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
}

export function CaseStudies() {
  return (
    <section id="cases" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-surface-900/50 border-y border-surface-200 dark:border-surface-800/60">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <div className="section-badge mb-4">Sites réalisés par Kayzen Web</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white">
              Des sites optimisés
              <br />
              <span className="gradient-text">dès la conception.</span>
            </h2>
          </div>
          <a
            href="https://internet.kayzen-lyon.fr/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-3 transition-all shrink-0"
          >
            Voir le portfolio complet <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div
              key={c.company}
              className="card-hover p-7 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-surface-600 dark:text-surface-400 mb-1">{c.category}</p>
                  <p className="text-base font-bold text-surface-900 dark:text-white">{c.company}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-brand-500" />
                </div>
              </div>

              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-5 flex-1">
                {c.desc}
              </p>

              <div className="flex flex-wrap gap-2">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${tagColors[tag] || 'bg-surface-100 text-surface-600 border-surface-200'}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
