'use client'

import { AlertTriangle } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

/**
 * Accessible error state for dashboard pages.
 * WCAG 4.1.3 / RGAA 7.5
 */
export function ErrorState({
  message = 'Une erreur est survenue lors du chargement.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" aria-live="assertive" className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden="true" />
      <p className="text-sm text-zinc-600 dark:text-white/60">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors"
        >
          Reessayer
        </button>
      )}
    </div>
  )
}
