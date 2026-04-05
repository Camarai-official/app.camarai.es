'use client';

import * as React from 'react';
import { Printer, Zap, Check, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type PrintMode = 'html' | 'thermal';

interface PrintModeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (mode: PrintMode) => void;
    thermalAvailable: boolean;
    thermalConnected: boolean;
    ticketCount: number;
}

export function PrintModeDialog({
    open,
    onOpenChange,
    onConfirm,
    thermalAvailable,
    thermalConnected,
    ticketCount,
}: PrintModeDialogProps) {
    const [selected, setSelected] = React.useState<PrintMode>('html');

    React.useEffect(() => {
        if (open) {
            // Preseleccionar térmica si está disponible, si no, HTML
            setSelected(thermalAvailable ? 'thermal' : 'html');
        }
    }, [open, thermalAvailable]);

    const handleConfirm = () => {
        onConfirm(selected);
        onOpenChange(false);
    };

    const ticketLabel = ticketCount === 1
        ? '1 ticket'
        : `${ticketCount} tickets`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="sm">
                <DialogHeader
                    icon={Printer}
                    title="Seleccionar método de impresión"
                    description={`Se imprimirán ${ticketLabel} de código QR`}
                />

                <DialogContent>
                    <div className="space-y-3">

                        {/* Opción: Impresora estándar */}
                        <button
                            type="button"
                            onClick={() => setSelected('html')}
                            className={cn(
                                "w-full text-left rounded-xl border-2 p-4 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                selected === 'html'
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                    selected === 'html'
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <Printer className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-foreground">
                                            Impresora estándar
                                        </p>
                                        {selected === 'html' && (
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                                        Abre el diálogo de impresión del navegador. Compatible con cualquier impresora instalada en el sistema.
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        <Badge variant="secondary" className="text-[10px] py-0 h-5">PDF</Badge>
                                        <Badge variant="secondary" className="text-[10px] py-0 h-5">Cualquier impresora</Badge>
                                        <Badge variant="secondary" className="text-[10px] py-0 h-5">Siempre disponible</Badge>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Opción: Impresora térmica */}
                        <button
                            type="button"
                            disabled={!thermalAvailable}
                            onClick={() => thermalAvailable && setSelected('thermal')}
                            className={cn(
                                "w-full text-left rounded-xl border-2 p-4 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                !thermalAvailable && "opacity-50 cursor-not-allowed",
                                thermalAvailable && selected === 'thermal' && "border-primary bg-primary/5",
                                thermalAvailable && selected !== 'thermal' && "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                    selected === 'thermal' && thermalAvailable
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    <Zap className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <p className="text-sm font-bold text-foreground">
                                                Impresora térmica
                                            </p>
                                            <ThermalStatusBadge
                                                available={thermalAvailable}
                                                connected={thermalConnected}
                                            />
                                        </div>
                                        {selected === 'thermal' && thermalAvailable && (
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                                        Envía comandos ESC/POS directamente a la Citaq H10-3 vía puerto serie. Corte automático de papel entre tickets.
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        <Badge variant="secondary" className="text-[10px] py-0 h-5">80mm</Badge>
                                        <Badge variant="secondary" className="text-[10px] py-0 h-5">ESC/POS</Badge>
                                        <Badge variant="secondary" className="text-[10px] py-0 h-5">Corte automático</Badge>
                                        {!thermalAvailable && (
                                            <Badge variant="destructive" className="text-[10px] py-0 h-5">
                                                Requiere Chrome 89+
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Info contextual según selección */}
                        {selected === 'thermal' && thermalAvailable && !thermalConnected && (
                            <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
                                <Wifi className="h-3 w-3 inline mr-1 mb-0.5" />
                                La primera vez se mostrará un diálogo del navegador para autorizar el acceso al puerto serie.
                            </p>
                        )}
                        {selected === 'thermal' && thermalAvailable && thermalConnected && (
                            <p className="text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
                                <Zap className="h-3 w-3 inline mr-1 mb-0.5 text-green-500" />
                                Impresora ya conectada. Se enviará el trabajo directamente.
                            </p>
                        )}
                    </div>
                </DialogContent>

                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                    onConfirm={handleConfirm}
                    confirmText={`Imprimir ${ticketLabel}`}
                />
            </DialogWindow>
        </Dialog>
    );
}

function ThermalStatusBadge({ available, connected }: { available: boolean; connected: boolean }) {
    if (!available) {
        return (
            <Badge variant="neutral" className="text-[10px] py-0 h-5 gap-1">
                <WifiOff className="h-2.5 w-2.5" />
                No disponible
            </Badge>
        );
    }
    if (connected) {
        return (
            <Badge variant="success" className="text-[10px] py-0 h-5 gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                Conectada
            </Badge>
        );
    }
    return (
        <Badge variant="warning" className="text-[10px] py-0 h-5 gap-1">
            <Wifi className="h-2.5 w-2.5" />
            Disponible
        </Badge>
    );
}
