import * as React from 'react';
import { FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/layout/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Order, OrderDetails } from '@/data/reportes';

type OrderDetailsDialogProps = {
    order: OrderDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
    if (!order) return null;

    const getStatusBadgeVariant = (status: Order['status']) => {
        switch (status) {
            case 'Completado': return 'completed';
            case 'En Progreso': return 'in-progress';
            case 'Cancelado': return 'cancelled';
            default: return 'secondary';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader
                    icon={FileText}
                    title={`Detalles de la Comanda #${order.order}`}
                    description={`Realizada a las ${order.time} para ${order.name}.`}
                />
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Mesa: <span className="font-bold text-foreground">{order.table}</span></span>
                        <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                    </div>
                    <Separator />
                    <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-center">Cant.</TableHead>
                                    <TableHead className="text-right">Precio</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map(item => (
                                    <TableRow key={item.name}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">?{(item.price * item.quantity).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium">?{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Impuestos:</span>
                            <span className="font-medium">?{order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                            <span>Total:</span>
                            <span className="text-primary">{order.total}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
