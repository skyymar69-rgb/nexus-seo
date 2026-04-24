import Link from 'next/link'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Search, Home, ArrowRight, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main-content" className="bg-white dark:bg-surface-950 min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-2xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-10 h-10 text-brand-500" />
          </div>

          <h1 className="text-6xl font-black text-surface-900 dark:text-white mb-4">404</h1>
          <h2 className="text-xl font-bold text-surface-700 dark:text-surface-300 mb-4">
            Page introuvable
          </h2>
          <p className="text-surface-500 dark:text-surface-400 mb-8">
            La page que vous cherchez n&apos;existe pas ou a ete deplacee.
            Verifiez l&apos;URL ou utilisez les liens ci-dessous.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2">
              <Home className="w-4 h-4" /> Accueil
            </Link>
            <Link href="/audit-gratuit" className="btn-outline px-6 py-3 rounded-xl inline-flex items-center gap-2">
              <Search className="w-4 h-4" /> Audit gratuit
            </Link>
            <Link href="/dashboard" className="btn-ghost px-6 py-3 rounded-xl inline-flex items-center gap-2">
              Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-2 text-xs">
            {[
              { label: 'Services', href: '/services' },
              { label: 'Tarifs', href: '/pricing' },
              { label: 'Blog', href: '/blog' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Contact', href: '/contact' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="px-3 py-1.5 rounded-full border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-brand-400 hover:text-brand-600 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
