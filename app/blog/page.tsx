import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import Link from 'next/link'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

export const metadata = {
  title: 'Blog SEO IA — GEO, AEO, LLMO',
  description: 'Les dernieres tendances et strategies SEO pour l\'ere de l\'IA : GEO, AEO, LLMO, ChatGPT SEO, Google SGE. Guides pratiques et etudes de cas.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog SEO & IA | Nexus SEO',
    description: 'Les dernieres tendances et strategies SEO pour l\'ere de l\'IA : GEO, AEO, LLMO, ChatGPT SEO, Google SGE. Guides pratiques et etudes de cas.',
    images: ['/api/og?title=Blog%20SEO%20%26%20IA&subtitle=Articles%20et%20guides'],
  },
}

const posts = [
  {
    slug: 'geo-guide-complet-2026',
    category: 'GEO',
    title: 'Guide complet du GEO en 2026 : optimiser pour Google SGE et les moteurs génératifs',
    excerpt: 'Tout ce que vous devez savoir sur le Generative Engine Optimization : comment fonctionne Google SGE, quels signaux il utilise, et comment structurer votre contenu pour être cité.',
    readTime: '12 min',
    date: '28 mars 2026',
    featured: true,
    tag_color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/40',
  },
  {
    slug: 'llmo-chatgpt-recommande-votre-marque',
    category: 'LLMO',
    title: 'Comment faire en sorte que ChatGPT recommande votre marque ?',
    excerpt: 'Le LLMO (Large Language Model Optimization) est la discipline la plus stratégique de 2026. Voici la méthode exacte pour apparaître dans les recommandations de ChatGPT, Claude et Gemini.',
    readTime: '9 min',
    date: '25 mars 2026',
    featured: false,
    tag_color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
  },
  {
    slug: 'aeo-featured-snippets-voice-search',
    category: 'AEO',
    title: 'AEO 2026 : dominer les featured snippets et la voice search avec l\'IA',
    excerpt: 'L\'Answer Engine Optimization va bien au-delà des balises FAQ. Découvrez comment structurer votre contenu pour que Google, Alexa et Siri vous choisissent comme réponse de référence.',
    readTime: '8 min',
    date: '20 mars 2026',
    featured: false,
    tag_color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40',
  },
  {
    slug: 'core-web-vitals-2026-guide',
    category: 'SEO Technique',
    title: 'Core Web Vitals 2026 : INP remplace FID, ce que ça change pour votre SEO',
    excerpt: 'L\'Interaction to Next Paint (INP) est maintenant le signal Core Web Vital principal. Comment mesurer, comprendre et optimiser votre INP pour maintenir vos positions.',
    readTime: '7 min',
    date: '15 mars 2026',
    featured: false,
    tag_color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
  },
  {
    slug: 'eeat-seo-ia-2026',
    category: 'GEO',
    title: 'E-E-A-T et l\'IA : comment prouver votre expertise aux moteurs génératifs',
    excerpt: 'Experience, Expertise, Authoritativeness, Trustworthiness — ces critères sont devenus encore plus critiques avec les AI Overviews. Voici comment les optimiser concrètement.',
    readTime: '10 min',
    date: '10 mars 2026',
    featured: false,
    tag_color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/40',
  },
  {
    slug: 'semrush-vs-nexus-comparaison',
    category: 'Comparatif',
    title: 'Semrush vs Nexus en 2026 : lequel choisir pour le SEO IA ?',
    excerpt: 'Comparaison détaillée des deux plateformes sur tous les critères : GEO, LLMO, prix, support, facilité d\'utilisation. Spoiler : l\'un d\'eux n\'existe pas encore en 2015.',
    readTime: '6 min',
    date: '5 mars 2026',
    featured: false,
    tag_color: 'text-surface-500 bg-surface-100 dark:bg-surface-800',
  },
]

export default function BlogPage() {
  const [featured, ...rest] = posts

  return (
    <>
      <Header />
      <main id="main-content" className="bg-white dark:bg-surface-950">
        {/* Hero */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'Blog' }]} />
            <div className="text-center">
            <div className="section-badge mx-auto mb-4">Blog SEO IA</div>
            <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white mb-4">
              Les stratégies SEO{' '}
              <span className="gradient-text">de l&apos;ère IA</span>
            </h1>
            <p className="text-lg text-surface-500 dark:text-surface-400">
              GEO · AEO · LLMO · SEO Technique — guides pratiques et études de cas chaque semaine.
            </p>
            </div>
          </div>
        </section>

        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Featured */}
            <Link href={`/blog/${featured.slug}`} className="card-hover p-0 overflow-hidden flex flex-col md:flex-row mb-8 group">
              <div className="md:w-2/5 bg-gradient-to-br from-brand-500 via-violet-600 to-cyan-600 flex items-center justify-center p-12 min-h-48">
                <span className="text-white/20 text-9xl font-black">SEO</span>
              </div>
              <div className="md:w-3/5 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${featured.tag_color}`}>{featured.category}</span>
                  <span className="text-xs text-surface-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{featured.readTime}
                  </span>
                  <span className="text-xs text-surface-400">{featured.date}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-surface-500 dark:text-surface-400 text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 group-hover:gap-2.5 transition-all">
                  Lire l&apos;article <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="card-hover p-6 flex flex-col group">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${post.tag_color}`}>{post.category}</span>
                    <span className="text-xs text-surface-400 flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" />{post.readTime}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-surface-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-surface-400">
                    <span>{post.date}</span>
                    <span className="text-brand-500 font-semibold group-hover:gap-1 flex items-center gap-0.5 transition-all">
                      Lire <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
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
