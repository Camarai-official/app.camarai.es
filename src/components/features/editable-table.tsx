'use client';

import * as React from 'react';
import { Pencil, Save, X, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Types
export interface EditableColumn<T> {
  key: keyof T;
  header: string;
  type: 'text' | 'number' | 'select' | 'date' | 'time' | 'badge' | 'readonly';
  options?: { value: string; label: string }[]; // For select type
  badgeVariants?: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'>; // For badge type
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string; // Custom formatter
}

export interface EditableChange {
  rowId: string;
  field: string;
  originalValue: any;
  newValue: any;
}

export interface EditableTableProps<T extends { id: string }> {
  data: T[];
  columns: EditableColumn<T>[];
  editable?: boolean;
  allowedRoles?: string[];
  currentUserRole?: string;
  onSave?: (changes: EditableChange[], reason?: string) => Promise<void> | void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

// Editable Cell Component
function EditableCell<T>({
  value,
  column,
  isEditing,
  onChange,
  isModified,
}: {
  value: any;
  column: EditableColumn<T>;
  isEditing: boolean;
  onChange: (value: any) => void;
  isModified: boolean;
}) {
  const cellClass = cn(
    'transition-all',
    isModified && 'ring-2 ring-yellow-400 ring-offset-1 rounded',
    column.align === 'center' && 'text-center',
    column.align === 'right' && 'text-right'
  );

  if (!isEditing || column.type === 'readonly') {
    // Render mode
    if (column.type === 'badge' && column.badgeVariants) {
      const variant = column.badgeVariants[value] || 'default';
      return (
        <TableCell className={cellClass}>
          <Badge variant={variant as any}>{value}</Badge>
        </TableCell>
      );
    }

    const displayValue = column.format ? column.format(value) : value;
    return <TableCell className={cellClass}>{displayValue}</TableCell>;
  }

  // Edit mode
  switch (column.type) {
    case 'select':
      return (
        <TableCell className={cellClass}>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      );

    case 'number':
      return (
        <TableCell className={cellClass}>
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="h-8 w-full"
          />
        </TableCell>
      );

    case 'date':
      return (
        <TableCell className={cellClass}>
          <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-full"
          />
        </TableCell>
      );

    case 'time':
      return (
        <TableCell className={cellClass}>
          <Input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-full"
          />
        </TableCell>
      );

    case 'badge':
      // Badge in edit mode becomes a select
      return (
        <TableCell className={cellClass}>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      );

    default: // text
      return (
        <TableCell className={cellClass}>
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-full"
          />
        </TableCell>
      );
  }
}

// Confirmation Dialog Component
function ConfirmChangesDialog({
  open,
  onOpenChange,
  changes,
  columns,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changes: EditableChange[];
  columns: EditableColumn<any>[];
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = React.useState('');

  const getColumnHeader = (field: string) => {
    const col = columns.find((c) => c.key === field);
    return col?.header || field;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Confirmar Cambios
          </AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de modificar {changes.length} campo(s). Esta acción quedará
            registrada.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {changes.map((change, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
              >
                <span className="font-medium">{getColumnHeader(change.field)}:</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through">
                    {String(change.originalValue)}
                  </span>
                  <span className="text-primary font-medium">→</span>
                  <span className="text-green-600 font-medium">
                    {String(change.newValue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="change-reason">Motivo del cambio (opcional)</Label>
          <Textarea
            id="change-reason"
            placeholder="Ej: Corrección de error en hora de entrada..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(reason)}>
            Confirmar Cambios
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main EditableTable Component
export function EditableTable<T extends { id: string }>({
  data,
  columns,
  editable = true,
  allowedRoles = ['manager', 'admin', 'encargado', 'jefe'],
  currentUserRole = 'admin',
  onSave,
  onRowClick,
  emptyMessage = 'No hay datos para mostrar',
  className,
}: EditableTableProps<T>) {
  const { toast } = useToast();
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null);
  const [editedValues, setEditedValues] = React.useState<Record<string, any>>({});
  const [pendingChanges, setPendingChanges] = React.useState<EditableChange[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const canEdit = editable && allowedRoles.includes(currentUserRole.toLowerCase());

  const startEditing = (row: T) => {
    if (!canEdit) return;
    setEditingRowId(row.id);
    // Initialize edited values with current row values
    const initialValues: Record<string, any> = {};
    columns.forEach((col) => {
      initialValues[col.key as string] = row[col.key];
    });
    setEditedValues(initialValues);
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditedValues({});
  };

  const handleValueChange = (field: string, value: any) => {
    setEditedValues((prev) => ({ ...prev, [field]: value }));
  };

  const getChanges = (rowId: string, originalRow: T): EditableChange[] => {
    const changes: EditableChange[] = [];
    columns.forEach((col) => {
      const key = col.key as string;
      const originalValue = originalRow[col.key];
      const newValue = editedValues[key];
      if (originalValue !== newValue && col.type !== 'readonly') {
        changes.push({
          rowId,
          field: key,
          originalValue,
          newValue,
        });
      }
    });
    return changes;
  };

  const handleSaveClick = (row: T) => {
    const changes = getChanges(row.id, row);
    if (changes.length === 0) {
      cancelEditing();
      return;
    }
    setPendingChanges(changes);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async (reason: string) => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(pendingChanges, reason);
      }
      toast({
        title: 'Cambios guardados',
        description: `Se han actualizado ${pendingChanges.length} campo(s).`,
      });
      setEditingRowId(null);
      setEditedValues({});
      setPendingChanges([]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
      });
    } finally {
      setIsSaving(false);
      setIsConfirmOpen(false);
    }
  };

  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
    setPendingChanges([]);
  };

  const isFieldModified = (rowId: string, field: string, originalValue: any): boolean => {
    if (editingRowId !== rowId) return false;
    return editedValues[field] !== originalValue;
  };

  return (
    <>
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key as string}
                style={{ width: col.width }}
                className={cn(
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right'
                )}
              >
                {col.header}
              </TableHead>
            ))}
            {canEdit && <TableHead className="w-[100px]">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (canEdit ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const isEditing = editingRowId === row.id;
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50',
                    isEditing && 'bg-yellow-50 dark:bg-yellow-900/10'
                  )}
                  onDoubleClick={() => !isEditing && canEdit && startEditing(row)}
                  onClick={() => !isEditing && onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <EditableCell
                      key={col.key as string}
                      value={isEditing ? editedValues[col.key as string] : row[col.key]}
                      column={col}
                      isEditing={isEditing}
                      onChange={(value) => handleValueChange(col.key as string, value)}
                      isModified={isFieldModified(row.id, col.key as string, row[col.key])}
                    />
                  ))}
                  {canEdit && (
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            onClick={() => handleSaveClick(row)}
                            disabled={isSaving}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10"
                            onClick={cancelEditing}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(row);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <ConfirmChangesDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        changes={pendingChanges}
        columns={columns}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelConfirm}
      />
    </>
  );
}

// Helper to create column definitions easily
export function createColumn<T>(
  key: keyof T,
  header: string,
  type: EditableColumn<T>['type'] = 'text',
  options?: Partial<Omit<EditableColumn<T>, 'key' | 'header' | 'type'>>
): EditableColumn<T> {
  return {
    key,
    header,
    type,
    ...options,
  };
}
