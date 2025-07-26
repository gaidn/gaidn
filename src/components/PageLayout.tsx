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
      // 基于主题色系的温暖渐变背景
      "bg-gradient-to-br from-background via-muted/20 to-background/95",
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