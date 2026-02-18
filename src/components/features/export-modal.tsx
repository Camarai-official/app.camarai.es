'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export type ExportFormat = 'csv' | 'pdf' | 'xlsx' | 'json';

export interface ExportField {
  id: string;
  label: string;
  checked: boolean;
}

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  formats?: ExportFormat[];
  fields?: ExportField[];
  showDateRange?: boolean;
  onExport: (options: {
    format: ExportFormat;
    fields: string[];
    dateRange?: { from: Date | undefined; to: Date | undefined };
  }) => void;
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  csv: <FileText className="h-4 w-4" />,
  pdf: <File className="h-4 w-4" />,
  xlsx: <FileSpreadsheet className="h-4 w-4" />,
  json: <FileText className="h-4 w-4" />,
};

const formatLabels: Record<ExportFormat, string> = {
  csv: 'CSV (Excel compatible)',
  pdf: 'PDF (Documento)',
  xlsx: 'Excel (XLSX)',
  json: 'JSON (Datos)',
};

export function ExportModal({
  open,
  onOpenChange,
  title = 'Exportar Datos',
  description = 'Selecciona el formato y los campos que deseas exportar.',
  formats = ['csv', 'pdf', 'xlsx'],
  fields = [],
  showDateRange = true,
  onExport,
}: ExportModalProps) {
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>(formats[0] || 'csv');
  const [selectedFields, setSelectedFields] = React.useState<string[]>(
    fields.filter((f) => f.checked).map((f) => f.id)
  );
  const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isExporting, setIsExporting] = React.useState(false);

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
  };

  const selectAllFields = () => {
    setSelectedFields(fields.map((f) => f.id));
  };

  const deselectAllFields = () => {
    setSelectedFields([]);
  };

  const handleExport = async () => {
    if (fields.length > 0 && selectedFields.length === 0) {
      toast({
        title: 'Selecciona al menos un campo',
        description: 'Debes seleccionar al menos un campo para exportar.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      await onExport({
        format: selectedFormat,
        fields: selectedFields,
        dateRange: showDateRange ? dateRange : undefined,
      });
      toast({
        title: 'Exportación completada',
        description: `Los datos se han exportado en formato ${formatLabels[selectedFormat]}.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error al exportar',
        description: 'Ha ocurrido un error al exportar los datos.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader
          icon={Download}
          title={title}
          description={description}
        />

        <div className="grid gap-6 py-4">
          {/* Format Selection */}
          <div className="grid gap-3">
            <Label>Formato de exportación</Label>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
              className="grid grid-cols-2 gap-2"
            >
              {formats.map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <RadioGroupItem value={format} id={format} />
                  <Label htmlFor={format} className="flex items-center gap-2 font-normal cursor-pointer">
                    {formatIcons[format]}
                    {formatLabels[format]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Date Range */}
          {showDateRange && (
            <div className="grid gap-3">
              <Label>Rango de fechas</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 justify-start text-left font-normal',
                        !dateRange.from && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy', { locale: es }) : 'Desde'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'flex-1 justify-start text-left font-normal',
                        !dateRange.to && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, 'dd/MM/yyyy', { locale: es }) : 'Hasta'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground">
                Deja vacío para exportar todos los registros.
              </p>
            </div>
          )}

          {/* Fields Selection */}
          {fields.length > 0 && (
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Campos a incluir</Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAllFields}>
                    Todos
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAllFields}>
                    Ninguno
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => toggleField(field.id)}
                    />
                    <Label htmlFor={`field-${field.id}`} className="text-sm font-normal cursor-pointer">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedFields.length} de {fields.length} campos seleccionados
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
