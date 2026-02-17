'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  availableColors?: string[];
  className?: string;
}

const defaultColors = ['blue-400', 'violet-500', 'rose-500', 'amber-500', 'green-500', 'blue-500'];

export function ColorPicker({
  value,
  onChange,
  label,
  availableColors = defaultColors,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label>
          {label}
        </Label>
      )}
      <div className="flex flex-wrap gap-2">
        {availableColors.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              "h-8 w-8 rounded-full transition-all hover:scale-110",
              color.startsWith('#') ? "" : `bg-${color}`,
              value === color
                ? "border-2 border-primary scale-110"
                : "opacity-80 hover:opacity-100"
            )}
            style={color.startsWith('#') ? { backgroundColor: color } : undefined}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  );
}
