'use client';
import { H3 } from '@/components/ui/typography';


import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// --- Customer Loyalty Card ---
const loyaltyData = [
  { name: 'Clientes recurrentes', value: 72, color: 'hsl(var(--primary))' },
  { name: 'Nuevos clientes', value: 28, color: 'hsl(var(--brand-blue))' },
];

const LoyaltyChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <p className="font-bold text-foreground">{`${payload[0].name}: ${payload[0].value}%`}</p>
            </div>
        );
    }
    return null;
};

export function CustomerLoyaltyCard() {
  return (
    <Card>
      <CardHeader>
        <H3>Análisis de Lealtad de Clientes</H3>
        <CardDescription>Frecuencia de visitas y clientes más recurrentes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip content={<LoyaltyChartTooltip />} />
                <Pie
                    data={loyaltyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={70}
                    innerRadius={40}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    stroke="hsl(var(--card))"
                    strokeWidth={4}
                >
                {loyaltyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                </Pie>
            </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="flex justify-around text-center">
            <div>
                <p className="text-2xl font-bold" style={{color: loyaltyData[0].color}}>{loyaltyData[0].value}%</p>
                <p className="text-sm text-muted-foreground">{loyaltyData[0].name}</p>
            </div>
            <div>
                <p className="text-2xl font-bold" style={{color: loyaltyData[1].color}}>{loyaltyData[1].value}%</p>
                <p className="text-sm text-muted-foreground">{loyaltyData[1].name}</p>
            </div>
             <div>
                <p className="text-2xl font-bold text-primary">35%</p>
                <p className="text-sm text-muted-foreground">Tasa de retención</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Campaign Performance Card ---
const campaignData = [
    { name: '20% Descuento Fin de Semana', audience: 42, openRate: 85, conversion: 15 },
    { name: '2x1 en Postres', audience: 153, openRate: 75, conversion: 25 },
    { name: 'Menú del Día Especial', audience: 0, openRate: 0, conversion: 0, status: 'Borrador' },
    { name: 'Cena Gratis Cumpleañeros', audience: 28, openRate: 92, conversion: 40, status: 'Inactiva' },
];

export function CampaignPerformanceCard() {
    return (
        <Card>
            <CardHeader>
                <H3>Rendimiento de Campañas</H3>
                <CardDescription>Eficacia de las promociones enviadas por WhatsApp.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Campaña</TableHead>
                            <TableHead className="text-right">Apertura</TableHead>
                            <TableHead className="text-right">Conversión</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaignData.map((campaign) => (
                            <TableRow key={campaign.name}>
                                <TableCell>
                                    <p className="font-medium truncate">{campaign.name}</p>
                                    <p className="text-xs text-muted-foreground">{campaign.audience} clientes</p>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={campaign.openRate > 80 ? 'completed' : 'in-progress'}>
                                        {campaign.openRate}%
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                     <Badge variant={campaign.conversion > 20 ? 'completed' : 'in-progress'}>
                                        {campaign.conversion}%
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

