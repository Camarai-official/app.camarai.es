import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium text-[11px] transition-all relative [&_svg]:h-3 [&_svg]:w-3",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/10 text-destructive dark:text-red-400",
        outline: "text-foreground border-border",
        
        // Semantic Premium Status Variants
        success:
          "border-transparent bg-green-500/10 text-green-700 dark:text-green-400",
        warning:
          "border-transparent bg-orange-500/10 text-orange-700 dark:text-orange-400",
        danger:
          "border-transparent bg-rose-500/10 text-rose-700 dark:text-rose-400",
        info:
          "border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-400",
        neutral:
          "border-transparent bg-muted text-muted-foreground",

        // Legacy / Named Statuses
        completed:
          "border-transparent bg-green-500/10 text-green-700 dark:text-green-400",
        'in-progress':
          "border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-400",
        cancelled:
          "border-transparent bg-red-500/10 text-red-700 dark:text-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// ============================================================================
// ICON BADGE COMPONENT (Standalone Icon Container)
// ============================================================================

export interface IconBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon component to render or a React element */
  icon?: React.ElementType | React.ReactNode;
  /** Icon color (Tailwind class like 'primary' or hex string) */
  iconColor?: string;
  /** Size of the icon inside the container */
  iconClassName?: string;
}

export const IconBadge = React.forwardRef<HTMLDivElement, IconBadgeProps>(
  ({ icon: Icon, iconColor, iconClassName, className, style, children, ...props }, ref) => {
    const isHexColor = iconColor?.startsWith('#');
    const isTailwindColor = iconColor && !isHexColor;
    
    // Check if Icon is a component (function/object) or a rendered element
    const isLucideComponent = (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)) && !React.isValidElement(Icon);

    return (
      <div
        ref={ref}
        className={cn(
          "flex-shrink-0 h-10 w-10 rounded-xl transition-all duration-300 flex items-center justify-center",
          "bg-[color-mix(in_srgb,currentColor,transparent_90%)]",
          !iconColor && "text-primary",
          isTailwindColor && `text-${iconColor}`,
          className
        )}
        style={{
          ...(isHexColor ? { color: iconColor } : {}),
          ...style,
        }}
        {...props}
      >
        {Icon ? (
          isLucideComponent ? (
            React.createElement(Icon as React.ElementType, { 
              className: cn("h-5 w-5 transition-all duration-300", iconClassName),
            })
          ) : (
            <div className={cn("[&_svg]:h-5 [&_svg]:w-5 transition-all duration-300", iconClassName)}>
              {Icon}
            </div>
          )
        ) : (
          children
        )}
      </div>
    );
  }
);
IconBadge.displayName = "IconBadge";

export { Badge, badgeVariants }
