'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { H4 } from '@/components/ui/typography';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Product } from '@/data/mock-data';
import { DateRange } from "react-day-picker";

type CategorySalesChartProps = {
  products: Product[];
  getCategoryName: (id: string) => string;
  date?: DateRange;
  className?: string;
};

export function CategorySalesChart({ products, getCategoryName, date, className }: CategorySalesChartProps) {
  const categorySales = React.useMemo(() => {
    const dateFactor = date?.from ? date.from.getTime() : 1;
    const sales: { [key: string]: number } = {};
    products.forEach(p => {
      const categoryName = getCategoryName(p.id_categoria) || 'Sin Categoría';
      const seed = (p.id.length + dateFactor) % 100;
      const simulatedSales = p.precio_venta * (seed + 20);
      sales[categoryName] = (sales[categoryName] || 0) + simulatedSales;
    });

    const sorted = Object.entries(sales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const max = Math.max(...sorted.map(s => s.value), 1);

    return sorted.map(item => ({
      ...item,
      percent: (item.value / max) * 100
    }));
  }, [products, getCategoryName, date]);

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <H4 className="text-muted-foreground">Top Productos</H4>
          <Select defaultValue="meses">
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horas">Horas</SelectItem>
              <SelectItem value="dias">Días</SelectItem>
              <SelectItem value="meses">Meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="w-full h-full min-h-[300px] flex flex-col justify-start gap-6">
          {categorySales.length > 0 ? (
            categorySales.map((item) => (
              <div key={item.name} className="flex items-center gap-4 w-full">
                <div className="w-32 shrink-0 text-sm font-medium text-muted-foreground text-left truncate">
                  {item.name}
                </div>
                <div className="flex-1 h-8 bg-muted/20 rounded-md relative overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-r-md transition-all duration-500 ease-out"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <div className="w-20 shrink-0 text-right font-bold text-foreground">
                  €{item.value.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              Sin datos disponibles
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
