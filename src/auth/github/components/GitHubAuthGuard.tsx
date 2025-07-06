'use client'

import { useAuthGuard } from '../hooks'
import { GitHubLoginButton } from '@/auth/github/components/GitHubLoginButton'
import { Lock, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface GitHubAuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
  redirectUrl?: string
}

export const GitHubAuthGuard = ({
  children,
  fallback,
  className,
  redirectUrl,
}: GitHubAuthGuardProps) => {
  const { isLoading, requiresAuth, error: authError } = useAuthGuard()
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLoginError = (error: string) => {
    setLoginError(error)
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className || ''}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (requiresAuth) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className || ''}`}>
        <div className="flex items-center gap-2 text-gray-600">
          <Lock className="h-5 w-5" />
          <span className="text-lg font-medium">需要登录</span>
        </div>
        <p className="text-sm text-gray-500 text-center">
          请使用 GitHub 账号登录以访问此页面
        </p>
        <GitHubLoginButton callbackUrl={redirectUrl} onError={handleLoginError} />
        
        {(loginError || authError) && (
          <div className="flex items-center gap-2 text-red-500 mt-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{loginError || authError}</span>
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
} 