'use client'

import { useSession } from 'next-auth/react'
import { useCallback } from 'react'

/**
 * Custom hook for authentication state
 * Provides user info, auth status, and helper methods
 */
export function useAuth() {
  const { data: session, status, update } = useSession()

  const user = session?.user

  /**
   * Refresh session data from server
   * Call this after updating user data (e.g., creating avatar)
   */
  const refreshSession = useCallback(async () => {
    await update()
  }, [update])

  return {
    // User data
    user,
    userId: user?.id,
    email: user?.email,
    name: user?.name,
    hasCreatedAvatar: user?.hasCreatedAvatar ?? false,

    // Auth status
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isUnauthenticated: status === 'unauthenticated',

    // Session
    session,
    status,

    // Methods
    refreshSession,
  }
}
