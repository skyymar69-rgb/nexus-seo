'use client'

import Link from 'next/link'
import { Globe, MessageCircle, Cpu, Wrench, FileText, ArrowRight } from 'lucide-react'

const features = [
  {
    id: 'geo',
    icon: Globe,
    title: 'GEO',
    subtitle: 'Generative Engine Optimization',
    desc: 'Soyez cité par Google SGE, Bing Copilot et Perplexity. Score E-E-A-T, schéma markup et monitoring quotidien.',
    gradient: 'from-brand-500/20 to-brand-500/5',
    border: 'border-brand-500/20 hover:border-brand-500/40',
    iconColor: 'text-brand-400',
    size: 'large',
  },
  {
    id: 'aeo',
    icon: MessageCircle,
    title: 'AEO',
    subtitle: 'Answer Engine Optimization',
    desc: 'Capturez les featured snippets, People Also Ask et réponses vocales. Analysez votre prêt pour la position zéro.',
    gradient: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/20 hover:border-violet-500/40',
    iconColor: 'text-violet-400',
    size: 'large',
  },
  {
    id: 'llmo',
    icon: Cpu,
    title: 'LLMO',
    subtitle: 'LLM Optimization',
    desc: 'Trackez vos mentions dans ChatGPT, Claude, Gemini et Perplexity en temps réel.',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    iconColor: 'text-cyan-400',
    size: 'small',
  },
  {
    id: 'technique',
    icon: Wrench,
    title: 'SEO Technique',
    subtitle: '25+ vérifications',
    desc: 'Audit complet, Core Web Vitals, crawl, sécurité, mobile et plus encore.',
    gradient: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    iconColor: 'text-amber-400',
    size: 'small',
  },
  {
    id: 'contenu',
    icon: FileText,
    title: 'Contenu & Mots-clés',
    subtitle: 'Optimisation IA',
    desc: 'Génération de contenu, recherche sémantique, keyword gap et analyse de lisibilité.',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    iconColor: 'text-emerald-400',
    size: 'small',
  },
]

export function BentoFeatures() {
  const largeItems = features.filter(f => f.size === 'large')
  const smallItems = features.filter(f => f.size === 'small')

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-950">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="section-badge mx-auto mb-4">Fonctionnalités</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            Tout ce qu&apos;il faut pour{' '}
            <span className="gradient-text">dominer l&apos;ère IA</span>
          </h2>
          <p className="text-lg text-surface-500 dark:text-surface-400">
            GEO, AEO, LLMO — les trois piliers du référencement nouvelle génération, réunis dans une seule plateforme.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {largeItems.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.id}
                className={`group relative rounded-2xl p-8 border bg-gradient-to-br ${f.gradient} ${f.border} transition-all duration-300 hover:shadow-glow hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-2xl font-black text-surface-900 dark:text-white">{f.title}</h3>
                  <span className="text-sm text-surface-500 dark:text-surface-400">{f.subtitle}</span>
                </div>
                <p className="text-surface-600 dark:text-surface-400 leading-relaxed max-w-md">{f.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {smallItems.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.id}
                className={`group relative rounded-2xl p-6 border bg-gradient-to-br ${f.gradient} ${f.border} transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5`}
              >
                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white">{f.title}</h3>
                  <span className="text-xs text-surface-500 dark:text-surface-400">{f.subtitle}</span>
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/signup" className="btn-primary px-8 py-3 rounded-xl text-sm">
            Commencer gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
