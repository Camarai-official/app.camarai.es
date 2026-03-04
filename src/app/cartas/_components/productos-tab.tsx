'use client';
import { H3 } from '@/components/ui/typography';


import * as React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import {
    Dialog,
    DialogWindow,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogClose } from '@/components/layout/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploader } from '@/components/ui/image-uploader';
import {
    mockProducts,
    mockCategories,
    mockTaxes,
    mockIngredients,
    type Product,
    type Ingredient,
    type AssociatedIngredient
} from '@/data/mock-data';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger } from '@/components/dialogs/global-alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';


import { ProductDialog } from '@/components/dialogs/inventario-product-dialog';


export function ProductosTab() {
    const [products, setProducts] = React.useState<Product[]>(mockProducts);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(12);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Local helpers replacing useAppData functions
    const addProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...productData,
            id: `prod-${Date.now()}` };
        setProducts(prev => [...prev, newProduct]);
    };

    const updateProduct = (id: string, productData: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
    };

    const removeProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const getCategoryName = (id: string) => {
        const cat = mockCategories.find(c => c.id === id);
        return cat ? cat.nombre_categoria : undefined;
    };

    const getTaxName = (id: string) => {
        const tax = mockTaxes.find(t => t.id === id);
        return tax ? tax.nombre_impuesto : undefined;
    };


    const filteredProducts = products.filter(prod =>
        prod.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

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

    const handleOpenDialog = (product?: Product) => {
        setEditingProduct(product || null);
        setIsDialogOpen(true);
    };

    const handleSave = (productData: Omit<Product, 'id'> | Product) => {
        const isEditing = 'id' in productData;
        if (isEditing) {
            updateProduct(productData.id, productData);
        } else {
            addProduct(productData as Omit<Product, 'id'>);
        }
        toast({
            title: `Producto ${isEditing ? 'Actualizado' : 'Creado'}`,
            description: `El producto "${productData.nombre_producto}" ha sido guardado.` });
    };

    const handleRemove = (id: string, name: string) => {
        removeProduct(id);
        toast({
            variant: "destructive",
            title: "Producto Eliminado",
            description: `El producto "${name}" ha sido eliminado.` });
    }

    return (
        <div className="space-y-6">
                <Card className="min-h-[70vh]">
                    <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <SearchInput 
                            containerClassName="md:w-1/3"
                            placeholder="Buscar producto..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                        />
                        <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Producto
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="hidden md:table-cell">Categoría</TableHead>
                                        <TableHead className="text-center">Precio Venta</TableHead>
                                        <TableHead className="hidden lg:table-cell text-center">Costo Escandallo</TableHead>
                                        <TableHead className="hidden lg:table-cell text-center">Margen</TableHead>
                                        <TableHead className="hidden xl:table-cell text-center">Impuesto</TableHead>
                                        <TableHead className="hidden md:table-cell text-center">Disponible</TableHead>
                                        <TableHead className="text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody
                                    key={currentPage}
                                    className={cn('transition-opacity duration-300', isAnimating ? 'opacity-0' : 'opacity-100')}
                                >
                                    {currentProducts.length > 0 ? currentProducts.map((prod) => (
                                        <TableRow key={prod.id}>
                                            <TableCell className="font-medium flex items-center gap-3 py-3">
                                                {prod.url_imagen_producto ? (
                                                    <Image 
                                                        src={prod.url_imagen_producto} 
                                                        alt={prod.nombre_producto} 
                                                        width={40} 
                                                        height={40} 
                                                        className="rounded-lg object-cover bg-muted" 
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-dashed">
                                                        <Package className="h-5 w-5 opacity-40" />
                                                    </div>
                                                )}
                                                {prod.nombre_producto}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant={'secondary'}>
                                                    {getCategoryName(prod.id_categoria) || 'Sin categoría'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-medium whitespace-nowrap">€{prod.precio_venta.toFixed(2)}</TableCell>
                                            <TableCell className="hidden lg:table-cell text-center">€{(prod.costo_escandallo_calculado || 0).toFixed(2)}</TableCell>
                                            <TableCell className="hidden lg:table-cell text-center">€{(prod.margen_beneficio || 0).toFixed(2)}</TableCell>
                                            <TableCell className="hidden xl:table-cell text-center">{getTaxName(prod.id_impuesto) || 'N/A'}</TableCell>
                                            <TableCell className="hidden md:table-cell text-center">
                                                <Badge variant={prod.disponible ? 'default' : 'destructive'}>
                                                    {prod.disponible ? 'Sí' : 'No'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="md" startIcon={<MoreHorizontal />} />
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(prod)}>
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
                                                                Esta acción no se puede deshacer. Se eliminará el producto de tu librería y de todas las cartas en las que aparezca.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleRemove(prod.id, prod.nombre_producto)} className={buttonVariants({ variant: 'destructive' })}>Eliminar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                {searchTerm ? 'No se encontraron productos.' : 'No has creado ningún producto todavía.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6">
                        <div className="text-xs text-muted-foreground order-2 sm:order-1">
                            Mostrando <strong>{Math.min(indexOfFirstItem + 1, filteredProducts.length)}-{Math.min(indexOfLastItem, filteredProducts.length)}</strong> de <strong>{filteredProducts.length}</strong> productos.
                        </div>
                        <div className="flex justify-center sm:justify-end items-center gap-2 order-1 sm:order-2">
                            <Button variant="outline" size="md" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                                <ChevronLeft />
                            </Button>
                            <div className="flex gap-1">
                                {pageNumbers.map(number => (
                                    <Button
                                        key={number}
                                        variant={currentPage === number ? "default" : "outline"}
                                        size="md"
                                        className={cn(
                                            // Hide most page numbers on small mobile
                                            number !== currentPage && number !== 1 && number !== totalPages && "hidden xs:flex"
                                        )}
                                        onClick={() => paginate(number)}
                                    >
                                        {number}
                                    </Button>
                                ))}
                            </div>
                            <Button variant="outline" size="md" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                                <ChevronRight />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            <ProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} productToEdit={editingProduct} onSave={handleSave} />
        </div>
    );
}


