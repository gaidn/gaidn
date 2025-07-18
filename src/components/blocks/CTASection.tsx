"use client";

import { CTASectionProps } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Github, Trophy, User } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function CTASection({ 
  title, 
  description, 
  loginButtonText,
  leaderboardButtonText,
  className 
}: CTASectionProps): JSX.Element {
  const { data: session, status } = useSession();

  // 渲染加载状态，避免 hydration 不匹配
  if (status === "loading") {
    return (
      <section className={cn(
        "py-20 px-4",
        className
      )}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {title}
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="h-14 w-48 bg-muted animate-pulse rounded-md" />
            <div className="h-14 w-48 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
      </section>
    );
  }

  // 判断用户是否已登录
  const isLoggedIn = !!session;

  return (
    <section className={cn(
      "py-20 px-4",
      className
    )}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {title}
        </h2>
        
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isLoggedIn ? (
            <Button
              size="lg"
              className="flex items-center gap-2 px-8 py-6 text-lg font-medium hover:scale-105 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <Link href="/profile">
                <User className="h-5 w-5" />
                查看我的资料
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex items-center gap-2 px-8 py-6 text-lg font-medium hover:scale-105 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => window.location.href = "/auth/signin"}
            >
              <Github className="h-5 w-5" />
              {loginButtonText}
            </Button>
          )}

          <Button
            size="lg"
            className="flex items-center gap-2 px-8 py-6 text-lg font-medium hover:scale-105 transition-all duration-300 bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <Link href="/leaderboard">
              <Trophy className="h-5 w-5" />
              {leaderboardButtonText}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}