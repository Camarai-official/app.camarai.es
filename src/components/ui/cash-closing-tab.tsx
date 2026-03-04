import * as React from 'react';
import { Eye } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/components/widgets/metric-card';
import { DollarSign, CreditCard, Wallet, TrendingUp } from 'lucide-react';
import { H3, TextSM } from '@/components/ui/typography';

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
                <CardHeader title="Realizar Cierre de Caja">
                    <CardDescription>Finaliza el turno actual asegurando el cuadre de las operaciones financieras.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="Saldo Inicial"
                            value={`€${initialCash.toFixed(2)}`}
                            icon={Wallet}
                        />
                        <MetricCard
                            title="Efectivo"
                            value={`€${cashSales.toFixed(2)}`}
                            icon={DollarSign}
                        />
                        <MetricCard
                            title="Tarjeta"
                            value={`€${cardSales.toFixed(2)}`}
                            icon={CreditCard}
                        />
                        <MetricCard
                            title="Total Ventas"
                            value={`€${totalSales.toFixed(2)}`}
                            icon={TrendingUp}
                        />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <H3>Operaciones Detalladas</H3>
                            <TextSM className="text-muted-foreground">
                                Revisa todos los movimientos individuales registrados durante el turno antes de proceder al cierre definitivo.
                            </TextSM>
                            <Button variant="outline" className="w-full h-12" onClick={onOpenMovements} startIcon={<Eye />}>
                                Ver Movimientos Detallados
                            </Button>
                        </div>
                        <div className="space-y-6">
                            <H3>Cuadre de Caja</H3>
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
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-end gap-3">
                    <TextSM className="text-muted-foreground">
                        Antes de cerrar, asegúrate de que todas las cuentas estén pagadas.
                    </TextSM>
                    <Button variant="outline" size="md">Cierre X (Parcial)</Button>
                    <Button variant="destructive" size="md">Cierre Z (Final)</Button>
                </CardFooter>
            </Card>
        </TabsContent>
    );
}

