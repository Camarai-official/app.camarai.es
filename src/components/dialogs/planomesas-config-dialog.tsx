'use client';

import * as React from 'react';
import { Settings, QrCode, CheckSquare, Users, Clock, AlertTriangle, XSquare, Copy, Download, Hash } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActionTile } from '@/components/ui/action-tile';
import { type Table, type TableStatus } from '@/types/environments';

const statusConfig: Record<TableStatus, { color: string; icon: React.ElementType; bgColor: string }> = {
    'Libre': { color: 'green-500', icon: CheckSquare, bgColor: 'bg-green-500/10' },
    'Ocupada': { color: 'blue-500', icon: Users, bgColor: 'bg-blue-500/10' },
    'Reservada': { color: 'purple-500', icon: Clock, bgColor: 'bg-purple-500/10' },
    'Mantenimiento': { color: 'orange-500', icon: AlertTriangle, bgColor: 'bg-orange-500/10' },
    'Inactiva': { color: 'muted-foreground', icon: XSquare, bgColor: 'bg-muted' }
};

interface EditTableDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingTable: Table | null;
    setEditingTable: (table: Table) => void;
    onSave: () => void;
    onOpenQR: (table: Table) => void;
}

export function EditTableDialog({ open, onOpenChange, editingTable, setEditingTable, onSave, onOpenQR }: EditTableDialogProps) {
    if (!editingTable) return null;
    const config = statusConfig[editingTable.status as TableStatus];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <DialogHeader icon={Settings} title={`Editar Mesa ${editingTable.number}`} description="Ajusta los parámetros físicos y operativos." />
                <DialogContent spaced>
                    <ActionTile
                        icon={Hash}
                        iconColor="muted-foreground"
                        title="Número de Mesa"
                        description="Identificador visual para clientes y tickets."
                        rightContentType="custom"
                        rightContentClassName="w-20"
                        layout="row"
                        customContent={
                            <Input 
                                type="number" 
                                value={editingTable.number} 
                                className="w-full"
                                onChange={(e) => {
                                    const n = parseInt(e.target.value, 10);
                                    setEditingTable({
                                        ...editingTable,
                                        number: Number.isNaN(n) ? editingTable.number : n,
                                    });
                                }}
                            />
                        }
                    />

                    <ActionTile
                        icon={Users}
                        iconColor="muted-foreground"
                        title="Capacidad"
                        description="Basado en las sillas configuradas."
                        rightContentType="custom"
                        rightContentClassName="w-20"
                        layout="row"
                        customContent={
                            <div className="flex items-center justify-center w-full h-10 border rounded-xl bg-background text-sm">
                                {((editingTable.chairs?.top?.length || 0) + 
                                  (editingTable.chairs?.bottom?.length || 0) + 
                                  (editingTable.chairs?.left?.length || 0) + 
                                  (editingTable.chairs?.right?.length || 0) +
                                  (editingTable.chairs?.round?.length || 0))}
                            </div>
                        }
                    />

                    <ActionTile
                        icon={config.icon}
                        iconColor={config.color}
                        title="Estado Operativo"
                        description="Determina si la mesa está disponible."
                        rightContentType="select"
                        rightContentClassName="min-w-36"
                        layout="row"
                        selectValue={editingTable.status}
                        onSelectChange={(v) => setEditingTable({ ...editingTable, status: v as TableStatus })}
                        selectOptions={Object.keys(statusConfig).map(s => ({ value: s, label: s }))}
                    />

                    <ActionTile
                        icon={QrCode}
                        iconColor="muted-foreground"
                        title="Código QR"
                        description="Enlace directo a la carta autogestionada."
                        rightContentType="custom"
                        layout="row"
                        customContent={
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="md"
                                    startIcon={<Copy />}
                                    onClick={() => onOpenQR(editingTable)}
                                    responsive={false}
                                >
                                    Enlace
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="md"
                                    startIcon={<Download />}
                                    onClick={() => onOpenQR(editingTable)}
                                    responsive={false}
                                >
                                    Imagen
                                </Button>
                            </div>
                        }
                    />
                </DialogContent>
                <DialogFooter onCancel={() => onOpenChange(false)} onConfirm={onSave} />
            </DialogWindow>
        </Dialog>
    );
}
