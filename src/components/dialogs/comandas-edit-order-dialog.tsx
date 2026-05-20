'use client';

import * as React from 'react';
import { TextSM, TextXS, TextMD, H4 } from "@/components/ui/typography";
import { 
  Pencil, 
  ShoppingBag, 
  User, 
  UtensilsCrossed,
  MessageSquare,
  LayoutGrid,
} from 'lucide-react';

import type { OrderDetails, OrderItem } from '@/types/orders';

import { Dialog, DialogWindow, DialogHeader, DialogContent, DialogFooter } from '@/components/layout/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ActionTile } from '@/components/ui/action-tile';
import { EmptyState } from '@/components/ui/empty-state';

type EditOrderDialogProps = {
  order: OrderDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedOrder: OrderDetails) => void;
};

export function EditOrderDialog({
  order,
  open,
  onOpenChange,
  onSave,
}: EditOrderDialogProps) {
  const [editedItems, setEditedItems] = React.useState<OrderItem[]>([]);
  const [editedTable, setEditedTable] = React.useState('');
  const [editedName, setEditedName] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [discount, setDiscount] = React.useState(0);
  const [searchProduct, setSearchProduct] = React.useState('');

  React.useEffect(() => {
    if (order) {
      setEditedItems([...order.items]);
      setEditedTable(order.tableLabel || '');
      setEditedName(order.customerName || order.staffName || '');
      setNotes(order.notes || '');
      setDiscount(order.discountAmount || 0);
      setSearchProduct('');
    }
  }, [order]);

  if (!order) return null;

  const calculateSubtotal = () => editedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const calculateDiscountValue = () => calculateSubtotal() * (discount / 100);
  const calculateTax = () => (calculateSubtotal() - calculateDiscountValue()) * 0.10; // 10% tax
  const calculateTotal = () => calculateSubtotal() - calculateDiscountValue() + calculateTax();

  const handleSave = () => {
    // TODO: Implement actual save with Convex mutation
    onSave(order);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow>
        {/* Header */}
        <DialogHeader
          icon={Pencil}
          title={`Editar Comanda #${order.orderNumber}`}
          description="Gestiona los productos y detalles del servicio."
        />

        <DialogContent className="flex-row">
          
          {/* Left Column (Items) */}
          <div className="flex-[7] flex flex-col border-r">
            <ScrollArea className="flex-1 px-5 py-4">
              <div className="space-y-3">
                {editedItems.length === 0 ? (
                  <EmptyState 
                    icon={ShoppingBag}
                    title="No hay productos"
                    description="Esta comanda no tiene productos."
                    className="py-12 bg-background border-dashed"
                  />
                ) : (
                  editedItems.map((item, index) => (
                    <ActionTile
                      key={`${item._id}-${index}`}
                      icon={UtensilsCrossed}
                      iconColor="#ea580c"
                      title={item.productName}
                      description={`${item.quantity} x €${item.unitPrice.toFixed(2)} = €${(item.unitPrice * item.quantity).toFixed(2)}`}
                    />
                  ))
                )}
                <div className="h-4" />
              </div>
            </ScrollArea>
          </div>

          {/* Right Column (Details) */}
          <div className="flex-[5] flex flex-col bg-background">
            <ScrollArea className="flex-1">
              <div className="p-8 space-y-8 flex flex-col justify-center min-h-full">
                {/* Details Section */}
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label icon={LayoutGrid}>Ubicación</Label>
                      <Input value={editedTable} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label icon={User}>Cliente</Label>
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Nombre..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label icon={MessageSquare}>Notas</Label>
                    <Textarea
                      placeholder="Notas del pedido..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                <Separator className="opacity-50" />

                {/* Totals Section */}
                <div className="space-y-3 px-1">
                  <div className="flex justify-between items-center text-sm">
                    <TextMD className="text-muted-foreground">Subtotal</TextMD>
                    <TextMD className="text-muted-foreground">€{calculateSubtotal().toFixed(2)}</TextMD>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-1">
                    <div className="flex items-center gap-2">
                      <TextMD className="text-muted-foreground">Descuento</TextMD>
                      <div className="flex items-center bg-background rounded-xl px-2 h-10 gap-0.5 border border-border">
                        <Input 
                          type="number" 
                          value={discount} 
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="h-full w-12 border-none bg-transparent p-0 text-center text-xs" 
                        />
                        <H4 className="text-muted-foreground">%</H4>
                      </div>
                    </div>
                    <H4 className="text-rose-500">-€{calculateDiscountValue().toFixed(2)}</H4>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <TextMD className="text-muted-foreground">IVA (10%)</TextMD>
                    <TextMD className="text-muted-foreground">€{calculateTax().toFixed(2)}</TextMD>
                  </div>

                  <div className="pt-5 mt-2 border-t flex justify-between items-center">
                    <H4 className="text-foreground">Total</H4>
                    <H4 className="text-foreground">
                      €{calculateTotal().toFixed(2)}
                    </H4>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>

        {/* Footer */}
        <DialogFooter
          onCancel={() => onOpenChange(false)}
          cancelText="Cancelar"
          onConfirm={handleSave}
          confirmText="Guardar Cambios"
        />
      </DialogWindow>
    </Dialog>
  );
}
