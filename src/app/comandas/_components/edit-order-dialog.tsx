'use client';

import * as React from 'react';
import { 
  Minus, 
  Pencil, 
  Plus, 
  Trash, 
  MessageSquare, 
  ShoppingBag, 
  User, 
  ChefHat,
  LayoutGrid,
  Search,
  CreditCard,
  UtensilsCrossed,
  Receipt
} from 'lucide-react';

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
import { ConfigItem } from '@/components/ui/config-item';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/ui/search-input';

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
      <DialogContent className="sm:max-w-[850px] overflow-hidden border-none shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle icon={Pencil} className="text-xl">
            <span>Editar Comanda #{order.order}</span>
          </DialogTitle>
          <DialogDescription className="ml-14">
            Personaliza los productos, cantidades y detalles de facturación.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] -mx-6">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Search & Products */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Product Search */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Search className="h-3 w-3" /> Añadir Item
                </h4>
                  <SearchInput 
                    placeholder="Buscar plato o bebida..."
                    className="bg-muted/40 border-transparent focus:bg-background transition-all"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                  />
                  {searchProduct && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-popover border rounded-xl shadow-xl z-50 max-h-[200px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => handleAddProduct(product)}
                          >
                            <span className="text-sm font-medium">{product.name}</span>
                            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">€{product.price.toFixed(2)}</span>
                          </div>
                        ))
                       ) : (
                        <p className="text-xs text-center text-muted-foreground py-2">No se encontraron productos</p>
                      )}
                </div>
              )}
              </div>

              <Separator className="opacity-50" />

              {/* Items Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ShoppingBag className="h-3 w-3" /> Productos Seleccionados ({editedItems.length})
                </h4>
                
                <div className="space-y-3">
                  {editedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed rounded-xl border-muted">
                      <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">La comanda está vacía</p>
                      <p className="text-xs text-muted-foreground mt-1">Busca y añade productos desde el panel derecho</p>
                    </div>
                  ) : (
                    editedItems.map((item, index) => (
                        <ConfigItem
                          key={`${item.name}-${index}`}
                          icon={UtensilsCrossed}
                          label={item.name}
                          description={`€${item.price.toFixed(2)} / unidad`}
                          iconClassName="text-orange-600"
                          iconContainerClassName="bg-orange-500/10"
                        >
                        <div className="flex items-center gap-3 bg-background rounded-lg border p-1 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/10 transition-colors rounded-md"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash className="h-3 w-3 text-muted-foreground" />
                          </Button>
                          <div className="w-px h-4 bg-border" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            onClick={() => handleQuantityChange(index, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleQuantityChange(index, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </ConfigItem>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Info, Notes & Summary */}
            <div className="md:col-span-5 flex flex-col gap-6">
              
              <div className="flex-1 space-y-6">
                {/* Details Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <User className="h-3 w-3" /> Detalles
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Table Select */}
                    <div className="space-y-1.5">
                       <Label className="text-xs text-muted-foreground ml-1">Mesa / Ubicación</Label>
                       <div className="relative">
                          <Select value={editedTable} onValueChange={setEditedTable}>
                            <SelectTrigger id="edit-table" className="h-10 pl-3 bg-card border-input/60 hover:bg-muted/50 hover:border-input transition-colors rounded-lg shadow-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {tables.map((table) => (
                                <SelectItem key={table} value={table}>{table}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                       </div>
                    </div>

                    {/* Client Input */}
                    <div className="space-y-1.5">
                       <Label className="text-xs text-muted-foreground ml-1">Cliente</Label>
                       <Input
                        id="edit-name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-10 bg-card border-input/60 hover:bg-muted/50 hover:border-input transition-colors rounded-lg shadow-sm focus-visible:ring-1"
                        placeholder="Nombre del cliente"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> Notas
                  </h4>
                  <Textarea
                    placeholder="Instrucciones especiales para cocina..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] bg-card border-input/60 hover:bg-muted/50 hover:border-input transition-colors rounded-lg shadow-sm resize-none focus-visible:ring-1"
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border bg-muted/40 p-5 space-y-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between border-b pb-3 border-border/50">
                   <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
                    <Receipt className="h-3.5 w-3.5" /> Totales
                  </h4>
                  <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border">IVA Incluido</span>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">€{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                       <span className="text-muted-foreground">Descuento</span>
                       <div className="flex items-center bg-background border rounded h-6 px-1.5 transition-colors focus-within:border-primary shadow-sm">
                          <Input 
                             type="number" 
                             min="0" 
                             max="100" 
                             value={discount} 
                             onChange={(e) => setDiscount(Number(e.target.value))}
                             className="w-8 h-full border-none bg-transparent p-0 text-center text-xs focus-visible:ring-0 shadow-none py-0 h-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                       </div>
                    </div>
                    <span className="text-rose-500 font-medium text-xs">-€{calculateDiscountValue().toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">IVA (21%)</span>
                    <span className="font-medium">€{calculateTax().toFixed(2)}</span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border/50 flex justify-between items-end">
                    <span className="font-bold text-sm text-foreground/80">Total Final</span>
                    <span className="font-black text-2xl text-primary leading-none tracking-tight">€{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <p className="text-xs text-muted-foreground hidden sm:block">
            <span className="font-medium text-foreground">Tip:</span> Revisa los alérgenos antes de confirmar.
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button variant="brand" onClick={handleSave} className="flex-1 sm:flex-none">
              Guardar Comanda
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
