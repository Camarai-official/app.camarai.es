'use client';

import * as React from 'react';
import { 
  Package, PlusCircle, ChevronLeft, ChevronRight, 
  Settings, Download, Edit, Trash, History
} from 'lucide-react';

import { TextXS } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SearchInput } from '@/components/ui/search-input';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { StockAdjustmentDialog } from '@/components/dialogs/inventario-stock-adjustment-dialog';
import { HistoryDialog } from '@/components/dialogs/inventario-history-dialog';
import { IngredientDialog } from '@/components/dialogs/inventario-ingredient-dialog';
import {
  mockIngredients,
  mockIngredientCategories,
  mockTaxes,
  type Ingredient
} from '@/data/mock-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// --- MAIN PAGE ---

export default function InventarioPage() {
  const { toast } = useToast();
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(mockIngredients);
  const ingredientCategories = mockIngredientCategories;
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<Ingredient | null>(null);
  
  // Dialog states
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  const filteredItems = ingredients.filter(item => {
    const matchesSearch = item.nombre_ingrediente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.id_categoria_ingrediente === selectedCategory;
    const isLow = item.stock_actual <= item.stock_minimo_alerta;
    const matchesStockFilter = !showLowStockOnly || isLow;
    return matchesSearch && matchesCategory && matchesStockFilter;
  });

  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleUpdateStock = (id: string, newStock: number) => {
    setIngredients(prev => prev.map(item => item.id === id ? { ...item, stock_actual: newStock } : item));
  };

  const handleSaveIngredient = (data: any) => {
    if (data.id) setIngredients(prev => prev.map(i => i.id === data.id ? { ...i, ...data } : i));
    else setIngredients(prev => [...prev, { ...data, id: `ing-${Date.now()}` }]);
  };

  const handleRemove = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
    toast({ title: "Componente eliminado", variant: "destructive" });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Gestión de Inventario" 
        subtitle="Unifica tu catálogo y el control operativo."
        actions={
            <Button onClick={() => { setSelectedItem(null); setIsEditOpen(true); }} startIcon={<PlusCircle />}>
                Nuevo Ingrediente
            </Button>
        }
      />
      
      <PageContent>
        <Card padding="none">
            <CardHeader className="space-y-0">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
                        <SearchInput 
                            placeholder="Buscar producto..." 
                            value={searchTerm} 
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                            containerClassName="w-full lg:w-[300px]"
                        />
                        <Select value={selectedCategory} onValueChange={v => { setSelectedCategory(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-full lg:w-[200px]">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todo</SelectItem>
                                {ingredientCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
                        <div className="flex items-center gap-2 pr-2 border-r border-border">
                            <Switch id="low-stock" checked={showLowStockOnly} onCheckedChange={setShowLowStockOnly} />
                            <Label htmlFor="low-stock" variant="medium" className="whitespace-nowrap">Solo Alertas</Label>
                        </div>
                        <Button variant="outline" size="md"><Download className="h-4 w-4" /></Button>
                    </div>
                </div>
            </CardHeader>
        </Card>

        <Card padding="none" className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingrediente</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead align="center">Stock Actual</TableHead>
                <TableHead align="center">Mín. Alerta</TableHead>
                <TableHead align="center">Unidad</TableHead>
                <TableHead align="right">Costo (€)</TableHead>
                <TableHead align="right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map(item => {
                const isLow = item.stock_actual <= item.stock_minimo_alerta;
                const categoryName = ingredientCategories.find(c => c.id === item.id_categoria_ingrediente)?.nombre || 'Sin categoría';
                
                return (
                  <TableRow key={item.id}>
                    <TableCell variant="medium">{item.nombre_ingrediente}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" size="xs">
                        {categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell align="center">
                      <div className={cn("font-bold", isLow ? 'text-rose-600' : 'text-foreground')}>
                        {item.stock_actual}
                      </div>
                    </TableCell>
                    <TableCell align="center">{item.stock_minimo_alerta}</TableCell>
                    <TableCell align="center" textTransform="capitalize">{item.unidad_medida}</TableCell>
                    <TableCell align="right">€{item.costo_unitario.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="md" onClick={() => { setSelectedItem(item); setIsStockAdjustmentOpen(true); }}>
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="md" onClick={() => { setSelectedItem(item); setIsEditOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="md" onClick={() => { setSelectedItem(item); setIsHistoryOpen(true); }}>
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="md" onClick={() => handleRemove(item.id)}>
                          <Trash className="h-4 w-4 text-rose-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredItems.length === 0 && (
            <div className="p-8">
              <EmptyState icon={Package} title="Sin resultados" description="No se encontraron componentes con los filtros actuales." />
            </div>
          )}
        </Card>

        {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between p-4 border border-dashed rounded-xl border-muted-foreground/20">
                <TextXS> {currentPage} / {totalPages}</TextXS>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="md" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <Button key={i} variant={currentPage === i + 1 ? "default" : "ghost"} size="md" onClick={() => setCurrentPage(i + 1)}> {i + 1} </Button>
                        ))}
                    </div>
                    <Button variant="outline" size="md" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
        )}
      </PageContent>

      <StockAdjustmentDialog item={selectedItem} open={isStockAdjustmentOpen} onOpenChange={setIsStockAdjustmentOpen} onUpdateStock={handleUpdateStock} />
      <HistoryDialog item={selectedItem} open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
      <IngredientDialog open={isEditOpen} onOpenChange={setIsEditOpen} ingredientToEdit={selectedItem} onSave={handleSaveIngredient} />
    </PageContainer>
  );
}
