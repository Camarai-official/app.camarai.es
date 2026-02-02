'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, Palette } from 'lucide-react';

interface ColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  presetColors?: string[];
  showInput?: boolean;
  disabled?: boolean;
  className?: string;
}

const defaultPresetColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#64748b', // slate
  '#71717a', // zinc
  '#737373', // neutral
];

export function ColorPicker({
  value = '#9B6EFD',
  onChange,
  label,
  placeholder = 'Seleccionar color',
  presetColors = defaultPresetColors,
  showInput = true,
  disabled = false,
  className,
}: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    // Reset to valid value if invalid
    if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
      setInputValue(value);
    }
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
    setInputValue(color);
    setOpen(false);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-start"
            disabled={disabled}
          >
            <div
              className="h-4 w-4 rounded-sm border mr-2"
              style={{ backgroundColor: value }}
            />
            <span className="flex-1 text-left">{value || placeholder}</span>
            <Palette className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="grid gap-3">
            {/* Color Input */}
            {showInput && (
              <div className="flex items-center gap-2">
                <div
                  className="h-10 w-10 rounded-md border shrink-0"
                  style={{ backgroundColor: value }}
                />
                <Input
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="#000000"
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Native Color Input */}
            <div className="flex items-center gap-2">
              <Label htmlFor="native-color" className="text-sm">
                Selector de color:
              </Label>
              <input
                id="native-color"
                type="color"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setInputValue(e.target.value);
                }}
                className="h-8 w-8 rounded cursor-pointer"
              />
            </div>

            {/* Preset Colors */}
            <div className="grid gap-1">
              <Label className="text-sm">Colores predefinidos</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handlePresetClick(color)}
                    className={cn(
                      'h-7 w-7 rounded-md border transition-all hover:scale-110 flex items-center justify-center',
                      value === color && 'ring-2 ring-primary ring-offset-2'
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {value === color && (
                      <Check className="h-4 w-4 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
