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

interface HistoryDialogProps {
  item: Ingredient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryDialog({ item, open, onOpenChange }: HistoryDialogProps) {
  if (!item) return null;

  const mockHistoryData = [
    { date: '2024-07-29', type: 'Entrada', quantity: 20, user: 'Admin', reason: 'Pedido proveedor' },
    { date: '2024-07-28', type: 'Merma', quantity: -2, user: 'Staff', reason: 'Caducado' },
    { date: '2024-07-27', type: 'Venta', quantity: -15, user: 'POS', reason: 'Consumo diario' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow size="md">
        <DialogHeader icon={History} title={`Historial: ${item.nombre_ingrediente}`} />
        
        <DialogContent className="p-0 overflow-hidden flex flex-col">
          <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 border-b bg-muted/10 shrink-0">
              <TabsList className="h-14 bg-transparent justify-start gap-4">
                <TabsTrigger value="all" icon={Repeat}>Todo</TabsTrigger>
                <TabsTrigger value="waste" icon={X}>Mermas</TabsTrigger>
                <TabsTrigger value="purchases" icon={ShoppingCart}>Compras</TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="flex-1">
              <TabsContent value="all" className="p-6">
                  <div className="space-y-1">
                      {mockHistoryData.map((h, i) => (
                          <ActionTile
                              key={i}
                              title={h.type}
                              description={`${h.user} • ${h.reason}`}
                              icon={h.type === 'Entrada' ? ArrowDown : h.type === 'Merma' ? X : ArrowRight}
                              iconColor={h.type === 'Entrada' ? '#22c55e' : h.type === 'Merma' ? '#ef4444' : undefined}
                              variant="ghost"
                              rightContent={
                                  <div className="text-right">
                                      <div className={cn("text-sm font-bold", h.quantity > 0 ? 'text-green-600' : 'text-rose-600')}>
                                          {h.quantity > 0 ? `+${h.quantity}` : h.quantity} {item.unidad_medida}
                                      </div>
                                      <TextXS>{h.date}</TextXS>
                                  </div>
                              }
                          />
                      ))}
                  </div>
              </TabsContent>
              <TabsContent value="waste" className="p-6">
                <EmptyState icon={X} title="Sin mermas" description="No se han registrado mermas recientemente." />
              </TabsContent>
              <TabsContent value="purchases" className="p-6">
                <EmptyState icon={ShoppingCart} title="Sin compras" description="No hay registros de compras directas." />
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
