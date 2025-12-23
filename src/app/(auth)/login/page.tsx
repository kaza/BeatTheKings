'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Logo } from '@/components/layout/Logo'
import { useAuth } from '@/lib/hooks/useAuth'

type OAuthProvider = 'google' | 'azure-ad'

interface OAuthError {
  provider: OAuthProvider | null
  message: string
}

/**
 * Login page wrapper with Suspense for useSearchParams
 */
export default function LoginPage(): JSX.Element {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  )
}

/**
 * Loading skeleton for login page
 */
function LoginPageSkeleton(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-[#F5F5F7]">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 animate-pulse">
        <div className="flex justify-center">
          <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded-lg" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
        </div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded-lg" />
          <div className="h-12 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </main>
  )
}

/**
 * Main login page content
 */
function LoginPageContent(): JSX.Element {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading, hasCreatedAvatar } = useAuth()

  const [isSigningIn, setIsSigningIn] = useState(false)
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<OAuthError | null>(null)

  // Check for OAuth error from callback
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError({
        provider: null,
        message: getErrorMessage(errorParam),
      })
    }
  }, [searchParams])

  // Redirect authenticated users based on avatar status
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectPath = hasCreatedAvatar ? '/welcome' : '/avatar'
      router.push(redirectPath)
    }
  }, [isAuthenticated, authLoading, hasCreatedAvatar, router])

  const handleSignIn = async (provider: OAuthProvider): Promise<void> => {
    setIsSigningIn(true)
    setActiveProvider(provider)
    setError(null)

    try {
      const result = await signIn(provider, {
        callbackUrl: '/',
        redirect: true,
      })

      if (result?.error) {
        setError({
          provider,
          message: getErrorMessage(result.error),
        })
        setIsSigningIn(false)
        setActiveProvider(null)
      }
    } catch {
      setError({
        provider,
        message: 'An unexpected error occurred. Please try again.',
      })
      setIsSigningIn(false)
      setActiveProvider(null)
    }
  }

  const isButtonDisabled = isSigningIn || authLoading

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-[#F5F5F7] relative">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <div className="text-sm font-semibold text-gray-900">EN / DE</div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-48 h-48 sm:w-64 sm:h-64">
            <Logo size="lg" pulsing />
          </div>
        </div>

        {/* Headline */}
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Rule the Game
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Join the ultimate sports competition platform
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            role="alert"
          >
            <p className="font-medium">Sign in failed</p>
            <p>{error.message}</p>
          </div>
        )}

        {/* OAuth Sign In Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleSignIn('google')}
            disabled={isButtonDisabled}
            aria-label="Sign in with Google"
            className="w-full min-h-[48px] bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-base border border-gray-300 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <GoogleIcon />
            <span>
              {activeProvider === 'google' && isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </button>

          <button
            onClick={() => handleSignIn('azure-ad')}
            disabled={isButtonDisabled}
            aria-label="Sign in with Microsoft"
            className="w-full min-h-[48px] bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-base border border-gray-300 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <MicrosoftIcon />
            <span>
              {activeProvider === 'azure-ad' && isSigningIn
                ? 'Signing in...'
                : 'Sign in with Microsoft'}
            </span>
          </button>
        </div>

        {/* Info */}
        <p className="text-center text-xs sm:text-sm text-gray-500">
          Sign in to get started with Beat the Kingz
        </p>
      </div>
    </main>
  )
}

function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    OAuthSignin: 'Could not start sign in. Please try again.',
    OAuthCallback: 'Could not complete sign in. Please try again.',
    OAuthCreateAccount: 'Could not create account. Please try again.',
    EmailCreateAccount: 'Could not create account with this email.',
    Callback: 'Sign in was cancelled or failed.',
    OAuthAccountNotLinked: 'This email is already linked to another account.',
    SessionRequired: 'Please sign in to continue.',
    Default: 'An error occurred during sign in. Please try again.',
  }
  return errorMessages[errorCode] || errorMessages.Default
}

function GoogleIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function MicrosoftIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" viewBox="0 0 23 23" aria-hidden="true">
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  )
}
