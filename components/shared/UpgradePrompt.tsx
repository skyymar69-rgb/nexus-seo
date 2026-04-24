'use client'

import Link from 'next/link'
import { Lock, ExternalLink } from 'lucide-react'
import { getPlan, type PlanId } from '@/lib/plans'

interface UpgradePromptProps {
  feature: string
  requiredPlan: string
}

const featureDescriptions: Record<string, string> = {
  aiVisibility: 'Voir votre visibilité dans les réponses IA',
  competitorAnalysis: 'Analyser vos concurrents en détail',
  exportPDF: 'Exporter vos audits en PDF',
  apiAccess: "Accéder à l'API complète",
  whiteLabel: 'Personnaliser la plateforme avec votre marque',
  auditsPerMonth: 'Effectuer des audits illimités',
  keywordsTracked: 'Suivre plus de mots-clés',
  backlinkChecks: 'Analyser vos backlinks en profondeur',
  maxWebsites: 'Gérer plusieurs sites web',
  aeoReports: 'Analyser le score AEO de vos pages',
  llmoReports: 'Mesurer votre visibilité dans les réponses LLM',
  customDashboard: 'Personnaliser votre dashboard',
  agencyAccess: "Bénéficier de l'accès prioritaire à l'Agence Kayzen",
}

export function UpgradePrompt({ feature, requiredPlan }: UpgradePromptProps) {
  const plan = getPlan('free')
  const description = featureDescriptions[feature] || 'Accéder à cette fonctionnalité'
  const isAgencyFeature = feature === 'agencyAccess'

  return (
    <div className="relative rounded-2xl border border-brand-200/20 dark:border-brand-800/20 bg-gradient-to-br from-brand-50/50 to-brand-100/30 dark:from-brand-950/20 dark:to-brand-900/10 p-8 text-center overflow-hidden">
      {/* Subtle gradient border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-400/10 to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Lock Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-display font-semibold text-surface-900 dark:text-surface-50 mb-2">
          Plan {plan.name} requis
        </h3>

        {/* Description */}
        <p className="text-surface-600 dark:text-surface-300 mb-6 max-w-sm mx-auto">
          {description}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {isAgencyFeature ? (
            <a
              href="https://internet.kayzen-lyon.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Découvrir l&apos;Agence Kayzen
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <Link
              href="/pricing"
              className="inline-flex px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Passer au plan {plan.name}
            </Link>
          )}

          <Link
            href="/#pricing"
            className="inline-flex px-6 py-3 rounded-lg font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 border border-brand-200 dark:border-brand-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-200"
          >
            Comparer les plans
          </Link>
        </div>
      </div>
    </div>
  )
}
