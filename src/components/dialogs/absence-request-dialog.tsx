'use client';

import * as React from 'react';
import { Calendar } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ExtendedStaffMember } from './employee-dialog';

interface AbsenceRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staffMembers: ExtendedStaffMember[];
    onSave: (data: any) => void;
}

export function AbsenceRequestDialog({
    open,
    onOpenChange,
    staffMembers,
    onSave
}: AbsenceRequestDialogProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        onSave(Object.fromEntries(formData));
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader
                        icon={Calendar}
                        title="Registrar Solicitud de Ausencia"
                        description="Crea una nueva solicitud de vacaciones o baja para un empleado."
                    />
                    
                    <DialogContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="staffId">Empleado</Label>
                        <Select name="staffId" required>
                            <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                            <SelectContent>
                                {staffMembers.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Ausencia</Label>
                        <Select name="type" required>
                            <SelectTrigger><SelectValue placeholder="Seleccionar motivo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vacation">Vacaciones</SelectItem>
                                <SelectItem value="sick_leave">Baja Médica</SelectItem>
                                <SelectItem value="personal_days">Asuntos Propios</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Desde</Label>
                            <Input name="startDate" type="date" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Hasta</Label>
                            <Input name="endDate" type="date" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo Detallado</Label>
                        <Input name="reason" placeholder="Opcional" />
                    </div>

                    </DialogContent>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit">Enviar Solicitud</Button>
                    </DialogFooter>
                </form>
            </DialogWindow>
        </Dialog>
    );
}
