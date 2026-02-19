
import * as React from "react"
import { H4 } from "@/components/ui/typography"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-0 overflow-hidden",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    title?: React.ReactNode; 
    icon?: React.ElementType;
    actions?: React.ReactNode;
  }
>(({ className, title, icon: Icon, actions, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-row items-center justify-between gap-4 p-4 pb-2 space-y-0 text-left w-full ", className)}
    {...props}
  >
    <div className="flex flex-row items-center gap-2.5">
      {Icon && (
        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-muted/20 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      )}
      {title && (
        <H4 className="text-muted-foreground font-medium">
          {title}
        </H4>
      )}
      {children}
    </div>
    {actions && (
      <div className="flex items-center gap-2">
        {actions}
      </div>
    )}
  </div>
))
CardHeader.displayName = "CardHeader"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-2", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardDescription, CardContent }
