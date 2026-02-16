'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertTriangle, Package, RefreshCcw } from 'lucide-react';
import { DashboardList, DashboardListItem } from '@/components/ui/dashboard-list';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Ingredient } from '@/data/mock-data';

interface LowStockAlertsProps {
  ingredients: Ingredient[];
}

export function LowStockAlerts({ ingredients }: LowStockAlertsProps) {
  const lowStockIngredients = React.useMemo(() => {
    return ingredients
      .filter(ing => ing.stock_actual <= ing.stock_minimo_alerta && ing.stock_minimo_alerta > 0)
      .sort((a, b) => (a.stock_actual / a.stock_minimo_alerta) - (b.stock_actual / b.stock_minimo_alerta))
      .slice(0, 5);
  }, [ingredients]);

  return (
    <Card className="h-full w-full overflow-hidden">
      <CardHeader 
        title="Alertas de Stock Bajo" 
        icon={AlertTriangle} 
      />
      <CardContent className="pt-0">
        <DashboardList className="divide-y-0 space-y-2">
          {lowStockIngredients.length > 0 ? (
            lowStockIngredients.map(ing => {
              const isCritical = ing.stock_actual < (ing.stock_minimo_alerta * 0.2);
              return (
                <DashboardListItem
                  key={ing.id}
                  className={cn(
                    "px-3 rounded-lg border transition-colors h-[56px] py-0",
                    isCritical 
                      ? "bg-destructive/5 border-destructive/20" 
                      : "bg-amber-500/5 border-amber-500/20"
                  )}
                  title={ing.nombre_ingrediente}
                  subtitle={`${ing.stock_actual} / ${ing.stock_minimo_alerta} ${ing.unidad_medida}`}
                  suffix={
                    <Button variant="outline" size="md">
                      <RefreshCcw />
                    </Button>
                  }
                />
              );
            })
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Todo en orden
            </div>
          )}
        </DashboardList>
      </CardContent>
    </Card>
  );
}
