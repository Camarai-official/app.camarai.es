'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DashboardList, DashboardListItem } from '@/components/ui/dashboard-list';
import { DateRange } from "react-day-picker";
import { Activity } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEstablishments } from '@/hooks/useEstablishments';

export function CostBreakdownChart({ date }: { date?: DateRange }) {
  const { activeEstablishment } = useEstablishments();
  
  const from = date?.from || new Date();
  const to = date?.to || from;

  const costBreakdown = useQuery(
    api.analytics.getCostBreakdown,
    activeEstablishment?.id && from && to
      ? {
          establishmentId: activeEstablishment.id as any,
          startDate: from.getTime(),
          endDate: to.getTime(),
        }
      : 'skip'
  );

  const totalCost = React.useMemo(() => {
    if (!costBreakdown || costBreakdown.length === 0) return 0;
    return costBreakdown.reduce((sum, item) => sum + item.value, 0);
  }, [costBreakdown]);

  const chartData = React.useMemo(() => {
    if (!costBreakdown || costBreakdown.length === 0) {
      return [];
    }

    return costBreakdown.map((item) => ({
      name: item.name,
      value: totalCost > 0 ? ((item.value / totalCost) * 100).toFixed(1) : '0',
      color: item.color,
    }));
  }, [costBreakdown, totalCost]);

  return (
    <Card className="h-full">
      <CardHeader 
        title="Desglose de Costes" 
        icon={Activity} 
      />
      <CardContent className="pt-0">
        {chartData.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No hay datos de costes disponibles
          </div>
        ) : (
          <DashboardList>
            {chartData.map((item) => (
              <DashboardListItem
                key={item.name}
                title={item.name}
                icon={<div className={`h-2 w-2 rounded-full ${item.color}`} />}
                value={`${item.value}%`}
              />
            ))}
          </DashboardList>
        )}
      </CardContent>
    </Card>
  );
}
