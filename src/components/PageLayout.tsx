"use client";

import Navbar from "@/components/Navbar";
import { PageContainer } from "@/components/ui/page-container";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function PageLayout({ 
  children, 
  className = "", 
  containerSize = "lg"
}: PageLayoutProps): JSX.Element {
  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      // 温暖渐变背景 - 浅色模式
      "bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50",
      // 深色模式的柔和渐变
      "dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900/20 dark:to-indigo-900/30",
      className
    )}>
      <Navbar />
      <main className="flex-1 relative">
        <PageContainer size={containerSize} className="relative z-10">
          {children}
        </PageContainer>
      </main>
    </div>
  );
} 