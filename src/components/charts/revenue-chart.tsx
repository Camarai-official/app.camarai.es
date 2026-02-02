'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, getDaysInMonth, startOfMonth } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { DateRange } from "react-day-picker";


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-1 text-center">
          <span className="text-sm font-bold text-muted-foreground">Día {label}</span>
          <span className="font-bold text-primary">
            {payload[0].value} reservas
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueChart({ date }: { date?: DateRange }) {
  const { isMobile } = useIsMobile();

  const data = React.useMemo(() => {
    const now = date?.from || new Date();
    const daysInMonth = getDaysInMonth(now);
    const chartData = [];

    for (let i = 1; i <= daysInMonth; i++) {
      // Simulate some booking data
      const baseBookings = 10;
      const dayOfWeek = new Date(now.getFullYear(), now.getMonth(), i).getDay();
      const weekendBoost = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) ? Math.random() * 15 + 5 : 0; // Fri, Sat, Sun
      const randomNoise = Math.random() * 5;
      chartData.push({
        day: i.toString().padStart(2, '0'),
        revenue: Math.floor(baseBookings + weekendBoost + randomNoise),
      });
    }
    return chartData;
  }, [date, isMobile]);

  const tickFormatter = (value: string) => {
    // Only show every N ticks on mobile to prevent clutter
    if (isMobile) {
      const dayNumber = parseInt(value, 10);
      return dayNumber % 3 === 0 ? value : '';
    }
    return value;
  };

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={isMobile ? tickFormatter : undefined}
            interval={isMobile ? 0 : 'preserveStartEnd'}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            domain={[0, 40]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
          <Bar
            dataKey="revenue"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            barSize={10}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
