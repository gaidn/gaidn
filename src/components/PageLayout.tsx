"use client";

import Navbar from "@/components/Navbar";
import { PageContainer } from "@/components/ui/page-container";
import { cva, type VariantProps } from "class-variance-authority";

const pageLayoutVariants = cva(
  "min-h-screen bg-background flex flex-col",
  {
    variants: {
      pattern: {
        none: "",
        dots: "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]",
        grid: "bg-[linear-gradient(to_right,#f3f4f6_1px,transparent_1px),linear-gradient(to_bottom,#f3f4f6_1px,transparent_1px)] [background-size:16px_16px]",
      },
    },
    defaultVariants: {
      pattern: "none",
    },
  }
);

interface PageLayoutProps extends VariantProps<typeof pageLayoutVariants> {
  children: React.ReactNode;
  className?: string;
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function PageLayout({ 
  children, 
  className = "", 
  pattern,
  containerSize = "lg"
}: PageLayoutProps): JSX.Element {
  return (
    <div className={pageLayoutVariants({ pattern, className })}>
      <Navbar />
      <main className="flex-1 relative">
        <PageContainer size={containerSize} className="relative z-10">
          {children}
        </PageContainer>
      </main>
    </div>
  );
} 