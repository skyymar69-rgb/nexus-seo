'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'nexus-cookie-consent'

type ConsentValue = 'accepted' | 'refused' | 'custom'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY)
    if (!consent) {
      // Small delay so the animation is visible
      const t = setTimeout(() => setVisible(true), 500)
      return () => clearTimeout(t)
    }
  }, [])

  function handleConsent(value: ConsentValue) {
    localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed bottom-0 inset-x-0 z-[9999] animate-slide-up"
    >
      <div className="mx-auto max-w-5xl px-4 pb-4">
        <div className="rounded-2xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 shadow-elev-lg p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Text */}
            <p className="flex-1 text-sm text-surface-800 dark:text-surface-200 leading-relaxed">
              Ce site utilise des cookies pour am&eacute;liorer votre exp&eacute;rience.
              En continuant, vous acceptez notre{' '}
              <Link
                href="/privacy"
                className="text-brand-700 dark:text-brand-300 underline underline-offset-2 hover:text-brand-800 dark:hover:text-brand-200 transition-colors"
              >
                politique de confidentialit&eacute;
              </Link>
              .
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => handleConsent('refused')}
                className="rounded-full border border-surface-300 dark:border-surface-700 px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-white/10 transition-colors"
              >
                Refuser
              </button>
              <button
                onClick={() => handleConsent('custom')}
                className="rounded-full border border-brand-600 dark:border-brand-400 px-4 py-2 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-400/10 transition-colors"
              >
                Personnaliser
              </button>
              <button
                onClick={() => handleConsent('accepted')}
                className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-elev-md"
              >
                Accepter tout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
