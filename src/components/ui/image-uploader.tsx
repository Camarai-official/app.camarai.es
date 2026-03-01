'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Camera, Upload, X, Plus } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'auto';
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
}

const aspectRatioClasses = {
  square: 'aspect-square rounded-xl',
  '16:9': 'aspect-video rounded-xl',
  '4:3': 'aspect-[4/3] rounded-xl',
  auto: 'rounded-xl',
};

export function ImageUploader({
  value,
  onChange,
  placeholder = 'Subir imagen',
  className,
  aspectRatio = 'square',
  maxSizeMB = 5,
  accept = 'image/*',
  disabled = false,
}: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }

    // Validate file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`La imagen no puede superar ${maxSizeMB}MB`);
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.onerror = () => {
      setError('Error al leer el archivo');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      const file = e.dataTransfer.files?.[0];
      handleFileChange(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div className={cn('relative group', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 overflow-hidden bg-muted',
          aspectRatioClasses[aspectRatio],
          isDragging && 'border-primary bg-primary/10',
          error && 'border-destructive bg-destructive/5',
          disabled && 'cursor-not-allowed opacity-50',
          !isDragging && !error && 'border-muted-foreground/20 cursor-pointer'
        )}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="rounded-full h-9 w-9 p-0 shadow-lg border-none hover:scale-110 transition-transform"
                  onClick={handleClick}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="md"
                  className="rounded-full h-9 w-9 p-0 shadow-lg border-none hover:scale-110 transition-transform"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-muted-foreground/60 transition-colors group-hover:border-primary group-hover:text-primary">
              <Plus className="h-6 w-6" />
            </div>
            <p className="mt-2 text-[10px] tracking-wider text-muted-foreground transition-colors">
              {isDragging ? 'Soltar imagen' : 'Añadir foto'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <Badge variant="destructive" className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-lg whitespace-nowrap px-2 py-0.5 text-[10px]">
          {error}
        </Badge>
      )}
    </div>
  );
}
