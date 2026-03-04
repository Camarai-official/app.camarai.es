'use client';

import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDaysInMonth } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { H4, TextMD, TextXS } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, Download, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';


const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface RevenueChartProps {
  date?: DateRange;
  className?: string;
}

export function RevenueChart({ date, className }: RevenueChartProps) {
  const { isMobile } = useIsMobile();
  const [selectedMonth, setSelectedMonth] = React.useState<string>('Junio');

  const data = React.useMemo(() => {
    const now = date?.from || new Date();
    const daysInMonth = getDaysInMonth(now);
    const chartData = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const baseBookings = 10;
      const dayOfWeek = new Date(now.getFullYear(), now.getMonth(), i).getDay();
      const weekendBoost = (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) ? Math.random() * 15 + 5 : 0;
      const randomNoise = Math.random() * 5;
      chartData.push({
        day: i.toString().padStart(2, '0'),
        revenue: Math.floor(baseBookings + weekendBoost + randomNoise),
      });
    }
    return chartData;
  }, [date, isMobile]);

  const tickFormatter = (value: string) => {
    if (isMobile) {
      const dayNumber = parseInt(value, 10);
      return dayNumber % 3 === 0 ? value : '';
    }
    return value;
  };

  return (
    <Card className={cn(" flex flex-col", className)}>
      <CardHeader 
        title="Número de Reservas" 
        icon={CalendarIcon}
        actions={
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="md" className="w-[130px] justify-between">
                  <TextMD>{selectedMonth}</TextMD>
                  <ChevronDown />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-2">
                <div className="grid grid-cols-3 gap-1">
                  {months.map(month => (
                    <Button
                      key={month}
                      variant="ghost"
                      size="md"
                      className={cn("justify-start", selectedMonth === month && "bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary")}
                      onClick={() => setSelectedMonth(month)}
                    >
                      {month}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Select defaultValue="2024">
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="md">
              <Download />
            </Button>
          </div>
        }
      />
      <CardContent className="flex-1">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--muted-foreground))" 
                opacity={0.08} 
              />
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                tickFormatter={isMobile ? tickFormatter : undefined}
                interval={isMobile ? 0 : 'preserveStartEnd'}
                dy={10}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                fontWeight={500}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[0, 'auto']}
                dx={-5}
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-border bg-background p-3 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col gap-1.5">
                          <TextXS className="text-muted-foreground">
                            Día {label}
                          </TextXS>
                          <div className="flex items-baseline gap-1.5">
                            <H4 className="text-foreground">
                              {payload[0].value}
                            </H4>
                            <TextXS className="text-muted-foreground">Reservas</TextXS>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                barSize={isMobile ? 8 : 12}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
