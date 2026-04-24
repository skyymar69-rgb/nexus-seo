'use client'

import Link from 'next/link'
import { Mail } from 'lucide-react'
import { AnimatedLogo } from '@/components/shared/AnimatedLogo'

const footerLinks = {
  Outils: [
    { label: 'Audit SEO gratuit', href: '/audit-gratuit' },
    { label: 'Audit GEO (IA)', href: '/dashboard/geo-audit' },
    { label: 'Score AEO', href: '/dashboard/aeo-score' },
    { label: 'Score LLMO', href: '/dashboard/llmo-score' },
    { label: 'Tous les outils', href: '/audit-gratuit#outils' },
  ],
  Ressources: [
    { label: 'Cas clients', href: '/cases' },
    { label: 'Blog SEO IA', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Services', href: '/services' },
  ],
  Entreprise: [
    { label: '\u00C0 propos', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Agence Web Kayzen', href: 'https://internet.kayzen-lyon.fr' },
  ],
  Légal: [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/privacy' },
    { label: 'CGU', href: '/cgu' },
    { label: 'Accessibilite', href: '/accessibilite' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-surface-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top: brand + newsletter */}
        <div className="py-12 flex flex-col lg:flex-row items-start justify-between gap-10 border-b border-white/5">
          <div className="max-w-xs">
            <Link href="/" className="inline-block mb-4">
              <AnimatedLogo size={36} />
            </Link>
            <p className="text-sm text-surface-700 dark:text-surface-400 leading-relaxed mb-5">
              La référence mondiale des outils SEO pour l&apos;ère de l&apos;IA. GEO · AEO · LLMO — tout en une plateforme.
            </p>
            <div className="flex gap-2">
              <a
                href="mailto:contact@nexus-seo.com"
                aria-label="Nous contacter par email"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors border border-white/10"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="max-w-sm w-full lg:w-auto">
            <p className="text-sm font-bold text-surface-900 dark:text-white mb-1">Newsletter SEO IA</p>
            <p className="text-xs text-white/50 mb-4">Les dernières tendances GEO, AEO et LLMO chaque semaine.</p>
            <form onSubmit={(e) => e.preventDefault()} aria-label="Inscription a la newsletter" className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" aria-hidden="true" />
                <input
                  type="email"
                  placeholder="votre@email.fr"
                  aria-label="Adresse email pour la newsletter"
                  aria-required="true"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-white dark:bg-surface-800 border border-white/10 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-semibold btn-primary"
              >
                S&apos;abonner
              </button>
            </form>
            <p className="text-xs text-white/50 mt-2">Pas de spam. Désabonnement en un clic.</p>
          </div>
        </div>

        {/* Links grid */}
        <nav aria-label="Liens du pied de page" className="py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 border-b border-white/5">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p id={`footer-${title.toLowerCase()}`} className="text-xs font-bold tracking-widest text-white/50 uppercase mb-4">
                {title}
              </p>
              <ul className="space-y-2.5" aria-labelledby={`footer-${title.toLowerCase()}`}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-700 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {currentYear} Nexus SEO — un service de <a href="https://kayzen-lyon.fr" className="text-brand-500 hover:underline">Kayzen Lyon</a>. Tous droits réservés.
          </p>
          <div className="flex items-center gap-1.5">
            {[
              { label: 'RGPD', color: 'text-brand-500' },
              { label: 'Hébergé en Europe', color: 'text-violet-500' },
              { label: '100% Gratuit', color: 'text-accent-500' },
            ].map((badge) => (
              <span
                key={badge.label}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border border-white/10 bg-white dark:bg-surface-800 ${badge.color}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
