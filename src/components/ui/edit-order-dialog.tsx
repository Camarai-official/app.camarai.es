'use client';

import * as React from 'react';
import { 
  Pencil, 
  ShoppingBag, 
  User, 
  Search,
  UtensilsCrossed,
  Receipt,
  MessageSquare,
  Plus,
  CreditCard,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

import type { OrderDetails, OrderDetailItem } from '@/types/orders';
import type { OrderProduct } from '@/data/orders';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/layout/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ActionTile } from '@/components/ui/action-tile';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';
import { DashboardList, DashboardListItem } from '@/components/ui/dashboard-list';

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
      newItems[index] = {
        ...newItems[index],
        quantity: Math.max(1, newItems[index].quantity + delta),
      };
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
      <DialogContent className="sm:max-w-[850px] sm:h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        {/* Header */}
        <DialogHeader
          flush
          icon={Pencil}
          title={`Editar Comanda #${order.order}`}
          description="Gestiona los productos y detalles del servicio de forma eficiente."
        />

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column (Items) */}
          <div className="flex-[7] flex flex-col border-r">
            <div className="p-5 pb-2">
              <div className="relative">
                <SearchInput 
                  placeholder="Buscar producto o plato..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
                
                {searchProduct && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-popover border rounded-xl shadow-xl z-50 max-h-[300px] overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => handleAddProduct(product)}
                        >
                          <span className="text-sm font-medium">{product.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary">€{product.price.toFixed(2)}</span>
                            <Plus className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-center text-muted-foreground py-4">Sin resultados</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 px-5 py-4">
              <div className="space-y-3">
                {editedItems.length === 0 ? (
                  <EmptyState 
                    icon={ShoppingBag}
                    title="No hay productos aún"
                    description="Utiliza el buscador para añadir ítems a la mesa."
                    className="py-12 bg-background border-dashed"
                  />
                ) : (
                  editedItems.map((item, index) => (
                    <ActionTile
                      key={`${item.name}-${index}`}
                      icon={UtensilsCrossed}
                      iconColor="#ea580c"
                      title={item.name}
                      description={`Unitario: €${item.price.toFixed(2)}`}
                      rightContentType="quantity"
                      quantity={item.quantity}
                      onIncrease={() => handleQuantityChange(index, 1)}
                      onDecrease={() => handleQuantityChange(index, -1)}
                      onRemove={() => handleRemoveItem(index)}
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
                      <Select value={editedTable} onValueChange={setEditedTable}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.map((table) => (
                            <SelectItem key={table} value={table}>{table}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <Label icon={MessageSquare}>Notas de Cocina</Label>
                    <Textarea
                      placeholder="Instrucciones para la preparación..."
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
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium tabular-nums text-muted-foreground">€{calculateSubtotal().toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Descuento</span>
                        <div className="flex items-center bg-background rounded-xl px-2 h-10 gap-0.5 border border-border focus-within:border-primary/20 transition-all">
                          <Input 
                            type="number" 
                            value={discount} 
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="h-full w-8 border-none bg-transparent p-0 text-center text-xs font-bold focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          />
                          <span className="text-[10px] text-muted-foreground/60 font-bold">%</span>
                        </div>
                      </div>
                      <span className="font-bold text-rose-500/80 tabular-nums">-€{calculateDiscountValue().toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">IVA (21%)</span>
                      <span className="font-medium tabular-nums text-muted-foreground">€{calculateTax().toFixed(2)}</span>
                    </div>

                    <div className="pt-5 mt-2 border-t flex justify-between items-center">
                      <span className="text-base font-bold text-foreground">Total</span>
                      <span className="font-bold text-foreground tabular-nums">
                        €{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter
          flush
          onCancel={() => onOpenChange(false)}
          cancelText="Cancelar"
          onConfirm={handleSave}
          confirmText="Guardar Cambios"
        />
      </DialogContent>
    </Dialog>
  );
}
