"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const pageHeaderVariants = cva(
  "flex flex-col space-y-2 text-center",
  {
    variants: {
      size: {
        sm: "mb-6",
        md: "mb-8",
        lg: "mb-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
  title: string
  description?: string
  children?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, size, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pageHeaderVariants({ size, className }))}
        {...props}
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        )}
        {children}
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { PageHeader, pageHeaderVariants }