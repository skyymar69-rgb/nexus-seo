import { Metadata } from 'next'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Check, ArrowRight, Sparkles, Zap, Globe, Search, TrendingUp, FileText, LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

export const metadata: Metadata = {
  title: 'Tarifs — 100% Gratuit, Tous les Outils SEO & IA',
  description:
    'Nexus SEO est 100% gratuit. Tous les outils SEO, GEO, AEO, LLMO sans aucune limitation. Aucune carte bancaire requise.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Tarifs — 100% Gratuit | Nexus SEO',
    description:
      'Nexus SEO est 100% gratuit. Tous les outils SEO, GEO, AEO, LLMO sans aucune limitation. Aucune carte bancaire requise.',
    images: ['/api/og?title=100%25%20Gratuit&subtitle=30%2B%20outils%20SEO%20%26%20IA'],
  },
}

const allFeatures = [
  'Audits SEO illimités',
  'Suivi de mots-clés illimité',
  'Sites web illimités',
  'Analyse concurrents',
  'Score GEO, AEO, LLMO',
  'Visibilité IA (ChatGPT, Claude, Gemini...)',
  'Générateur de contenu SEO',
  'Profil backlinks complet',
  'Crawleur web',
  'Keyword Magic & Gap',
  'Topic Research',
  'Content Template',
  'Rapports & Analytics',
  'AI Advisor',
  'Export PDF / JSON',
  'Chat IA intégré',
  'Domain Overview',
  'On-Page Checker',
  'Recherche sémantique',
]

const categories = [
  {
    icon: Search,
    name: 'SEO Technique',
    features: ['Audit complet 30+ critères', 'Core Web Vitals', 'Crawl illimité', 'On-Page Checker'],
  },
  {
    icon: TrendingUp,
    name: 'Mots-cles',
    features: ['Suivi de positions', 'Keyword Magic', 'Keyword Gap', 'Recherche sémantique'],
  },
  {
    icon: Sparkles,
    name: 'IA & GEO',
    features: ['Score GEO / AEO / LLMO', 'Monitoring 10+ LLMs', 'AI Advisor', 'Alertes en temps réel'],
  },
  {
    icon: FileText,
    name: 'Contenu',
    features: ['Générateur SEO', 'Optimisation contenu', 'Topic Research', 'Content Template'],
  },
]

const faqs = [
  {
    q: 'C\'est vraiment 100% gratuit ?',
    a: 'Oui, tous les outils sont gratuits et sans limitation. Aucune carte bancaire n\'est requise. Nous monétiserons plus tard avec des fonctionnalités premium optionnelles, mais l\'ensemble des outils actuels restera gratuit.',
  },
  {
    q: 'Pourquoi faut-il s\'inscrire ?',
    a: 'L\'inscription permet de sauvegarder vos sites, suivre l\'évolution de vos positions et conserver l\'historique de vos audits. Les outils ponctuels (audit, générateur de contenu) fonctionnent sans compte.',
  },
  {
    q: 'Y a-t-il des limites ?',
    a: 'Non. Audits illimités, mots-clés illimités, sites illimités. Nous voulons que vous ayez accès à tous les outils pour optimiser votre SEO sans contrainte.',
  },
  {
    q: 'Qu\'est-ce que le GEO / AEO / LLMO ?',
    a: 'Ce sont les nouvelles disciplines du SEO : Generative Engine Optimization (Google SGE), Answer Engine Optimization (featured snippets, voice search) et Large Language Model Optimization (ChatGPT, Claude, Gemini). Nexus est le premier outil à les combiner.',
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: 'Oui. Toutes les données sont chiffrées, hébergées en Europe et conformes au RGPD. Nous ne revendons jamais vos données.',
  },
]

export default function PricingPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="bg-white dark:bg-surface-950">
        {/* Hero */}
        <section className="pt-32 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Tarifs' }]} />
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full mb-6">
                <span className="text-green-700 dark:text-green-400 text-sm font-bold">100% Gratuit</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-surface-900 dark:text-white mb-6">
                Tous les outils.{' '}
                <span className="gradient-text">Zero euro.</span>
              </h1>
              <p className="text-xl text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
                Nexus SEO est entièrement gratuit. 50+ outils SEO & IA sans aucune limitation. Aucune carte bancaire requise.
              </p>
            </div>
          </div>
        </section>

        {/* Single Plan Card */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border-2 border-brand-500 bg-white dark:bg-surface-900 shadow-xl">
              {/* Badge */}
              <div className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                Accès complet
              </div>

              <div className="p-8 sm:p-10">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black text-surface-900 dark:text-white">0&euro;</span>
                  <span className="text-surface-400 text-lg">/mois</span>
                </div>
                <p className="text-surface-500 dark:text-surface-400 mb-8">
                  Pour toujours. Aucune carte bancaire requise.
                </p>

                <Link
                  href="/signup"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold text-base hover:from-brand-700 hover:to-accent-700 transition-all shadow-lg"
                >
                  Commencer gratuitement <ArrowRight className="w-5 h-5" />
                </Link>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allFeatures.map((feature) => (
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
        </section>

        {/* Categories Detail */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white text-center mb-12">
              Ce qui est inclus
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <div key={cat.name} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <h3 className="font-bold text-surface-900 dark:text-white mb-3">{cat.name}</h3>
                    <ul className="space-y-2">
                      {cat.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-surface-200 dark:border-surface-800">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">
                Questions fréquentes
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left text-surface-900 dark:text-white font-semibold text-sm hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span className="ml-4 text-surface-400 group-open:rotate-45 transition-transform text-xl leading-none flex-shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="px-6 pb-5 text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-surface-200 dark:border-surface-800">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">
              Prêt à booster votre visibilité ?
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              50+ outils SEO & IA gratuits. Commencez en 30 secondes.
            </p>
            <Link
              href="/signup"
              className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2"
            >
              Démarrer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
