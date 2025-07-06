'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useCallback, useState } from 'react'
import type { GitHubUser, GitHubLoginOptions } from './types'

interface LoginResult {
  error?: string;
  ok?: boolean;
  url?: string;
  status?: number;
}

// 使用 GitHub 登录的 Hook
export const useGitHubAuth = () => {
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)

  const loginWithGitHub = useCallback(async (options?: GitHubLoginOptions): Promise<LoginResult | undefined> => {
    try {
      setError(null)
      console.log('useGitHubAuth: 开始 GitHub 登录流程...', { 
        callbackUrl: options?.callbackUrl || '/',
        redirect: options?.redirect,
        options
      })
      
      // 默认使用重定向模式
      if (options?.redirect === false) {
        // 非重定向模式，返回结果
        console.log('useGitHubAuth: 使用非重定向模式登录')
        try {
          const result = await signIn('github', {
            ...options,
            redirect: false,
          }) as LoginResult
          console.log('useGitHubAuth: 非重定向登录结果:', result)
          
          if (result?.error) {
            setError(result.error)
            console.error('useGitHubAuth: GitHub 登录失败:', result.error)
          }
          
          return result
        } catch (err) {
          console.error('useGitHubAuth: signIn 非重定向模式内部错误:', err)
          setError(err instanceof Error ? err.message : '登录过程出错')
          return { error: '登录失败' }
        }
      } else {
        // 重定向模式
        console.log('useGitHubAuth: 使用重定向模式登录，即将跳转...')
        try {
          // 确保回调URL正确设置
          await signIn('github', {
            callbackUrl: options?.callbackUrl || '/',
          })
          console.log('useGitHubAuth: 重定向登录已发起')
          return undefined
        } catch (err) {
          console.error('useGitHubAuth: signIn 重定向模式内部错误:', err)
          setError(err instanceof Error ? err.message : '登录过程出错')
          return { error: '登录失败' }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败'
      setError(errorMessage)
      console.error('useGitHubAuth: GitHub 登录过程中捕获到错误:', error)
      return { error: errorMessage }
    }
  }, [])

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)
      console.log('useGitHubAuth: 开始登出流程...')
      await signOut({ callbackUrl: '/' })
      console.log('useGitHubAuth: 登出成功')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登出失败'
      setError(errorMessage)
      console.error('useGitHubAuth: 登出失败:', error)
      return false
    }
  }, [])

  console.log('useGitHubAuth: 当前状态:', { 
    status, 
    isAuthenticated: status === 'authenticated',
    hasSession: !!session,
    user: session?.user
  })

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
  
  console.log('useAuthGuard: 当前状态:', { isAuthenticated, isLoading, requiresAuth: !isAuthenticated && !isLoading })
  
  return {
    isAuthenticated,
    isLoading,
    requiresAuth: !isAuthenticated && !isLoading,
    error,
  }
} 