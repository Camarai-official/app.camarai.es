'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardList, DashboardListItem } from '@/components/ui/dashboard-list';
import { H1, TextXS } from '@/components/ui/typography';

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
    <Card className={cn("flex-col", className)}>
      <CardHeader 
        title="Aforo Ambientes" 
        icon={Users} 
      />
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="flex items-center justify-center">
            <TextXS className="text-muted-foreground">No hay datos disponibles.</TextXS>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            <div className="flex justify-center">
              <div className="relative w-full h-[140px] overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-end">
                  <H1>{total}</H1>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={processedData}
                      cx="50%"
                      cy="100%"
                      innerRadius="110%"
                      outerRadius="160%"
                      paddingAngle={10}
                      startAngle={180}
                      endAngle={0}
                      dataKey="value"
                      stroke="none"
                      animationDuration={1000}
                    >
                      {processedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <DashboardList>
              {processedData.map((item) => (
                <DashboardListItem
                  key={item.name}
                  title={item.name}
                  icon={<div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />}
                  value={`${item.percentage.toFixed(1)}%`}
                  labelSecondary={item.value}
                />
              ))}
            </DashboardList>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
