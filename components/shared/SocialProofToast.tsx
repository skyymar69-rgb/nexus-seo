'use client'

import { useState, useEffect, useCallback } from 'react'

const messages = [
  { name: 'Thomas', city: 'Paris', action: 'vient de lancer un audit GEO', initials: 'TP' },
  { name: 'Sophie', city: 'Marseille', action: 'a analysé 3 concurrents', initials: 'SM' },
  { name: 'Marc', city: 'Bordeaux', action: 'a exporté son rapport SEO', initials: 'MB' },
  { name: 'Julie', city: 'Lyon', action: 'vient de créer son compte', initials: 'JL' },
  { name: 'Pierre', city: 'Toulouse', action: 'a lancé un score LLMO', initials: 'PT' },
]

const STORAGE_KEY = 'nexus_social_proof_seen'
const INITIAL_DELAY = 8000
const SHOW_DURATION = 4000
const CYCLE_INTERVAL = 12000

export default function SocialProofToast() {
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return
    } catch {
      // SSR or storage unavailable
    }
    setDismissed(false)
  }, [])

  const showToast = useCallback(() => {
    setVisible(true)
    const hideTimer = setTimeout(() => setVisible(false), SHOW_DURATION)
    return () => clearTimeout(hideTimer)
  }, [])

  // Initial delay then first show
  useEffect(() => {
    if (dismissed) return
    const timer = setTimeout(() => {
      showToast()
    }, INITIAL_DELAY)
    return () => clearTimeout(timer)
  }, [dismissed, showToast])

  // Cycle through messages
  useEffect(() => {
    if (dismissed) return
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % messages.length
        if (next === 0) {
          // We've shown all messages, mark as seen
          try {
            sessionStorage.setItem(STORAGE_KEY, '1')
          } catch {
            // ignore
          }
          setDismissed(true)
          return prev
        }
        return next
      })
      showToast()
    }, CYCLE_INTERVAL)
    return () => clearInterval(interval)
  }, [dismissed, showToast])

  if (dismissed && !visible) return null

  const msg = messages[index]

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ease-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-surface-900 shadow-lg border border-surface-200 dark:border-surface-700 max-w-xs">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {msg.initials}
        </div>
        {/* Text */}
        <p className="text-sm text-surface-700 dark:text-surface-300 leading-snug">
          <span className="font-semibold text-surface-900 dark:text-white">
            {msg.name} de {msg.city}
          </span>{' '}
          {msg.action}
        </p>
      </div>
    </div>
  )
}
