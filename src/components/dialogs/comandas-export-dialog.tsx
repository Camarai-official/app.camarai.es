'use client';

import * as React from 'react';
import {
  Dialog,
  DialogWindow,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  File, 
  Table as TableIcon,
  Calendar as CalendarDefault,
  LayoutGrid,
  FileBox,
  ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ActionTile } from '@/components/ui/action-tile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SelectField } from '@/components/ui/select-field';

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

const formatIcons: Record<ExportFormat, any> = {
  csv: FileText,
  pdf: File,
  xlsx: FileSpreadsheet,
  json: FileText,
};

const formatColors: Record<ExportFormat, string> = {
  csv: "#3b82f6", // Blue
  pdf: "#ef4444", // Red
  xlsx: "#10b981", // Green
  json: "#f59e0b", // Amber
};

const formatLabels: Record<ExportFormat, string> = {
  csv: 'CSV',
  pdf: 'PDF',
  xlsx: 'Excel',
  json: 'JSON',
};

export function ExportModal({
  open,
  onOpenChange,
  title = 'Exportar Datos',
  description = 'Prepara tus archivos para informes o integración.',
  formats = ['csv', 'pdf', 'xlsx', 'json'],
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
        title: 'Selección vacía',
        description: 'Debes seleccionar al menos un campo.',
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
        title: '¡Listo!',
        description: `Archivo generado correctamente en formato ${selectedFormat.toUpperCase()}.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el archivo de exportación.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow size="lg">
        <DialogHeader
          icon={Download}
          title={title}
          description={description}
        />

        <DialogContent>
          <ScrollArea className="h-full">
          <div className="p-6 space-y-8">
            {/* Format Selection */}
            <div className="space-y-4">
              <Label icon={LayoutGrid}>Formato de salida</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {formats.map((format) => (
                  <ActionTile
                    key={format}
                    icon={formatIcons[format]}
                    iconColor={formatColors[format]}
                    title={formatLabels[format]}
                    onClick={() => setSelectedFormat(format)}
                    className={cn(
                      "transition-all duration-300",
                      selectedFormat === format 
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                        : ""
                    )}
                  />
                ))}
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Date Range Selection */}
            {showDateRange && (
              <div className="space-y-4">
                <Label icon={CalendarDefault}>Periodo de tiempo</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left',
                            !dateRange.from && 'text-muted-foreground'
                          )}
                        >
                          <CalendarDefault className="mr-2 h-4 w-4 text-primary" />
                          {dateRange.from ? format(dateRange.from, 'dd MMM yyyy', { locale: es }) : 'Desde'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                          locale={es}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left',
                            !dateRange.to && 'text-muted-foreground'
                          )}
                        >
                          <CalendarDefault className="mr-2 h-4 w-4 text-primary" />
                          {dateRange.to ? format(dateRange.to, 'dd MMM yyyy', { locale: es }) : 'Hasta'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                          locale={es}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            <Separator className="opacity-50" />

            {/* Fields Selection */}
            {fields.length > 0 && (
              <SelectField
                label="Columnas a incluir"
                icon={ClipboardList}
                options={fields}
                selectedValues={selectedFields}
                onToggle={toggleField}
              />
            )}
          </div>
          </ScrollArea>
        </DialogContent>

        <DialogFooter
          hint="La exportación puede tardar unos segundos."
          onCancel={() => onOpenChange(false)}
          cancelText="Cancelar"
          onConfirm={handleExport}
          confirmText={isExporting ? "Generando..." : "Comenzar Exportación"}
          confirmDisabled={isExporting}
        />
      </DialogWindow>
    </Dialog>
  );
}
