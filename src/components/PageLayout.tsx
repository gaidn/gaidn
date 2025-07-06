"use client";

import Navbar from "@/components/Navbar";
import { useGitHubAuth } from "@/auth/github/hooks";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
  const { isAuthenticated } = useGitHubAuth();
  
  // 这里使用isAuthenticated变量，避免未使用警告
  // 可以用于条件渲染或其他逻辑
  const pageClass = isAuthenticated ? `authenticated ${className}` : className;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className={`container mx-auto px-4 py-16 flex-1 ${pageClass}`}>
        {children}
      </main>
    </div>
  );
} 