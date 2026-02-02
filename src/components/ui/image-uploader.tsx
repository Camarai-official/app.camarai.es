'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';

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
  square: 'aspect-square',
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  auto: '',
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
    <div className={cn('relative', className)}>
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
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer',
          aspectRatioClasses[aspectRatio],
          !value && 'min-h-[120px]',
          isDragging && 'border-primary bg-primary/5',
          error && 'border-destructive',
          disabled && 'cursor-not-allowed opacity-50',
          !isDragging && !error && 'border-muted-foreground/25 hover:border-muted-foreground/50'
        )}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className={cn(
                'h-full w-full object-cover rounded-lg',
                aspectRatioClasses[aspectRatio]
              )}
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleClick}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Cambiar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            {isDragging ? (
              <Upload className="h-8 w-8 text-primary mb-2" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            )}
            <p className="text-sm font-medium">
              {isDragging ? 'Suelta aquí' : placeholder}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Arrastra o haz clic para subir
            </p>
            <p className="text-xs text-muted-foreground">
              Máximo {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
