'use client';

import * as React from 'react';
import { Clock, Edit } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TimeLog } from '@/data/mock-data';
import type { ExtendedStaffMember } from './employee-dialog';

interface TimeLogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingTimeLog: TimeLog | null;
    staffMembers: ExtendedStaffMember[];
    onSave: (data: any) => void;
}

export function TimeLogDialog({
    open,
    onOpenChange,
    editingTimeLog,
    staffMembers,
    onSave
}: TimeLogDialogProps) {
    const isEditing = !!editingTimeLog;

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
                        icon={isEditing ? Edit : Clock}
                        title={isEditing ? "Editar Registro de Fichaje" : "Registrar Fichaje Manual"}
                        description={isEditing 
                            ? "Modifica la fecha, hora o acción del registro." 
                            : "Añadir un registro de tiempo manualmente."}
                    />
                    
                    <DialogContent className="space-y-4">
                    {isEditing ? (
                        <div className="space-y-2">
                            <Label>Empleado</Label>
                            <Input 
                                value={staffMembers.find(s => s.id === editingTimeLog.staffId)?.nombre || 'Desconocido'} 
                                disabled 
                                className="bg-muted"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="staffId">Empleado</Label>
                            <Select name="staffId" required>
                                <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                                <SelectContent>
                                    {staffMembers.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input 
                                id="date" 
                                name="date" 
                                type="date" 
                                defaultValue={isEditing ? editingTimeLog.timestamp.split('T')[0] : new Date().toISOString().split('T')[0]}
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Hora</Label>
                            <Input 
                                id="time" 
                                name="time" 
                                type="time" 
                                defaultValue={isEditing ? editingTimeLog.timestamp.split('T')[1]?.slice(0, 5) : ''}
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo de registro</Label>
                        <Select name="type" defaultValue={isEditing ? editingTimeLog.action : undefined} required>
                            <SelectTrigger id="type"><SelectValue placeholder="Seleccionar acción" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="clock-in">Entrada</SelectItem>
                                <SelectItem value="start-break">Iniciar Pausa</SelectItem>
                                <SelectItem value="end-break">Fin Pausa</SelectItem>
                                <SelectItem value="clock-out">Salida</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    </DialogContent>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Guardar Registro'}</Button>
                    </DialogFooter>
                </form>
            </DialogWindow>
        </Dialog>
    );
}
