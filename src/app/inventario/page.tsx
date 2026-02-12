
'use client';

import * as React from 'react';
import { MoreHorizontal, Package, PlusCircle, ChevronLeft, ChevronRight, FileDown, MoreVertical, ArrowDown, ArrowUp, X, Check, FileText, History, ShoppingCart, Repeat, ArrowRight, Settings, Download } from 'lucide-react';
import { ExportModal, type ExportField } from '@/components/features/export-modal';
import { Switch } from '@/components/ui/switch';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Removed useAppData
import {
  mockIngredients,
  mockIngredientCategories,
  type Ingredient,
  type IngredientCategory
} from '@/data/mock-data';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


type InventoryItem = Ingredient;
type AdjustmentType = 'add' | 'subtract-sale' | 'subtract-waste' | 'set';

function StockAdjustmentDialog({ item, open, onOpenChange, onUpdateStock }: { item: InventoryItem | null, open: boolean, onOpenChange: (open: boolean) => void, onUpdateStock: (id: string, newStock: number) => void }) {
  const [adjustmentType, setAdjustmentType] = React.useState<AdjustmentType>('add');
  const [amount, setAmount] = React.useState(0);
  const [reason, setReason] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    // Reset state when dialog is opened or item changes
    if (open) {
      setAdjustmentType('add');
      setAmount(0);
      setReason('');
    }
  }, [open]);

  const handleAdjust = () => {
    if (!item || item.stock_actual === undefined) return;
    let finalAmount = item.stock_actual;

    switch (adjustmentType) {
      case 'add':
        finalAmount += amount;
        break;
      case 'subtract-sale':
      case 'subtract-waste':
        finalAmount -= amount;
        break;
      case 'set':
        finalAmount = amount;
        break;
    }

    // Call the callback passed from parent instead of hook
    onUpdateStock(item.id, finalAmount);

    toast({
      title: "Stock Ajustado",
      description: `El stock de "${item.nombre_ingrediente}" se ha ajustado a ${finalAmount} ${item.unidad_medida}.`,
    });

    onOpenChange(false);
  }

  if (!item) return null;

  const adjustmentConfig = {
    'add': { title: 'Entrada', description: 'Suma unidades al stock actual. Ideal para recepción de pedidos.', icon: ArrowDown },
    'subtract-sale': { title: 'Venta', description: 'Resta unidades por ventas no automatizadas.', icon: ArrowRight },
    'subtract-waste': { title: 'Merma', description: 'Resta unidades por productos caducados, rotos o en mal estado.', icon: X },
    'set': { title: 'Fijar', description: 'Establece el número exacto de unidades tras un inventario físico.', icon: Check },
  };

  const currentConfig = adjustmentConfig[adjustmentType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle icon={Package}>Ajustar Stock de &quot;{item.nombre_ingrediente}&quot;</DialogTitle>
          <DialogDescription>Stock actual: {item.stock_actual} {item.unidad_medida}. Selecciona una operación.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 pt-4">
          {Object.entries(adjustmentConfig).map((key) => {
            const config = adjustmentConfig[key[1].title.toLowerCase().replace(/\s+/g, '-') as AdjustmentType] || adjustmentConfig[key[0] as AdjustmentType];
            const Icon = config.icon;
            return (
              <Button
                key={key[0]}
                variant={adjustmentType === key[0] as AdjustmentType ? 'default' : 'outline'}
                onClick={() => setAdjustmentType(key[0] as AdjustmentType)}
                className="flex flex-col h-auto p-3"
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{config.title}</span>
              </Button>
            )
          })}
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium"><currentConfig.icon className="h-5 w-5" />{currentConfig.title}</CardTitle>
            <CardDescription>{currentConfig.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Cantidad a {adjustmentType === 'add' ? 'añadir' : adjustmentType === 'set' ? 'fijar' : 'restar'} (en {item.unidad_medida})</Label>
              <div className="flex items-center gap-2">
                <Input id="amount" type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} min="0" className="flex-grow" />
                <span className="font-semibold text-muted-foreground">{item.unidad_medida}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo del ajuste (Opcional)</Label>
              <Textarea id="reason" placeholder="Ej: Recepción de pedido, merma, inventario físico..." value={reason} onChange={e => setReason(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
          <Button variant="brand" onClick={handleAdjust}>Ajustar Stock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const mockHistoryData = [
  { date: '2024-07-29', type: 'Entrada', quantity: 20, user: 'Laura G.', reason: 'Pedido proveedor A' },
  { date: '2024-07-28', type: 'Merma', quantity: -2, user: 'Carlos P.', reason: 'Caducado' },
  { date: '2024-07-27', type: 'Venta', quantity: -15, user: 'Sistema', reason: 'Ventas del día' },
  { date: '2024-07-26', type: 'Fijar', quantity: 120, user: 'Laura G.', reason: 'Inventario semanal' },
];

function HistoryDialog({ item, open, onOpenChange }: { item: InventoryItem | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle icon={History}>Historial de &quot;{item.nombre_ingrediente}&quot;</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="movements" className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="movements"><Repeat className="mr-2 h-4 w-4" />Movimientos</TabsTrigger>
            <TabsTrigger value="waste"><X className="mr-2 h-4 w-4" />Mermas</TabsTrigger>
            <TabsTrigger value="purchases"><ShoppingCart className="mr-2 h-4 w-4" />Compras</TabsTrigger>
          </TabsList>
          <TabsContent value="movements" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Movimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockHistoryData.map((h, i) => (
                        <TableRow key={i}>
                          <TableCell>{h.date}</TableCell>
                          <TableCell>
                            {/* Adjusted Badge variant to standard ones */}
                            <Badge variant={h.type === 'Entrada' ? 'default' : h.type === 'Merma' ? 'destructive' : 'secondary'}>{h.type}</Badge>
                          </TableCell>
                          <TableCell className={cn(h.quantity > 0 ? 'text-green-500' : 'text-red-500')}>{h.quantity > 0 ? `+${h.quantity}` : h.quantity} {item.unidad_medida}</TableCell>
                          <TableCell>{h.user}</TableCell>
                          <TableCell>{h.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="waste" className="pt-4">
            <Card>
              <CardHeader><CardTitle>Historial de Mermas</CardTitle></CardHeader>
              <CardContent><p className="text-center text-muted-foreground p-4">No hay datos de mermas para este producto.</p></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="purchases" className="pt-4">
            <Card>
              <CardHeader><CardTitle>Historial de Compras</CardTitle></CardHeader>
              <CardContent><p className="text-center text-muted-foreground p-4">No hay datos de compras para este producto.</p></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild><Button variant="secondary">Cerrar</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Export fields configuration
const inventoryExportFields: ExportField[] = [
  { id: 'nombre', label: 'Nombre', checked: true },
  { id: 'categoria', label: 'Categoría', checked: true },
  { id: 'stock_actual', label: 'Stock Actual', checked: true },
  { id: 'stock_minimo', label: 'Stock Mínimo', checked: true },
  { id: 'unidad', label: 'Unidad', checked: true },
  { id: 'costo', label: 'Costo Unitario', checked: true },
  { id: 'valoracion', label: 'Valoración Total', checked: false },
];

export default function InventarioPage() {
  const { toast } = useToast();
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(mockIngredients);
  // Using mock categories directly, could also be state if needed but usually static for this view unless editing categories
  const ingredientCategories = mockIngredientCategories;

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [isStockDialogOpen, setIsStockDialogOpen] = React.useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  // Export and config state
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = React.useState(false);
  
  // Export handler
  const handleExport = async (options: { format: string; fields: string[]; dateRange?: any }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Exporting inventory:', options);
    // In a real app, this would generate and download the file
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const handleUpdateStock = (id: string, newStock: number) => {
    setIngredients(prev => prev.map(item => item.id === id ? { ...item, stock_actual: newStock } : item));
  }


  const filteredItems = ingredients.filter(item => {
    const matchesSearchTerm = item.nombre_ingrediente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.id_categoria_ingrediente === selectedCategory;
    const matchesStockFilter = !showLowStockOnly || item.stock_actual <= item.stock_minimo_alerta;
    return matchesSearchTerm && matchesCategory && matchesStockFilter;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setIsAnimating(false);
    }, 300);
  };

  const openStockDialog = (item: any) => {
    setSelectedItem(item);
    setIsStockDialogOpen(true);
  }

  const openHistoryDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsHistoryDialogOpen(true);
  }

  const getStockStatus = (current: number, min: number): 'ok' | 'warning' | 'low' => {
    if (min <= 0) return 'ok';
    if (current <= min) return 'low';
    if (current <= min * 1.5) return 'warning';
    return 'ok';
  }

  const getIngredientCategoryName = (categoryId: string) => {
    const category = ingredientCategories.find(cat => cat.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      <PageHeader title="Gestión de Inventario" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-2 md:gap-6 md:p-6 md:pt-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-muted-foreground">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-3/4">
                <SearchInput 
                  containerClassName="sm:flex-1"
                  placeholder="Buscar por nombre..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-auto sm:flex-1">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {ingredientCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <div className="flex items-center gap-2 mr-2">
                  <Switch
                    id="low-stock-filter"
                    checked={showLowStockOnly}
                    onCheckedChange={setShowLowStockOnly}
                  />
                  <Label htmlFor="low-stock-filter" className="text-sm whitespace-nowrap">Solo stock bajo</Label>
                </div>
                <Button variant="outline" size="icon" onClick={() => setIsConfigOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button onClick={() => setIsExportOpen(true)}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold text-muted-foreground">Componentes en Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Componente</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Stock Actual</TableHead>
                      <TableHead><span className="sr-only">Acciones</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody
                    key={currentPage}
                    className={cn('transition-opacity duration-300', isAnimating ? 'opacity-0' : 'opacity-100')}
                  >
                    {currentItems.map(item => {
                      const stockStatus = getStockStatus(item.stock_actual, item.stock_minimo_alerta);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.nombre_ingrediente}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{getIngredientCategoryName(item.id_categoria_ingrediente)}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {/* Mapped badge variants to standard ones */}
                            <Badge variant={stockStatus === 'low' ? 'destructive' : stockStatus === 'warning' ? 'destructive' : 'secondary'}>
                              {item.stock_actual} {item.unidad_medida}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Menú de acciones</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => openStockDialog(item)}>
                                  <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                                  Ajustar Stock
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => openHistoryDialog(item)}>
                                  <History className="mr-2 h-4 w-4 text-muted-foreground" />
                                  Ver historial
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                          No se encontraron componentes en el inventario con los filtros seleccionados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{Math.min(indexOfFirstItem + 1, filteredItems.length)}-{Math.min(indexOfLastItem, filteredItems.length)}</strong> de <strong>{filteredItems.length}</strong> componentes.
            </div>
            <div className="flex justify-end items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.map(number => (
                <Button
                  key={number}
                  variant={currentPage === number ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => paginate(number)}
                >
                  {number}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
      <StockAdjustmentDialog
        item={selectedItem}
        open={isStockDialogOpen}
        onOpenChange={setIsStockDialogOpen}
        onUpdateStock={handleUpdateStock}
      />
      <HistoryDialog
        item={selectedItem}
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
      />
      
      {/* Export Modal */}
      <ExportModal
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        title="Exportar Inventario"
        description="Exporta el estado actual del inventario."
        fields={inventoryExportFields}
        showDateRange={false}
        onExport={handleExport}
      />
      
      {/* Configuration Modal */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle icon={Settings}>
              Configurar Inventario
            </DialogTitle>
            <DialogDescription>
              Configura alertas y opciones de visualización del inventario.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Umbrales de Alerta</Label>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Los umbrales de stock mínimo se configuran por ingrediente en la página de Ingredientes.</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Notificaciones</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-email" className="font-normal">Alerta por email</Label>
                  <Switch id="notif-email" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-push" className="font-normal">Notificación push</Label>
                  <Switch id="notif-push" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Vista de Inventario</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-value" className="font-normal">Mostrar valoración</Label>
                  <Switch id="show-value" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-cost" className="font-normal">Mostrar coste unitario</Label>
                  <Switch id="show-cost" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              toast({ title: 'Configuración guardada', description: 'Los ajustes del inventario se han aplicado.' });
              setIsConfigOpen(false);
            }}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
