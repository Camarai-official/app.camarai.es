'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { H3, TextSM } from './typography';

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
        "flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed rounded-xl border-border bg-card transition-all duration-300",
        className
      )}
    >
      {Icon && (
        <div className="relative mb-4">
           
          <Icon 
            className={cn(
                "h-12 w-12 text-muted-foreground relative z-10", 
                iconClassName
            )} 
          />
        </div>
      )}
      <H3>
        {title}
      </H3>
      {description && (
        <TextSM className="text-muted-foreground max-w-[300px] leading-relaxed">
          {description}
        </TextSM>
      )}
      {action && (
        <div className="flex flex-col gap-4 p-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
          {action}
        </div>
      )}
    </div>
  );
}
