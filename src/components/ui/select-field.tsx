'use client';

import * as React from 'react';
import { Check, LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface SelectFieldOption {
  id: string;
  label: string;
}

interface SelectFieldProps {
  /** The main label text */
  label: string;
  /** Optional icon to display next to the label */
  icon?: LucideIcon;
  /** List of selectable options */
  options: SelectFieldOption[];
  /** Array of currently selected option IDs */
  selectedValues: string[];
  /** Handler called when an option is toggled */
  onToggle: (id: string) => void;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the grid container */
  gridClassName?: string;
  /** Optional number of columns for the grid (default: 2) */
  columns?: 1 | 2 | 3 | 4;
}

/**
 * SelectField Component
 * 
 * A premium selection component that displays multiple options in a grid with checkable tiles.
 */
export function SelectField({
  label,
  icon,
  options,
  selectedValues,
  onToggle,
  className,
  gridClassName,
  columns = 2,
}: SelectFieldProps) {
  
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  }[columns];

  return (
    <div className={cn("space-y-4", className)}>
      <Label icon={icon}>{label}</Label>
      <div className={cn("grid gap-3 p-1", gridColsClass, gridClassName)}>
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.id);
          
          return (
            <div
              key={option.id}
              onClick={() => onToggle(option.id)}
              className={cn(
                "flex h-10 items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                isSelected
                  ? "bg-primary/5 border-primary/20"
                  : "bg-background border-border hover:border-primary/20"
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-md border flex items-center justify-center transition-all",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-muted/50 border-input group-hover:border-primary/50"
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {option.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
