'use client'

import Link from 'next/link'
import { Search, TrendingUp, Link as LinkIcon, FileText, Sparkles, BarChart3, ArrowRight } from 'lucide-react'

const categories = [
  {
    name: 'SEO Technique',
    icon: Search,
    color: 'from-blue-500 to-blue-600',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    tools: ['Audit de site', 'Performance', 'Domain Overview', 'On-Page Checker', 'Crawleur Web'],
    count: 8,
  },
  {
    name: 'Mots-clés',
    icon: TrendingUp,
    color: 'from-violet-500 to-violet-600',
    border: 'border-violet-500/20 hover:border-violet-500/40',
    tools: ['Suivi de positions', 'Keyword Magic', 'Keyword Gap', 'Recherche Sémantique', 'Clustering'],
    count: 8,
  },
  {
    name: 'Backlinks',
    icon: LinkIcon,
    color: 'from-orange-500 to-orange-600',
    border: 'border-orange-500/20 hover:border-orange-500/40',
    tools: ['Profil Backlinks', 'Audit Toxicité', 'Analyse Concurrents', 'Netlinking'],
    count: 6,
  },
  {
    name: 'Contenu',
    icon: FileText,
    color: 'from-emerald-500 to-emerald-600',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    tools: ['Optimisation', 'Topic Research', 'Templates SEO', 'Générateur IA', 'Analyse Lisibilité'],
    count: 8,
  },
  {
    name: 'IA & GEO',
    icon: Sparkles,
    color: 'from-brand-500 to-accent-500',
    border: 'border-brand-500/20 hover:border-brand-500/40',
    tools: ['Visibilité IA', 'Audit GEO', 'Score AEO', 'Score LLMO', 'AI Advisor', 'Prompt Tester'],
    count: 10,
  },
  {
    name: 'Rapports',
    icon: BarChart3,
    color: 'from-cyan-500 to-cyan-600',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    tools: ['Analytics', 'Évolution', 'Rapports PDF', 'Export CSV'],
    count: 6,
  },
]

export function ToolsGrid() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-950" id="outils">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="section-badge mx-auto mb-4">Boîte à outils</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            <span className="gradient-text">50+ outils</span> en une seule plateforme
          </h2>
          <p className="text-lg text-surface-500 dark:text-surface-400">
            Tout ce dont vous avez besoin pour le SEO classique et l'optimisation IA, sans jongler entre 5 abonnements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon
            return (
              <div
                key={i}
                className={`group rounded-2xl p-6 border ${cat.border} bg-white/50 dark:bg-white/[0.02] transition-all duration-300 hover:shadow-glow`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 dark:text-white">{cat.name}</h3>
                    <span className="text-xs text-surface-500 dark:text-surface-400">{cat.count} outils</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.tools.map((tool, j) => (
                    <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-surface-100 dark:bg-white/5 text-surface-600 dark:text-surface-400">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base transition-colors"
          >
            Découvrir les 50+ outils
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">100% gratuit — Aucune carte bancaire requise</p>
        </div>
      </div>
    </section>
  )
}
