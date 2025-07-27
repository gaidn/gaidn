"use client";

import type { CTASectionProps } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Github, Trophy, User, Sparkles, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function CTASection({ 
  title, 
  description, 
  loginButtonText,
  leaderboardButtonText,
  className 
}: CTASectionProps): JSX.Element {
  const { data: session, status } = useSession();
  const t = useTranslations();

  // 渲染加载状态，避免 hydration 不匹配
  if (status === "loading") {
    return (
      <section className={cn(
        "py-24 px-4 relative overflow-hidden",
        className
      )}>
        {/* 加载状态背景 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-muted/50 rounded-lg mx-auto max-w-2xl"></div>
            <div className="h-6 bg-muted/30 rounded mx-auto max-w-3xl"></div>
            <div className="h-6 bg-muted/30 rounded mx-auto max-w-xl"></div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="h-14 w-48 bg-muted/50 rounded-xl" />
              <div className="h-14 w-48 bg-muted/50 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 判断用户是否已登录
  const isLoggedIn = !!session;

  return (
    <section className={cn(
      "py-24 px-4 relative overflow-hidden",
      className
    )}>
      {/* 增强渐变背景 */}
      <div className="absolute inset-0 -z-10">
        {/* 主渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-background/98 to-accent/12"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent"></div>
        
        {/* 动态装饰元素 */}
        <div className="absolute top-1/6 left-1/8 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/6 right-1/8 w-96 h-96 bg-gradient-to-bl from-accent/10 to-primary/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/6 rounded-full blur-2xl animate-pulse delay-2000"></div>
        
        {/* 装饰性光线 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-b from-primary/30 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-t from-accent/30 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center">
        {/* 标题区域 */}
        <div className="mb-16 animate-fadeInUp">
          {/* 装饰性图标 */}
          <div className="relative inline-block mb-8">
            <Sparkles className="h-12 w-12 text-primary mx-auto animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 text-primary/20 blur-lg animate-pulse"></div>
          </div>
          
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
            <span className="text-foreground">
              {title}
            </span>
          </h2>
          
          {/* 描述文字卡片 */}
          <div className="max-w-4xl mx-auto">
            <div className="relative backdrop-blur-sm bg-card/40 border border-border/20 rounded-2xl p-8">
              <div className="relative z-10">
                <p className="text-xl md:text-2xl leading-relaxed text-card-foreground">
                  {description}
                </p>
              </div>
              
              {/* 卡片装饰 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 rounded-2xl"></div>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="animate-fadeInUp delay-200">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* 主要操作按钮 */}
            <div className="relative group">
              {isLoggedIn ? (
                <Button
                  size="lg"
                  className="enhanced-gradient-button flex items-center gap-3 px-10 py-6 text-lg font-semibold text-white"
                  asChild
                >
                  <Link href="/profile">
                    <User className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    <span>{t("user.view_my_profile")}</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="enhanced-gradient-button flex items-center gap-3 px-10 py-6 text-lg font-semibold text-white"
                  onClick={() => window.location.href = "/auth/signin"}
                >
                  <Github className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span>{loginButtonText}</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              )}
            </div>

            {/* 次要操作按钮 */}
            <div className="relative group">
              <Button
                size="lg"
                className="enhanced-gradient-button-secondary flex items-center gap-3 px-10 py-6 text-lg font-semibold text-white"
                asChild
              >
                <Link href="/leaderboard">
                  <Trophy className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  <span>{leaderboardButtonText}</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </div>
          </div>

          {/* 底部装饰性提示 */}
          <div className="mt-12 animate-fadeInUp delay-400">
            <p className="text-sm text-muted-foreground/60 max-w-md mx-auto">
              {t("home.cta.bottom_text")}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}