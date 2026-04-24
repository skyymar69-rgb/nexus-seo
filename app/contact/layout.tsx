import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Parlons de Votre Visibilité IA',
  description:
    'Contactez l\'équipe Nexus SEO pour une démo personnalisée, un audit gratuit ou toute question sur le GEO, AEO et LLMO. Réponse sous 24h.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact | Nexus SEO',
    description:
      'Contactez l\'équipe Nexus SEO pour une démo personnalisée ou un audit gratuit. Réponse sous 24h.',
    images: ['/api/og?title=Contact&subtitle=Parlons%20de%20votre%20visibilit%C3%A9%20IA'],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
