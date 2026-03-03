'use client';

import * as React from 'react';
import { Calendar } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogClose } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Environment } from '@/data/environments';

type ReservationStatus = 'Pendiente' | 'Confirmada' | 'Cancelada' | 'Completada';

export type Reservation = {
  id: string;
  customerName: string;
  phone: string;
  guests: number;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes?: string;
  environmentId?: string;
  tableId?: number;
};

interface ReservationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (res: Omit<Reservation, 'id'>, id?: string) => void;
    getAvailableTables: (res: Partial<Reservation>) => Environment[];
    environments: Environment[];
    editingReservation?: Reservation | null;
}

export function ReservationDialog({ 
    open, 
    onOpenChange, 
    onSave, 
    getAvailableTables, 
    environments,
    editingReservation 
}: ReservationDialogProps) {
    const isEditing = !!editingReservation;
    
    const [reservation, setReservation] = React.useState<Omit<Reservation, 'id' | 'status'>>({
        customerName: '',
        phone: '',
        guests: 2,
        startTime: '20:30',
        endTime: '22:00',
        notes: '',
        environmentId: undefined,
        tableId: undefined 
    });

    const [selectedEnvId, setSelectedEnvId] = React.useState<string | undefined>(undefined);

    // Initialize form when editing
    React.useEffect(() => {
        if (editingReservation) {
            setReservation({
                customerName: editingReservation.customerName,
                phone: editingReservation.phone,
                guests: editingReservation.guests,
                startTime: editingReservation.startTime,
                endTime: editingReservation.endTime,
                notes: editingReservation.notes || '',
                environmentId: editingReservation.environmentId,
                tableId: editingReservation.tableId 
            });
            setSelectedEnvId(editingReservation.environmentId);
        } else {
            setReservation({
                customerName: '',
                phone: '',
                guests: 2,
                startTime: '20:30',
                endTime: '22:00',
                notes: '',
                environmentId: undefined,
                tableId: undefined 
            });
            setSelectedEnvId(undefined);
        }
    }, [editingReservation, open]);

    const availableTablesByEnv = React.useMemo(() => {
        if (!selectedEnvId) return [];
        const availableEnvs = getAvailableTables({ ...reservation, id: editingReservation?.id });
        const selectedAvailableEnv = availableEnvs.find(e => e.id === selectedEnvId);
        return selectedAvailableEnv ? selectedAvailableEnv.tables : [];
    }, [selectedEnvId, reservation, getAvailableTables, editingReservation?.id]);
    
    React.useEffect(() => {
        // Reset table selection if environment changes (only for new reservations)
        if (!isEditing) {
            setReservation(p => ({ ...p, tableId: undefined }));
        }
    }, [selectedEnvId, isEditing]);

    const handleSave = () => {
        const status = isEditing ? editingReservation.status : 'Confirmada';
        onSave({ ...reservation, status }, editingReservation?.id);
        onOpenChange(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <DialogHeader
                    icon={Calendar}
                    title={isEditing ? 'Editar Reserva' : 'Añadir Nueva Reserva'}
                    description={isEditing ? 'Modifica los datos de la reserva.' : 'Introduce los datos para crear una reserva manualmente.'}
                />
                <DialogContent spaced>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="customerName">Nombre del Cliente</Label>
                            <Input 
                                id="customerName" 
                                placeholder="Ej: Juan Pérez"
                                value={reservation.customerName} 
                                onChange={e => setReservation(p => ({...p, customerName: e.target.value}))}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input 
                                id="phone" 
                                type="tel" 
                                placeholder="Ej: +34 600 000 000"
                                value={reservation.phone} 
                                onChange={e => setReservation(p => ({...p, phone: e.target.value}))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="guests">Comensales</Label>
                            <Input 
                                id="guests" 
                                type="number" 
                                min="1" 
                                value={reservation.guests} 
                                onChange={e => setReservation(p => ({...p, guests: parseInt(e.target.value) || 1}))}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="startTime">Hora de Inicio</Label>
                            <Input 
                                id="startTime" 
                                type="time" 
                                value={reservation.startTime} 
                                onChange={e => setReservation(p => ({...p, startTime: e.target.value}))}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="endTime">Hora de Fin</Label>
                            <Input 
                                id="endTime" 
                                type="time" 
                                value={reservation.endTime} 
                                onChange={e => setReservation(p => ({...p, endTime: e.target.value}))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="environment-select">Ambiente</Label>
                            <Select value={selectedEnvId} onValueChange={setSelectedEnvId}>
                                <SelectTrigger id="environment-select">
                                    <SelectValue placeholder="Seleccionar ambiente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {environments.map(env => (
                                        <SelectItem key={env.id} value={env.id}>{env.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="table-select">Mesa</Label>
                            <Select 
                                value={reservation.tableId?.toString()} 
                                onValueChange={(val) => setReservation(p => ({...p, tableId: parseInt(val), environmentId: selectedEnvId }))}
                                disabled={!selectedEnvId || availableTablesByEnv.length === 0}
                            >
                                <SelectTrigger id="table-select">
                                    <SelectValue placeholder={!selectedEnvId ? 'Elige un ambiente' : 'Mesas disponibles...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTablesByEnv.map(table => (
                                        <SelectItem key={table.id} value={table.id.toString()}>Mesa {table.number} (Cap: {table.capacity})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="notes">Notas (Opcional)</Label>
                        <Textarea 
                            id="notes" 
                            placeholder="Alergias, preferencias de mesa, celebración, etc." 
                            value={reservation.notes} 
                            onChange={e => setReservation(p => ({...p, notes: e.target.value}))}
                            rows={4}
                        />
                    </div>
                </DialogContent>
                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                    cancelText="Cancelar"
                    onConfirm={handleSave}
                    confirmText={isEditing ? 'Guardar Cambios' : 'Crear Reserva'}
                />
            </DialogWindow>
        </Dialog>
    );
}
