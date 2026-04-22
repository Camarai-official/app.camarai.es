
import * as React from "react"
import { H4 } from "@/components/ui/typography"
import { IconBadge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    padding?: 'none' | 'sm' | 'md' | 'lg';
    height?: 'auto' | 'full';
    position?: 'default' | 'relative';
    flex?: boolean;
    gap?: 'none' | 'sm' | 'md' | 'lg';
  }
>(({ className, padding = 'none', height = 'auto', position = 'default', flex = false, gap = 'none', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow transition-all duration-300",
      padding === 'none' && "p-0",
      padding === 'sm' && "p-2",
      padding === 'md' && "p-4",
      padding === 'lg' && "p-6",
      height === 'full' && "h-full",
      position === 'relative' && "relative",
      flex && "flex flex-col",
      gap === 'sm' && "gap-2",
      gap === 'md' && "gap-4",
      gap === 'lg' && "gap-6",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { title?: string; description?: string; icon?: React.ElementType; actions?: React.ReactNode; compact?: boolean }
>(({ className, title, description, icon: Icon, actions, children, compact, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      compact && "p-4 space-y-1",
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          {title && <h3 className="text-lg font-bold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    {children}
  </div>
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

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
  React.HTMLAttributes<HTMLDivElement> & { 
    flex?: boolean; 
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'default';
    gap?: 'none' | 'sm' | 'md' | 'lg';
    compact?: boolean;
  }
>(({ className, flex = false, padding = 'default', gap = 'none', compact, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-6", 
      compact && "p-4",
      padding === 'default' && "pt-0",
      flex && "flex-grow",
      padding === 'none' && "p-0",
      padding === 'sm' && "p-2",
      padding === 'md' && "p-4",
      padding === 'lg' && "p-6",
      gap === 'sm' && "space-y-2",
      gap === 'md' && "space-y-4",
      gap === 'lg' && "space-y-6",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    justify?: 'start' | 'center' | 'end' | 'between';
    gap?: 'none' | 'sm' | 'md' | 'lg';
    padding?: 'none' | 'sm' | 'md' | 'lg';
  }
>(({ className, justify = 'start', gap = 'none', padding = 'default' as any, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      justify === 'start' && "justify-start",
      justify === 'center' && "justify-center",
      justify === 'end' && "justify-end",
      justify === 'between' && "justify-between",
      gap === 'sm' && "gap-2",
      gap === 'md' && "gap-4",
      gap === 'lg' && "gap-6",
      padding === 'none' && "p-0",
      padding === 'sm' && "p-2",
      padding === 'md' && "p-4",
      padding === 'lg' && "p-6",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardDescription, CardContent, CardTitle }
