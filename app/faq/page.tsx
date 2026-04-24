import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { FAQ } from '@/components/landing/FAQ'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

export const metadata = {
  title: 'FAQ — Questions fréquentes',
  description: 'Tout ce que vous devez savoir sur Nexus, le GEO, l\'AEO, le LLMO et notre plateforme SEO IA. Réponses rapides et complètes.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ | Nexus SEO',
    description: 'Tout ce que vous devez savoir sur Nexus, le GEO, l\'AEO, le LLMO et notre plateforme SEO IA.',
    images: ['/api/og?title=FAQ&subtitle=Questions%20fr%C3%A9quentes'],
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: "Qu'est-ce que le GEO, l'AEO et le LLMO ?", acceptedAnswer: { '@type': 'Answer', text: "Le GEO optimise votre contenu pour les réponses IA de Google SGE. L'AEO vous positionne sur les featured snippets. Le LLMO fait en sorte que ChatGPT, Claude et Gemini recommandent votre marque." } },
    { '@type': 'Question', name: 'Nexus est-il vraiment 100% gratuit ?', acceptedAnswer: { '@type': 'Answer', text: "Oui, tous les outils sont gratuits et sans limitation. Aucune carte bancaire requise. L'inscription sert à sauvegarder vos sites et suivis." } },
    { '@type': 'Question', name: 'Nexus est-il compatible avec mon CMS ?', acceptedAnswer: { '@type': 'Answer', text: "Oui, Nexus analyse n'importe quel site web : WordPress, Shopify, Webflow, Wix, Prestashop, ou sites custom React/Next.js." } },
    { '@type': 'Question', name: 'Comment Nexus surveille-t-il les mentions dans les LLMs ?', acceptedAnswer: { '@type': 'Answer', text: "Nexus envoie des requêtes aux APIs de ChatGPT, Claude, Gemini et Perplexity avec les questions-types de votre secteur et analyse les citations." } },
    { '@type': 'Question', name: 'Mes données sont-elles sécurisées ?', acceptedAnswer: { '@type': 'Answer', text: "Oui. Nexus est hébergé en Europe via Vercel et Railway, respecte le RGPD. Vos données ne sont jamais partagées." } },
  ],
}

export default function FAQPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="bg-white dark:bg-surface-950 pt-8">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-4">
          <Breadcrumb items={[{ label: 'Accueil', href: '/' }, { label: 'FAQ' }]} />
          <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-surface-900 dark:text-white mb-4">
            Centre d&apos;aide
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400">
            Toutes les réponses à vos questions sur Nexus et le SEO IA.
          </p>
          </div>
        </div>
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
