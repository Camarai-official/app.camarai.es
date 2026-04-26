'use client';
import * as React from 'react';
import { 
  Package, PlusCircle, ChevronLeft, ChevronRight, 
  Settings, Download, Edit, Trash, History
} from 'lucide-react';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

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
import type { Ingredient } from '@/data/mock-data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useEstablishments } from '@/hooks/useEstablishments';

// --- MAIN PAGE ---

export default function InventarioPage() {
  const { toast } = useToast();
  const { activeEstablishment } = useEstablishments();
  
  // Obtener los ingredientes del establecimiento
  const ingredients = useQuery(api.ingredients.getIngredients, 
    activeEstablishment?.id ? { establishmentId: activeEstablishment.id } : "skip"
  ) || [];
  
  // Obtener las categorías de ingredientes
  const ingredientCategories = useQuery(api.ingredients.getIngredientCategories, 
    activeEstablishment?.id ? { establishmentId: activeEstablishment.id } : "skip"
  ) || [];
  
  // Obtener el staff del establecimiento para el staffId
  const staffData = useQuery(api.staff.getStaffByEstablishment, 
    activeEstablishment?.id ? { establishmentId: activeEstablishment.id } : "skip"
  ) || [];

  // StaffId temporal para pruebas - usar el primero disponible o null
  const tempStaffId = staffData && staffData.length > 0 ? staffData[0].id : null;

  const createIngredient = useMutation(api.ingredients.createIngredient);
  const updateIngredientMutation = useMutation(api.ingredients.updateIngredient);
  const deleteIngredientMutation = useMutation(api.ingredients.deleteIngredient);
  const adjustStockMutation = useMutation(api.ingredients.adjustStock);
  
  // Convert Convex data to frontend format
  const extendedIngredients = React.useMemo(() => {
    return ingredients.map(ingredient => {
      const converted = {
        id: ingredient._id,
        nombre_ingrediente: ingredient.name,
        stock_actual: ingredient.stock,
        stock_minimo: ingredient.alert_min,
        stock_maximo: ingredient.stock_max || 0,
        unidad_medida: ingredient.unit,
        costo_unitario: ingredient.cost_base,
        proveedor: ingredient.supplier || '',
        codigo_barras: ingredient.barcode || '',
        categoria_nombre: ingredient.category_name || 'Sin categoría',
        id_categoria: ingredient.category_id,
        disponible: ingredient.stock > ingredient.alert_min,
        conversiones: ingredient.conversions || []
      };
      return converted;
    });
  }, [ingredients]);
  
  // State hooks - siempre deben ir antes de cualquier return condicional
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
  
  // Loading states - después de todos los hooks
  if (!activeEstablishment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Cargando establecimiento...</div>
      </div>
    );
  }

  const filteredItems = extendedIngredients.filter(item => {
    const matchesSearch = (item.nombre_ingrediente || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.id_categoria === selectedCategory;
    const isLow = item.stock_actual <= item.stock_minimo;
    const matchesStockFilter = !showLowStockOnly || isLow;
    return matchesSearch && matchesCategory && matchesStockFilter;
  });

  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await adjustStockMutation({ 
        ingredientId: id as Id<"ingredients">, 
        newStock: newStock, 
        adjustmentType: "set",
        staffId: tempStaffId as Id<"staff">
      });
      toast({ 
        title: "Stock actualizado", 
        description: "El stock ha sido actualizado correctamente." 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "No se pudo actualizar el stock.", 
        variant: "destructive" 
      });
    }
  };

  const handleSaveIngredient = async (data: any) => {
    if (!activeEstablishment) return;
    
    // Mapear unidades del frontend a Convex
    const unitMapping: Record<string, string> = {
      'unidades': 'units',
      'kg': 'kg',
      'g': 'grams', 
      'l': 'liters',
      'ml': 'liters' // Convertir ml a liters
    };
    
    const convexUnit = unitMapping[data.unidad_medida] || 'units';
    
    try {
      if (data.id) {
        // Update existing ingredient
        await updateIngredientMutation({
          ingredientId: data.id as Id<"ingredients">,
          name: data.nombre_ingrediente,
          stock: data.stock_actual || 0,
          alertMin: data.stock_minimo_alerta || data.stock_minimo || 0,
          stockMax: data.stock_maximo || 0,
          unit: convexUnit as any, // Usar unidad mapeada
          costBase: data.costo_unitario || 0,
          supplier: data.proveedor_nombre,
          barcode: data.codigo_barras,
          categoryId: data.id_categoria_ingrediente || data.id_categoria,
          conversions: (data as any).conversiones || []
        });
        toast({ title: "Ingrediente actualizado" });
      } else {
        // Create new ingredient
        const categoryId = data.id_categoria_ingrediente || data.id_categoria;
        const alertMin = data.stock_minimo_alerta || data.stock_minimo || 0;
        
        if (!categoryId) {
          toast({ 
            title: "Error", 
            description: "Debes seleccionar una categoría.", 
            variant: "destructive" 
          });
          return;
        }
        
        await createIngredient({
          establishmentId: activeEstablishment.id,
          categoryId: categoryId as Id<"ingredient_categories">,
          name: data.nombre_ingrediente,
          stock: data.stock_actual || 0,
          alertMin: alertMin,
          stockMax: data.stock_maximo || 0,
          unit: convexUnit as any, // Usar unidad mapeada
          costBase: data.costo_unitario || 0,
          supplier: data.proveedor_nombre,
          barcode: data.codigo_barras,
          conversions: (data as any).conversiones || []
        });
        toast({ title: "Ingrediente creado" });
      }
    } catch (error) {
      console.error('Error guardando ingrediente:', error);
      toast({ 
        title: "Error", 
        description: "No se pudo guardar el ingrediente.", 
        variant: "destructive" 
      });
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await deleteIngredientMutation({ ingredientId: id as Id<"ingredients"> });
      toast({ 
        title: "Ingrediente eliminado", 
        description: "El ingrediente ha sido eliminado correctamente.",
        variant: "destructive" 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "No se pudo eliminar el ingrediente.", 
        variant: "destructive" 
      });
    }
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
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full lg:w-auto">
                        <SearchInput 
                            placeholder="Buscar producto..." 
                            value={searchTerm} 
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                            containerClassName="w-full sm:w-[300px]"
                        />
                        <Select value={selectedCategory} onValueChange={v => { setSelectedCategory(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todo</SelectItem>
                                {ingredientCategories.map(cat => (
                                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="flex items-center gap-2 pr-3 border-r border-border">
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
                <TableHead align="center">Stock</TableHead>
                <TableHead align="center">Alerta</TableHead>
                <TableHead align="center">Unidad</TableHead>
                <TableHead align="right">Costo</TableHead>
                <TableHead align="right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map(item => {
                const isLow = item.stock_actual <= item.stock_minimo;
                
                const categoryName = ingredientCategories.find(c => c._id === item.id_categoria)?.name || item.categoria_nombre || 'Sin categoría';
                
                return (
                  <TableRow key={item.id}>
                    <TableCell variant="medium">{item.nombre_ingrediente}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" size="xs">
                        {categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell align="center">
                      <div className={cn("font-bold", isLow ? 'text-red-600' : 'text-foreground')}>
                        {item.stock_actual}
                      </div>
                    </TableCell>
                    <TableCell align="center">{item.stock_minimo}</TableCell>
                    <TableCell align="center" textTransform="capitalize">{item.unidad_medida}</TableCell>
                    <TableCell align="right">€{item.costo_unitario.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="md" onClick={() => { setSelectedItem(item); setIsStockAdjustmentOpen(true); }}>
                          <Package className="h-4 w-4" />
                        </Button>
                        <Button variant="secondary" size="md" onClick={() => { setSelectedItem(item); setIsEditOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="secondary" size="md" onClick={() => { setSelectedItem(item); setIsHistoryOpen(true); }}>
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="secondary" size="md" onClick={() => handleRemove(item.id)}>
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

      <StockAdjustmentDialog 
        item={selectedItem} 
        open={isStockAdjustmentOpen} 
        onOpenChange={setIsStockAdjustmentOpen} 
        onUpdateStock={handleUpdateStock} 
        staffId={tempStaffId} 
        staffData={staffData} 
      />
      <HistoryDialog item={selectedItem} open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
      <IngredientDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        ingredientToEdit={selectedItem} 
        onSave={handleSaveIngredient} 
        categories={ingredientCategories}
      />
    </PageContainer>
  );
}
