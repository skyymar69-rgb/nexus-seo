import dynamic from 'next/dynamic'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { TrustedBy } from '@/components/landing/TrustedBy'
import { Stats } from '@/components/landing/Stats'
import { Problem } from '@/components/landing/Problem'
import { BentoFeatures } from '@/components/landing/BentoFeatures'
import { AISection } from '@/components/landing/AISection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ToolsGrid } from '@/components/landing/ToolsGrid'
import { EcoImpact } from '@/components/landing/EcoImpact'
import { Footer } from '@/components/landing/Footer'

// Below-the-fold components — lazy-loaded for performance
const Comparison = dynamic(() => import('@/components/landing/Comparison').then(m => m.Comparison), { ssr: true })
const CaseStudies = dynamic(() => import('@/components/landing/CaseStudies').then(m => m.CaseStudies), { ssr: true })
const Testimonials = dynamic(() => import('@/components/landing/Testimonials').then(m => m.Testimonials), { ssr: true })
const FAQ = dynamic(() => import('@/components/landing/FAQ').then(m => m.FAQ), { ssr: true })
const CTA = dynamic(() => import('@/components/landing/CTA').then(m => m.CTA), { ssr: true })
const ExitIntent = dynamic(() => import('@/components/shared/ExitIntent'), { ssr: false })

export const metadata = {
  title: 'Nexus SEO — GEO · AEO · LLMO | La référence SEO de l\'ère IA',
  description:
    "Nexus est le premier outil SEO conçu pour 2026 : optimisez votre présence dans ChatGPT, Perplexity, Google SGE et tous les LLMs. GEO, AEO, LLMO — une seule plateforme.",
  keywords: 'SEO IA, GEO, AEO, LLMO, ChatGPT SEO, Google SGE, optimisation LLM, visibilité IA',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Nexus SEO — La référence SEO de l\'ère IA',
    description: 'GEO · AEO · LLMO : dominez ChatGPT, Google SGE, Perplexity et tous les moteurs IA.',
    type: 'website',
    images: ['/og-image.png'],
  },
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content">
        {/* TOFU — Attirer & Capter */}
        <Hero />
        <TrustedBy />
        <Stats />

        {/* MOFU — Éduquer & Convaincre */}
        <Problem />
        <BentoFeatures />
        <AISection />
        <HowItWorks />
        <ToolsGrid />

        {/* Proof & Trust */}
        <Comparison />
        <CaseStudies />
        <Testimonials />

        {/* Values */}
        <EcoImpact />

        {/* BOFU — Convertir */}
        <FAQ />
        <CTA />
      </main>
      <ExitIntent />
      <Footer />
    </>
  )
}
