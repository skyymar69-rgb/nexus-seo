'use client'

import { useState, useCallback } from 'react'

export interface AuditCheck {
  id: string
  category: 'meta' | 'content' | 'technical' | 'performance'
  name: string
  status: 'passed' | 'warning' | 'error'
  score: number
  value: string
  recommendation: string
}

export interface AuditContent {
  wordCount: number
  h1Count: number
  h2Count: number
  h3Count: number
  imageCount: number
  imagesWithAlt: number
  internalLinks: number
  externalLinks: number
}

export interface AuditMeta {
  title: string | null
  description: string | null
  canonical: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
}

export interface AuditSummary {
  passed: number
  warnings: number
  errors: number
  totalChecks: number
}

export interface AuditResults {
  url: string
  score: number
  loadTime: number
  htmlSize: number
  checks: AuditCheck[]
  summary: AuditSummary
  meta: AuditMeta
  content: AuditContent
}

export interface UseAuditReturn {
  url: string
  setUrl: (url: string) => void
  loading: boolean
  error: string | null
  results: AuditResults | null
  runAudit: (urlParam?: string) => Promise<void>
  clearResults: () => void
}

// Helper to validate URL
function isValidUrl(urlString: string): boolean {
  let url: URL
  try {
    url = new URL(urlString)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

// Helper to normalize URL
function normalizeUrl(urlString: string): string {
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    return 'https://' + urlString
  }
  return urlString
}

export function useAudit(): UseAuditReturn {
  const [url, setUrl] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<AuditResults | null>(null)

  const clearResults = useCallback(() => {
    setResults(null)
    setError(null)
  }, [])

  const runAudit = useCallback(
    async (urlParam?: string) => {
      const urlToAudit = urlParam || url

      if (!urlToAudit.trim()) {
        setError('Veuillez entrer une URL valide')
        return
      }

      const normalizedUrl = normalizeUrl(urlToAudit.trim())

      if (!isValidUrl(normalizedUrl)) {
        setError('Veuillez entrer une URL valide (ex: www.monsite.fr)')
        return
      }

      setLoading(true)
      setError(null)
      setResults(null)

      try {
        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: normalizedUrl }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          setError(data.error || 'Une erreur est survenue lors de l\'analyse')
          setLoading(false)
          return
        }

        setResults(data.data)
        setUrl(normalizedUrl)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue'
        setError(`Erreur: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    },
    [url]
  )

  return {
    url,
    setUrl,
    loading,
    error,
    results,
    runAudit,
    clearResults,
  }
}
