'use client'

import { useGitHubAuth } from '../hooks'
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
  callbackUrl,
  onError,
}: GitHubLoginButtonProps) => {
  const { loginWithGitHub, isLoading, error } = useGitHubAuth()
  const [isButtonLoading, setIsButtonLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setIsButtonLoading(true)
      console.log('开始 GitHub 登录流程...')
      const result = await loginWithGitHub({ 
        callbackUrl,
        redirect: true 
      })
      console.log('GitHub 登录结果:', result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败'
      console.error('登录失败:', error)
      onError?.(errorMessage)
    } finally {
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
      {error && !onError && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 