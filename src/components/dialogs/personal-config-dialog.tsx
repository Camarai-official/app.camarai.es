'use client';

import * as React from 'react';
import { Settings, Activity, Users, Clock, Calendar, AlertCircle, Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
            <DialogContent size="sm">
                <DialogHeader
                    icon={Settings}
                    title="Configurar Vista Personal"
                    description="Personaliza qué secciones quieres ver en tu panel de gestión de equipo."
                />

                <div className="space-y-4 py-4 px-6">
                    <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <Label className="text-sm font-semibold">Resumen de KPIs</Label>
                                <p className="text-xs text-muted-foreground">Estadísticas generales del equipo</p>
                            </div>
                        </div>
                        <Switch checked={config.kpis} onCheckedChange={() => onToggle('kpis')} />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                                <Users className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                                <Label className="text-sm font-semibold">Gestión de Equipo</Label>
                                <p className="text-xs text-muted-foreground">Listado y edición de empleados</p>
                            </div>
                        </div>
                        <Switch checked={config.equipo} onCheckedChange={() => onToggle('equipo')} />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                <Clock className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                                <Label className="text-sm font-semibold">Control Horario</Label>
                                <p className="text-xs text-muted-foreground">Registro de entradas y salidas</p>
                            </div>
                        </div>
                        <Switch checked={config.controlHorario} onCheckedChange={() => onToggle('controlHorario')} />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                <Calendar className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                                <Label className="text-sm font-semibold">Gestión de Ausencias</Label>
                                <p className="text-xs text-muted-foreground">Vacaciones y permisos</p>
                            </div>
                        </div>
                        <Switch checked={config.ausencias} onCheckedChange={() => onToggle('ausencias')} />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                                <Label className="text-sm font-semibold">Incidencias de Fichaje</Label>
                                <p className="text-xs text-muted-foreground">Errores y correcciones de registros</p>
                            </div>
                        </div>
                        <Switch checked={config.incidencias} onCheckedChange={() => onToggle('incidencias')} />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                                <Smartphone className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                                <Label className="text-sm font-semibold">Dispositivos de Fichaje</Label>
                                <p className="text-xs text-muted-foreground">Gestión de tablets y terminales</p>
                            </div>
                        </div>
                        <Switch checked={config.fichaje} onCheckedChange={() => onToggle('fichaje')} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="default" className="w-full" onClick={() => onOpenChange(false)}>
                        Cerrar y Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
