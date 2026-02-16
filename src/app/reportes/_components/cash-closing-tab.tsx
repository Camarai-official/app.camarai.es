import { H3 } from '@/components/ui/typography';
import * as React from 'react';
import { Eye } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type CashClosingTabProps = {
    realCash: string;
    onRealCashChange: (value: string) => void;
    initialCash: number;
    totalSales: number;
    cashSales: number;
    cardSales: number;
    theoreticalCash: number;
    cashDifference: number | null;
    onOpenMovements: () => void;
};

export function CashClosingTab({
    realCash,
    onRealCashChange,
    initialCash,
    totalSales,
    cashSales,
    cardSales,
    theoreticalCash,
    cashDifference,
    onOpenMovements }: CashClosingTabProps) {
    return (
        <TabsContent value="cash-closing" className="space-y-6">
            <Card>
                <CardHeader>
                    <H3>Realizar Cierre de Caja</H3>
                    <CardDescription>Finaliza el turno actual asegurando el cuadre de las operaciones financieras.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg">Resumen del Turno</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between p-3 bg-muted/50 rounded-md">
                                <span>Saldo Inicial en Caja:</span>
                                <span className="font-mono font-medium">€{initialCash.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-muted/50 rounded-md">
                                <span>Ventas en Efectivo:</span>
                                <span className="font-mono font-medium">€{cashSales.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-muted/50 rounded-md">
                                <span>Ventas con Tarjeta:</span>
                                <span className="font-mono font-medium">€{cardSales.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-base font-bold p-3 bg-muted/50 rounded-md">
                                <span>Total de Ventas:</span>
                                <span className="font-mono">€{totalSales.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={onOpenMovements}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Movimientos Detallados
                        </Button>
                    </div>
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg">Cuadre de Caja</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-lg p-3 bg-blue-500/10 rounded-lg">
                                <span className="font-semibold text-blue-800 dark:text-blue-300">Total Teórico en Caja:</span>
                                <span className="font-mono font-bold text-blue-800 dark:text-blue-300">€{theoreticalCash.toFixed(2)}</span>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="realCash">Total Real Contado (€):</Label>
                                <Input
                                    id="realCash"
                                    type="number"
                                    placeholder="Introduce el importe contado..."
                                    value={realCash}
                                    onChange={(e) => onRealCashChange(e.target.value)}
                                    className="text-lg h-12"
                                />
                            </div>
                            {cashDifference !== null && (
                                <div className={cn(
                                    "flex justify-between items-center text-lg p-3 rounded-lg",
                                    cashDifference === 0 && "bg-green-500/10 text-green-800 dark:text-green-300",
                                    cashDifference > 0 && "bg-yellow-500/10 text-yellow-800 dark:text-yellow-400",
                                    cashDifference < 0 && "bg-red-500/10 text-red-800 dark:text-red-400"
                                )}>
                                    <span className="font-semibold">
                                        {cashDifference === 0 ? "¡Caja Cuadrada!" : cashDifference > 0 ? "Sobrante:" : "Faltante:"}
                                    </span>
                                    <span className="font-mono font-bold">€{Math.abs(cashDifference).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-end gap-3">
                    <p className="text-sm text-muted-foreground flex-1 text-center sm:text-left">
                        Antes de cerrar, asegúrate de que todas las cuentas estén pagadas.
                    </p>
                    <Button variant="outline" size="lg">Cierre X (Parcial)</Button>
                    <Button variant="destructive" size="lg">Cierre Z (Final)</Button>
                </CardFooter>
            </Card>
        </TabsContent>
    );
}

