'use client';

import * as React from 'react';
import { Settings, QrCode, CheckSquare, Users, Clock, AlertTriangle, XSquare, Copy, Download, Hash } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextXS } from '@/components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ActionTile } from '@/components/ui/action-tile';
import { type Table, type TableStatus } from '@/data/mock-data';

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
    setEditingTable: (table: any) => void;
    onSave: () => void;
    onOpenQR: (table: any) => void;
}

export function EditTableDialog({ open, onOpenChange, editingTable, setEditingTable, onSave, onOpenQR }: EditTableDialogProps) {
    if (!editingTable) return null;
    const config = statusConfig[editingTable.status as TableStatus];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="sm">
                <DialogHeader icon={Settings} title={`Editar Mesa ${editingTable.number}`} description="Ajusta los parámetros físicos y operativos." />
                <DialogContent>
                    <ActionTile
                        icon={Hash}
                        title="Número de Mesa"
                        description="Identificador visual para clientes y tickets"
                        rightContentType="custom"
                        customContent={
                            <Input 
                                type="number" 
                                value={editingTable.number} 
                                onChange={(e) => setEditingTable({ ...editingTable, number: parseInt(e.target.value) })}
                            />
                        }
                    />

                    <ActionTile
                        icon={Users}
                        title="Capacidad"
                        description="Máximo de comensales sugerido"
                        rightContentType="quantity"
                        quantity={editingTable.capacity || 0}
                        onIncrease={() => setEditingTable({ ...editingTable, capacity: (editingTable.capacity || 0) + 1 })}
                        onDecrease={() => setEditingTable({ ...editingTable, capacity: Math.max(1, (editingTable.capacity || 0) - 1) })}
                        onRemove={() => {}}
                    />

                    <ActionTile
                        icon={config.icon}
                        iconColor={config.color}
                        title="Estado Operativo"
                        description="Determina si la mesa está disponible."
                        rightContentType="select"
                        selectValue={editingTable.status}
                        onSelectChange={(v) => setEditingTable({ ...editingTable, status: v as TableStatus })}
                        selectOptions={Object.keys(statusConfig).map(s => ({ value: s, label: s }))}
                    />

                    <ActionTile
                        icon={QrCode}
                        title="Código QR"
                        description="Enlace directo a la carta autogestionada"
                        rightContentType="custom"
                        customContent={
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="md" startIcon={<Copy />}>Enlace</Button>
                                <Button variant="outline" size="md" startIcon={<Download />}>Imagen</Button>
                            </div>
                        }
                    />
                </DialogContent>
                <DialogFooter onCancel={() => onOpenChange(false)} onConfirm={onSave} />
            </DialogWindow>
        </Dialog>
    );
}
