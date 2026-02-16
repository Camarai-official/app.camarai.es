'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { H4 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

type OccupancyData = {
  name: string;
  value: number;
  color: string;
  percentage: number;
};

interface OccupancyChartProps {
  data: OccupancyData[];
  className?: string;
}



const tailwindColorMap: { [key: string]: string } = {
  'blue-400': '#60a5fa',
  'blue-500': '#3b82f6',
  'violet-500': '#8b5cf6',
  'rose-500': '#f43f5e',
  'amber-500': '#f59e0b',
  'green-500': '#22c55e',
  'emerald-500': '#10b981',
  'slate-400': '#94a3b8',
  'slate-500': '#64748b',
  'brand-blue': 'hsl(var(--brand-blue))',
  'brand-pink': 'hsl(var(--brand-pink))',
  'brand-yellow': 'hsl(var(--brand-yellow))',
  'brand-green': 'hsl(var(--brand-green))',
  'primary': 'hsl(var(--primary))' 
};

const getColor = (color: string) => {
  if (!color) return 'hsl(var(--primary))';
  if (color.startsWith('#') || color.startsWith('hsl') || color.startsWith('rgb')) {
    return color;
  }
  return tailwindColorMap[color] || color;
};

export function OccupancyChart({ data, className }: OccupancyChartProps) {
  const processedData = React.useMemo(() => {
    if (!data) return [];
    return data.map(item => ({
      ...item,
      color: getColor(item.color)
    }));
  }, [data]);

  const total = React.useMemo(() => {
    return processedData.reduce((acc, curr) => acc + curr.value, 0);
  }, [processedData]);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex-row ">
        <H4 className="text-muted-foreground">Aforo Ambientes</H4>
      </CardHeader>
      <CardContent className="flex-grow">
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-muted-foreground text-xs text-center">No hay datos disponibles.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-8 py-6">
            <div className="relative w-48 h-48 shrink-0">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Total</span>
                  <span className="text-3xl font-black">{total}</span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedData}
                    cx="50%"
                    cy="50%"
                    innerRadius="75%"
                    outerRadius="100%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    animationDuration={0}
                  >
                    {processedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-[240px]">
              {processedData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground font-medium truncate max-w-[150px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.value}</span>
                    <span className="font-bold text-foreground">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
