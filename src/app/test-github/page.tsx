'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export default function TestGitHubLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleDirectLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('直接调用 signIn...')
      const result = await signIn('github', { 
        redirect: true,
        callbackUrl: '/' 
      })
      console.log('登录结果:', result)
      setResult(result)
    } catch (err) {
      console.error('登录错误:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">GitHub 登录测试页面</h1>
      
      <div className="p-6 border rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">直接调用 NextAuth signIn</h2>
        <Button
          onClick={handleDirectLogin}
          disabled={isLoading}
          className="w-full"
        >
          <Github className="mr-2 h-4 w-4" />
          {isLoading ? '登录中...' : '直接使用 GitHub 登录'}
        </Button>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            <p>错误: {error}</p>
          </div>
        )}
        
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 