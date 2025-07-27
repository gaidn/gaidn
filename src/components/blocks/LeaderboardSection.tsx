"use client";

import type { LeaderboardSectionProps } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Crown } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function LeaderboardSection({ 
  title, 
  description, 
  buttonText,
  className 
}: LeaderboardSectionProps): JSX.Element {
  return (
    <section className={cn(
      "py-24 px-4 relative overflow-hidden",
      className
    )}>
      {/* 增强背景装饰 */}
      <div className="absolute inset-0 -z-10">
        {/* 主渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-background to-muted/30"></div>
        
        {/* 动态装饰元素 */}
        <div className="absolute top-1/4 left-1/8 w-72 h-72 bg-gradient-to-br from-primary/6 to-accent/4 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/8 w-80 h-80 bg-gradient-to-bl from-accent/6 to-primary/4 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* 装饰性几何图形 */}
        <div className="absolute top-1/6 right-1/6 opacity-10 animate-pulse delay-500">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-primary/30 rotate-45"></div>
            <div className="absolute inset-2 border-2 border-accent/30 rotate-12"></div>
          </div>
        </div>
        <div className="absolute bottom-1/6 left-1/6 opacity-10 animate-pulse delay-1500">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-2 border-accent/30 rounded-full"></div>
            <div className="absolute inset-3 border-2 border-primary/30 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto text-center">
        {/* 图标和标题区域 */}
        <div className="mb-12 animate-fadeInUp">
          {/* 多层次图标设计 */}
          <div className="relative inline-block mb-8">
            {/* 主奖杯图标 */}
            <div className="relative p-6 rounded-2xl backdrop-blur-sm bg-gradient-to-br from-primary/10 to-accent/5 border border-border/20 shadow-2xl">
              <Trophy className="h-16 w-16 text-primary mx-auto" />
              
              {/* 装饰星星 */}
              <Star className="absolute -top-2 -left-2 h-4 w-4 text-accent animate-pulse" />
              <Crown className="absolute -top-2 -right-2 h-5 w-5 text-primary animate-pulse delay-500" />
              <Star className="absolute -bottom-1 -left-1 h-3 w-3 text-primary/60 animate-pulse delay-1000" />
              <Star className="absolute -bottom-1 -right-1 h-3 w-3 text-accent/60 animate-pulse delay-300" />
              
              {/* 发光效果 */}
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            </div>
            
            {/* 底部光晕 */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-primary/20 rounded-full blur-2xl"></div>
          </div>
          
          {/* 标题 */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
        </div>
        
        {/* 描述文字 */}
        <div className="mb-12 animate-fadeInUp delay-200">
          <div className="max-w-3xl mx-auto">
            <div className="relative backdrop-blur-sm bg-card/20 border border-border/10 rounded-2xl p-8">
              {/* 内容 */}
              <div className="relative z-10 space-y-4">
                {description.split('。').filter(sentence => sentence.trim()).map((sentence, index, array) => (
                  <p 
                    key={index}
                    className="text-lg md:text-xl leading-relaxed text-foreground/80"
                  >
                    {sentence.trim()}{index < array.length - 1 ? '。' : ''}
                  </p>
                ))}
              </div>
              
              {/* 卡片装饰 */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 rounded-2xl"></div>
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* 增强的按钮 */}
        <div className="animate-fadeInUp delay-400">
          <div className="relative inline-block group">
            <Button
              size="lg"
              className="enhanced-gradient-button flex items-center gap-3 px-10 py-6 text-lg font-semibold text-white"
              asChild
            >
              <Link href="/leaderboard">
                <Trophy className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                <span>{buttonText}</span>
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}