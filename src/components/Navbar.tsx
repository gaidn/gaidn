"use client"

// 兼容 next-auth 扩展属性
type UserWithGithub = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  githubUsername?: string;
  customName?: string;
};

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GitHubLoginButton, GitHubUserProfile } from "@/auth/github"
import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-xl">GAIDN</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              排行榜
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <GitHubUserProfile showLogout={false} />
          <GitHubLoginButton 
            variant="outline" 
            size="sm"
            className="hidden sm:flex"
          />
        </div>
      </div>
    </nav>
  )
} 