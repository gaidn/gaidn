"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const pageContainerVariants = cva(
  "w-full mx-auto px-4 py-8",
  {
    variants: {
      size: {
        sm: "max-w-2xl",
        md: "max-w-4xl",
        lg: "max-w-6xl",
        xl: "max-w-7xl",
        full: "max-w-full",
      },
      spacing: {
        sm: "py-4",
        md: "py-8",
        lg: "py-12",
        xl: "py-16",
      },
    },
    defaultVariants: {
      size: "lg",
      spacing: "md",
    },
  }
)

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {
  children: React.ReactNode
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, size, spacing, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pageContainerVariants({ size, spacing, className }))}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PageContainer.displayName = "PageContainer"

export { PageContainer, pageContainerVariants }