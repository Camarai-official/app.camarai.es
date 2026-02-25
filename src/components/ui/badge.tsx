import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive dark:text-red-400 hover:bg-destructive/20",
        outline: "text-foreground border-border",
        
        // Semantic Premium Status Variants
        success:
          "border-transparent bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 uppercase tracking-widest font-bold text-[9px]",
        warning:
          "border-transparent bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20 uppercase tracking-widest font-bold text-[9px]",
        danger:
          "border-transparent bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 uppercase tracking-widest font-bold text-[9px]",
        info:
          "border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 uppercase tracking-widest font-bold text-[9px]",
        neutral:
          "border-transparent bg-muted text-muted-foreground uppercase tracking-widest font-bold text-[9px]",

        // Legacy / Named Statuses
        completed:
          "border-transparent bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 uppercase tracking-widest font-bold text-[9px]",
        'in-progress':
          "border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 uppercase tracking-widest font-bold text-[9px]",
        cancelled:
          "border-transparent bg-red-500/10 text-red-700 dark:text-red-500 hover:bg-red-500/20 uppercase tracking-widest font-bold text-[9px]",
      },
      size: {
        default: "px-2.5 py-0.5",
        sm: "px-1.5 h-4 text-[9px]",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
