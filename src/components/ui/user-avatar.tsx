"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"
import { cn } from "@/lib/utils"
import { Github, User } from "lucide-react"
import { Badge } from "./badge"

export interface UserAvatarProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
  showOnlineIndicator?: boolean
  showGithubBadge?: boolean
  isOnline?: boolean
  isGithubConnected?: boolean
}

const sizeVariants = {
  sm: "h-6 w-6",
  md: "h-8 w-8", 
  lg: "h-10 w-10",
  xl: "h-12 w-12"
}

const UserAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  UserAvatarProps
>(({ 
  className, 
  src, 
  alt, 
  fallback, 
  size = "md",
  showOnlineIndicator = false,
  showGithubBadge = false,
  isOnline = false,
  isGithubConnected = false,
  ...props 
}, ref) => {
  const getFallbackText = (): React.ReactNode => {
    if (fallback) return fallback
    if (alt) return alt.charAt(0).toUpperCase()
    return <User className="h-4 w-4" />
  }

  return (
    <div className="relative inline-block">
      <Avatar
        ref={ref}
        className={cn(sizeVariants[size], className)}
        {...props}
      >
        <AvatarImage src={src || undefined} alt={alt || "用户头像"} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
          {getFallbackText()}
        </AvatarFallback>
      </Avatar>
      
      {/* 在线状态指示器 */}
      {showOnlineIndicator && (
        <div className="absolute -bottom-0 -right-0 flex items-center justify-center">
          <div className={cn(
            "h-3 w-3 rounded-full border-2 border-background",
            isOnline ? "bg-green-500" : "bg-gray-400"
          )} />
        </div>
      )}
      
      {/* GitHub 连接状态徽章 */}
      {showGithubBadge && isGithubConnected && (
        <div className="absolute -top-1 -right-1">
          <Badge variant="secondary" className="h-5 w-5 p-0 rounded-full">
            <Github className="h-3 w-3" />
          </Badge>
        </div>
      )}
    </div>
  )
})

UserAvatar.displayName = "UserAvatar"

export { UserAvatar }