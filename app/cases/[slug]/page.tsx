import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, TrendingUp, Check } from 'lucide-react'
import { notFound } from 'next/navigation'

const cases: Record<string, {
  company: string
  category: string
  challenge: string
  result: string
  detail: string
  duration: string
  tags: string[]
  description: string
  context: string
  solution: string[]
  results: { metric: string; value: string }[]
  quote: string
  author: string
  role: string
}> = {
  'maison-lumiere': {
    company: 'Maison Lumière',
    category: 'E-commerce Mode',
    challenge: 'Trafic en chute suite aux AI Overviews Google',
    result: '+420% trafic organique',
    detail: '3,2M → 15,6M visites/mois en 6 mois',
    duration: '6 mois',
    tags: ['GEO', 'AEO'],
    description: 'Enseigne de mode premium, Maison Lumière a vu son trafic organique s\'effondrer de 43% en 3 mois suite au déploiement massif des AI Overviews Google.',
    context: 'Maison Lumière génère 80% de son CA via l\'acquisition organique. L\'arrivée des AI Overviews a absorbé leurs clics sur les requêtes "robe de soirée", "manteau femme hiver" et 200+ requêtes head terms.',
    solution: [
      'Restructuration complète du contenu produit pour la compatibilité SGE',
      'Implémentation Schema.org Product + BreadcrumbList sur 12 000 pages',
      'Création d\'un hub éditorial E-E-A-T (guides mode, tendances)',
      'Optimisation des FAQ produits pour les featured snippets',
      'Stratégie de contenu AEO sur 340 requêtes questions',
    ],
    results: [
      { metric: 'Trafic organique', value: '+420%' },
      { metric: 'Visites/mois', value: '15,6M' },
      { metric: 'Positions Top 3', value: '+312' },
      { metric: 'Apparitions SGE', value: '2 400+/mois' },
    ],
    quote: 'Nexus a transformé notre approche SEO. En 6 mois, notre trafic organique a plus que quadruplé. L\'équipe maîtrise parfaitement les enjeux du GEO et du SEO IA.',
    author: 'Sophie Renard',
    role: 'CMO · Maison Lumière',
  },
  'flowstack': {
    company: 'FlowStack',
    category: 'SaaS B2B',
    challenge: 'Marque absente des réponses ChatGPT et Claude',
    result: '×4 mentions dans les LLMs',
    detail: '0 → 1 200 citations LLM/mois',
    duration: '4 mois',
    tags: ['LLMO', 'GEO'],
    description: 'FlowStack, outil de productivité B2B, n\'apparaissait dans aucune recommandation LLM. Leur pipeline sales stagnait pendant que des concurrents plus visibles raflaient les deals.',
    context: 'Avec 65% des acheteurs B2B qui consultent ChatGPT avant de sélectionner un outil SaaS, être absent des réponses LLM représentait un manque à gagner direct et quantifiable.',
    solution: [
      'Audit de présence dans 10 LLMs avec analyse concurrentielle',
      'Stratégie de contenu LLMO : articles de fond, comparatifs, use cases',
      'Citation engineering : obtenir des mentions dans les sources de confiance',
      'Optimisation du corpus de contenu pour l\'autorité topique',
      'Monitoring en temps réel des mentions LLM et alertes',
    ],
    results: [
      { metric: 'Mentions LLM/mois', value: '1 200' },
      { metric: 'Multiplieur', value: '×4' },
      { metric: 'LLMs qui recommandent', value: '8/10' },
      { metric: 'Pipeline impacté', value: '+35%' },
    ],
    quote: 'La stratégie LLMO de Nexus nous a permis de devenir la référence que ChatGPT recommande dans notre secteur. ROI exceptionnel dès le 3ème mois.',
    author: 'Thomas Lefort',
    role: 'CEO · FlowStack',
  },
  'lefort-associes': {
    company: 'Lefort & Associés',
    category: 'Cabinet Juridique',
    challenge: 'Concurrence féroce sur les requêtes à forte valeur',
    result: '#1 sur 89 requêtes clés',
    detail: '+260% leads qualifiés',
    duration: '3 mois',
    tags: ['AEO', 'SEO Technique'],
    description: 'Cabinet spécialisé en droit des affaires, Lefort & Associés faisait face à une concurrence accrue de cabinets mieux dotés digitalement sur leurs requêtes cibles.',
    context: 'Dans le secteur juridique, chaque lead qualifié représente plusieurs milliers d\'euros. Dominer les featured snippets sur des requêtes comme "rachat de créances entreprise" ou "liquidation judiciaire" était un enjeu critique.',
    solution: [
      'Audit technique complet : 47 erreurs critiques corrigées',
      'Stratégie AEO sur 120 requêtes questions juridiques',
      'Structuration FAQ avec Schema.org sur toutes les pages services',
      'Contenu E-E-A-T : mise en avant des expertises et certifications',
      'Rich snippets avocats avec Schema.org LegalService',
    ],
    results: [
      { metric: 'Requêtes Top 1', value: '89' },
      { metric: 'Leads qualifiés', value: '+260%' },
      { metric: 'Featured snippets', value: '34' },
      { metric: 'Score technique', value: '96/100' },
    ],
    quote: 'Grâce à l\'AEO, notre cabinet est maintenant la réponse suggérée sur toutes les requêtes juridiques stratégiques. Nos leads ont explosé en qualité et en volume.',
    author: 'Camille Dumont',
    role: 'Directrice Marketing · Lefort & Associés',
  },
}

// Generate metadata
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = cases[params.slug]
  if (!c) return {}
  return {
    title: `${c.company} — ${c.result} | Nexus SEO`,
    description: c.description,
  }
}

export default function CaseDetailPage({ params }: { params: { slug: string } }) {
  const c = cases[params.slug]
  if (!c) notFound()

  return (
    <>
      <Header />
      <main className="bg-white dark:bg-surface-950">
        {/* Hero */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/cases" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-brand-500 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Tous les cas clients
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="section-badge">{c.category}</span>
              {c.tags.map((tag) => (
                <span key={tag} className="section-badge">{tag}</span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white mb-4">
              {c.company}
            </h1>
            <p className="text-xl text-surface-500 dark:text-surface-400 mb-10">
              {c.description}
            </p>

            {/* Result cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {c.results.map((r) => (
                <div key={r.metric} className="card p-5 text-center">
                  <p className="text-2xl font-black gradient-text mb-1">{r.value}</p>
                  <p className="text-xs text-surface-400">{r.metric}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              {/* Context */}
              <div>
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Le contexte</h2>
                <p className="text-surface-600 dark:text-surface-400 leading-relaxed">{c.context}</p>
              </div>

              {/* Solution */}
              <div>
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Notre approche</h2>
                <ul className="space-y-3">
                  {c.solution.map((s) => (
                    <li key={s} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                      </div>
                      <span className="text-sm text-surface-600 dark:text-surface-400">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quote */}
              <blockquote className="card-gradient p-8 rounded-2xl">
                <p className="text-lg text-surface-700 dark:text-surface-300 italic leading-relaxed mb-5">
                  &ldquo;{c.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
                    {c.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">{c.author}</p>
                    <p className="text-xs text-surface-400">{c.role}</p>
                  </div>
                </div>
              </blockquote>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wide mb-4">Résultats clés</h3>
                <div className="space-y-4">
                  {c.results.map((r) => (
                    <div key={r.metric}>
                      <p className="text-2xl font-black gradient-text">{r.value}</p>
                      <p className="text-xs text-surface-400">{r.metric}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wide mb-4">Infos</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-400">Secteur</span>
                    <span className="text-surface-900 dark:text-white font-medium">{c.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Durée</span>
                    <span className="text-surface-900 dark:text-white font-medium">{c.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Services</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {c.tags.map((tag) => (
                        <span key={tag} className="text-xs font-semibold text-brand-600 dark:text-brand-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/signup" className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                Obtenir les mêmes résultats
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export function generateStaticParams() {
  return Object.keys(cases).map((slug) => ({ slug }))
}
