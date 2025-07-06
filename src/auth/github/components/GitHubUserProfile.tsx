'use client'

import { useGitHubAuth } from '@/auth/github/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

interface GitHubUserProfileProps {
  className?: string
  showLogout?: boolean
}

export const GitHubUserProfile = ({
  className,
  showLogout = true,
}: GitHubUserProfileProps) => {
  const { user, logout, isLoading } = useGitHubAuth()

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  // 使用 image 或 avatar_url 作为头像
  const avatarUrl = user.image || user.avatar_url || ''
  // 使用 name 或 login 或 githubUsername 作为显示名
  const displayName = user.name || user.login || user.githubUsername || '用户'

  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {displayName}
        </span>
        {user.email && (
          <span className="text-xs text-muted-foreground">{user.email}</span>
        )}
      </div>

      {showLogout && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoading}
          className="ml-auto"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 