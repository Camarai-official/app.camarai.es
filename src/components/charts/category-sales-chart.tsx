'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardList, DashboardListItem } from '@/components/ui/dashboard-list';
import type { Product } from '@/data/mock-data';
import { DateRange } from "react-day-picker";
import { Star } from 'lucide-react';

type CategorySalesChartProps = {
  products: Product[];
  getCategoryName: (id: string) => string;
  date?: DateRange;
  className?: string;
};

export function CategorySalesChart({ products, getCategoryName, date }: CategorySalesChartProps) {
  const categorySales = React.useMemo(() => {
    const dateFactor = date?.from ? date.from.getTime() : 1;
    const sales: { [key: string]: number } = {};
    products.forEach(p => {
      const categoryName = getCategoryName(p.id_categoria) || 'Sin Categoría';
      const seed = (p.id.length + dateFactor) % 100;
      const simulatedSales = p.precio_venta * (seed + 20);
      sales[categoryName] = (sales[categoryName] || 0) + simulatedSales;
    });

    return Object.entries(sales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [products, getCategoryName, date]);

  return (
    <Card className="h-full">
      <CardHeader 
        title="Top Productos" 
        icon={Star}
        actions={
          <Select defaultValue="meses">
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horas">Horas</SelectItem>
              <SelectItem value="dias">Días</SelectItem>
              <SelectItem value="meses">Meses</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <CardContent className="pt-0">
        <DashboardList>
          {categorySales.map((item, index) => {
             const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-rose-500", "bg-violet-500"];
             return (
              <DashboardListItem
                key={item.name}
                title={item.name}
                icon={<div className={`h-2 w-2 rounded-full ${colors[index % colors.length]}`} />}
                value={`€${item.value.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`}
              />
            );
          })}
        </DashboardList>
      </CardContent>
    </Card>
  );
}
