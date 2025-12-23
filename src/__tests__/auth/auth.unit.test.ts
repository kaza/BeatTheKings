import { describe, it, expect } from 'vitest'
import {
  isPublicRoute,
  requiresAvatar,
  getPostLoginRedirect,
  PUBLIC_ROUTES,
  AVATAR_REQUIRED_ROUTES,
} from '@/lib/auth'

describe('Auth Utilities', () => {
  describe('isPublicRoute', () => {
    it('should return true for public routes', () => {
      expect(isPublicRoute('/')).toBe(true)
      expect(isPublicRoute('/login')).toBe(true)
      expect(isPublicRoute('/api/auth')).toBe(true)
      expect(isPublicRoute('/api/auth/callback/google')).toBe(true)
      expect(isPublicRoute('/api/auth/signin')).toBe(true)
    })

    it('should return false for protected routes', () => {
      expect(isPublicRoute('/welcome')).toBe(false)
      expect(isPublicRoute('/avatar')).toBe(false)
      expect(isPublicRoute('/ranking')).toBe(false)
      expect(isPublicRoute('/map')).toBe(false)
      expect(isPublicRoute('/challenges')).toBe(false)
    })

    it('should handle nested routes correctly', () => {
      expect(isPublicRoute('/api/auth/providers')).toBe(true)
      expect(isPublicRoute('/login/error')).toBe(true)
      expect(isPublicRoute('/api/users')).toBe(false)
    })
  })

  describe('requiresAvatar', () => {
    it('should return true for avatar-required routes', () => {
      expect(requiresAvatar('/welcome')).toBe(true)
      expect(requiresAvatar('/ranking')).toBe(true)
      expect(requiresAvatar('/map')).toBe(true)
      expect(requiresAvatar('/challenges')).toBe(true)
      expect(requiresAvatar('/matches')).toBe(true)
    })

    it('should return false for routes that do not require avatar', () => {
      expect(requiresAvatar('/login')).toBe(false)
      expect(requiresAvatar('/avatar')).toBe(false)
      expect(requiresAvatar('/')).toBe(false)
      expect(requiresAvatar('/api/auth')).toBe(false)
    })

    it('should handle nested routes correctly', () => {
      expect(requiresAvatar('/challenges/123')).toBe(true)
      expect(requiresAvatar('/matches/456')).toBe(true)
      expect(requiresAvatar('/ranking/city')).toBe(true)
    })
  })

  describe('getPostLoginRedirect', () => {
    it('should return /avatar for users without avatar', () => {
      expect(getPostLoginRedirect(false)).toBe('/avatar')
    })

    it('should return /welcome for users with avatar', () => {
      expect(getPostLoginRedirect(true)).toBe('/welcome')
    })
  })

  describe('Route Constants', () => {
    it('should have public routes defined', () => {
      expect(PUBLIC_ROUTES).toContain('/')
      expect(PUBLIC_ROUTES).toContain('/login')
      expect(PUBLIC_ROUTES).toContain('/api/auth')
    })

    it('should have avatar-required routes defined', () => {
      expect(AVATAR_REQUIRED_ROUTES).toContain('/welcome')
      expect(AVATAR_REQUIRED_ROUTES).toContain('/ranking')
      expect(AVATAR_REQUIRED_ROUTES).toContain('/map')
      expect(AVATAR_REQUIRED_ROUTES).toContain('/challenges')
      expect(AVATAR_REQUIRED_ROUTES).toContain('/matches')
    })
  })
})
