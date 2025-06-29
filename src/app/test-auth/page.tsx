'use client'

import { GitHubLoginButton, GitHubUserProfile, GitHubAuthGuard, useGitHubAuth } from '@/auth/github'
import { useState } from 'react'

export default function TestAuthPage() {
  const { user, isAuthenticated, logout } = useGitHubAuth()
  const [showProtected, setShowProtected] = useState(false)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">GitHub 登录测试</h1>

      <div className="grid gap-8">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">登录状态</h2>
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 text-green-700 rounded-md">
                已登录
              </div>
              <GitHubUserProfile />
              <button 
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => logout()}
              >
                登出
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                未登录
              </div>
              <GitHubLoginButton />
            </div>
          )}
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">登录按钮</h2>
          <GitHubLoginButton />
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">受保护内容</h2>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
            onClick={() => setShowProtected(!showProtected)}
          >
            {showProtected ? '隐藏受保护内容' : '显示受保护内容'}
          </button>

          {showProtected && (
            <GitHubAuthGuard>
              <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
                这是受保护的内容，只有登录用户才能看到
              </div>
            </GitHubAuthGuard>
          )}
        </div>

        {isAuthenticated && user && (
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">用户信息</h2>
            <pre className="p-4 bg-gray-50 rounded-md overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 