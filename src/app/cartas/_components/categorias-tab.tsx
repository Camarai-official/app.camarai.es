'use client';

import * as React from 'react';
import { 
    PlusCircle, 
    Edit, 
    Trash, 
    ChevronLeft, 
    ChevronRight, 
    Eye,
    EyeOff,
    Utensils,
    LayoutGrid
} from 'lucide-react';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge, IconBadge } from '@/components/ui/badge';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from '@/components/dialogs/global-alert-dialog';
import { SearchInput } from '@/components/ui/search-input';
import { TextSM } from '@/components/ui/typography';
import { useToast } from '@/hooks/use-toast';
import { iconMap } from '@/components/ui/icon-picker';
import { useEstablishments } from '@/hooks/useEstablishments';

import { CategoryDialog, type ExtendedCategory } from '@/components/dialogs/cartas-categoria-dialog';

interface CategoriasTabProps {
    searchTerm?: string;
}

export function CategoriasTab({ searchTerm = '' }: CategoriasTabProps) {
  const { toast } = useToast();
  const { activeEstablishment } = useEstablishments();
  
  // Obtener los productos del establecimiento
  const products = useQuery(api.products.getProducts, 
    activeEstablishment?.id ? { establishmentId: activeEstablishment.id } : "skip"
  ) || [];
  
  // Obtener categorías para el diálogo establecimiento
  const categories = useQuery(api.categories.getCategories, 
    activeEstablishment?.id ? { establishmentId: activeEstablishment.id } : "skip"
  ) || [];
  
  const createCategory = useMutation(api.categories.createCategory);
  const updateCategoryMutation = useMutation(api.categories.updateCategory);
  const deleteCategoryMutation = useMutation(api.categories.deleteCategory);
  const toggleCategoryStatusMutation = useMutation(api.categories.toggleCategoryStatus);
  const updateProductsCategoryMutation = useMutation(api.products.updateProductsCategory);
  
  // Convert Convex data to frontend format
  const extendedCategories = React.useMemo(() => {
    return categories.map(category => ({
      id: category._id,
      nombre_categoria: category.name,
      descripcion: category.description || '',
      activa: category.active,
      icono: category.icon || 'Utensils',
      color: category.color || 'blue-400',
      bannerImage: category.bannerImage,
      orden: category.order,
      product_count: category.product_count || 0,
      impresora_destino: category.printerDestination || '',
      visible_en_carta: category.visibleInMenu ?? true
    }));
  }, [categories]);

  // Convert products to frontend format for CategoryDialog
  const extendedProducts = React.useMemo(() => {
    return products.map(product => ({
      id: product._id,
      nombre_producto: product.name,
      descripcion_producto: product.description || '',
      precio_venta: product.price / 100,
      id_categoria: product.category_id,
      url_imagen_producto: product.image
    }));
  }, [products]);
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<ExtendedCategory | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  
  // Reset pagination on search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Listen for global event to open add dialog
  React.useEffect(() => {
      const handleOpenAdd = () => handleOpenDialog();
      window.addEventListener('open-add-categorias', handleOpenAdd);
      return () => window.removeEventListener('open-add-categorias', handleOpenAdd);
  }, []);

  // Loading states
  if (!activeEstablishment) {
      return (
          <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Cargando establecimiento...</div>
          </div>
      );
  }

  // Helper functions
  const handleOpenDialog = (category?: ExtendedCategory) => {
    setEditingCategory(category || null);
    setIsDialogOpen(true);
  };

  const handleSaveCategory = async (categoryData: Partial<ExtendedCategory>, assignedProductIds?: string[]) => {
    if (categoryData && activeEstablishment) {
      try {
        let categoryId: string;
        
        if (categoryData.id) {
          // Update existing category
          await updateCategoryMutation({
            categoryId: categoryData.id as Id<'categories'>,
            name: categoryData.nombre_categoria,
            description: categoryData.descripcion,
            icon: categoryData.icono,
            color: categoryData.color,
            bannerImage: categoryData.bannerImage || null,
            active: categoryData.activa ?? true,
            order: categoryData.orden,
            printerDestination: categoryData.impresora_destino,
            visibleInMenu: categoryData.visible_en_carta ?? true
          });
          categoryId = categoryData.id;
          
          toast({
            title: "Categoría Actualizada",
            description: "La categoría ha sido actualizada correctamente."
          });
        } else {
          // Create new category
          categoryId = await createCategory({
            establishmentId: activeEstablishment.id,
            name: categoryData.nombre_categoria!,
            description: categoryData.descripcion,
            icon: categoryData.icono,
            color: categoryData.color,
            bannerImage: categoryData.bannerImage || null,
            active: categoryData.activa ?? true,
            printerDestination: categoryData.impresora_destino,
            visibleInMenu: categoryData.visible_en_carta ?? true
          });
          
          toast({
            title: "Categoría Creada",
            description: "La nueva categoría se ha creado correctamente."
          });
        }
        
        // Update product categories if assignedProductIds is provided
        if (assignedProductIds && assignedProductIds.length > 0) {
          await updateProductsCategoryMutation({
            productIds: assignedProductIds as Id<'products'>[],
            categoryId: categoryId as Id<'categories'>
          });
        }
        
        setIsDialogOpen(false);
        setEditingCategory(null);
      } catch (error) {
        console.error("Error saving category:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo guardar la categoría."
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se puede guardar la categoría sin un establecimiento válido."
      });
    }
  };

  const removeCategory = async (id: string, name: string) => {
    try {
      await deleteCategoryMutation({ categoryId: id as Id<'categories'> });
      toast({
        variant: "destructive",
        title: "Categoría Eliminada",
        description: `La categoría "${name}" ha sido eliminada.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la categoría."
      });
    }
  };

  const toggleCategoryStatus = async (id: string, active: boolean) => {
    try {
      await toggleCategoryStatusMutation({ categoryId: id as Id<'categories'>, active });
      toast({
        title: active ? "Categoría Activada" : "Categoría Desactivada",
        description: `Se ha actualizado el estado de la categoría.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado de la categoría."
      });
    }
  };

  const filteredCategories = extendedCategories.filter(cat =>
    cat.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  return (
    <div className="space-y-6">
        <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead width="80px" align="center">Icono</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Productos</TableHead>
                        <TableHead align="center">Visibilidad</TableHead>
                        <TableHead align="right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentCategories.map((cat) => {
                        const CatIcon = iconMap[cat.icono || 'Utensils'] || Utensils;
                        const isVisible = cat.activa !== false;
                        
                        return (
                            <TableRow key={cat.id}>
                                <TableCell align="center">
                                    <IconBadge 
                                        icon={CatIcon} 
                                        iconColor={cat.color || '#9B6EFD'} 
                                        className="h-10 w-10 rounded-md shadow-sm"
                                        iconClassName="h-5 w-5"
                                    />
                                </TableCell>
                                <TableCell variant="medium">{cat.nombre_categoria}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {cat.product_count || 0}
                                    </Badge>
                                </TableCell>
                                <TableCell align="center">
                                    <Badge variant={isVisible ? "success" : "destructive"}>
                                        {isVisible ? "Activa" : "Inactiva"}
                                    </Badge>
                                </TableCell>
                                <TableCell align="right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button 
                                            variant="secondary" 
                                            size="md" 
                                            onClick={() => handleOpenDialog(cat)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            size="md" 
                                            onClick={() => toggleCategoryStatus(cat.id, !isVisible)}
                                        >
                                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost-destructive" size="md">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Se eliminará la categoría "{cat.nombre_categoria}". Esta acción no se puede deshacer.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className={buttonVariants({ variant: 'outline', size: 'md' })}>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={() => removeCategory(cat.id, cat.nombre_categoria)} 
                                                        className={buttonVariants({ variant: 'destructive', size: 'md' })}
                                                    >
                                                        Eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {currentCategories.length === 0 && (
                <div className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <LayoutGrid className="h-12 w-12 opacity-20" />
                        <p>{searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay categorías disponibles"}</p>
                    </div>
                </div>
            )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4">
                <Button 
                    variant="outline" 
                    size="md" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                </Button>
                <TextSM className="font-medium">
                    Página {currentPage} de {totalPages}
                </TextSM>
                <Button 
                    variant="outline" 
                    size="md" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages}
                >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        )}

        <CategoryDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            category={editingCategory}
            onSave={(id, categoryData, assignedProductIds) => {
                handleSaveCategory(categoryData, assignedProductIds);
            }}
            products={extendedProducts}
            allCategories={extendedCategories}
        />
    </div>
    );
}
