"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
    variant?: 'default' | 'muted' | 'label';
  }
>(
  (
    { className, orientation = "horizontal", decorative = true, margin = "none", variant = 'default', ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-primary/20",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        variant === 'muted' && "opacity-50",
        variant === 'label' && "opacity-30",
        margin === 'xs' && (orientation === "horizontal" ? "my-1" : "mx-1"),
        margin === 'sm' && (orientation === "horizontal" ? "my-2" : "mx-2"),
        margin === 'md' && (orientation === "horizontal" ? "my-4" : "mx-4"),
        margin === 'lg' && (orientation === "horizontal" ? "my-6" : "mx-6"),
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
