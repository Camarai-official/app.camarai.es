'use client';

import * as React from 'react';
import { Clock, Edit, Calendar, User, Play } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ActionTile } from '@/components/ui/action-tile';
import { iconMap } from '@/components/ui/icon-picker';
import type { TimeLog } from '@/types/staff';
import type { ExtendedStaffMember } from './personal-edit-dialog';

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
    const [staffId, setStaffId] = React.useState('');
    const [date, setDate] = React.useState('');
    const [time, setTime] = React.useState('');
    const [type, setType] = React.useState('');

    React.useEffect(() => {
        if (open) {
            if (editingTimeLog) {
                setStaffId(editingTimeLog.staffId);
                setDate(editingTimeLog.timestamp.split('T')[0]);
                setTime(editingTimeLog.timestamp.split('T')[1]?.slice(0, 5) || '');
                setType(editingTimeLog.action);
            } else {
                setStaffId('');
                setDate(new Date().toISOString().split('T')[0]);
                setTime(new Date().toTimeString().slice(0, 5)); // Hora actual
                setType('clock-in');
            }
        }
    }, [open, editingTimeLog]);

    const handleSave = () => {
        onSave({ staffId, date, time, type });
        onOpenChange(false);
    };

    const selectedStaff = staffMembers.find(s => s.id === staffId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <DialogHeader
                    icon={isEditing ? Edit : Clock}
                    title={isEditing ? "Editar Registro de Fichaje" : "Registrar Fichaje Manual"}
                    description={isEditing 
                        ? "Modifica la fecha, hora o acción del registro." 
                        : "Añadir un registro de tiempo manualmente."}
                />
                
                <DialogContent className="space-y-3">
                    {isEditing ? (
                        <ActionTile
                            icon={selectedStaff ? iconMap[selectedStaff.icon || 'User'] : User}
                            iconColor={selectedStaff?.color}
                            title="Empleado"
                            description={selectedStaff?.nombre || 'Desconocido'}
                            rightContentType="badge"
                            badgeText="Solo lectura"
                            badgeVariant="neutral"
                        />
                    ) : (
                        <ActionTile
                            icon={selectedStaff ? iconMap[selectedStaff.icon || 'User'] : User}
                            iconColor={selectedStaff?.color}
                            title="Seleccionar Empleado"
                            description={selectedStaff ? 'Empleado asignado' : 'Selecciona un miembro del equipo'}
                            rightContentType="select"
                            selectValue={staffId}
                            onSelectChange={setStaffId}
                            selectPlaceholder="Seleccionar..."
                            selectOptions={staffMembers.map(s => ({ value: s.id, label: s.nombre }))}
                        />
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <ActionTile
                            icon={Calendar}
                            title="Fecha"
                            rightContentType="custom"
                            customContent={
                                <Input 
                                    type="date" 
                                    value={date} 
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-40"
                                />
                            }
                        />
                        <ActionTile
                            icon={Clock}
                            title="Hora"
                            rightContentType="custom"
                            customContent={
                                <Input 
                                    type="time" 
                                    value={time} 
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-24"
                                />
                            }
                        />
                    </div>

                    <ActionTile
                        icon={Play}
                        title="Tipo de Registro"
                        description="Acción realizada por el empleado"
                        rightContentType="select"
                        selectValue={type}
                        onSelectChange={setType}
                        selectOptions={[
                            { value: 'clock-in', label: 'Entrada' },
                            { value: 'start-break', label: 'Iniciar Pausa' },
                            { value: 'end-break', label: 'Fin Pausa' },
                            { value: 'clock-out', label: 'Salida' },
                        ]}
                    />
                </DialogContent>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button 
                        onClick={handleSave}
                        disabled={!staffId || !date || !time || !type}
                    >
                        {isEditing ? 'Guardar Cambios' : 'Guardar Registro'}
                    </Button>
                </DialogFooter>
            </DialogWindow>
        </Dialog>
    );
}
