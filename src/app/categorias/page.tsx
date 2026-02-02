
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Search, X, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
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

// Extended category type
interface ExtendedCategory extends Category {
  descripcion?: string;
  icono?: string;
  color?: string;
  imagen?: string;
  orden?: number;
  categoria_padre_id?: string;
  visible_en_carta?: boolean;
  impresora_destino?: string;
}

function CategoryDialog({
  isOpen,
  onOpenChange,
  category,
  onSave,
  products,
  allCategories
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  category: ExtendedCategory | null;
  onSave: (id: string | null, categoryData: Partial<ExtendedCategory>, assignedProductIds: string[]) => void;
  products: Product[];
  allCategories: ExtendedCategory[];
}) {
  const [categoryData, setCategoryData] = React.useState<Partial<ExtendedCategory>>({
    nombre_categoria: '',
    descripcion: '',
    icono: 'Utensils',
    color: '#9B6EFD',
    imagen: '',
    orden: 0,
    categoria_padre_id: '',
    visible_en_carta: true,
    impresora_destino: '',
  });
  const [assignedProducts, setAssignedProducts] = React.useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('general');

  React.useEffect(() => {
    if (category) {
      setCategoryData({
        nombre_categoria: category.nombre_categoria,
        descripcion: category.descripcion || '',
        icono: category.icono || 'Utensils',
        color: category.color || '#9B6EFD',
        imagen: category.imagen || '',
        orden: category.orden || 0,
        categoria_padre_id: category.categoria_padre_id || '',
        visible_en_carta: category.visible_en_carta !== false,
        impresora_destino: category.impresora_destino || '',
      });
      const currentProducts = (products || []).filter(p => p.id_categoria === category.id);
      setAssignedProducts(currentProducts);
    } else {
      setCategoryData({
        nombre_categoria: '',
        descripcion: '',
        icono: 'Utensils',
        color: '#9B6EFD',
        imagen: '',
        orden: allCategories.length,
        categoria_padre_id: '',
        visible_en_carta: true,
        impresora_destino: '',
      });
      setAssignedProducts([]);
    }
    setSearchTerm('');
    setActiveTab('general');
  }, [category, isOpen, products, allCategories]);

  const handleSaveClick = () => {
    onSave(category?.id || null, categoryData, assignedProducts.map(p => p.id));
    onOpenChange(false);
  };

  const unassignedProducts = React.useMemo(() => {
    const assignedIds = new Set(assignedProducts.map(p => p.id));
    return (products || []).filter(p =>
      !assignedIds.has(p.id) &&
      p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, assignedProducts, searchTerm]);

  const handleSelectProduct = (product: Product) => {
    setAssignedProducts(prev => [...prev, product]);
    setSearchTerm('');
    setIsSearchPopoverOpen(false);
  }

  const handleRemoveProduct = (productId: string) => {
    setAssignedProducts(prev => prev.filter(p => p.id !== productId));
  }

  // Get parent category options (exclude self and children)
  const parentCategoryOptions = React.useMemo(() => {
    if (!category) return allCategories;
    return allCategories.filter(c => c.id !== category.id && c.categoria_padre_id !== category.id);
  }, [allCategories, category]);

  const SelectedIcon = iconMap[categoryData.icono || 'Utensils'] || iconMap['Utensils'];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {categoryData.icono && (
              <div
                className="h-8 w-8 rounded-md flex items-center justify-center"
                style={{ backgroundColor: categoryData.color || '#9B6EFD' }}
              >
                <SelectedIcon className="h-4 w-4 text-white" />
              </div>
            )}
            {category ? 'Editar' : 'Crear'} Categoría
          </DialogTitle>
          <DialogDescription>
            Configura los detalles de la categoría y gestiona los productos asignados.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
            <TabsTrigger value="productos">Productos</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 pr-4">
            {/* Tab General */}
            <TabsContent value="general" className="space-y-6 mt-0">
              <div className="space-y-2">
                <Label htmlFor="nombre_categoria">Nombre de la Categoría *</Label>
                <Input
                  id="nombre_categoria"
                  value={categoryData.nombre_categoria}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, nombre_categoria: e.target.value }))}
                  placeholder="Ej: Entrantes, Postres, Vinos..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={categoryData.descripcion}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción opcional de la categoría..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría Padre (Jerarquía)</Label>
                  <Select
                    value={categoryData.categoria_padre_id || 'none'}
                    onValueChange={(v) => setCategoryData(prev => ({ ...prev, categoria_padre_id: v === 'none' ? '' : v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Sin categoría padre" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría padre</SelectItem>
                      {parentCategoryOptions.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nombre_categoria}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Para crear subcategorías.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orden">Orden de Visualización</Label>
                  <Input
                    id="orden"
                    type="number"
                    value={categoryData.orden}
                    onChange={(e) => setCategoryData(prev => ({ ...prev, orden: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-muted-foreground">Menor número = aparece antes.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Impresora de Destino (KDS)</Label>
                  <Select
                    value={categoryData.impresora_destino || 'none'}
                    onValueChange={(v) => setCategoryData(prev => ({ ...prev, impresora_destino: v === 'none' ? '' : v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Sin impresora específica" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin impresora específica</SelectItem>
                      <SelectItem value="cocina">Cocina</SelectItem>
                      <SelectItem value="barra">Barra</SelectItem>
                      <SelectItem value="postres">Postres</SelectItem>
                      <SelectItem value="caja">Caja</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Impresora para productos de esta categoría.</p>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Visible en Carta</Label>
                    <p className="text-xs text-muted-foreground">Mostrar esta categoría en las cartas</p>
                  </div>
                  <Switch
                    checked={categoryData.visible_en_carta}
                    onCheckedChange={(checked) => setCategoryData(prev => ({ ...prev, visible_en_carta: checked }))}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab Apariencia */}
            <TabsContent value="apariencia" className="space-y-6 mt-0">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <IconPicker
                    value={categoryData.icono || 'Utensils'}
                    onChange={(icon) => setCategoryData(prev => ({ ...prev, icono: icon }))}
                    label="Icono de la Categoría"
                  />
                  <ColorPicker
                    value={categoryData.color || '#9B6EFD'}
                    onChange={(color) => setCategoryData(prev => ({ ...prev, color: color }))}
                    label="Color de la Categoría"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Imagen de Categoría (opcional)</Label>
                  <ImageUploader
                    value={categoryData.imagen}
                    onChange={(img) => setCategoryData(prev => ({ ...prev, imagen: img }))}
                    placeholder="Subir imagen"
                    aspectRatio="16:9"
                  />
                </div>
              </div>

              {/* Preview */}
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                    <div
                      className="h-10 w-10 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: categoryData.color || '#9B6EFD' }}
                    >
                      <SelectedIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{categoryData.nombre_categoria || 'Nombre de categoría'}</p>
                      <p className="text-xs text-muted-foreground">{categoryData.descripcion || 'Descripción de la categoría'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Productos */}
            <TabsContent value="productos" className="space-y-6 mt-0">
              <div className="space-y-4">
                <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar productos para añadir..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          if (e.target.value.length > 0) setIsSearchPopoverOpen(true);
                          else setIsSearchPopoverOpen(false);
                        }}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandList>
                        {unassignedProducts.length === 0 ? (
                          <CommandEmpty>No se encontraron productos.</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {unassignedProducts.map(p => (
                              <CommandItem
                                key={p.id}
                                value={p.nombre_producto}
                                onSelect={() => handleSelectProduct(p)}
                              >
                                {p.nombre_producto}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className='text-base'>Productos Asignados ({assignedProducts.length})</CardTitle>
                    <CardDescription>Productos que pertenecen a esta categoría.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-52">
                      <div className="space-y-2 pr-4">
                        {assignedProducts.length > 0 ? assignedProducts.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2 border rounded-lg bg-background text-sm">
                            <div className='flex items-center gap-2'>
                              <Image src={p.url_imagen_producto} alt={p.nombre_producto} width={32} height={32} className="rounded-sm" data-ai-hint="product image" />
                              <span>{p.nombre_producto}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveProduct(p.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )) : (
                          <div className="text-center text-sm text-muted-foreground py-10">
                            <p>Aún no hay productos en esta categoría.</p>
                            <p className="text-xs mt-1">Busca productos arriba para añadirlos.</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className='pt-4 border-t'>
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSaveClick}>Guardar Categoría</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriasPage() {
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
      ...categoryData,
    };
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
      description: `La categoría "${categoryData.nombre_categoria}" ha sido guardada correctamente.`,
    });
  };

  const handleRemove = (id: string, name: string) => {
    removeCategory(id);
    toast({
      variant: "destructive",
      title: "Categoría Eliminada",
      description: `La categoría "${name}" ha sido eliminada.`,
    });
  }

  const getProductsInCategoryCount = (categoryId: string) => {
    return (products || []).filter(p => p.id_categoria === categoryId).length;
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="p-4 md:p-6">
        <PageHeader title="Librería de Categorías" />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <Card className="min-h-[70vh]">
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar categoría..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nueva Categoría
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Categoría</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
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
                          <CatIcon className="h-4 w-4 text-white" />
                        </div>
                        <span>{cat.nombre_categoria}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getProductsInCategoryCount(cat.id)} productos</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleOpenDialog(cat)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
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
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Mostrando <strong>{Math.min(indexOfFirstItem + 1, filteredCategories.length)}-{Math.min(indexOfLastItem, filteredCategories.length)}</strong> de <strong>{filteredCategories.length}</strong> categorías.
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


