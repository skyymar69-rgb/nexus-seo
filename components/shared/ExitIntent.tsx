'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { X, ArrowRight, Mail } from 'lucide-react'

const STORAGE_KEY = 'nexus_exit_intent_shown'

export default function ExitIntent() {
  const [show, setShow] = useState(false)
  const [url, setUrl] = useState('')
  const [email, setEmail] = useState('')
  const pathname = usePathname()

  const handleClose = useCallback(() => {
    setShow(false)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    // Only on landing pages
    if (pathname.startsWith('/dashboard')) return

    // Only once per session
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) {
        setShow(true)
        try {
          sessionStorage.setItem(STORAGE_KEY, '1')
        } catch {
          // ignore
        }
        document.removeEventListener('mouseout', handleMouseLeave)
      }
    }

    // Small delay before activating to avoid false triggers on page load
    const timer = setTimeout(() => {
      document.addEventListener('mouseout', handleMouseLeave)
    }, 3000)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseout', handleMouseLeave)
    }
  }, [pathname])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Offre avant de partir"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-surface-900 shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-brand-500 via-violet-500 to-gold-400" />

        <div className="p-8">
          {/* Heading */}
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
            Attendez ! Votre audit SEO gratuit vous attend
          </h2>
          <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">
            Entrez votre URL pour recevoir un audit complet GEO + AEO + LLMO en 5 minutes.
          </p>

          {/* URL input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (url.trim()) {
                window.location.href = `/audit-gratuit?url=${encodeURIComponent(url.trim())}`
              }
            }}
            className="mb-6"
          >
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://votre-site.fr"
                aria-label="URL du site a auditer"
                className="flex-1 px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                Auditer
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200 dark:border-surface-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-surface-900 px-3 text-xs text-surface-400">
                Ou recevez votre rapport par email
              </span>
            </div>
          </div>

          {/* Email input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (email.trim()) {
                handleClose()
                // In production this would submit to an API
              }
            }}
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  aria-label="Adresse email pour recevoir le rapport"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl border border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 font-semibold text-sm hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors flex-shrink-0"
              >
                Envoyer
              </button>
            </div>
          </form>

          {/* Trust */}
          <p className="text-xs text-surface-400 mt-4 text-center">
            Sans carte bancaire &middot; Résultat en 5 min &middot; 100% gratuit
          </p>
        </div>
      </div>
    </div>
  )
}
