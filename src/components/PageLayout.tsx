"use client";

import Navbar from "@/components/Navbar";
import { useGitHubAuth } from "@/auth/github/hooks";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
  // 如果后续需要使用身份验证状态，可以取消注释下面的行
  // const { isAuthenticated } = useGitHubAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className={`container mx-auto px-4 py-16 flex-1 ${className}`}>
        {children}
      </main>
    </div>
  );
} 