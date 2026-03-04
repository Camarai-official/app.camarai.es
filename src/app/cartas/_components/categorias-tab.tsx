'use client';
import { H3 } from '@/components/ui/typography';


import * as React from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash, X, ChevronLeft, ChevronRight, Printer, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogClose, DialogWindow } from '@/components/layout/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/dialogs/global-alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { SearchInput } from '@/components/ui/search-input';
import { PageContainer } from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker, iconMap } from '@/components/ui/icon-picker';
import { ImageUploader } from '@/components/ui/image-uploader';
import {
  mockCategories,
  mockProducts,
  type Category,
  type Product
} from '@/data/mock-data';

import { CategoryDialog, type ExtendedCategory } from '@/components/dialogs/inventario-category-dialog';

export function CategoriasTab() {
  const [categories, setCategories] = React.useState<ExtendedCategory[]>(mockCategories as ExtendedCategory[]);
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<ExtendedCategory | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(12);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Helper functions
  const addCategory = (categoryData: Partial<ExtendedCategory>) => {
    const newCategory: ExtendedCategory = {
      id: `cat-${Date.now()}`,
      nombre_categoria: categoryData.nombre_categoria || '',
      ...categoryData };
    setCategories(prev => [...prev, newCategory]);
    return newCategory.id;
  }

  const updateCategory = (id: string, categoryData: Partial<ExtendedCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...categoryData } : c));
  }

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    // Also unassign products
    setProducts(prev => prev.map(p => p.id_categoria === id ? { ...p, id_categoria: '' } : p));
  }

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
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

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

  const handleOpenDialog = (category?: ExtendedCategory) => {
    setEditingCategory(category || null);
    setIsDialogOpen(true);
  };

  const handleSave = (id: string | null, categoryData: Partial<ExtendedCategory>, assignedProductIds: string[]) => {
    let categoryId = id;
    const isEditing = !!id;

    if (id) { // Editing existing category
      updateCategory(id, categoryData);
    } else { // Creating new category
      categoryId = addCategory(categoryData);
    }

    if (!categoryId) return;

    syncProductsWithCategory(categoryId, assignedProductIds);
    toast({
      title: `Categoría ${isEditing ? 'Actualizada' : 'Creada'}`,
      description: `La categoría "${categoryData.nombre_categoria}" ha sido guardada correctamente.` });
  };

  const handleRemove = (id: string, name: string) => {
    removeCategory(id);
    toast({
      variant: "destructive",
      title: "Categoría Eliminada",
      description: `La categoría "${name}" ha sido eliminada.` });
  }

  const getProductsInCategoryCount = (categoryId: string) => {
    return (products || []).filter(p => p.id_categoria === categoryId).length;
  }

  return (
    <div className="space-y-6">
        <Card className="min-h-[70vh]">
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
            <SearchInput 
              containerClassName="md:w-1/3"
              placeholder="Buscar categoría..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
            <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nueva Categoría
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Categoría</TableHead>
                    <TableHead className="text-center">Productos</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody
                  key={currentPage}
                  className={cn('transition-opacity duration-300', isAnimating ? 'opacity-0' : 'opacity-100')}
                >
                  {currentCategories.length > 0 ? currentCategories.map((cat) => {
                    const CatIcon = iconMap[cat.icono || 'Utensils'] || iconMap['Utensils'];
                    return (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: cat.color || '#9B6EFD' }}
                          >
                            <CatIcon className="h-4 w-4 text-foreground" />
                          </div>
                          <span>{cat.nombre_categoria}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{getProductsInCategoryCount(cat.id)} productos</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="md" startIcon={<MoreHorizontal />} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleOpenDialog(cat)}>
                                <Edit />
                                Editar
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem>
                                  <Trash />
                                  Eliminar
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará la categoría permanentemente. Los productos en las cartas que usen esta categoría quedarán sin categorizar.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemove(cat.id, cat.nombre_categoria)} className={buttonVariants({ variant: 'destructive' })}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        {searchTerm ? 'No se encontraron categorías.' : 'No has creado ninguna categoría todavía.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{Math.min(indexOfFirstItem + 1, filteredCategories.length)}-{Math.min(indexOfLastItem, filteredCategories.length)}</strong> de <strong>{filteredCategories.length}</strong> categorías.
            </div>
            <div className="flex justify-end items-center gap-2">
              <Button variant="outline" size="md" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft />
              </Button>
              {pageNumbers.map(number => (
                <Button
                  key={number}
                  variant={currentPage === number ? "default" : "outline"}
                  size="md"
                  onClick={() => paginate(number)}
                >
                  {number}
                </Button>
              ))}
              <Button variant="outline" size="md" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                <ChevronRight />
              </Button>
            </div>
          </CardFooter>
        </Card>
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



