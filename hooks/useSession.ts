'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'
import type { Session } from 'next-auth'

interface ExtendedUser {
  id: string
  email?: string
  name?: string
  image?: string
  plan?: string
  role?: string
}

interface ExtendedSession extends Session {
  user: ExtendedUser
}

export function useSession() {
  const { data: session, status, update } = useNextAuthSession() as {
    data: ExtendedSession | null
    status: 'authenticated' | 'loading' | 'unauthenticated'
    update: (data?: any) => Promise<ExtendedSession | null>
  }

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user ?? null,
    update,
  }
}
