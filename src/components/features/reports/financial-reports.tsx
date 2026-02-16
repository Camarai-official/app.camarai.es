'use client';
import { H3 } from '@/components/ui/typography';


import * as React from 'react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Product, Tax } from '@/data/mock-data';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, Users, Clock } from 'lucide-react';

// --- AverageTicketCard ---
export function AverageTicketCard() {
    return (
        <Card>
            <CardHeader>
                <H3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Ticket Medio
                </H3>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-primary">€38.50</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" /> +4.5% vs semana pasada
                </p>
            </CardContent>
        </Card>
    )
}

// --- TableTurnoverCard ---
export function TableTurnoverCard() {
    return (
        <Card>
            <CardHeader>
                <H3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <Users className="h-5 w-5" /> Rotación de Mesas
                </H3>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-primary">2.8</p>
                <p className="text-xs text-muted-foreground">
                    veces por servicio
                </p>
            </CardContent>
        </Card>
    )
}

// --- RevenuePerHourCard ---
export function RevenuePerHourCard() {
    return (
        <Card>
            <CardHeader>
                <H3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5" /> Ingresos por Hora
                </H3>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-primary">€150.75</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" /> +8.2% vs semana pasada
                </p>
            </CardContent>
        </Card>
    )
}


// --- TaxReportCard ---
type TaxReportCardProps = {
    products: Product[];
    taxes: Tax[];
    getTaxName: (id: string) => string;
};

export function TaxReportCard({ products, taxes, getTaxName }: TaxReportCardProps) {
    const taxReport = React.useMemo(() => {
        const report: { [key: string]: { base: number, taxAmount: number } } = {};

        products.forEach(p => {
            const tax = taxes.find(t => t.id === p.id_impuesto);
            if (!tax) return;

            // Simulate some sales data
            const simulatedSales = p.precio_venta * (Math.floor(Math.random() * 20) + 5);
            const baseAmount = simulatedSales / (1 + tax.porcentaje_impuesto / 100);
            const taxAmount = simulatedSales - baseAmount;

            if (!report[tax.id]) {
                report[tax.id] = { base: 0, taxAmount: 0 };
            }
            report[tax.id].base += baseAmount;
            report[tax.id].taxAmount += taxAmount;
        });

        return report;
    }, [products, taxes]);

    const totalBase = Object.values(taxReport).reduce((acc, curr) => acc + curr.base, 0);
    const totalTax = Object.values(taxReport).reduce((acc, curr) => acc + curr.taxAmount, 0);
    const totalRevenue = totalBase + totalTax;

    return (
        <Card>
            <CardHeader>
                <H3>Informe de Impuestos</H3>
                <CardDescription>Desglose de los impuestos recaudados.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tipo de Impuesto</TableHead>
                            <TableHead className="text-right">Base Imponible</TableHead>
                            <TableHead className="text-right">Total Impuesto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(taxReport).map(([taxId, data]) => (
                            <TableRow key={taxId}>
                                <TableCell className="font-medium">{getTaxName(taxId)}</TableCell>
                                <TableCell className="text-right">€{data.base.toFixed(2)}</TableCell>
                                <TableCell className="text-right">€{data.taxAmount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Base Imponible:</span>
                        <span className="font-medium">€{totalBase.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Impuestos:</span>
                        <span className="font-medium">€{totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                        <span>Ingresos Totales:</span>
                        <span className="text-primary">€{totalRevenue.toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


// --- ProfitAndLossCard ---
type ProfitAndLossCardProps = {
    products: Product[];
};
export function ProfitAndLossCard({ products }: ProfitAndLossCardProps) {
    const { revenue, cogs } = React.useMemo(() => {
        let totalRevenue = 0;
        let totalCogs = 0;

        products.forEach(p => {
            const simulatedUnitsSold = Math.floor(Math.random() * 20) + 5;
            totalRevenue += p.precio_venta * simulatedUnitsSold;
            totalCogs += (p.costo_escandallo_calculado || 0) * simulatedUnitsSold;
        });

        return { revenue: totalRevenue, cogs: totalCogs };
    }, [products]);

    const grossProfit = revenue - cogs;
    const operatingExpenses = 12500; // Mocked value for salaries, rent, etc.
    const netProfit = grossProfit - operatingExpenses;

    return (
        <Card>
            <CardHeader>
                <H3>Pérdidas y Ganancias (P&L)</H3>
                <CardDescription>Resumen de rentabilidad del período.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Ingresos Totales</span>
                    <span className="font-semibold text-green-600">€{revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Coste de Mercancías (COGS)</span>
                    <span className="font-semibold text-red-600">- €{cogs.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-bold text-base">
                    <span>Beneficio Bruto</span>
                    <span>€{grossProfit.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gastos Operativos (Estimado)</span>
                    <span className="font-semibold text-red-600">- €{operatingExpenses.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-bold text-base text-primary">
                    <span>Beneficio Neto</span>
                    <span>€{netProfit.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    );
}

