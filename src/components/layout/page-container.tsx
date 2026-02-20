import { cn } from "@/lib/utils"
import React from "react"

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function PageContainer({ className, children, ...props }: PageContainerProps) {
  return (
    <div className={cn("flex flex-1 flex-col h-full", className)} {...props}>
      {children}
    </div>
  )
}
