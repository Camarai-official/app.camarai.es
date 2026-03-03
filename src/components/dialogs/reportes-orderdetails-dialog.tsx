import * as React from 'react';
import { FileText, Users2, Clock, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogHeader, DialogFooter, DialogClose } from '@/components/layout/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ActionTile } from '@/components/ui/action-tile';
import type { Order, OrderDetails } from '@/data/reportes';

type OrderDetailsDialogProps = {
    order: OrderDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
    if (!order) return null;

    const getStatusInfo = (status: Order['status']) => {
        switch (status) {
            case 'Completado': 
                return { variant: 'completed' as const, icon: CheckCircle };
            case 'En Progreso': 
                return { variant: 'in-progress' as const, icon: Clock };
            case 'Cancelado': 
                return { variant: 'cancelled' as const, icon: XCircle };
            default: 
                return { variant: 'secondary' as const, icon: AlertCircle };
        }
    };

    const statusInfo = getStatusInfo(order.status);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <DialogHeader
                    icon={FileText}
                    title={`Comanda #${order.order}`}
                    description={`Resumen detallado del pedido finalizado.`}
                />
                
                <DialogContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ActionTile
                            icon={Users2}
                            title="Mesa"
                            description="Ubicación asignada"
                            rightContentType="badge"
                            badgeText={order.table}
                            badgeVariant="outline"
                        />
                         <ActionTile
                            icon={statusInfo.icon}
                            title="Estado"
                            description="Situación del pedido"
                            rightContentType="badge"
                            badgeText={order.status}
                            badgeVariant={statusInfo.variant}
                        />
                    </div>

                    <Separator className="my-2" />

                    <div className="rounded-xl border bg-card overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-4">Producto</TableHead>
                                    <TableHead className="text-center">Cant.</TableHead>
                                    <TableHead className="text-right pr-4">Precio</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map(item => (
                                    <TableRow key={item.name}>
                                        <TableCell className="pl-4 font-medium">{item.name}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right pr-4">€{(item.price * item.quantity).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>€{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Impuestos</span>
                            <span>€{order.tax.toFixed(2)}</span>
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-xl text-primary">{order.total}</span>
                        </div>
                    </div>
                </DialogContent>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cerrar</Button>
                    </DialogClose>
                    <Button variant="default" startIcon={<Download />}>
                        Descargar PDF
                    </Button>
                </DialogFooter>
            </DialogWindow>
        </Dialog>
    );
}
