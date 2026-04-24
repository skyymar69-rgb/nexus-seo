'use client'

import { useState } from 'react'
import { Globe, MessageCircle, Cpu, Wrench, BarChart3, Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const tabs = [
  {
    id: 'geo',
    label: 'GEO',
    icon: Globe,
    color: 'text-brand-500',
    title: 'Generative Engine Optimization',
    subtitle: 'Soyez cité par Google SGE, Bing Copilot et Perplexity',
    desc: "Nexus analyse votre contenu pour le rendre éligible aux réponses générées par IA. Notre moteur GEO identifie les lacunes de structure, de crédibilité E-E-A-T et de schéma markup qui vous excluent des AI Overviews.",
    features: [
      'Analyse de compatibilité SGE en temps réel',
      'Optimisation Schema markup avancée',
      'Score E-E-A-T détaillé et recommandations',
      'Monitoring des apparitions SGE quotidien',
      'Alertes de décrochage automatiques',
      'Rapport GEO hebdomadaire automatisé',
    ],
    mockup: {
      title: 'Score GEO',
      value: '94 / 100',
      bars: [
        { label: 'Google SGE',    pct: 94, color: 'bg-brand-500' },
        { label: 'Bing Copilot', pct: 78, color: 'bg-violet-500' },
        { label: 'Perplexity',   pct: 86, color: 'bg-cyan-500' },
      ],
    },
  },
  {
    id: 'aeo',
    label: 'AEO',
    icon: MessageCircle,
    color: 'text-violet-500',
    title: 'Answer Engine Optimization',
    subtitle: 'Devenez la réponse de référence pour vos prospects',
    desc: "Structurez votre contenu pour dominer les featured snippets, la voice search et les PAA (People Also Ask). Nexus identifie toutes les questions de votre audience et vous aide à y répondre de façon optimale.",
    features: [
      'Extraction automatique des questions cibles',
      'FAQ sémantique structurée avec schema',
      'Rich snippets optimisés (étoiles, prix, FAQ)',
      'Audit voice search readiness',
      'Analyse Knowledge Graph et entités',
      'Suivi des featured snippets gagnés',
    ],
    mockup: {
      title: 'Featured Snippets',
      value: '+47 ce mois',
      bars: [
        { label: 'Paragraphes',  pct: 58, color: 'bg-violet-500' },
        { label: 'Listes',       pct: 72, color: 'bg-brand-500' },
        { label: 'Tableaux',     pct: 34, color: 'bg-cyan-500' },
      ],
    },
  },
  {
    id: 'llmo',
    label: 'LLMO',
    icon: Cpu,
    color: 'text-cyan-500',
    title: 'Large Language Model Optimization',
    subtitle: 'ChatGPT, Claude, Gemini recommandent votre marque',
    desc: "Le LLMO est la discipline la plus nouvelle et la plus stratégique de 2026. Nexus surveille vos mentions dans 10+ LLMs, identifie comment les IA parlent de vous et de vos concurrents, et optimise votre corpus de contenu pour être cité naturellement.",
    features: [
      'Monitoring 10+ LLMs (ChatGPT, Claude, Gemini...)',
      'Brand mention tracking et sentiment LLM',
      'Analyse du content corpus (autorité topique)',
      'Citation engineering et backlink IA',
      'Alertes de mentions en temps réel',
      'Tableau de bord LLMO comparatif',
    ],
    mockup: {
      title: 'Mentions LLM ce mois',
      value: '+1 247',
      bars: [
        { label: 'ChatGPT',  pct: 88, color: 'bg-cyan-500' },
        { label: 'Claude',   pct: 74, color: 'bg-brand-500' },
        { label: 'Gemini',   pct: 62, color: 'bg-violet-500' },
        { label: 'Perplexity', pct: 81, color: 'bg-accent-500' },
      ],
    },
  },
  {
    id: 'technical',
    label: 'SEO Technique',
    icon: Wrench,
    color: 'text-accent-500',
    title: 'Audit Technique Complet',
    subtitle: 'Le socle technique parfait pour dominer les SERP',
    desc: "Nexus crawle votre site en profondeur pour détecter tous les problèmes techniques qui freinent votre référencement : performance, indexation, architecture, liens cassés, redirections, Core Web Vitals...",
    features: [
      'Crawl complet jusqu\'à 100 000 pages',
      'Core Web Vitals (LCP, CLS, FID, INP)',
      'Détection des erreurs d\'indexation',
      'Analyse de l\'architecture de liens internes',
      'Vérification SSL, redirections, canoniques',
      'Rapport d\'audit automatisé avec priorités',
    ],
    mockup: {
      title: 'Score technique',
      value: '87 / 100',
      bars: [
        { label: 'Performance',   pct: 92, color: 'bg-accent-500' },
        { label: 'Indexation',    pct: 88, color: 'bg-brand-500' },
        { label: 'Core Web Vitals', pct: 79, color: 'bg-amber-500' },
      ],
    },
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    color: 'text-amber-500',
    title: 'Analytics & Rapports Intelligents',
    subtitle: 'Toutes vos données SEO au même endroit',
    desc: "Connectez Google Search Console, Analytics et vos outils tiers. Nexus agrège tout et génère des rapports clairs, actionnables et beautifully designed pour vous et vos clients.",
    features: [
      'Import Google Search Console & Analytics',
      'Suivi de mots-clés quotidien (jusqu\'à 500)',
      'Analyse de backlinks et Domain Rating',
      'Rapports PDF white-label automatisés',
      'Alertes intelligentes par email/Slack',
      'API complète pour intégrations custom',
    ],
    mockup: {
      title: 'Mots-clés Top 3',
      value: '847 (+34)',
      bars: [
        { label: 'Position 1',  pct: 38, color: 'bg-amber-500' },
        { label: 'Position 2',  pct: 29, color: 'bg-amber-400/70' },
        { label: 'Position 3',  pct: 33, color: 'bg-amber-300/60' },
      ],
    },
  },
]

export function Features() {
  const [active, setActive] = useState('geo')
  const tab = tabs.find((t) => t.id === active) || tabs[0]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-surface-950">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="section-badge mx-auto mb-4">La solution</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            Nexus couvre{' '}
            <span className="gradient-text">tout le spectre SEO</span>
          </h2>
          <p className="text-lg text-surface-700 dark:text-surface-400">
            De l&apos;audit technique au LLMO, en passant par les mots-clés et les backlinks — une seule plateforme pour dominer tous les canaux de découverte.
          </p>
        </div>

        {/* Tab bar — #30 Keyboard accessible */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-12"
          role="tablist"
          aria-label="Fonctionnalités Nexus"
          onKeyDown={(e) => {
            const tabIds = tabs.map(t => t.id)
            const idx = tabIds.indexOf(active)
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault()
              setActive(tabIds[(idx + 1) % tabIds.length])
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault()
              setActive(tabIds[(idx - 1 + tabIds.length) % tabIds.length])
            }
          }}
        >
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = t.id === active
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${t.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(t.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-brand'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                )}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div id={`tabpanel-${tab.id}`} role="tabpanel" aria-labelledby={tab.id} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <div className="animate-fade-in">
            <div className={cn('flex items-center gap-2 mb-4')}>
              <tab.icon className={cn('w-6 h-6', tab.color)} />
              <span className={cn('text-sm font-bold uppercase tracking-wider', tab.color)}>{tab.label}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-2">
              {tab.title}
            </h3>
            <p className="text-base font-medium text-surface-700 dark:text-surface-400 mb-4">
              {tab.subtitle}
            </p>
            <p className="text-surface-600 dark:text-surface-400 leading-relaxed mb-8">
              {tab.desc}
            </p>

            <ul className="space-y-3 mb-8">
              {tab.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="text-sm text-surface-700 dark:text-surface-300">{f}</span>
                </li>
              ))}
            </ul>

            <Link href={`/services#${tab.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-3 transition-all">
              En savoir plus sur le {tab.label} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: mockup */}
          <div className="card-gradient p-6 sm:p-8 rounded-3xl animate-fade-in">
            <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wider mb-2">{tab.mockup.title}</p>
            <p className="text-4xl font-black text-surface-900 dark:text-white mb-8">{tab.mockup.value}</p>
            <div className="space-y-5">
              {tab.mockup.bars.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs text-surface-500 dark:text-surface-400 mb-1.5">
                    <span>{b.label}</span>
                    <span>{b.pct}%</span>
                  </div>
                  <div className="h-2.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', b.color)}
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between text-xs text-surface-600 dark:text-surface-400">
              <span>Mis à jour il y a 3 min</span>
              <div className="flex items-center gap-1.5 text-accent-500 font-semibold">
                <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                Actif
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
