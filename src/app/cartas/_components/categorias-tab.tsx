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

import {
  mockCategories,
  mockProducts,
  type Category,
  type Product
} from '@/data/mock-data';

import { CategoryDialog, type ExtendedCategory } from '@/components/dialogs/cartas-categoria-dialog';

interface CategoriasTabProps {
    searchTerm?: string;
}

export function CategoriasTab({ searchTerm = '' }: CategoriasTabProps) {
  const [categories, setCategories] = React.useState<ExtendedCategory[]>(mockCategories as ExtendedCategory[]);
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<ExtendedCategory | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const { toast } = useToast();

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Listen for global event to open add dialog
  React.useEffect(() => {
      const handleOpenAdd = () => handleOpenDialog();
      window.addEventListener('open-add-categorias', handleOpenAdd);
      return () => window.removeEventListener('open-add-categorias', handleOpenAdd);
  }, []);

  // Helper functions
  const addCategory = (categoryData: Partial<ExtendedCategory>) => {
    const newCategory: ExtendedCategory = {
      id: `cat-${Date.now()}`,
      nombre_categoria: categoryData.nombre_categoria || '',
      ...categoryData 
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory.id;
  }

  const updateCategory = (id: string, categoryData: Partial<ExtendedCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...categoryData } : c));
  }

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setProducts(prev => prev.map(p => p.id_categoria === id ? { ...p, id_categoria: '' } : p));
  }

  const toggleVisibility = (id: string, visible: boolean) => {
    updateCategory(id, { visible_en_carta: visible });
    toast({
        title: visible ? "Categoría Visible" : "Categoría Oculta",
        description: `Se ha actualizado la visibilidad de la categoría.`
    });
  };

  const syncProductsWithCategory = (categoryId: string, productIds: string[]) => {
    const productIdsSet = new Set(productIds);
    setProducts(prev => prev.map(p => {
      if (productIdsSet.has(p.id)) {
        return { ...p, id_categoria: categoryId };
      } else if (p.id_categoria === categoryId) {
        return { ...p, id_categoria: '' };
      }
      return p;
    }));
  }

  const filteredCategories = categories.filter(cat =>
    cat.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  const handleOpenDialog = (category?: ExtendedCategory) => {
    setEditingCategory(category || null);
    setIsDialogOpen(true);
  };

  const handleSave = (id: string | null, categoryData: Partial<ExtendedCategory>, assignedProductIds: string[]) => {
    let categoryId = id;
    const isEditing = !!id;

    if (id) {
      updateCategory(id, categoryData);
    } else {
      categoryId = addCategory(categoryData);
    }

    if (!categoryId) return;

    syncProductsWithCategory(categoryId, assignedProductIds);
    toast({
      title: `Categoría ${isEditing ? 'Actualizada' : 'Creada'}`,
      description: `La categoría "${categoryData.nombre_categoria}" ha sido guardada.` 
    });
  };

  const handleRemove = (id: string, name: string) => {
    removeCategory(id);
    toast({
      variant: "destructive",
      title: "Categoría Eliminada",
      description: `La categoría "${name}" ha sido eliminada.` 
    });
  }

  const getProductsInCategoryCount = (categoryId: string) => {
    return (products || []).filter(p => p.id_categoria === categoryId).length;
  }

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
                        const productCount = getProductsInCategoryCount(cat.id);
                        const isVisible = cat.visible_en_carta !== false;
                        
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
                                        {productCount}
                                    </Badge>
                                </TableCell>
                                <TableCell align="center">
                                    <Badge variant={isVisible ? "success" : "destructive"}>
                                        {isVisible ? "Visible" : "Oculta"}
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
                                            onClick={() => toggleVisibility(cat.id, !isVisible)}
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
                                                        Se eliminará la categoría "{cat.nombre_categoria}". Los productos asociados quedarán sin categoría. Esta acción no se puede deshacer.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className={buttonVariants({ variant: 'outline', size: 'md' })}>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={() => handleRemove(cat.id, cat.nombre_categoria)} 
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
            onSave={handleSave}
            products={products}
            allCategories={categories}
        />
    </div>
    );
}
