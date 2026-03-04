import { TextXS, H4 } from "@/components/ui/typography";

'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, addHours, startOfDay, subDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { Download, CalendarIcon, LineChart } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Internal Logic Types
type ViewMode = 'hours' | 'days' | 'months' | 'years';

type ChartDataPoint = {
  label: string;
  value: number;
  fullDate: Date;
};

export function SalesChart({ globalDate }: { globalDate?: DateRange }) {
  const [date, setDate] = React.useState<DateRange | undefined>(globalDate);
  const [isDetached, setIsDetached] = React.useState(false);

  React.useEffect(() => {
    if (!isDetached && globalDate) {
      setDate(globalDate);
    }
  }, [globalDate, isDetached]);

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    setIsDetached(true);
  };

  const handleReset = () => {
    setDate(globalDate);
    setIsDetached(false);
  };

  const [viewMode, setViewMode] = React.useState<ViewMode>('hours');
  const [isOpen, setIsOpen] = React.useState(false);
  const { isMobile } = useIsMobile();

  // Smart Data Generation
  const chartData = React.useMemo(() => {
    const data: ChartDataPoint[] = [];
    const from = date?.from || new Date();
    const to = date?.to || from;
    const isRange = differenceInDays(to, from) > 0;
    const effectiveMode = isRange ? 'days' : viewMode;

    if (effectiveMode === 'hours') {
      const start = startOfDay(from);
      for (let i = 0; i < 24; i++) {
        const currentHour = addHours(start, i);
        let baseValue = Math.random() * 200 + 50;
        if (i >= 13 && i <= 15) baseValue += 400;
        if (i >= 20 && i <= 23) baseValue += 500;
        data.push({ label: format(currentHour, 'HH:00'), value: Math.floor(baseValue), fullDate: currentHour });
      }
    } else if (effectiveMode === 'days') {
      let current = isRange ? from : subDays(from, 29);
      const end = isRange ? to : from;
      let iterations = 0;
      while (current <= end && iterations < 365) {
        const baseValue = Math.random() * 2000 + 1000;
        data.push({ label: format(current, 'dd MMM', { locale: es }), value: Math.floor(baseValue), fullDate: current });
        current = addHours(current, 24);
        iterations++;
      }
    } else if (effectiveMode === 'months') {
      const currentYear = from.getFullYear();
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentYear, i, 1);
        const baseValue = Math.random() * 50000 + 20000;
        data.push({ label: format(monthDate, 'MMM', { locale: es }), value: Math.floor(baseValue), fullDate: monthDate });
      }
    } else if (effectiveMode === 'years') {
      const currentYear = from.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const yearDate = new Date(currentYear - i, 0, 1);
        const baseValue = Math.random() * 500000 + 100000;
        data.push({ label: format(yearDate, 'yyyy'), value: Math.floor(baseValue), fullDate: yearDate });
      }
    }
    return data;
  }, [date, viewMode]);

  const handleExport = () => {
    console.log("Exporting data...", chartData);
  };

  return (
    <Card>
      <CardHeader
        title="Ventas Totales"
        icon={LineChart}
        actions={
          <div className="flex items-center gap-2">
            <CalendarDateRangePicker 
              date={date} 
              setDate={handleDateSelect} 
              numberOfMonths={1}
              closeOnSelect={true}
            />

            <Select value={viewMode} onValueChange={(v: ViewMode) => setViewMode(v)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Vista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Horas</SelectItem>
                <SelectItem value="days">Días</SelectItem>
                <SelectItem value="months">Meses</SelectItem>
                <SelectItem value="years">Años</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="md" onClick={handleExport}>
              <Download />
            </Button>
          </div>
        }
      >
        {isDetached && (
          <Button
            variant="ghost"
            size="md"
            onClick={handleReset}
            title="Sincronizar con filtro global"
          >
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} minTickGap={30} dy={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} fontWeight={500} tickLine={false} axisLine={false} tickFormatter={(value) => `€${(value / 1000).toFixed(1)}k`} dx={-10} />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border-2 border-border p-2 shadow-xl bg-background">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-8">
                          <TextXS className="text-muted-foreground">{label}</TextXS>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <H4 className="text-foreground">
                            €{Number(payload[0].value).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </H4>
                          <TextXS className="text-muted-foreground">EUR</TextXS>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))', strokeWidth: 3, className: "shadow-xl" }} animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
