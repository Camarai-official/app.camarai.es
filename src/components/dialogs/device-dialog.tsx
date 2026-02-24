'use client';

import * as React from 'react';
import { Tablet, Monitor, Smartphone } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import type { DispositivoFichaje } from '@/types/fichaje';

interface DeviceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingDevice: DispositivoFichaje | null;
    onSave: (device: DispositivoFichaje) => void;
}

export function DeviceDialog({
    open,
    onOpenChange,
    editingDevice,
    onSave
}: DeviceDialogProps) {
    const [intervalo, setIntervalo] = React.useState(editingDevice?.intervalo_qr || 30);

    React.useEffect(() => {
        setIntervalo(editingDevice?.intervalo_qr || 30);
    }, [editingDevice]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        onSave({
            id: editingDevice?.id || '',
            nombre: formData.get('nombre') as string,
            tipo: formData.get('tipo') as 'tablet' | 'terminal' | 'movil',
            ubicacion: formData.get('ubicacion') as string,
            intervalo_qr: intervalo,
            modo_offline: formData.get('modo_offline') === 'on',
            estado: editingDevice?.estado || 'offline'
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader
                        icon={Tablet}
                        title={`${editingDevice ? 'Editar' : 'Añadir'} Dispositivo`}
                        description="Configura los parámetros del dispositivo de fichaje."
                    />
                    <DialogContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre del dispositivo</Label>
                        <Input id="nombre" name="nombre" defaultValue={editingDevice?.nombre || ''} placeholder="Ej: Tablet Entrada" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de dispositivo</Label>
                        <Select name="tipo" defaultValue={editingDevice?.tipo || 'tablet'}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tablet">Tablet</SelectItem>
                                <SelectItem value="terminal">Terminal fijo</SelectItem>
                                <SelectItem value="movil">Móvil</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ubicacion">Ubicación</Label>
                        <Input id="ubicacion" name="ubicacion" defaultValue={editingDevice?.ubicacion || ''} placeholder="Ej: Recepción" />
                    </div>
                    <div className="space-y-2">
                        <Label>Intervalo de regeneración QR: {intervalo}s</Label>
                        <Slider
                            value={[intervalo]}
                            min={15}
                            max={120}
                            step={5}
                            onValueChange={(v) => setIntervalo(v[0])}
                        />
                        <p className="text-xs text-muted-foreground">15s (más seguro) - 120s (menos tráfico)</p>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <Label>Modo Offline</Label>
                            <p className="text-xs text-muted-foreground">Permitir fichajes sin conexión</p>
                        </div>
                        <Checkbox name="modo_offline" defaultChecked={editingDevice?.modo_offline ?? true} />
                    </div>
                    </DialogContent>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit">Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogWindow>
        </Dialog>
    );
}
