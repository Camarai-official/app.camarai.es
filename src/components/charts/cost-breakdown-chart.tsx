'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DashboardList, DashboardListItem } from '@/components/ui/dashboard-list';
import { DateRange } from "react-day-picker";
import { Activity } from 'lucide-react';

export function CostBreakdownChart({ date }: { date?: DateRange }) {
  const dynamicData = React.useMemo(() => {
    const dateFactor = date?.from ? date.from.getTime() : 1;
    return [
      { name: 'Ingredientes', value: 40 + (dateFactor % 10), color: "bg-chart-1" },
      { name: 'Personal', value: 20 + (dateFactor % 8), color: "bg-chart-2" },
      { name: 'Alquiler', value: 15, color: "bg-chart-3" },
      { name: 'Suministros', value: 8 + (dateFactor % 5), color: "bg-chart-4" },
      { name: 'Marketing', value: 3 + (dateFactor % 4), color: "bg-chart-5" },
    ];
  }, [date]);

  return (
    <Card className="h-full">
      <CardHeader 
        title="Desglose de Costes" 
        icon={Activity} 
      />
      <CardContent className="pt-0">
        <DashboardList>
          {dynamicData.map((item) => (
            <DashboardListItem
              key={item.name}
              title={item.name}
              icon={<div className={`h-2 w-2 rounded-full ${item.color}`} />}
              value={`${item.value}%`}
            />
          ))}
        </DashboardList>
      </CardContent>
    </Card>
  );
}
