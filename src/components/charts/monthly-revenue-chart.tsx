'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-1 text-center">
          <span className="text-sm font-bold text-muted-foreground">Día {label}</span>
          <span className="font-bold text-primary">
            €{payload[0].value.toFixed(0)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};


export function MonthlyRevenueChart() {
  const { isMobile } = useIsMobile();

  const revenueData = React.useMemo(() => {
    const data = [];
    const now = new Date();
    const daysInMonth = getDaysInMonth(now);
    
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(now.getFullYear(), now.getMonth(), i);
        const dayOfWeek = date.getDay();
        const weekendBoost = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) ? Math.random() * 300 + 150 : 0;
        const baseRevenue = 200;
        const randomNoise = (Math.random() - 0.5) * 80;
        const totalRevenue = baseRevenue + weekendBoost + randomNoise;

        data.push({
            day: i,
            revenue: Math.max(50, totalRevenue),
        });
    }
    return data;
  }, []);


  const tickFormatter = (value: number) => {
    if (isMobile) {
      if ([1, 10, 20, 30].includes(value)) {
        return value.toString();
      }
      return '';
    }
    return value.toString();
  };

  return (
    <div className="h-full w-full min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
                data={revenueData} 
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={tickFormatter}
                    ticks={isMobile ? [1, 10, 20, 30] : undefined}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `€${value}`}
                    domain={[0, 800]}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#revenueGradient)" 
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
}
