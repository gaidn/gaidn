'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export default function DirectGitHubLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDirectLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('直接调用 GitHub 登录...')
      
      // 直接调用 GitHub 登录，强制重定向
      await signIn('github', { 
        callbackUrl: '/',
        redirect: true
      })
    } catch (err) {
      console.error('登录错误:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            直接 GitHub 登录测试
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            使用直接调用 signIn 函数的方式登录
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <Button
              onClick={handleDirectLogin}
              disabled={isLoading}
              className="w-full max-w-xs"
              size="lg"
            >
              <Github className="mr-2 h-4 w-4" />
              {isLoading ? '登录中...' : '使用 GitHub 登录'}
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              这是一个直接使用 NextAuth signIn 函数的测试页面
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 