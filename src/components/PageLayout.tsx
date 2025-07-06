"use client";

import Navbar from "@/components/Navbar";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className={`container mx-auto px-4 py-16 flex-1 ${className}`}>
        {children}
      </main>
    </div>
  );
} 