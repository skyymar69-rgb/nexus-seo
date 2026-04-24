import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import Link from 'next/link'
import { ArrowRight, Check, MapPin, Search, Zap, Globe, BarChart3 } from 'lucide-react'

// 50 principales villes francaises pour le SEO programmatique
const CITIES: Record<string, { name: string; region: string; population: string; description: string }> = {
  'paris': { name: 'Paris', region: 'Ile-de-France', population: '2.1M', description: 'capitale et centre economique' },
  'lyon': { name: 'Lyon', region: 'Auvergne-Rhone-Alpes', population: '516K', description: 'deuxieme ville numerique de France' },
  'marseille': { name: 'Marseille', region: 'Provence-Alpes-Cote d\'Azur', population: '870K', description: 'hub mediterraneen' },
  'toulouse': { name: 'Toulouse', region: 'Occitanie', population: '493K', description: 'ville rose et pole aeronautique' },
  'nice': { name: 'Nice', region: 'Provence-Alpes-Cote d\'Azur', population: '342K', description: 'capitale de la Cote d\'Azur' },
  'nantes': { name: 'Nantes', region: 'Pays de la Loire', population: '318K', description: 'ville innovante de l\'Ouest' },
  'strasbourg': { name: 'Strasbourg', region: 'Grand Est', population: '284K', description: 'capitale europeenne' },
  'montpellier': { name: 'Montpellier', region: 'Occitanie', population: '290K', description: 'ville etudiante et tech' },
  'bordeaux': { name: 'Bordeaux', region: 'Nouvelle-Aquitaine', population: '257K', description: 'pole viticole et numerique' },
  'lille': { name: 'Lille', region: 'Hauts-de-France', population: '233K', description: 'carrefour europeen' },
  'rennes': { name: 'Rennes', region: 'Bretagne', population: '220K', description: 'pole numerique breton' },
  'grenoble': { name: 'Grenoble', region: 'Auvergne-Rhone-Alpes', population: '160K', description: 'ville alpine et tech' },
  'rouen': { name: 'Rouen', region: 'Normandie', population: '114K', description: 'capitale normande' },
  'toulon': { name: 'Toulon', region: 'Provence-Alpes-Cote d\'Azur', population: '178K', description: 'port mediterraneen' },
  'clermont-ferrand': { name: 'Clermont-Ferrand', region: 'Auvergne-Rhone-Alpes', population: '147K', description: 'capitale auvergnate' },
  'dijon': { name: 'Dijon', region: 'Bourgogne-Franche-Comte', population: '158K', description: 'ville gastronomique' },
  'angers': { name: 'Angers', region: 'Pays de la Loire', population: '155K', description: 'ville verte' },
  'saint-etienne': { name: 'Saint-Etienne', region: 'Auvergne-Rhone-Alpes', population: '174K', description: 'ville du design' },
  'brest': { name: 'Brest', region: 'Bretagne', population: '139K', description: 'pointe bretonne' },
  'le-mans': { name: 'Le Mans', region: 'Pays de la Loire', population: '146K', description: 'ville des 24 heures' },
}

export const dynamicParams = true

export async function generateStaticParams() {
  return Object.keys(CITIES).map(ville => ({ ville: `audit-seo-${ville}` }))
}

function extractCity(slug: string): string {
  return slug.replace(/^audit-seo-/, '')
}

export async function generateMetadata({ params }: { params: { ville: string } }): Promise<Metadata> {
  const city = CITIES[extractCity(params.ville)]
  if (!city) return { title: 'Page non trouvee' }

  return {
    title: `Audit SEO gratuit a ${city.name} — Nexus SEO`,
    description: `Analysez votre site web gratuitement a ${city.name}. 50+ outils SEO, GEO, AEO, LLMO. Score SEO instantane, recommandations actionnables. 100% gratuit.`,
    openGraph: {
      title: `Audit SEO gratuit a ${city.name}`,
      description: `Optimisez votre visibilite a ${city.name} avec Nexus SEO. Audit complet, mots-cles, backlinks, visibilite IA.`,
    },
  }
}

export default function AuditSEOVillePage({ params }: { params: { ville: string } }) {
  const city = CITIES[extractCity(params.ville)]
  if (!city) notFound()

  const features = [
    'Audit SEO complet (30+ criteres)',
    'Score Core Web Vitals (Google PageSpeed)',
    'Analyse de mots-cles et positions',
    'Profil de backlinks',
    'Visibilite IA (ChatGPT, Claude, Gemini)',
    'Score GEO, AEO, LLMO',
    'Generateur de contenu SEO',
    'Rapports exportables (PDF, CSV, HTML)',
  ]

  return (
    <>
      <Header />
      <main id="main-content" className="bg-white dark:bg-surface-950">
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[
              { label: 'Accueil', href: '/' },
              { label: 'Outils', href: '/audit-gratuit' },
              { label: `Audit SEO ${city.name}` },
            ]} />

            <div className="text-center mt-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-full mb-6">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span className="text-brand-700 dark:text-brand-400 text-sm font-bold">{city.name} — {city.region}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-surface-900 dark:text-white mb-6">
                Audit SEO gratuit a{' '}
                <span className="gradient-text">{city.name}</span>
              </h1>

              <p className="text-xl text-surface-700 dark:text-surface-400 max-w-2xl mx-auto mb-10">
                Analysez votre site web en 30 secondes. Obtenez un diagnostic SEO complet avec des recommandations adaptees au marche de {city.name}, {city.description}.
              </p>

              <Link
                href="/audit-gratuit"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold text-lg hover:from-brand-700 hover:to-accent-700 transition-all shadow-lg"
              >
                Lancer mon audit gratuit <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white text-center mb-4">
              Ce que comprend votre audit SEO a {city.name}
            </h2>
            <p className="text-center text-surface-600 dark:text-surface-400 mb-12 max-w-2xl mx-auto">
              Tous les outils sont gratuits, illimites et sans carte bancaire. Nexus SEO est le seul outil qui combine SEO classique et visibilite IA.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map(feature => (
                <div key={feature} className="flex items-center gap-3 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4">
                  <div className="w-6 h-6 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-sm text-surface-700 dark:text-surface-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why local SEO */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-surface-200 dark:border-surface-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white text-center mb-12">
              Pourquoi le SEO est essentiel a {city.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Search, title: 'Visibilite locale', desc: `Les entreprises de ${city.name} (${city.population} habitants) doivent se demarquer dans les resultats Google locaux.` },
                { icon: Globe, title: 'Visibilite IA', desc: `ChatGPT et Gemini recommandent deja des entreprises locales. Soyez visible dans ces nouveaux moteurs a ${city.name}.` },
                { icon: BarChart3, title: 'Avantage concurrentiel', desc: `La majorite des PME de ${city.name} n'optimisent pas leur SEO. C'est votre opportunite.` },
              ].map(item => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <h3 className="font-bold text-surface-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-surface-600 dark:text-surface-400">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-600 to-violet-600">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pret a optimiser votre site a {city.name} ?
            </h2>
            <p className="text-white/80 mb-8">
              Rejoignez les entreprises de {city.name} qui utilisent Nexus SEO pour dominer Google et les moteurs IA.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-700 font-bold text-lg hover:bg-surface-50 transition-colors shadow-lg">
              Creer mon compte gratuit <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Other cities */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-surface-200 dark:border-surface-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white text-center mb-8">
              Audit SEO gratuit dans d&apos;autres villes
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(CITIES)
                .filter(([slug]) => slug !== extractCity(params.ville))
                .slice(0, 15)
                .map(([slug, c]) => (
                  <Link
                    key={slug}
                    href={`/outils/audit-seo-${slug}`}
                    className="px-3 py-1.5 text-xs font-medium rounded-full border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
                  >
                    Audit SEO {c.name}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
