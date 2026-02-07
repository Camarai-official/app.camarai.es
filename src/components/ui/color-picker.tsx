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

const defaultColors = ['#78A3ED', '#9B6EFD', '#F0768C', '#F7B731', '#4CAF50', '#2196F3'];

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
              value === color
                ? "ring-2 ring-primary ring-offset-2 scale-110"
                : "opacity-80 hover:opacity-100"
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  );
}
