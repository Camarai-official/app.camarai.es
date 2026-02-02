
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Ingredient, IngredientCategory } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';


// --- InventoryValuationCard ---
const COLORS = ['#9B6EFD', '#78A3ED', '#F0768C', '#F7B731', '#4CAF50', '#2196F3', '#FF9800'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col">
          <span className="font-bold text-foreground">{payload[0].name}</span>
          <span className="text-sm text-primary">€{payload[0].value.toFixed(2)}</span>
        </div>
      </div>
    );
  }
  return null;
};

type InventoryValuationCardProps = {
  ingredients: Ingredient[];
  ingredientCategories: IngredientCategory[];
};

export function InventoryValuationCard({ ingredients, ingredientCategories }: InventoryValuationCardProps) {
  const valuationByCategory = React.useMemo(() => {
    const valuation: { [key: string]: number } = {};
    ingredients.forEach(ing => {
      const category = ingredientCategories.find(cat => cat.id === ing.id_categoria_ingrediente);
      const categoryName = category ? category.nombre : 'Sin Categoría';
      const value = ing.costo_unitario * ing.stock_actual;
      valuation[categoryName] = (valuation[categoryName] || 0) + value;
    });

    return Object.entries(valuation)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [ingredients, ingredientCategories]);

  const totalValue = valuationByCategory.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valoración de Inventario</CardTitle>
        <CardDescription>Valor total del stock actual y desglose por categoría.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={valuationByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                stroke="hsl(var(--card))"
                strokeWidth={4}
              >
                {valuationByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          <div className='text-center md:text-left'>
            <p className="text-sm text-muted-foreground">Valor Total del Inventario</p>
            <p className="text-3xl font-bold text-primary">€{totalValue.toFixed(2)}</p>
          </div>
          <div className="w-full space-y-2">
            {valuationByCategory.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center text-sm justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-muted-foreground truncate flex-1">{entry.name}</span>
                </div>
                <span className="font-semibold text-foreground ml-2">€{entry.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


// --- WasteReportCard ---
const mockWasteData = [
  { id: 'waste-1', date: '2024-07-28', item: 'Tomate Pera', quantity: '2 kg', reason: 'Caducado', cost: 3.60, user: 'Ana Martínez' },
  { id: 'waste-2', date: '2024-07-28', item: 'Pan de Hamburguesa', quantity: '10 uds', reason: 'Rotura', cost: 6.00, user: 'Carlos Pérez' },
  { id: 'waste-3', date: '2024-07-27', item: 'Pechuga de Pollo', quantity: '1.5 kg', reason: 'Mal estado', cost: 10.50, user: 'Ana Martínez' },
  { id: 'waste-4', date: '2024-07-26', item: 'Merluza de Pincho', quantity: '0.8 kg', reason: 'Error en pedido', cost: 12.80, user: 'Laura García' },
];

export function WasteReportCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Informe de Mermas</CardTitle>
            <CardDescription>Seguimiento de productos desechados o caducados en el período.</CardDescription>
          </div>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Exportar</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead className="text-right">Coste</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockWasteData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date}</TableCell>
                <TableCell className="font-medium">{item.item}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <Badge variant="warning">{item.reason}</Badge>
                </TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell className="text-right text-destructive font-semibold">€{item.cost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

