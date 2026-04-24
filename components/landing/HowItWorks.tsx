'use client'

import Link from 'next/link'
import { ArrowRight, Plus, Search, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Plus,
    title: 'Connectez votre site en 30 secondes',
    desc: 'Ajoutez votre domaine, connectez Google Search Console en 1 clic et choisissez vos mots-clés prioritaires. Pas d\'installation technique requise.',
    detail: 'Compatible avec tous les CMS : WordPress, Shopify, Webflow, custom...',
    color: 'from-brand-500 to-brand-600',
    bg: 'bg-brand-50 dark:bg-brand-950/20',
  },
  {
    number: '02',
    icon: Search,
    title: 'Analyse complète en 5 minutes',
    desc: 'Nexus crawle votre site, vérifie votre score GEO/AEO/LLMO, identifie vos opportunités de featured snippets et audite vos 100+ facteurs techniques.',
    detail: 'Rapport d\'audit disponible immédiatement, comparé à vos 5 principaux concurrents.',
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Implémentez et dominez',
    desc: 'Suivez les recommandations prioritaires de notre IA, mesurez l\'impact de chaque action et regardez votre trafic organique et votre visibilité IA croître chaque semaine.',
    detail: 'Rapports automatiques pour vous et vos clients, avec évolution des KPIs.',
    color: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-950">
      <div className="max-w-7xl mx-auto">

        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="section-badge mx-auto mb-4">Simple et rapide</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            Opérationnel en{' '}
            <span className="gradient-text">moins de 10 minutes</span>
          </h2>
          <p className="text-lg text-surface-700 dark:text-surface-400">
            Pas d&apos;agence. Pas de consultant. Nexus fait le travail à votre place et vous montre exactement quoi faire.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500/0 via-brand-500/40 to-brand-500/0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="relative flex flex-col items-start">
                  {/* Step number + icon */}
                  <div className="relative mb-6 z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-xs font-black text-surface-300 dark:text-surface-600">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-surface-600 dark:text-surface-400 leading-relaxed mb-4">
                    {step.desc}
                  </p>
                  <p className={`text-xs font-medium px-3 py-2 rounded-xl ${step.bg} text-surface-600 dark:text-surface-400`}>
                    {step.detail}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center mt-14">
          <Link href="/signup" className="btn-primary px-10 py-4 text-base rounded-2xl">
            Commencer maintenant — C&apos;est gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-3 text-sm text-surface-600 dark:text-surface-400">Aucune carte bancaire requise · Configuration en 5 min</p>
        </div>
      </div>
    </section>
  )
}
