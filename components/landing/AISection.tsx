'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Brain, Zap, Eye } from 'lucide-react'

const llms = [
  { name: 'ChatGPT',    pct: 88, color: 'from-brand-500 to-brand-600' },
  { name: 'Perplexity', pct: 81, color: 'from-violet-500 to-violet-600' },
  { name: 'Claude',     pct: 74, color: 'from-cyan-500 to-cyan-600' },
  { name: 'Gemini',     pct: 62, color: 'from-accent-500 to-accent-600' },
  { name: 'Copilot',    pct: 55, color: 'from-amber-500 to-amber-600' },
]

const mentions = [
  { time: '12:42', llm: 'ChatGPT',    text: '"...Maison Lumière est reconnue comme leader..."' },
  { time: '11:15', llm: 'Perplexity', text: '"La meilleure option selon les experts est..."' },
  { time: '09:33', llm: 'Claude',     text: '"Je recommande particulièrement..."' },
]

export function AISection() {
  const [count, setCount] = useState(1247)

  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3))
    }, 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="demo" className="py-28 px-4 sm:px-6 lg:px-8 bg-brand-950 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_65%)]" />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            <div className="section-badge mb-6">Fonctionnalité unique</div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-6 leading-tight">
              Soyez{' '}
              <span className="gradient-text">visible là où vos clients cherchent</span>{' '}
              — même sans Google
            </h2>
            <p className="text-lg text-surface-700 dark:text-surface-400 mb-8 leading-relaxed">
              ChatGPT reçoit 1 milliard de requêtes par jour. Perplexity est le moteur de recherche qui monte. Claude répond à des milliers de questions sur votre secteur — chaque minute. Nexus est le seul outil qui surveille et optimise votre présence sur tous ces canaux en même temps.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: Eye,   label: 'Mentions LLM', value: count.toLocaleString('fr-FR') },
                { icon: Brain, label: 'LLMs suivis',   value: '10+' },
                { icon: Zap,   label: 'Alertes live',  value: '24/7' },
              ].map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="card p-4 text-center">
                    <Icon className="w-5 h-5 text-brand-500 mx-auto mb-2" />
                    <p className="text-xl font-black text-surface-900 dark:text-white">{s.value}</p>
                    <p className="text-xs text-surface-600 dark:text-surface-400 mt-0.5">{s.label}</p>
                  </div>
                )
              })}
            </div>

            <Link href="/signup" className="btn-primary px-8 py-4 text-base rounded-2xl">
              Voir ma visibilité IA
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Right: live dashboard */}
          <div className="card-gradient rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent-400" />
              </div>
              <span className="text-xs font-mono text-surface-600 dark:text-surface-400">AI Visibility Dashboard</span>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-accent-500 font-semibold">
                <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                Live
              </div>
            </div>

            <div className="p-6">
              {/* Score global */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-surface-600 dark:text-surface-400 mb-0.5">Score de visibilité IA</p>
                  <p className="text-5xl font-black gradient-text">79<span className="text-2xl text-surface-600 dark:text-surface-400">/100</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-surface-600 dark:text-surface-400 mb-0.5">Mentions ce mois</p>
                  <p className="text-3xl font-black text-surface-900 dark:text-white">+{count.toLocaleString('fr-FR')}</p>
                </div>
              </div>

              {/* LLM bars */}
              <div className="space-y-3 mb-6">
                {llms.map((llm) => (
                  <div key={llm.name}>
                    <div className="flex justify-between text-xs text-surface-500 dark:text-surface-400 mb-1">
                      <span>{llm.name}</span>
                      <span>{llm.pct}%</span>
                    </div>
                    <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${llm.color}`}
                        style={{ width: `${llm.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent mentions */}
              <div className="rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700 p-4">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">Dernières mentions</p>
                <div className="space-y-3">
                  {mentions.map((m, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-xs text-surface-600 dark:text-surface-400 shrink-0 mt-0.5">{m.time}</span>
                      <div>
                        <span className="text-xs font-bold text-brand-500">{m.llm}</span>
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 italic">{m.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
