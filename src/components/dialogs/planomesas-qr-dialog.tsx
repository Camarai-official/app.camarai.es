'use client';

import * as React from 'react';
import { 
    QrCode, Activity, Globe, MapPin, FileText, 
    Copy, Download, Printer as PrinterIcon 
} from 'lucide-react';

// UI Components
import { TextXS } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ActionTile } from '@/components/ui/action-tile';

// Layout Components
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';

// Data & Helpers
import { type Table, type Environment } from '@/types/environments';

interface QRConfigDialogProps { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    table: Table | null;
    activeEnv?: Environment;
}

export function QRConfigDialog({ 
    open, 
    onOpenChange, 
    table, 
    activeEnv 
}: QRConfigDialogProps) {
    const { toast } = useToast();
    const [qrKey, setQrKey] = React.useState(0);
    const [qrConfig, setQrConfig] = React.useState({
        baseUrl: 'https://camarai.app',
        includeEnv: true,
        customMessage: '¡Bienvenido! Escanea para ver nuestro menú.',
    });

    if (!table) return null;

    const getQRUrl = () => {
        let url = `${qrConfig.baseUrl}/t/${table.number}`;
        if (qrConfig.includeEnv && activeEnv) {
            url += `?envId=${encodeURIComponent(activeEnv.id)}`;
        }
        return url;
    };

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getQRUrl())}&t=${qrKey}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(getQRUrl());
        toast({ title: "Enlace Copiado", description: "El enlace de5. Numeración al añadir mesa (huecos por borrados)

En addTable, reemplazar length + 1 por el mismo criterio que duplicateTable: max de number entre mesas no-objeto + 1 (filtrar !t.isObject), para no reutilizar números cuando hay huecos.5. Numeración al añadir mesa (huecos por borrados)

En addTable, reemplazar length + 1 por el mismo criterio que duplicateTable: max de number entre mesas no-objeto + 1 (filtrar !t.isObject), para no reutilizar números cuando hay huecos. la mesa ha sido copiado al portapapeles." });
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrImageUrl;
        link.download = `qr-mesa-${table.number}.png`;
        link.click();
        toast({ title: "Descargando QR", description: `El código de la Mesa ${table.number} se está descargando.` });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="lg">
                <DialogHeader 
                    icon={QrCode} 
                    title={`Configurar QR - Mesa ${table.number}`} 
                    description="Personaliza el acceso digital y el mensaje de bienvenida para tus clientes." 
                />
                <DialogContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                        {/* Previsualización */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="p-8 bg-foreground rounded-[2.5rem] shadow-2xl group/qr relative overflow-hidden transition-transform hover:scale-[1.02] duration-300">
                                <img src={qrImageUrl} alt="QR Preview" className="w-48 h-48 rounded-xl" />
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/qr:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            <Button 
                                variant="outline" 
                                size="md" 
                                onClick={() => { setQrKey(Date.now()); toast({ title: "QR Regenerado" }); }} 
                                startIcon={<Activity />}
                                className="w-full max-w-[200px]"
                            >
                                Regenerar Firma
                            </Button>
                        </div>

                        {/* Configuración */}
                        <div className="flex flex-col gap-5">
                            <div className="space-y-2">
                                <Label variant="group">URL de Acceso</Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary/10 rounded-lg">
                                        <Globe className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <Input 
                                        value={qrConfig.baseUrl}
                                        onChange={(e) => setQrConfig(p => ({ ...p, baseUrl: e.target.value }))}
                                        className="pl-10"
                                        placeholder="https://tu-restaurante.com"
                                    />
                                </div>
                            </div>

                            <ActionTile
                                icon={MapPin}
                                title="Incluir Ambiente"
                                description="Añade el identificador del salón al enlace."
                                rightContentType="switch"
                                switchId="include-env"
                                switchChecked={qrConfig.includeEnv}
                                onSwitchChange={(v) => setQrConfig(p => ({ ...p, includeEnv: v }))}
                            />

                            <div className="space-y-2">
                                <Label variant="group">Mensaje de Bienvenida</Label>
                                <Textarea 
                                    value={qrConfig.customMessage}
                                    onChange={(e) => setQrConfig(p => ({ ...p, customMessage: e.target.value }))}
                                    placeholder="¡Hola! Bienvenidos..."
                                    className="resize-none h-24"
                                />
                            </div>

                            <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-3 w-3 text-primary" />
                                    <Label variant="group" className="ml-0">URL Generada</Label>
                                </div>
                                <TextXS className="font-mono break-all opacity-70 line-clamp-2">
                                    {getQRUrl()}
                                </TextXS>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <div className="flex gap-2 w-full justify-end">
                        <Button variant="ghost" onClick={handleCopy} startIcon={<Copy />}>Copiar Enlace</Button>
                        <Button variant="outline" onClick={handleDownload} startIcon={<Download />}>Descargar</Button>
                        <Button variant="brand" onClick={() => { handleDownload(); onOpenChange(false); }} startIcon={<PrinterIcon />}>Imprimir Código</Button>
                    </div>
                </DialogFooter>
            </DialogWindow>
        </Dialog>
    );
}
