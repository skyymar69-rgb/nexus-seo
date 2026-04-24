import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'

const posts: Record<string, {
  title: string
  category: string
  readTime: string
  date: string
  excerpt: string
  content: string[]
  tag_color: string
}> = {
  'geo-guide-complet-2026': {
    title: 'Guide complet du GEO en 2026 : optimiser pour Google SGE et les moteurs génératifs',
    category: 'GEO',
    readTime: '12 min',
    date: '28 mars 2026',
    excerpt: 'Tout ce que vous devez savoir sur le Generative Engine Optimization : comment fonctionne Google SGE, quels signaux il utilise, et comment structurer votre contenu pour être cité.',
    tag_color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/40',
    content: [
      'Le Generative Engine Optimization (GEO) est devenu la priorité absolue de tout référenceur en 2026. Depuis que Google a généralisé ses AI Overviews à l\'ensemble de ses marchés, les clics organiques "classiques" ont chuté de 30 à 60% sur les requêtes informationnelles.',
      'La bonne nouvelle ? Ceux qui maîtrisent le GEO captent désormais une visibilité nouvelle, plus qualifiée, directement dans les réponses générées. Voici comment.',
      '## Qu\'est-ce que le GEO ?',
      'Le GEO est l\'ensemble des pratiques visant à optimiser votre contenu pour qu\'il soit sélectionné comme source par les moteurs génératifs — principalement Google SGE, mais aussi Bing Copilot et Perplexity.',
      'Contrairement au SEO classique où vous optimisez pour apparaître en position 1-10, avec le GEO vous optimisez pour être cité à l\'intérieur de la réponse générée.',
      '## Les 4 signaux clés du GEO',
      '**1. La crédibilité E-E-A-T** : les moteurs génératifs sélectionnent en priorité les sources ayant une expertise démontrée, des auteurs identifiés, et des signaux d\'autorité forts.',
      '**2. La structure de l\'information** : votre contenu doit répondre directement aux questions. Les sections H2/H3 descriptives, les listes à puces et les tableaux sont fortement valorisés.',
      '**3. Le Schema.org** : les données structurées Article, FAQ, HowTo, Product signalent explicitement à l\'IA la nature et la fiabilité de votre contenu.',
      '**4. La fraîcheur** : les AI Overviews préfèrent les contenus récents et régulièrement mis à jour.',
      '## Comment auditer votre score GEO',
      'Nexus calcule automatiquement votre score GEO sur 100 en analysant ces quatre dimensions. Un score > 70 est nécessaire pour apparaître régulièrement dans les AI Overviews. Nos clients en plan Professionnel reçoivent un rapport GEO hebdomadaire avec les opportunités d\'amélioration priorisées.',
    ],
  },
  'llmo-chatgpt-recommande-votre-marque': {
    title: 'Comment faire en sorte que ChatGPT recommande votre marque ?',
    category: 'LLMO',
    readTime: '9 min',
    date: '25 mars 2026',
    excerpt: 'Le LLMO (Large Language Model Optimization) est la discipline la plus stratégique de 2026. Voici la méthode exacte pour apparaître dans les recommandations de ChatGPT, Claude et Gemini.',
    tag_color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
    content: [
      'ChatGPT reçoit plus d\'un milliard de requêtes par jour. Une fraction significative de ces requêtes est du type "quel est le meilleur outil pour [X]" ou "recommande-moi une solution pour [Y]". Si votre marque n\'y apparaît pas, vous perdez des clients potentiels chaque minute.',
      'Le LLMO (Large Language Model Optimization) est la discipline qui adresse ce problème. Voici la méthode.',
      '## Comment les LLMs décident qui recommander',
      'Les LLMs comme ChatGPT ou Claude sont entraînés sur des milliards de documents. Ils "connaissent" les marques qui sont fréquemment mentionnées, analysées, citées comme références dans des sources de qualité.',
      'La règle de base : si vous êtes cité dans des sources que les LLMs considèrent comme fiables (publications spécialisées, forums d\'experts, études sectorielles), votre probabilité d\'être recommandé augmente.',
      '## La stratégie LLMO en 4 étapes',
      '**Étape 1 — Audit de présence** : commencer par mesurer où vous en êtes. Nexus envoie des requêtes types à 10+ LLMs et analyse si votre marque apparaît, avec quel sentiment, et face à quels concurrents.',
      '**Étape 2 — Citation engineering** : obtenir des mentions dans les publications que les LLMs valorisent. Guides sectoriels, comparatifs d\'outils, études de cas publiées par des tiers.',
      '**Étape 3 — Autorité topique** : produire le contenu de référence de votre secteur. Les LLMs recommandent les marques dont le corpus de contenu est le plus complet et le plus cité.',
      '**Étape 4 — Monitoring continu** : surveiller en temps réel l\'évolution de vos mentions dans chaque LLM et ajuster la stratégie.',
    ],
  },
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = posts[params.slug]
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['Nexus SEO'],
      tags: [post.category, 'SEO', 'IA'],
      images: [`/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug]
  if (!post) notFound()

  return (
    <>
      <Header />
      <main className="bg-white dark:bg-surface-950">
        <article className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-brand-500 transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              Retour au blog
            </Link>

            <div className="flex items-center gap-3 mb-5">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.tag_color}`}>{post.category}</span>
              <span className="text-xs text-surface-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />{post.readTime}
              </span>
              <span className="text-xs text-surface-400">{post.date}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-surface-500 dark:text-surface-400 mb-12 leading-relaxed border-b border-surface-200 dark:border-surface-800 pb-10">
              {post.excerpt}
            </p>

            <div className="prose-custom space-y-5">
              {post.content.map((block, i) => {
                if (block.startsWith('## ')) {
                  return (
                    <h2 key={i} className="text-2xl font-bold text-surface-900 dark:text-white mt-10 mb-4">
                      {block.slice(3)}
                    </h2>
                  )
                }
                if (block.startsWith('**')) {
                  return (
                    <p key={i} className="text-surface-600 dark:text-surface-400 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, '<strong class="text-surface-900 dark:text-white">$1</strong>') }}
                    />
                  )
                }
                return (
                  <p key={i} className="text-surface-600 dark:text-surface-400 leading-relaxed">
                    {block}
                  </p>
                )
              })}
            </div>

            {/* CTA */}
            <div className="mt-16 card-gradient p-8 rounded-2xl text-center">
              <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-3">
                Prêt à optimiser votre {post.category} ?
              </h3>
              <p className="text-surface-500 dark:text-surface-400 mb-6 text-sm">
                Audit gratuit en 5 minutes. Découvrez votre score {post.category} et les actions prioritaires.
              </p>
              <Link href="/signup" className="btn-primary px-8 py-3 rounded-xl inline-flex items-center gap-2">
                Lancer mon audit gratuit
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }))
}
