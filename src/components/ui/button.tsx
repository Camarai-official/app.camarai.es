
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border border-transparent hover:bg-primary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        brand: "bg-brand-gradient text-foreground border border-transparent hover:opacity-90 transition-opacity",
        success: "bg-green-500 text-white hover:bg-green-600 transition-all",
        "ghost-primary": "text-primary hover:bg-primary/10",
        "ghost-destructive": "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
        "ghost-success": "bg-green-500/10 text-green-500 hover:bg-green-500/20",
        card: "bg-card text-foreground border border-border hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent px-2 gap-3 transition-all duration-200",
      },
      size: {
        sm: "min-w-8 h-8 px-2 [&_svg]:h-3.5 [&_svg]:w-3.5",
        md: "min-w-10 h-10 px-3 [&_svg]:h-4 [&_svg]:w-4",
        lg: "min-w-14 h-14 px-4 [&_svg]:h-5 [&_svg]:w-5",
        icon: "h-7 w-7 p-0 [&_svg]:h-4 [&_svg]:w-4",
      },
      fullWidth: {
        true: "w-full",
      },
      justify: {
        center: "justify-center",
        start: "justify-start text-left font-normal",
        between: "justify-between",
      },
      truncate: {
        true: "truncate",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
        xs: "min-w-[120px]",
        sm: "min-w-[160px]",
        md: "min-w-[200px]",
        lg: "min-w-[240px]",
      },
      gap: {
        none: "gap-0",
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-4",
      },
      responsiveWidth: {
        "auto-sm": "w-full sm:w-auto",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
      justify: "center",
      truncate: false,
      width: "auto",
      gap: "sm",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, justify, truncate, width, gap, responsiveWidth, asChild = false, startIcon, endIcon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const variantProps = { variant, size, fullWidth, justify, truncate, width, gap, responsiveWidth };

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ ...variantProps, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ ...variantProps, className }))}
        ref={ref}
        {...props}
      >
        {startIcon && (
          <span className={cn(
            children && "mr-2", 
            "inline-flex shrink-0", 
            (variant === 'outline' || variant === 'ghost') && "text-muted-foreground"
          )}>
            {startIcon}
          </span>
        )}
        {children}
        {endIcon && (
          <span className={cn(
            "ml-2 inline-flex shrink-0", 
            (variant === 'outline' || variant === 'ghost') && "text-muted-foreground"
          )}>
            {endIcon}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
