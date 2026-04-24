'use client'

import { Check, ArrowRight, Sparkles, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const features = [
  'Audits SEO illimités',
  'Suivi de mots-clés illimité',
  'Sites web illimités',
  'Score GEO, AEO, LLMO',
  'Visibilité IA (10+ LLMs)',
  'Générateur de contenu SEO',
  'Analyse concurrents',
  'Export PDF / JSON',
  'Chat IA intégré',
  'Support email',
]

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-surface-900/50 border-y border-surface-200 dark:border-surface-800/60">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="section-badge mx-auto mb-4">100% Gratuit</div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
            Tous les outils.{' '}
            <span className="gradient-text">Zéro euro.</span>
          </h2>
          <p className="text-lg text-surface-700 dark:text-surface-400">
            50+ outils SEO & IA sans aucune limitation. Aucune carte bancaire requise.
          </p>
        </div>

        {/* Single Free Plan Card */}
        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl border-2 border-brand-500 bg-white dark:bg-surface-900 shadow-xl">
            <div className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
              Accès complet
            </div>

            <div className="p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-brand-500" />
                <h3 className="text-xl font-bold text-surface-900 dark:text-white">Nexus SEO</h3>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-surface-900 dark:text-white">0&euro;</span>
                <span className="text-surface-600 dark:text-surface-400 text-lg">/mois, pour toujours</span>
              </div>
              <p className="text-surface-600 dark:text-surface-400 mb-8">
                Aucune carte bancaire. Aucune limitation.
              </p>

              <Link
                href="/signup"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold text-base hover:from-brand-700 hover:to-accent-700 transition-all shadow-lg"
              >
                Commencer gratuitement <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-sm text-surface-700 dark:text-surface-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Kayzen Agency Banner */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-amber-500/10 to-brand-500/10 dark:from-amber-500/5 dark:to-brand-500/5 border border-amber-300/30 dark:border-amber-700/30 p-8 text-center">
          <p className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
            Besoin d&apos;un site web performant ?
          </p>
          <p className="text-surface-600 dark:text-surface-400 mb-5 max-w-xl mx-auto">
            L&apos;Agence Kayzen crée des sites optimisés SEO dès 1&nbsp;500&euro;
          </p>
          <a
            href="https://internet.kayzen-lyon.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Découvrir l&apos;Agence Kayzen
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <p className="text-center text-surface-600 dark:text-surface-500 text-sm mt-10">
          Hébergé en Europe &middot; Conforme RGPD &middot; Support inclus
        </p>
      </div>
    </section>
  )
}
