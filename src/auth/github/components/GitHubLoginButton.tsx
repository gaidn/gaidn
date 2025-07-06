'use client'

import { useGitHubAuth } from '@/auth/github/hooks'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { useState } from 'react'

interface GitHubLoginButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  children?: React.ReactNode
  callbackUrl?: string
  onError?: (error: string) => void
}

export const GitHubLoginButton = ({
  className,
  variant = 'default',
  size = 'default',
  children,
  callbackUrl = '/',
  onError,
}: GitHubLoginButtonProps) => {
  const { loginWithGitHub, isLoading } = useGitHubAuth()
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLogin = async () => {
    try {
      setIsButtonLoading(true)
      setLoginError(null)
      
      console.log('GitHubLoginButton: 点击登录按钮，准备开始登录流程...')
      console.log('GitHubLoginButton: 使用回调URL:', callbackUrl)
      
      // 使用重定向模式，直接跳转到GitHub授权页面
      const result = await loginWithGitHub({ callbackUrl })
      
      // 检查是否有错误返回（非重定向模式或出错的情况）
      if (result?.error) {
        setLoginError(result.error)
        onError?.(result.error)
        setIsButtonLoading(false)
      }
      
      // 注意：重定向模式下，这里的代码不会继续执行，因为页面会被重定向
    } catch (error) {
      // 这个 catch 块现在应该很少被触发，因为大多数错误都在 hook 中处理了
      const errorMessage = error instanceof Error 
        ? `登录错误: ${error.message}` 
        : '登录过程中发生未知错误'
      
      console.error('GitHubLoginButton: 登录过程中捕获到错误:', error)
      setLoginError(errorMessage)
      onError?.(errorMessage)
      
      // 确保按钮状态重置
      setIsButtonLoading(false)
    }
  }

  const buttonLoading = isLoading || isButtonLoading

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleLogin}
        disabled={buttonLoading}
        variant={variant}
        size={size}
        className={className}
      >
        <Github className="mr-2 h-4 w-4" />
        {children || (buttonLoading ? '登录中...' : '使用 GitHub 登录')}
      </Button>
      
      {/* 显示错误信息 */}
      {loginError && (
        <p className="text-sm text-red-500">
          {loginError}
        </p>
      )}
    </div>
  )
} 