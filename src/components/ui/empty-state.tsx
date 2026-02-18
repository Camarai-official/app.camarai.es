'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Primary message */
  title: string;
  /** Secondary message */
  description?: string;
  /** Optional action element (buttons, etc) */
  action?: React.ReactNode;
  /** Custom container classes */
  className?: string;
  /** Icon specific classes */
  iconClassName?: string;
}

/**
 * A reusable, premium empty state component for lists, tables, charts, etc.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconClassName,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed rounded-[2rem] border-muted/60 bg-muted/5 transition-all duration-300",
        className
      )}
    >
      {Icon && (
        <div className="relative mb-4">
           {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-muted-foreground/5 blur-xl rounded-full" />
          <Icon 
            className={cn(
                "h-12 w-12 text-muted-foreground/30 relative z-10", 
                iconClassName
            )} 
          />
        </div>
      )}
      <h3 className="text-sm font-bold text-muted-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-[220px] leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {action}
        </div>
      )}
    </div>
  );
}
