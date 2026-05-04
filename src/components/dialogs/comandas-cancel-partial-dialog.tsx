'use client';

import * as React from 'react';
import { Ban, UtensilsCrossed, ShoppingBag, AlertTriangle } from 'lucide-react';
import type { OrderDetails, OrderItem } from '@/types/orders';
import { Dialog, DialogWindow, DialogHeader, DialogContent, DialogFooter } from '@/components/layout/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { TextSM, H4, TextMD } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

type CancelPartialDialogProps = {
  order: OrderDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (itemsToCancel: OrderItem[]) => void;
};

export function CancelPartialDialog({
  order,
  open,
  onOpenChange,
  onConfirm,
}: CancelPartialDialogProps) {
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (order) {
      setSelectedItems(new Set());
    }
  }, [order, open]);

  if (!order) return null;

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleAll = () => {
    if (selectedItems.size === order.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(order.items.map(item => item._id)));
    }
  };

  const itemsToCancel = order.items.filter(item => selectedItems.has(item._id));
  const itemsToKeep = order.items.filter(item => !selectedItems.has(item._id));

  const calculateTotal = (items: OrderItem[]) => 
    items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  const handleConfirm = () => {
    onConfirm(itemsToCancel);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow size="lg">
        <DialogHeader
          icon={Ban}
          title={`Anular Productos - Comanda #${order.orderNumber}`}
          description="Selecciona los productos que deseas anular. Los productos no seleccionados se mantendrán en una nueva comanda."
        />

        <DialogContent>
          <div className="p-6 space-y-6">
            {/* Warning */}
            <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <TextSM className="text-amber-800">
                Esta acción anulará los productos seleccionados y creará una nueva comanda con los productos restantes.
              </TextSM>
            </div>

            {/* Items Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <TextMD className="font-medium">Productos a anular</TextMD>
                <button
                  onClick={toggleAll}
                  className="text-xs text-primary hover:underline"
                >
                  {selectedItems.size === order.items.length ? 'Desmarcar todos' : 'Seleccionar todos'}
                </button>
              </div>

              <ScrollArea className="h-[250px] border rounded-lg p-3">
                {order.items.length === 0 ? (
                  <EmptyState
                    icon={ShoppingBag}
                    title="No hay productos"
                    description="Esta comanda no tiene productos."
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item._id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedItems.has(item._id)
                            ? 'bg-rose-50 border-rose-200'
                            : 'bg-background hover:bg-muted/50'
                        }`}
                        onClick={() => toggleItem(item._id)}
                      >
                        <Checkbox
                          checked={selectedItems.has(item._id)}
                          onCheckedChange={() => toggleItem(item._id)}
                        />
                        <div className="flex-1">
                          <TextSM className="font-medium">{item.productName}</TextSM>
                          <TextSM className="text-muted-foreground">
                            {item.quantity} x €{(item.unitPrice / 100).toFixed(2)}
                          </TextSM>
                        </div>
                        <div className="text-right">
                          <TextSM className="font-medium text-rose-600">
                            €{((item.unitPrice * item.quantity) / 100).toFixed(2)}
                          </TextSM>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-3">
              <TextMD className="font-medium">Resumen</TextMD>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${itemsToCancel.length > 0 ? 'bg-rose-50 border-rose-200' : 'bg-muted/50'}`}>
                  <TextSM className="text-muted-foreground mb-1">Productos a anular</TextSM>
                  <H4 className={itemsToCancel.length > 0 ? 'text-rose-600' : ''}>
                    {itemsToCancel.length} items
                  </H4>
                  <TextSM className="text-muted-foreground">
                    €{(calculateTotal(itemsToCancel) / 100).toFixed(2)}
                  </TextSM>
                </div>

                <div className={`p-4 rounded-lg border ${itemsToKeep.length > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/50'}`}>
                  <TextSM className="text-muted-foreground mb-1">Productos en nueva comanda</TextSM>
                  <H4 className={itemsToKeep.length > 0 ? 'text-emerald-600' : ''}>
                    {itemsToKeep.length} items
                  </H4>
                  <TextSM className="text-muted-foreground">
                    €{(calculateTotal(itemsToKeep) / 100).toFixed(2)}
                  </TextSM>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogFooter
          hint="Los productos anulados no se pueden recuperar."
          actions={
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Volver
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={selectedItems.size === 0}
              >
                {selectedItems.size === 0 ? "Selecciona productos" : `Anular ${itemsToCancel.length} productos`}
              </Button>
            </>
          }
        />
      </DialogWindow>
    </Dialog>
  );
}
