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
        <div className="rounded-2xl border border-purple-500/20 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-purple-900/20 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Text */}
            <p className="flex-1 text-sm text-zinc-300 leading-relaxed">
              Ce site utilise des cookies pour am&eacute;liorer votre exp&eacute;rience.
              En continuant, vous acceptez notre{' '}
              <Link
                href="/privacy"
                className="text-purple-400 underline underline-offset-2 hover:text-purple-300 transition-colors"
              >
                politique de confidentialit&eacute;
              </Link>
              .
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => handleConsent('refused')}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
              >
                Refuser
              </button>
              <button
                onClick={() => handleConsent('custom')}
                className="rounded-lg border border-purple-500/40 px-4 py-2 text-sm font-medium text-purple-300 hover:bg-purple-500/10 transition-colors"
              >
                Personnaliser
              </button>
              <button
                onClick={() => handleConsent('accepted')}
                className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/25"
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
