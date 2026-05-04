'use client';

import * as React from 'react';
import { History, Repeat, X, ShoppingCart, ArrowDown, ArrowRight } from 'lucide-react';
import { 
    Dialog, 
    DialogWindow,
    DialogContent, 
    DialogFooter, 
    DialogHeader 
} from '@/components/layout/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActionTile } from '@/components/ui/action-tile';
import { TextXS } from '@/components/ui/typography';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type Ingredient } from '@/data/mock-data';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

// Renombrado de inventoryQueries a inventoryQueries por el cambio de nombre de archivo
const inventoryApi = api.inventoryQueries as any;

interface HistoryDialogProps {
  item: Ingredient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mapeo de tipos a etiquetas en español
const typeLabels: Record<string, string> = {
  purchase: 'Entrada',
  sale: 'Venta',
  waste: 'Merma',
  adjustment: 'Ajuste',
  return: 'Devolución',
  auto_deduction: 'Venta Automática'
};

// Mapeo de tipos a iconos
const typeIcons: Record<string, any> = {
  purchase: ArrowDown,
  sale: ArrowRight,
  waste: X,
  adjustment: Repeat,
  return: ArrowDown,
  auto_deduction: ArrowRight
};

// Mapeo de tipos a colores
const typeColors: Record<string, string> = {
  purchase: '#22c55e',
  sale: undefined,
  waste: '#ef4444',
  adjustment: '#3b82f6',
  return: '#22c55e',
  auto_deduction: undefined
};

export function HistoryDialog({ item, open, onOpenChange }: HistoryDialogProps) {
  // Obtener todos los movimientos del ingrediente
  const allMovements = useQuery(inventoryApi.getStockMovements, 
    item?.id ? { ingredientId: item.id as any } : "skip"
  );

  // Obtener solo mermas
  const wasteMovements = useQuery(inventoryApi.getStockMovementsByType, 
    item?.id ? { ingredientId: item.id as any, type: "waste" } : "skip"
  );

  // Obtener solo compras
  const purchaseMovements = useQuery(inventoryApi.getStockMovementsByType, 
    item?.id ? { ingredientId: item.id as any, type: "purchase" } : "skip"
  );

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES');
  };

  const renderMovement = (movement: any) => {
    const Icon = typeIcons[movement.type] || Repeat;
    const color = typeColors[movement.type];
    const label = typeLabels[movement.type] || movement.type;
    
    return (
      <ActionTile
        key={movement._id}
        title={label}
        description={`${movement.staffName} • ${movement.notes || 'Sin notas'}`}
        icon={Icon}
        iconColor={color}
        variant="ghost"
        rightContent={
          <div className="text-right">
            <div className={cn("text-sm font-bold", movement.quantity > 0 ? 'text-green-600' : 'text-rose-600')}>
              {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity} {item.unidad_medida}
            </div>
            <TextXS>{formatTimestamp(movement.timestamp)}</TextXS>
          </div>
        }
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow size="md">
        <DialogHeader icon={History} title={`Historial: ${item?.nombre_ingrediente || 'Selecciona un ingrediente'}`} />
        
        <DialogContent className="p-0 overflow-hidden flex flex-col">
          <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0">
              <TabsList className="w-full">
                <TabsTrigger value="all" icon={Repeat}>Todo</TabsTrigger>
                <TabsTrigger value="waste" icon={X}>Mermas</TabsTrigger>
                <TabsTrigger value="purchases" icon={ShoppingCart}>Compras</TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1">
              <TabsContent value="all" className="py-4 px-2 sm:p-6">
                <div className="space-y-1">
                  {item ? (
                    allMovements?.map(renderMovement) || (
                      <EmptyState icon={History} title="Sin movimientos" description="No hay registros de stock para este ingrediente." />
                    )
                  ) : (
                    <EmptyState icon={History} title="Sin selección" description="Selecciona un ingrediente para ver su historial." />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="waste" className="py-4 px-2 sm:p-6">
                <div className="space-y-1">
                  {item ? (
                    wasteMovements?.map(renderMovement) || (
                      <EmptyState icon={X} title="Sin mermas" description="No se han registrado mermas recientemente." />
                    )
                  ) : (
                    <EmptyState icon={X} title="Sin selección" description="Selecciona un ingrediente para ver sus mermas." />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="purchases" className="py-4 px-2 sm:p-6">
                <div className="space-y-1">
                  {item ? (
                    purchaseMovements?.map(renderMovement) || (
                      <EmptyState icon={ShoppingCart} title="Sin compras" description="No hay registros de compras directas." />
                    )
                  ) : (
                    <EmptyState icon={ShoppingCart} title="Sin selección" description="Selecciona un ingrediente para ver sus compras." />
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>

        <DialogFooter
          onCancel={() => onOpenChange(false)}
        />
      </DialogWindow>
    </Dialog>
  )
}
