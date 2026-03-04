'use client';

import * as React from 'react';
import { Tablet, Monitor, Smartphone, Globe, Info, Save, X as XIcon, RefreshCw, MoreHorizontal, Settings } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextSM, TextXS, TextMD } from "@/components/ui/typography";
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ActionTile } from '@/components/ui/action-tile';
import type { DispositivoFichaje } from '@/types/fichaje';

interface DeviceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingDevice: DispositivoFichaje | null;
    onSave: (device: DispositivoFichaje) => void;
}

const tipoOptions = [
    { value: 'tablet', label: 'Tablet' },
    { value: 'terminal', label: 'Terminal Fijo' },
    { value: 'movil', label: 'Móvil' }
];

export function DeviceDialog({
    open,
    onOpenChange,
    editingDevice,
    onSave
}: DeviceDialogProps) {
    const [intervalo, setIntervalo] = React.useState(30);
    const [tipo, setTipo] = React.useState<'tablet' | 'terminal' | 'movil'>('tablet');
    const [offline, setOffline] = React.useState(true);

    React.useEffect(() => {
        if (editingDevice) {
            setIntervalo(editingDevice.intervalo_qr || 30);
            setTipo(editingDevice.tipo || 'tablet');
            setOffline(editingDevice.modo_offline ?? true);
        } else {
            setIntervalo(30);
            setTipo('tablet');
            setOffline(true);
        }
    }, [editingDevice, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        onSave({
            id: editingDevice?.id || Math.random().toString(36).substr(2, 9),
            nombre: formData.get('nombre') as string,
            tipo: tipo,
            ubicacion: formData.get('ubicacion') as string,
            intervalo_qr: intervalo,
            modo_offline: offline,
            estado: editingDevice?.estado || 'offline'
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader
                        icon={editingDevice ? Settings : Tablet}
                        title={editingDevice ? 'Editar Dispositivo' : 'Vincular Dispositivo'}
                        description="Personaliza la configuración y permisos del terminal."
                    />
                    <DialogContent className="space-y-6">
                        {/* IDENTIDAD DEL DISPOSITIVO */}
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="nombre">Nombre Identificativo</Label>
                                <Input 
                                    id="nombre" 
                                    name="nombre" 
                                    defaultValue={editingDevice?.nombre || ''} 
                                    placeholder="Ej: Tablet Recepción" 
                                    required 
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="ubicacion">Ubicación / Área</Label>
                                <Input 
                                    id="ubicacion" 
                                    name="ubicacion" 
                                    defaultValue={editingDevice?.ubicacion || ''} 
                                    placeholder="Ej: Entrada Principal" 
                                />
                            </div>
                        </div>

                        {/* CONFIGURACIÓN TÉCNICA */}
                        <div className="grid gap-3">
                            <Label>Parámetros de Funcionamiento</Label>
                            
                            <ActionTile
                                icon={tipo === 'tablet' ? Tablet : tipo === 'terminal' ? Monitor : Smartphone}
                                title="Tipo de Dispositivo"
                                description="Formato del terminal físico"
                                rightContentType="select"
                                selectValue={tipo}
                                onSelectChange={(v) => setTipo(v as any)}
                                selectOptions={tipoOptions}
                            />

                            <ActionTile
                                icon={Globe}
                                title="Modo Offline"
                                description="Permite fichar sin conexión"
                                rightContentType="switch"
                                switchId="modo-offline"
                                switchChecked={offline}
                                onSwitchChange={setOffline}
                            />
                        </div>

                        {/* SEGURIDAD QR */}
                        <div className="p-4 bg-muted/30 rounded-xl space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground tracking-widest">
                                <RefreshCw className="h-3 w-3" /> Seguridad Dinámica QR
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-0.5">
                                        <TextSM>Frecuencia de Rotación</TextSM>
                                        <TextXS className="text-muted-foreground">Regenerar código cada {intervalo} segundos</TextXS>
                                    </div>
                                    <Badge variant="outline" className="h-6 tabular-nums">{intervalo}s</Badge>
                                </div>
                                <Slider
                                    value={[intervalo]}
                                    min={15}
                                    max={120}
                                    step={5}
                                    onValueChange={(v) => setIntervalo(v[0])}
                                />
                                <div className="flex items-start gap-2 text-[10px] text-muted-foreground leading-tight">
                                    <Info className="h-3 w-3 shrink-0" />
                                    <TextMD>Un intervalo más bajo aumenta la seguridad pero requiere una conexión a internet más estable.</TextMD>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" variant="default" startIcon={<Save />}>
                            {editingDevice ? 'Actualizar' : 'Vincular'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogWindow>
        </Dialog>
    );
}
