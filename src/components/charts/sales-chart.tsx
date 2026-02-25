'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, addHours, startOfDay, subDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { Download, CalendarIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
    // Fallback to Today if date is undefined (deselected)
    const from = date?.from || new Date();
    const to = date?.to || from;
    const isRange = differenceInDays(to, from) > 0;

    // Logic: If user picked a range > 1 day, force "Days" view logic, else respect viewMode or default to hours
    const effectiveMode = isRange ? 'days' : viewMode;

    if (effectiveMode === 'hours') {
      // 24h for 'from' date
      const start = startOfDay(from);
      for (let i = 0; i < 24; i++) {
        const currentHour = addHours(start, i);
        let baseValue = Math.random() * 200 + 50;
        if (i >= 13 && i <= 15) baseValue += 400;
        if (i >= 20 && i <= 23) baseValue += 500;

        data.push({
          label: format(currentHour, 'HH:00'),
          value: Math.floor(baseValue),
          fullDate: currentHour
        });
      }
    } else if (effectiveMode === 'days') {
      // Generate days between 'from' and 'to', OR last 30 days if no range
      let current = isRange ? from : subDays(from, 29);
      const end = isRange ? to : from;

      // Safety cap: max 365 days
      let iterations = 0;
      while (current <= end && iterations < 365) {
        const baseValue = Math.random() * 2000 + 1000;
        data.push({
          label: format(current, 'dd MMM', { locale: es }),
          value: Math.floor(baseValue),
          fullDate: current
        });
        current = addHours(current, 24); // Add 1 day
        iterations++;
      }
    } else if (effectiveMode === 'months') {
      const currentYear = from.getFullYear();
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentYear, i, 1);
        const baseValue = Math.random() * 50000 + 20000;
        data.push({
          label: format(monthDate, 'MMM', { locale: es }),
          value: Math.floor(baseValue),
          fullDate: monthDate
        });
      }
    } else if (effectiveMode === 'years') {
      const currentYear = from.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const yearDate = new Date(currentYear - i, 0, 1);
        const baseValue = Math.random() * 500000 + 100000;
        data.push({
          label: format(yearDate, 'yyyy'),
          value: Math.floor(baseValue),
          fullDate: yearDate
        });
      }
    }
    return data;
  }, [date, viewMode]);

  const handleExport = () => {
    console.log("Exporting data...", chartData);
  };

  return (
    <Card className="col-span-1 lg:col-span-2 flex flex-col h-full shadow-md border-border/50 gap-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-4">
          <CardTitle className="text-base font-bold text-muted-foreground flex items-center gap-2">
            Ventas Totales
            {isDetached && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary hover:text-primary/80"
                onClick={handleReset}
                title="Sincronizar con filtro global"
              >
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </Button>
            )}
          </CardTitle>

        <div className="flex items-center gap-2">

          {/* Date Picker Range + Year Config */}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal h-9",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd", { locale: es })} -{" "}
                      {format(date.to, "LLL dd, y", { locale: es })}
                    </>
                  ) : (
                    format(date.from, "PPP", { locale: es })
                  )
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border"
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>

          <Select
            value={viewMode}
            onValueChange={(v: ViewMode) => setViewMode(v)}
          >
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue placeholder="Vista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">Horas</SelectItem>
              <SelectItem value="days">Días</SelectItem>
              <SelectItem value="months">Meses</SelectItem>
              <SelectItem value="years">Años</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
                </div>
      </CardHeader>

      <CardContent className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-1 gap-1">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {label}
                        </span>
                        <span className="font-bold text-primary">
                          €{Number(payload[0].value).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorSales)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
