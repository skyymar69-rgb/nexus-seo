'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface Website {
  id: string
  domain: string
  name: string | null
  verified: boolean
  createdAt: string
  latestAudit?: {
    score: number
    grade: string
    createdAt: string
  } | null
}

interface WebsiteContextType {
  websites: Website[]
  selectedWebsite: Website | null
  isLoading: boolean
  selectWebsite: (id: string) => void
  addWebsite: (domain: string, name?: string) => Promise<Website | null>
  refreshWebsites: () => Promise<void>
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined)

export function WebsiteProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [websites, setWebsites] = useState<Website[]>([])
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchWebsites = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false)
      return
    }
    try {
      const res = await fetch('/api/websites')
      if (res.ok) {
        const data = await res.json()
        setWebsites(data)

        // Auto-select from localStorage or first website
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('nexus-selected-website') : null
        const saved = data.find((w: Website) => w.id === savedId)
        if (saved) {
          setSelectedWebsite(saved)
        } else if (data.length > 0 && !selectedWebsite) {
          setSelectedWebsite(data[0])
          if (typeof window !== 'undefined') {
            localStorage.setItem('nexus-selected-website', data[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchWebsites()
  }, [fetchWebsites])

  const selectWebsite = useCallback((id: string) => {
    const website = websites.find(w => w.id === id)
    if (website) {
      setSelectedWebsite(website)
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexus-selected-website', id)
      }
    }
  }, [websites])

  const addWebsite = useCallback(async (domain: string, name?: string): Promise<Website | null> => {
    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, name }),
      })
      if (res.ok) {
        const newWebsite = await res.json()
        setWebsites(prev => [...prev, newWebsite])
        if (!selectedWebsite) {
          setSelectedWebsite(newWebsite)
          if (typeof window !== 'undefined') {
            localStorage.setItem('nexus-selected-website', newWebsite.id)
          }
        }
        return newWebsite
      }
      const errorData = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
      throw new Error(errorData.error || `Erreur ${res.status}`)
    } catch (error) {
      console.error('Failed to add website:', error)
      throw error
    }
  }, [selectedWebsite])

  return (
    <WebsiteContext.Provider value={{
      websites,
      selectedWebsite,
      isLoading,
      selectWebsite,
      addWebsite,
      refreshWebsites: fetchWebsites,
    }}>
      {children}
    </WebsiteContext.Provider>
  )
}

export function useWebsite() {
  const context = useContext(WebsiteContext)
  if (context === undefined) {
    throw new Error('useWebsite must be used within a WebsiteProvider')
  }
  return context
}
