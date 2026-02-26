'use client';

import * as React from 'react';
import { Settings, Activity, Users, Clock, Calendar, AlertCircle, Smartphone } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { ActionTile } from '@/components/ui/action-tile';

export type PersonalConfig = { 
    kpis: boolean; 
    equipo: boolean; 
    controlHorario: boolean; 
    ausencias: boolean; 
    incidencias: boolean; 
    fichaje: boolean 
};

interface PersonalConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: PersonalConfig;
    onToggle: (key: keyof PersonalConfig) => void;
}

export function PersonalConfigDialog({
    open,
    onOpenChange,
    config,
    onToggle
}: PersonalConfigDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="sm">
                <DialogHeader
                    icon={Settings}
                    title="Configurar Vista Personal"
                    description="Personaliza qué secciones quieres ver en tu panel de gestión de equipo."
                />
                <DialogContent>
                    <ActionTile
                        icon={Activity}
                        iconColor="primary"
                        title="Resumen de KPIs"
                        description="Estadísticas generales del equipo"
                        rightContentType="switch"
                        switchId="kpis"
                        switchChecked={config.kpis}
                        onSwitchChange={() => onToggle('kpis')}
                    />

                    <ActionTile
                        icon={Users}
                        iconColor="green-500"
                        title="Gestión de Equipo"
                        description="Listado y edición de empleados"
                        rightContentType="switch"
                        switchId="equipo"
                        switchChecked={config.equipo}
                        onSwitchChange={() => onToggle('equipo')}
                    />

                    <ActionTile
                        icon={Clock}
                        iconColor="blue-500"
                        title="Control Horario"
                        description="Registro de entradas y salidas"
                        rightContentType="switch"
                        switchId="controlHorario"
                        switchChecked={config.controlHorario}
                        onSwitchChange={() => onToggle('controlHorario')}
                    />

                    <ActionTile
                        icon={Calendar}
                        iconColor="purple-500"
                        title="Gestión de Ausencias"
                        description="Vacaciones y permisos"
                        rightContentType="switch"
                        switchId="ausencias"
                        switchChecked={config.ausencias}
                        onSwitchChange={() => onToggle('ausencias')}
                    />

                    <ActionTile
                        icon={AlertCircle}
                        iconColor="red-500"
                        title="Incidencias de Fichaje"
                        description="Errores y correcciones de registros"
                        rightContentType="switch"
                        switchId="incidencias"
                        switchChecked={config.incidencias}
                        onSwitchChange={() => onToggle('incidencias')}
                    />

                    <ActionTile
                        icon={Smartphone}
                        iconColor="orange-500"
                        title="Dispositivos de Fichaje"
                        description="Gestión de tablets y terminales"
                        rightContentType="switch"
                        switchId="fichaje"
                        switchChecked={config.fichaje}
                        onSwitchChange={() => onToggle('fichaje')}
                    />
                </DialogContent>

                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                />
            </DialogWindow>
        </Dialog>
    );
}
