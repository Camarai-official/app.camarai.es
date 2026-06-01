'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Pipette, Check, X } from 'lucide-react';

interface ColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  availableColors?: string[];
  className?: string;
}

const defaultColors = ['violet-500', 'rose-500', 'amber-500', 'green-500', 'blue-500'];

/** Map de colores Tailwind predefinidos → valor HEX para alimentar el input[type=color] */
const tailwindToHex: Record<string, string> = {
  'violet-500': '#8b5cf6',
  'rose-500': '#f43f5e',
  'amber-500': '#f59e0b',
  'green-500': '#22c55e',
  'blue-500': '#3b82f6',
  'blue-400': '#60a5fa',
  'primary': '#9B6EFD',
};

/** Devuelve el color en formato HEX */
function toHex(color: string | undefined): string {
  if (!color) return '#9B6EFD';
  if (color.startsWith('#')) return color;
  return tailwindToHex[color] ?? '#9B6EFD';
}

export function ColorPicker({
  value,
  onChange,
  label,
  availableColors = defaultColors,
  className,
}: ColorPickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  /** Color pendiente de confirmar (sólo para el selector personalizado) */
  const [pendingColor, setPendingColor] = React.useState<string | null>(null);

  /** El valor actual es un color personalizado si empieza por '#'
   *  y NO está en la lista de predefinidos */
  const isCustomActive =
    !!value &&
    value.startsWith('#') &&
    !availableColors.includes(value);

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo actualiza la previsualización local, NO llama a onChange todavía
    setPendingColor(e.target.value);
  };

  const handleConfirm = () => {
    if (pendingColor) {
      onChange(pendingColor); // ← aquí sí se escribe en la BD
      setPendingColor(null);
    }
  };

  const handleCancel = () => {
    setPendingColor(null);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && <Label>{label}</Label>}

      <div className="flex flex-wrap items-center gap-2">
        {/* Colores predefinidos — siguen guardando inmediatamente */}
        {availableColors.map((color) => (
          <Button
            key={color}
            type="button"
            size="sm"
            className={cn(
              color.startsWith('#') ? '' : `bg-${color} hover:bg-${color}`,
              value === color
                ? 'border-2 border-foreground scale-110'
                : 'opacity-80 hover:opacity-100',
            )}
            style={color.startsWith('#') ? { backgroundColor: color } : undefined}
            onClick={() => {
              setPendingColor(null); // descarta cualquier pendiente
              onChange(color);
            }}
          />
        ))}

        {/* Botón de color personalizado */}
        <div className="relative">
          <Button
            type="button"
            size="sm"
            title="Elige un color personalizado"
            className={cn(
              'relative overflow-hidden',
              isCustomActive && !pendingColor
                ? 'border-2 border-foreground scale-110'
                : 'opacity-80 hover:opacity-100',
            )}
            style={
              isCustomActive && !pendingColor
                ? { backgroundColor: value }
                : {
                    background:
                      'conic-gradient(from 0deg, #f43f5e, #f59e0b, #22c55e, #3b82f6, #8b5cf6, #f43f5e)',
                  }
            }
            onClick={() => inputRef.current?.click()}
          >
            {(!isCustomActive || !!pendingColor) && (
              <Pipette className="h-3 w-3 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
            )}
          </Button>

          {/* Input nativo oculto */}
          <input
            ref={inputRef}
            type="color"
            className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
            value={pendingColor ?? toHex(isCustomActive ? value : undefined)}
            onChange={handleCustomChange}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Previsualización del color pendiente + botones Aceptar / Cancelar */}
      {pendingColor && (
        <div className="flex items-center gap-3 p-2.5 rounded-xl border bg-muted/30 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Muestra de color */}
          <div
            className="h-8 w-8 rounded-lg shrink-0 border shadow-sm"
            style={{ backgroundColor: pendingColor }}
          />

          {/* Código HEX */}
          <span className="text-xs font-mono text-muted-foreground tracking-wider flex-1">
            {pendingColor.toUpperCase()}
          </span>

          {/* Aceptar */}
          <Button
            type="button"
            size="sm"
            variant="default"
            className="h-7 px-2 gap-1 text-xs"
            onClick={handleConfirm}
          >
            <Check className="h-3 w-3" />
            Aceptar
          </Button>

          {/* Cancelar */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleCancel}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Muestra el HEX del color personalizado ya guardado */}
      {isCustomActive && !pendingColor && (
        <p className="text-xs text-muted-foreground font-mono tracking-wider">
          {value?.toUpperCase()}
        </p>
      )}
    </div>
  );
}
