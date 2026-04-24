import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'

export const metadata = {
  title: 'Cas clients — Résultats prouvés | Nexus SEO',
  description: 'Découvrez comment nos clients ont multiplié leur trafic organique et leur visibilité dans les LLMs grâce à Nexus GEO, AEO et LLMO.',
  openGraph: {
    title: 'Cas clients',
    description: 'Découvrez comment nos clients ont multiplié leur trafic organique et leur visibilité dans les LLMs grâce à Nexus GEO, AEO et LLMO.',
    images: ['/api/og?title=Cas%20clients&subtitle=Resultats%20concrets'],
  },
}

const cases = [
  {
    slug: 'maison-lumiere',
    category: 'E-commerce Mode',
    company: 'Maison Lumière',
    challenge: 'Trafic en chute suite aux AI Overviews Google (-43% en 3 mois)',
    result: '+420% trafic organique',
    detail: '3,2M → 15,6M visites/mois en 6 mois',
    tags: ['GEO', 'AEO'],
    duration: '6 mois',
    description: 'Maison Lumière, enseigne de mode premium, a vu son trafic organique s\'effondrer après le déploiement des AI Overviews. Nexus a restructuré leur contenu pour les moteurs génératifs.',
  },
  {
    slug: 'flowstack',
    category: 'SaaS B2B',
    company: 'FlowStack',
    challenge: 'Marque absente des réponses ChatGPT et Claude',
    result: '×4 mentions dans les LLMs',
    detail: '0 → 1 200 citations LLM/mois',
    tags: ['LLMO', 'GEO'],
    duration: '4 mois',
    description: 'FlowStack, outil de productivité B2B, n\'existait pas dans les recommandations des LLMs. La stratégie LLMO de Nexus en a fait la référence citée par ChatGPT dans leur secteur.',
  },
  {
    slug: 'lefort-associes',
    category: 'Cabinet Juridique',
    company: 'Lefort & Associés',
    challenge: 'Concurrence féroce sur les requêtes juridiques à forte valeur',
    result: '#1 sur 89 requêtes clés',
    detail: '+260% leads qualifiés',
    tags: ['AEO', 'SEO Technique'],
    duration: '3 mois',
    description: 'Lefort & Associés, cabinet spécialisé en droit des affaires, voulait dominer les featured snippets sur leurs requêtes cibles. L\'AEO Nexus leur a permis de devenir la réponse de référence.',
  },
  {
    slug: 'techflow-saas',
    category: 'SaaS Tech',
    company: 'TechFlow SaaS',
    challenge: 'Croissance organique stagnante malgré un bon produit',
    result: '#1 sur 67 requêtes',
    detail: '+180% demos bookées',
    tags: ['GEO', 'LLMO', 'SEO Technique'],
    duration: '5 mois',
    description: 'TechFlow avait un bon produit mais une visibilité nulle dans les moteurs IA. La combinaison GEO+LLMO de Nexus a transformé leur acquisition.',
  },
  {
    slug: 'agence-digitale-lyon',
    category: 'Agence Marketing',
    company: 'Agence Digitale Lyon',
    challenge: 'Gérer 45+ clients SEO avec des rapports cohérents',
    result: '45 audits / jour',
    detail: '-70% temps reporting',
    tags: ['Analytics', 'AEO'],
    duration: '2 mois',
    description: 'L\'Agence Digitale Lyon utilisait 4 outils différents pour gérer ses clients SEO. Nexus a centralisé tout en une plateforme avec rapports white-label automatisés.',
  },
  {
    slug: 'ecommerce-sante',
    category: 'E-commerce Santé',
    company: 'VitaShop Pro',
    challenge: 'Forte concurrence + contraintes réglementaires santé',
    result: '+310% trafic qualifié',
    detail: '+90 positions Top 3',
    tags: ['SEO Technique', 'AEO'],
    duration: '8 mois',
    description: 'VitaShop Pro opère dans un secteur très réglementé. L\'audit technique + AEO de Nexus leur a permis de structurer du contenu E-E-A-T conforme et performant.',
  },
]

const tagColors: Record<string, string> = {
  'GEO': 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 border-brand-200 dark:border-brand-800/50',
  'AEO': 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 border-violet-200 dark:border-violet-800/50',
  'LLMO': 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50',
  'SEO Technique': 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  'Analytics': 'bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-400 border-accent-200 dark:border-accent-800/50',
}

export default function CasesPage() {
  return (
    <>
      <Header />
      <main className="bg-white dark:bg-surface-950">
        {/* Hero */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="section-badge mx-auto mb-4">Résultats concrets</div>
            <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white mb-6">
              Ils ont choisi Nexus.{' '}
              <span className="gradient-text">Voici leurs résultats.</span>
            </h1>
            <p className="text-xl text-surface-500 dark:text-surface-400">
              Des entreprises de toutes tailles, tous secteurs — résultats vérifiables et documentés.
            </p>
          </div>
        </section>

        {/* Cases grid */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => (
              <Link
                key={c.slug}
                href={`/cases/${c.slug}`}
                className="card-hover p-7 flex flex-col group"
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-xs text-surface-400 mb-1">{c.category}</p>
                    <p className="text-base font-bold text-surface-900 dark:text-white">{c.company}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 dark:group-hover:bg-brand-950/60 transition-colors">
                    <TrendingUp className="w-4 h-4 text-brand-500" />
                  </div>
                </div>

                <p className="text-xs text-surface-400 italic mb-4">&ldquo;{c.challenge}&rdquo;</p>

                <div className="rounded-2xl bg-surface-50 dark:bg-surface-800 border border-surface-100 dark:border-surface-700 p-4 mb-5">
                  <p className="text-xl font-black text-surface-900 dark:text-white mb-0.5">{c.result}</p>
                  <p className="text-xs text-surface-400">{c.detail}</p>
                </div>

                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed mb-5 flex-1">
                  {c.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${tagColors[tag] || 'bg-surface-100 text-surface-600 border-surface-200'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-surface-400">{c.duration}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">
              Votre entreprise sera le prochain cas client ?
            </h2>
            <Link href="/signup" className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2">
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
