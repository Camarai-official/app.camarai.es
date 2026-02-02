import * as React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mockMovements } from '@/data/reportes';

type MovementsDetailsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function MovementsDetailsDialog({ open, onOpenChange }: MovementsDetailsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Movimientos Detallados del Turno</DialogTitle>
                    <DialogDescription>Aquí se muestra un desglose de todas las transacciones del día.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Importe</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockMovements.map(mov => (
                                <TableRow key={mov.id}>
                                    <TableCell className="font-medium">{mov.concept}</TableCell>
                                    <TableCell>
                                        <Badge variant={mov.type === 'Ingreso' ? 'completed' : 'destructive'} className="gap-1">
                                            {mov.type === 'Ingreso' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                            {mov.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={cn("text-right font-mono", mov.type === 'Gasto' && 'text-destructive')}>
                                        €{mov.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
