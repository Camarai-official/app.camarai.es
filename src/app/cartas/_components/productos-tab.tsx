'use client';

import * as React from 'react';
import { 
    PlusCircle, 
    Edit, 
    Trash, 
    ChevronLeft, 
    ChevronRight, 
    Package,
    Eye,
    EyeOff
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
import { 
    Dialog, 
    DialogWindow, 
    DialogContent, 
    DialogFooter, 
    DialogHeader 
} from '@/components/layout/dialog';
import { Badge } from '@/components/ui/badge';
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
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

import {
    mockProducts,
    mockCategories,
    type Product,
} from '@/data/mock-data';

import { ProductDialog } from '@/components/dialogs/cartas-producto-dialog';

interface ProductosTabProps {
    searchTerm?: string;
}

export function ProductosTab({ searchTerm = '' }: ProductosTabProps) {
    const [products, setProducts] = React.useState<Product[]>(mockProducts);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);
    const { toast } = useToast();

    // Reset pagination on search
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Listen for global event to open add dialog
    React.useEffect(() => {
        const handleOpenAdd = () => handleOpenDialog();
        window.addEventListener('open-add-productos', handleOpenAdd);
        return () => window.removeEventListener('open-add-productos', handleOpenAdd);
    }, []);

    // Handlers
    const addProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = { ...productData, id: `prod-${Date.now()}` };
        setProducts(prev => [...prev, newProduct]);
    };

    const updateProduct = (id: string, productData: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
    };

    const removeProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const toggleAvailability = (id: string, available: boolean) => {
        updateProduct(id, { disponible: available });
        toast({
            title: available ? "Producto Visible" : "Producto Oculto",
            description: `El estado de visibilidad ha sido actualizado.`
        });
    };

    const getCategoryName = (id: string) => {
        const cat = mockCategories.find(c => c.id === id);
        return cat ? cat.nombre_categoria : undefined;
    };

    // Filtering & Pagination
    const filteredProducts = products.filter(prod =>
        prod.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(prod.id_categoria)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

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
            description: `El producto "${productData.nombre_producto}" ha sido guardado correctamente.`
        });
    };

    const handleRemove = (id: string, name: string) => {
        removeProduct(id);
        toast({
            variant: "destructive",
            title: "Producto Eliminado",
            description: `El producto "${name}" ha sido eliminado exitosamente.`
        });
    }

    return (
        <div className="space-y-6">
            <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead width="80px" align="center">Imagen</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead align="center">Estado</TableHead>
                            <TableHead align="right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentProducts.map((prod) => (
                            <TableRow key={prod.id}>
                                <TableCell align="center">
                                    <div className="relative h-10 w-10 mx-auto rounded-md overflow-hidden bg-muted">
                                        {prod.url_imagen_producto ? (
                                            <Image 
                                                src={prod.url_imagen_producto} 
                                                alt={prod.nombre_producto} 
                                                fill
                                                className="object-cover" 
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full">
                                                <Package className="h-5 w-5 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell variant="medium">{prod.nombre_producto}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {getCategoryName(prod.id_categoria) || 'Sin categoría'}
                                    </Badge>
                                </TableCell>
                                <TableCell variant="medium">€{prod.precio_venta.toFixed(2)}</TableCell>
                                <TableCell align="center">
                                    <Badge variant={prod.disponible ? "success" : "destructive"}>
                                        {prod.disponible ? "Disponible" : "Agotado"}
                                    </Badge>
                                </TableCell>
                                <TableCell align="right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button 
                                            variant="secondary" 
                                            size="md" 
                                            onClick={() => handleOpenDialog(prod)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            size="md" 
                                            onClick={() => toggleAvailability(prod.id, !prod.disponible)}
                                        >
                                            {prod.disponible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost-destructive" size="md">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Se eliminará "{prod.nombre_producto}" permanentemente de todas las cartas. Esta acción no se puede deshacer.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className={buttonVariants({ variant: 'outline', size: 'md' })}>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={() => handleRemove(prod.id, prod.nombre_producto)} 
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
                        ))}
                    </TableBody>
                </Table>

                {currentProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Package className="h-12 w-12 opacity-20" />
                            <p>{searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay productos disponibles"}</p>
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

            <ProductDialog 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen} 
                productToEdit={editingProduct} 
                onSave={handleSave} 
            />
        </div>
    );
}
