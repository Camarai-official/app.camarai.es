'use client';

import * as React from 'react';
import { Settings, Monitor, Printer, LayoutGrid, Wallet } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { ActionTile } from '@/components/ui/action-tile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface POSConfig {
    terminalId: string;
    printerId: string;
    operationMode: string;
    paymentMethods: {
        cash: boolean;
        card: boolean;
        mixed: boolean;
    };
}

interface POSConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: POSConfig;
    onConfigChange: (config: POSConfig) => void;
    onSave: () => void;
    terminals: any[];
    printers: any[];
}

export function POSConfigDialog({
    open,
    onOpenChange,
    config,
    onConfigChange,
    onSave,
    terminals,
    printers
}: POSConfigDialogProps) {
    const handleTogglePayment = (method: keyof POSConfig['paymentMethods']) => {
        onConfigChange({
            ...config,
            paymentMethods: {
                ...config.paymentMethods,
                [method]: !config.paymentMethods[method]
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <DialogHeader
                    icon={Settings}
                    title="Configuración del POS"
                    description="Configura el terminal, impresora y opciones de operación para el punto de venta."
                />
                <DialogContent>
                    <ScrollArea height="full">
                        <div className="space-y-6 p-1">
                            {/* Conectividad */}
                            <div className="space-y-3">
                                <ActionTile
                                    icon={Monitor}
                                    iconColor="muted-foreground"
                                    title="Dispositivo / Terminal"
                                    description="Selecciona el dispositivo desde el que operarás."
                                    rightContentType="select"
                                    selectValue={config.terminalId}
                                    onSelectChange={(v) => onConfigChange({ ...config, terminalId: v })}
                                    selectOptions={terminals.length > 0 
                                        ? terminals.map(t => ({ value: t.id, label: t.name }))
                                        : [{ value: 'none', label: 'Sin terminales' }]
                                    }
                                />

                                <ActionTile
                                    icon={Printer}
                                    iconColor="muted-foreground"
                                    title="Impresora de Tickets"
                                    description="Impresora para tickets y comandas."
                                    rightContentType="select"
                                    selectValue={config.printerId}
                                    onSelectChange={(v) => onConfigChange({ ...config, printerId: v })}
                                    selectOptions={printers.length > 0 
                                        ? printers.map(p => ({ value: p.id, label: p.name }))
                                        : [{ value: 'none', label: 'Sin impresoras' }]
                                    }
                                />
                            </div>

                            <Separator variant="muted" />

                            {/* Operación */}
                            <div className="space-y-3">
                                <ActionTile
                                    icon={LayoutGrid}
                                    iconColor="muted-foreground"
                                    title="Modo de Operación"
                                    description="Define el flujo de trabajo principal."
                                    rightContentType="select"
                                    selectValue={config.operationMode}
                                    onSelectChange={(v) => onConfigChange({ ...config, operationMode: v })}
                                    selectOptions={[
                                        { value: 'mesa', label: 'Servicio en Mesa' },
                                        { value: 'barra', label: 'Servicio en Barra' },
                                        { value: 'llevar', label: 'Para Llevar' },
                                        { value: 'mixto', label: 'Modo Mixto' }
                                    ]}
                                />
                            </div>

                            <Separator variant="muted" />

                            {/* Pagos */}
                            <div className="space-y-3">
                                <ActionTile
                                    icon={Wallet}
                                    iconColor="muted-foreground"
                                    title="Efectivo"
                                    description="Habilitar cobros en efectivo."
                                    rightContentType="switch"
                                    switchId="payment-cash"
                                    switchChecked={config.paymentMethods.cash}
                                    onSwitchChange={() => handleTogglePayment('cash')}
                                />
                                <ActionTile
                                    icon={Wallet}
                                    iconColor="muted-foreground"
                                    title="Tarjeta"
                                    description="Habilitar cobros con tarjeta."
                                    rightContentType="switch"
                                    switchId="payment-card"
                                    switchChecked={config.paymentMethods.card}
                                    onSwitchChange={() => handleTogglePayment('card')}
                                />
                                <ActionTile
                                    icon={Wallet}
                                    iconColor="muted-foreground"
                                    title="Pago Mixto"
                                    description="Permitir dividir cuenta entre varios métodos."
                                    rightContentType="switch"
                                    switchId="payment-mixed"
                                    switchChecked={config.paymentMethods.mixed}
                                    onSwitchChange={() => handleTogglePayment('mixed')}
                                />
                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
                <DialogFooter
                    onCancel={() => { onSave(); onOpenChange(false); }}
                    cancelText="Cerrar"
                />
            </DialogWindow>
        </Dialog>
    );
}
