'use client';

import * as React from 'react';
import { Minus, Pencil, Plus, Trash2, MessageSquare } from 'lucide-react';

import type { OrderDetails, OrderDetailItem } from '@/types/orders';
import type { OrderProduct } from '@/data/orders';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

type EditOrderDialogProps = {
  order: OrderDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedOrder: OrderDetails) => void;
  products: OrderProduct[];
  tables: string[];
};

export function EditOrderDialog({
  order,
  open,
  onOpenChange,
  onSave,
  products,
  tables,
}: EditOrderDialogProps) {
  const [editedItems, setEditedItems] = React.useState<OrderDetailItem[]>([]);
  const [editedTable, setEditedTable] = React.useState('');
  const [editedName, setEditedName] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [discount, setDiscount] = React.useState(0);
  const [searchProduct, setSearchProduct] = React.useState('');

  React.useEffect(() => {
    if (order) {
      setEditedItems([...order.items]);
      setEditedTable(order.table);
      setEditedName(order.name);
      setEditedName(order.name);
      setNotes('');
      setDiscount(0);
      setSearchProduct('');
    }
  }, [order]);

  if (!order) return null;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const handleQuantityChange = (index: number, delta: number) => {
    setEditedItems((prev) => {
      const newItems = [...prev];
      newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
      return newItems;
    });
  };

  const handleRemoveItem = (index: number) => {
    setEditedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = (product: OrderProduct) => {
    const existingIndex = editedItems.findIndex((item) => item.name === product.name);
    if (existingIndex >= 0) {
      handleQuantityChange(existingIndex, 1);
    } else {
      setEditedItems((prev) => [...prev, { name: product.name, quantity: 1, price: product.price }]);
    }
    setSearchProduct('');
  };

  const calculateSubtotal = () => editedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const calculateDiscountValue = () => calculateSubtotal() * (discount / 100);
  const calculateTax = () => (calculateSubtotal() - calculateDiscountValue()) * 0.21;
  const calculateTotal = () => calculateSubtotal() - calculateDiscountValue() + calculateTax();

  const handleSave = () => {
    const updatedOrder: OrderDetails = {
      ...order,
      items: editedItems,
      table: editedTable,
      name: editedName,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: `€${calculateTotal().toFixed(2)}`,
    };
    onSave(updatedOrder);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Editar Comanda #{order.order}
          </DialogTitle>
          <DialogDescription>
            Modifica los productos, cantidades o datos de la comanda.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-table">Mesa</Label>
                <Select value={editedTable} onValueChange={setEditedTable}>
                  <SelectTrigger id="edit-table">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table} value={table}>
                        {table}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Cliente</Label>
                <Input
                  id="edit-name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Productos en la comanda</Label>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {editedItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay productos en esta comanda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {editedItems.map((item, index) => (
                      <div key={`${item.name}-${index}`} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">€{item.price.toFixed(2)} c/u</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(index, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(index, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Añadir productos</Label>
              <Input
                placeholder="Buscar producto..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
              {searchProduct && (
                <ScrollArea className="h-[120px] border rounded-md">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                      onClick={() => handleAddProduct(product)}
                    >
                      <span className="text-sm">{product.name}</span>
                      <span className="text-sm text-muted-foreground">€{product.price.toFixed(2)}</span>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notas del pedido
              </Label>
              <Textarea
                id="order-notes"
                placeholder="Alergias, preferencias, instrucciones especiales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <Label htmlFor="discount" className="font-normal flex items-center gap-1">
                  Descuento (%):
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  className="w-20 h-7 text-right"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">€{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuento ({discount}%):</span>
                <span className="text-red-500 font-medium">-€{calculateDiscountValue().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA (21%):</span>
                <span className="font-medium">€{calculateTax().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">€{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
