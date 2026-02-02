
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { Ingredient } from '@/data/mock-data';

interface LowStockAlertsProps {
  ingredients: Ingredient[];
}

export function LowStockAlerts({ ingredients }: LowStockAlertsProps) {
  const [restockedIds, setRestockedIds] = React.useState<string[]>([]);

  const lowStockIngredients = React.useMemo(() => {
    return ingredients
      .filter(ing => ing.stock_actual <= ing.stock_minimo_alerta && ing.stock_minimo_alerta > 0)
      .filter(ing => !restockedIds.includes(ing.id)) // Hide locally restocked items
      .sort((a, b) => (a.stock_actual / a.stock_minimo_alerta) - (b.stock_actual / b.stock_minimo_alerta));
  }, [ingredients, restockedIds]);


  const getProgressColor = (current: number, min: number) => {
    const percentage = min > 0 ? (current / min) * 100 : 0;
    if (percentage < 25) return 'bg-destructive'; // Red
    if (percentage < 50) return 'bg-orange-400'; // Orange
    return 'bg-primary'; // Brand
  }

  const handleRestock = (id: string, name: string) => {
    // In a real app, this would call an API mutation
    setRestockedIds(prev => [...prev, id]);
    // Ideally use sonner/toast here, but we'll stick to visual removal for now
    console.log(`Restocking initiated for ${name}`);
  };

  return (
    <Card className="bg-card h-full w-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold text-muted-foreground">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          Alertas de Stock Bajo
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className={cn("h-full", lowStockIngredients.length > 5 ? "h-[640px]" : "h-auto")}>
          <div className="space-y-6 px-6 pb-6">
            {lowStockIngredients.length > 0 ? (
              lowStockIngredients.map(ing => {
                const stockPercentage = ing.stock_minimo_alerta > 0 ? (ing.stock_actual / ing.stock_minimo_alerta) * 100 : 0;
                return (
                  <div key={ing.id} className="space-y-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex flex-col">
                              <p className="font-semibold truncate">{ing.nombre_ingrediente}</p>
                              <p className="text-muted-foreground text-xs">
                                <span className={cn("font-bold", stockPercentage < 25 ? "text-destructive" : "text-foreground")}>{ing.stock_actual}</span> / {ing.stock_minimo_alerta} {ing.unidad_medida}
                              </p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Queda un {Math.round(stockPercentage)}% del stock mínimo.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Progress value={stockPercentage} className="h-2" indicatorClassName={getProgressColor(ing.stock_actual, ing.stock_minimo_alerta)} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs mt-1"
                      onClick={() => handleRestock(ing.id, ing.nombre_ingrediente)}
                    >
                      Reponer
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-10">
                <Package className="h-10 w-10 mb-2" />
                <p className="font-semibold">¡Todo en orden!</p>
                <p className="text-sm">No hay ingredientes con stock bajo.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
