'use client';

import { format } from 'date-fns';
import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Ingredient, IngredientCategory } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Download, Wallet, AlertTriangle, PackageX, PackageSearch } from 'lucide-react';
import { MetricCard } from '@/components/widgets/metric-card';


// --- InventoryMetrics ---
export function InventoryMetrics({ ingredients }: { ingredients: Ingredient[] }) {
  const totalValue = ingredients.reduce((acc, ing) => acc + (ing.costo_unitario * ing.stock_actual), 0);
  const lowStock = ingredients.filter(ing => ing.stock_actual > 0 && ing.stock_actual <= ing.stock_minimo_alerta).length;
  const outOfStock = ingredients.filter(ing => ing.stock_actual <= 0).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="Valor Inventario" 
        value={`€${totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={Wallet}
      />
      <MetricCard 
        title="Stock Bajo" 
        value={lowStock.toString()}
        icon={AlertTriangle}
      />
      <MetricCard 
        title="Agotados" 
        value={outOfStock.toString()}
        icon={PackageX}
      />
      <MetricCard 
        title="Total Items" 
        value={ingredients.length.toString()}
        icon={PackageSearch}
      />
    </div>
  );
}

// --- LowStockCard ---
export function LowStockCard({ ingredients }: { ingredients: Ingredient[] }) {
  const lowStockItems = ingredients.filter(ing => ing.stock_actual <= ing.stock_minimo_alerta)
    .sort((a,b) => (a.stock_actual/a.stock_minimo_alerta) - (b.stock_actual/b.stock_minimo_alerta));

  return (
    <Card className="h-full">
      <CardHeader 
        title="Alertas de Stock" 
        actions={<Badge variant="destructive">{lowStockItems.length}</Badge>}
      >
        <CardDescription>Productos que requieren reposición inmediata.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Actual</TableHead>
              <TableHead className="text-right">Mínimo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockItems.slice(0, 5).map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.nombre_ingrediente}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.stock_actual <= 0 ? "danger" : "warning"}>
                    {item.stock_actual} {item.unidad_medida}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {item.stock_minimo_alerta} {item.unidad_medida}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {lowStockItems.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Todo el stock está en niveles correctos.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- InventoryValuationCard ---
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--brand-blue))',
  'hsl(var(--brand-pink))',
  'hsl(var(--brand-yellow))',
  'hsl(var(--brand-green))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-5))'
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col">
          <span className="font-bold">{payload[0].name}</span>
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

  return (
    <Card>
      <CardHeader title="Valoración de Inventario">
        <CardDescription>Valor total por categoría.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                    data={valuationByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={60}
                    fill="hsl(var(--primary))"
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {valuationByCategory.map((entry, index) => (
                    <TableRow key={entry.name}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                {entry.name}
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">€{entry.value.toFixed(2)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
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
      <CardHeader 
        title="Informe de Mermas" 
        actions={<Button variant="outline" size="sm" startIcon={<Download />}>Exportar</Button>}
      >
        <CardDescription>Seguimiento de productos desechados en el período.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead className="text-center">Motivo</TableHead>
              <TableHead className="text-right">Coste</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockWasteData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{item.item}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">
                    {item.reason}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">€{item.cost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


