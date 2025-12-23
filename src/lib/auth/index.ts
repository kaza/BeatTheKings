import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Re-export adapter functions
export * from './drizzle-adapter'

/**
 * Extended session user type with our custom fields
 */
export interface SessionUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  hasCreatedAvatar: boolean
}

/**
 * Extended session type
 */
export interface AppSession {
  user: SessionUser
  expires: string
}

/**
 * Get server-side session
 * Use this in Server Components and API routes
 */
export async function getSession(): Promise<AppSession | null> {
  const session = await getServerSession(authOptions)
  return session as AppSession | null
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session?.user
}

/**
 * Get current user from session (server-side)
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()
  return session?.user || null
}

/**
 * Require authentication - throws if not authenticated
 * Use in API routes and Server Components that require auth
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = ['/', '/login', '/api/auth']

/**
 * Routes that require profile completion (onboarding)
 */
export const PROFILE_REQUIRED_ROUTES = [
  '/avatar',
  '/welcome',
  '/ranking',
  '/map',
  '/challenges',
  '/matches',
]

/**
 * Routes that require avatar to be created
 */
export const AVATAR_REQUIRED_ROUTES = ['/welcome', '/ranking', '/map', '/challenges', '/matches']

/**
 * Check if a path is public (no auth required)
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`) || path.startsWith('/api/auth')
  )
}

/**
 * Check if a path requires avatar
 */
export function requiresAvatar(path: string): boolean {
  return AVATAR_REQUIRED_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
}

/**
 * Get redirect path after login based on user state
 */
export function getPostLoginRedirect(hasCreatedAvatar: boolean): string {
  return hasCreatedAvatar ? '/welcome' : '/avatar'
}
