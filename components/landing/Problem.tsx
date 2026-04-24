'use client'

import { AlertTriangle, TrendingDown, BrainCircuit, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const problems = [
  {
    icon: TrendingDown,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-900/40',
    title: 'Google SGE vole vos clics',
    stat: '−40%',
    statLabel: 'de clics organiques en 2025',
    desc: 'Les AI Overviews de Google absorbent jusqu\'à 40 % du trafic sur les requêtes informationnelles. Votre contenu actuel n\'est pas optimisé pour y apparaître.',
  },
  {
    icon: BrainCircuit,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-900/40',
    title: 'ChatGPT répond à votre place',
    stat: '1Md',
    statLabel: 'requêtes/jour sur ChatGPT',
    desc: 'ChatGPT, Perplexity et Claude reçoivent des milliards de questions par jour. Si votre marque n\'est pas mentionnée dans leurs réponses, vous êtes invisible pour une génération entière.',
  },
  {
    icon: AlertTriangle,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    border: 'border-violet-200 dark:border-violet-900/40',
    title: 'Vos concurrents s\'adaptent déjà',
    stat: '23%',
    statLabel: 'des leaders optimisent pour l\'IA',
    desc: 'Les entreprises qui investissent maintenant dans le GEO, AEO et LLMO creusent un fossé difficile à rattraper. Chaque semaine d\'attente est un retard stratégique.',
  },
]

export function Problem() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="section-badge mx-auto mb-4">Le problème</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            Le SEO traditionnel ne suffit{' '}
            <span className="gradient-text">plus en 2026</span>
          </h2>
          <p className="text-lg text-surface-500 dark:text-surface-400">
            Les règles du référencement ont changé. Les moteurs de recherche génératifs redistribuent le trafic. Êtes-vous prêt ?
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {problems.map((p, i) => {
            const Icon = p.icon
            return (
              <div key={i} className="group rounded-2xl p-8 border border-white/10 dark:border-white/5 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl hover:border-white/20 dark:hover:border-white/10 transition-all duration-300 hover:shadow-glow">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${p.bg} border ${p.border}`}>
                  <Icon className={`w-6 h-6 ${p.color}`} />
                </div>
                <div className="mb-4">
                  <span className={`text-5xl sm:text-6xl font-black ${p.color}`}>{p.stat}</span>
                  <span className="block text-xs text-surface-500 dark:text-surface-400 mt-1">{p.statLabel}</span>
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">{p.title}</h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{p.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Bridge to solution */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm">
            <span className="text-sm font-semibold text-surface-900 dark:text-white">Nexus résout exactement ces 3 problèmes</span>
            <Link href="#features" className="flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-400 hover:gap-2 transition-all">
              Voir comment <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
