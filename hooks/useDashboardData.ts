'use client'

import { useState, useEffect, useCallback } from 'react'

export interface DashboardAudit {
  id: string
  score: number
  grade: string
  createdAt: string
  website: { domain: string }
}

export interface DashboardNotification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface DashboardStats {
  websites: { total: number }
  audits: { total: number; latestScore: number | null }
  keywords: { total: number; avgPosition: number | null }
  backlinks: { total: number; dofollowRatio: number }
  aiVisibility: { totalQueries: number; mentionRate: number }
  notifications: { unread: number }
  recentActivity: {
    audits: DashboardAudit[]
    notifications: DashboardNotification[]
  }
}

interface UseDashboardDataReturn {
  data: DashboardStats | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardData(websiteId?: string): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (websiteId) {
        params.set('websiteId', websiteId)
      }
      const query = params.toString()
      const url = `/api/dashboard/stats${query ? `?${query}` : ''}`

      const res = await fetch(url)
      if (!res.ok) {
        if (res.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.')
          return
        }
        throw new Error(`Erreur ${res.status}`)
      }

      const json = await res.json()
      setData(json)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors du chargement des données'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [websiteId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
