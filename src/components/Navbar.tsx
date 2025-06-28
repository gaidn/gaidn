"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function Navbar() {
  const { data: session, status } = useSession()

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
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${session.user.githubUsername}`}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{session.user.customName || session.user.name}</span>
              </Link>
              <Button asChild variant="ghost" size="sm">
                <Link href="/settings">设置</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                退出
              </Button>
            </div>
          ) : (
            <Button onClick={() => signIn("github")} size="sm">
              GitHub 登录
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
} 