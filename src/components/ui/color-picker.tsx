'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  availableColors?: string[];
  className?: string;
}

const defaultColors = ['violet-500', 'rose-500', 'amber-500', 'green-500', 'blue-500'];

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
          <Button
            key={color}
            type="button"
            size="sm"
            className={cn(
              
              color.startsWith('#') ? "" : `bg-${color} hover:bg-${color}`,
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
