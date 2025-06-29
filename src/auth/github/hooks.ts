import { useSession, signIn, signOut } from 'next-auth/react'
import { useCallback, useState } from 'react'
import type { GitHubUser, GitHubLoginOptions } from './types'

// 使用 GitHub 登录的 Hook
export const useGitHubAuth = () => {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)

  const loginWithGitHub = useCallback(async (options?: GitHubLoginOptions) => {
    try {
      setError(null)
      const result = await signIn('github', {
        callbackUrl: options?.callbackUrl || '/',
        redirect: true,
        ...options,
      })
      
      if (result?.error) {
        setError(result.error)
        console.error('GitHub 登录失败:', result.error)
      }
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败'
      setError(errorMessage)
      console.error('GitHub 登录失败:', error)
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setError(null)
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登出失败'
      setError(errorMessage)
      console.error('登出失败:', error)
      throw error
    }
  }, [])

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const user = session?.user as GitHubUser | null

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithGitHub,
    logout,
  }
}

// 检查用户是否已登录的 Hook
export const useAuthGuard = () => {
  const { isAuthenticated, isLoading, error } = useGitHubAuth()
  
  return {
    isAuthenticated,
    isLoading,
    requiresAuth: !isAuthenticated && !isLoading,
    error,
  }
} 