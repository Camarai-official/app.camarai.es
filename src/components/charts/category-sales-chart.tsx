'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import type { Product } from '@/data/mock-data';
import { cn } from '@/lib/utils';

import { DateRange } from "react-day-picker";

type CategorySalesChartProps = {
  products: Product[];
  getCategoryName: (id: string) => string;
  date?: DateRange;
};

export function CategorySalesChart({ products, getCategoryName, date }: CategorySalesChartProps) {

  const categorySales = React.useMemo(() => {
    // We can use 'date' here to seed the random noise so it changes when the date changes
    const dateFactor = date?.from ? date.from.getTime() : 1;
    const sales: { [key: string]: number } = {};
    products.forEach(p => {
      const categoryName = getCategoryName(p.id_categoria) || 'Sin Categoría';
      // Use date as seed for "different" random data
      const seed = (p.id.length + dateFactor) % 100;
      const simulatedSales = p.precio_venta * (seed + 20);
      sales[categoryName] = (sales[categoryName] || 0) + simulatedSales;
    });

    const sorted = Object.entries(sales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Calculate max for percentages
    const max = Math.max(...sorted.map(s => s.value), 1); // Avoid div by 0

    return sorted.map(item => ({
      ...item,
      percent: (item.value / max) * 100
    }));
  }, [products, getCategoryName, date]);

  return (
    <div className="w-full h-full min-h-[300px] p-6 pt-0 -mt-5 flex flex-col justify-start gap-6">
      {categorySales.length > 0 ? (
        categorySales.map((item) => (
          <div key={item.name} className="flex items-center gap-4 w-full">
            {/* 1. Label Column: Fixed width, explicitly left-aligned */}
            <div className="w-32 shrink-0 text-sm font-medium text-muted-foreground text-left truncate">
              {item.name}
            </div>

            {/* 2. Bar Column: Takes remaining space (Track + Fill) */}
            <div className="flex-1 h-8 bg-muted/20 rounded-md relative overflow-hidden">
              <div
                className="h-full bg-primary rounded-r-md transition-all duration-500 ease-out"
                style={{ width: `${item.percent}%` }}
              />
            </div>

            {/* 3. Value Column: Fixed width, right aligned */}
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
  );
}
