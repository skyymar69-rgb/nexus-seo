import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import { Providers } from '@/app/providers'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-outfit',
})

const CookieBanner = dynamic(() => import('@/components/shared/CookieBanner'), { ssr: false })
const AccessibilityToggle = dynamic(() => import('@/components/shared/AccessibilityToggle'), { ssr: false })
const ScrollProgress = dynamic(() => import('@/components/shared/ScrollProgress'), { ssr: false })
const AIChatWidget = dynamic(() => import('@/components/shared/AIChatWidget'), { ssr: false })
import './globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://nexus-seo.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Nexus SEO — La référence mondiale du SEO IA en 2026',
    template: '%s | Nexus SEO',
  },
  description:
    'Nexus est la plateforme SEO IA qui combine audit technique, suivi de mots-clés, analyse de backlinks et optimisation GEO·AEO·LLMO. Dominez Google, ChatGPT, Perplexity et tous les moteurs IA.',
  keywords: [
    'SEO', 'SEO IA', 'GEO', 'AEO', 'LLMO', 'audit SEO', 'suivi mots-clés',
    'backlinks', 'ChatGPT SEO', 'Perplexity SEO', 'plateforme SEO', 'outil SEO',
    'référencement naturel', 'visibilité IA', 'Google SGE',
  ],
  authors: [{ name: 'Nexus SEO' }],
  creator: 'Nexus SEO',
  publisher: 'Nexus SEO',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'fr': BASE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: BASE_URL,
    siteName: 'Nexus SEO',
    title: 'Nexus SEO — La référence mondiale du SEO IA en 2026',
    description:
      'Dominez Google, ChatGPT et tous les moteurs IA avec la seule plateforme SEO qui couvre GEO, AEO et LLMO.',
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Nexus SEO by Kayzen — Plateforme SEO et visibilité IA gratuite' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus SEO — La référence mondiale du SEO IA en 2026',
    description: 'Dominez Google, ChatGPT et tous les moteurs IA.',
    images: ['/og-image.png'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Nexus SEO',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
      sameAs: ['https://kayzen-lyon.fr'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: '6, rue Pierre Termier',
        addressLocality: 'Lyon',
        postalCode: '69009',
        addressCountry: 'FR',
      },
      telephone: '+33487776861',
      email: 'contact@kayzen-lyon.fr',
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Nexus SEO',
      publisher: { '@id': `${BASE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/blog?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Nexus SEO',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        description: 'Tous les outils SEO gratuits et sans limitation',
      },
      featureList: 'GEO Audit, AEO Scoring, LLMO Analysis, Technical SEO, Keyword Tracking, Backlink Analysis',
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${BASE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'Tarifs', item: `${BASE_URL}/pricing` },
        { '@type': 'ListItem', position: 4, name: 'Blog', item: `${BASE_URL}/blog` },
      ],
    },
    {
      '@type': 'Service',
      name: 'GEO — Generative Engine Optimization',
      description: 'Optimisez votre visibilité dans les réponses de ChatGPT, Claude, Gemini et Perplexity.',
      provider: { '@id': `${BASE_URL}/#organization` },
      areaServed: 'Worldwide',
      serviceType: 'SEO Optimization',
    },
    {
      '@type': 'Service',
      name: 'AEO — Answer Engine Optimization',
      description: 'Optimisez votre contenu pour les featured snippets, les réponses vocales et les People Also Ask.',
      provider: { '@id': `${BASE_URL}/#organization` },
      areaServed: 'Worldwide',
      serviceType: 'SEO Optimization',
    },
    {
      '@type': 'Service',
      name: 'LLMO — LLM Optimization',
      description: 'Mesurez et améliorez la probabilité que les LLMs recommandent votre marque.',
      provider: { '@id': `${BASE_URL}/#organization` },
      areaServed: 'Worldwide',
      serviceType: 'SEO Optimization',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* #1 Theme color + color scheme */}
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="color-scheme" content="light dark" />
        {/* #2 PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* #5 Apple mobile web app */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nexus SEO" />
        {/* #28 DNS prefetch for external APIs */}
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api.anthropic.com" />
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} min-h-screen bg-zinc-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 antialiased`}>
        <a href="#main-content" className="skip-to-main">
          Aller au contenu principal
        </a>
        <Providers>
          <div className="animate-fade-in">
          {children}
          </div>
          <ErrorBoundary><ScrollProgress /></ErrorBoundary>
          <ErrorBoundary><CookieBanner /></ErrorBoundary>
          <ErrorBoundary><AccessibilityToggle /></ErrorBoundary>
          <ErrorBoundary><AIChatWidget /></ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
