'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Nexus Error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-black text-surface-900 dark:text-white mb-4">
          Une erreur est survenue
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8">
          Nous sommes desoles. Une erreur inattendue s&apos;est produite.
          Essayez de recharger la page ou revenez a l&apos;accueil.
        </p>

        {error.digest && (
          <p className="text-xs text-surface-400 mb-6 font-mono">
            Code erreur: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reessayer
          </button>
          <Link href="/" className="btn-outline px-6 py-3 rounded-xl inline-flex items-center gap-2">
            <Home className="w-4 h-4" /> Accueil
          </Link>
          <Link href="/contact" className="btn-ghost px-6 py-3 rounded-xl inline-flex items-center gap-2">
            <Mail className="w-4 h-4" /> Contacter le support
          </Link>
        </div>
      </div>
    </div>
  )
}
