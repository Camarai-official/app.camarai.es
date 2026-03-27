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
import { useEstablishments } from '@/hooks/useEstablishments';
import Image from 'next/image';

import type { Product } from '@/data/mock-data';

import { ProductDialog } from '@/components/dialogs/cartas-producto-dialog';

interface ProductosTabProps {
    searchTerm?: string;
}

export function ProductosTab({ searchTerm = '' }: ProductosTabProps) {
    const { toast } = useToast();
    const { activeEstablishment } = useEstablishments();
    
    // Obtener el establecimiento de Convex usando el ID local
    const convexEstablishment = useQuery(api.establishmentsHelpers.getEstablishmentByLocalId, { 
        localId: activeEstablishment?.id || 'camarai' 
    });
    
    // Obtener los productos del establecimiento
    const products = useQuery(api.products.getProducts, { 
        establishmentId: convexEstablishment?._id
    }) || [];
    
    // Obtener categorías para el diálogo
    const categories = useQuery(api.categories.getCategories, { 
        establishmentId: convexEstablishment?._id
    }) || [];
    
    // Obtener impuestos para el diálogo
    const taxes = useQuery(api.products.getTaxes, { 
        establishmentId: convexEstablishment?._id
    }) || [];
    
    const createProduct = useMutation(api.products.createProduct);
    const updateProductMutation = useMutation(api.products.updateProduct);
    const deleteProductMutation = useMutation(api.products.deleteProduct);
    const toggleProductAvailabilityMutation = useMutation(api.products.toggleProductAvailability);
    const createCategory = useMutation(api.categories.createCategory);
    const updateCategoryMutation = useMutation(api.categories.updateCategory);
    const deleteCategoryMutation = useMutation(api.categories.deleteCategory);
    const toggleCategoryStatusMutation = useMutation(api.categories.toggleCategoryStatus);
    const updateProductsCategoryMutation = useMutation(api.products.updateProductsCategory);
    const ensureDefaultCategoryMutation = useMutation(api.categories.ensureDefaultCategory);
    
    // Convert Convex data to frontend format
    const extendedProducts = React.useMemo(() => {
        return products.map(product => ({
            id: product._id,
            nombre_producto: product.name,
            descripcion_producto: product.description || '',
            precio_venta: product.price / 100,
            id_categoria: product.category_id,
            categoria_nombre: product.category_name || 'Sin categoría',
            id_impuesto: product.tax_id,
            disponible: product.active,
            url_imagen_producto: product.image,
            costo_escandallo_calculado: product.cost / 100,
            net_margin: product.net_margin || 0,
            ingredientes_asociados: [],
            variantes: (product as any).variants || [],
            alergenos: (product as any).allergens || [],
            horario_disponible: (product as any).availability_hours ? {
                inicio: (product as any).availability_hours.start,
                fin: (product as any).availability_hours.end
            } : null,
            stock_minimo: (product as any).stock_minimo || 0,
            impresora_destino: (product as any).impresora_destino || 'caja'
        }));
    }, [products]);
    
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);
    
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

    // Ensure default category exists and get its ID
    const defaultCategoryId = React.useMemo(() => {
        const defaultCat = categories.find(cat => cat.nombre_categoria === "Sin categoría");
        return defaultCat?.id || null;
    }, [categories]);

    // Auto-create default category if it doesn't exist
    React.useEffect(() => {
        if (convexEstablishment && !defaultCategoryId && categories.length > 0) {
            ensureDefaultCategoryMutation({ establishmentId: convexEstablishment._id });
        }
    }, [convexEstablishment, defaultCategoryId, categories.length]);

    // Loading states
    if (convexEstablishment === undefined) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Cargando establecimiento...</div>
            </div>
        );
    }

    if (!convexEstablishment) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">No se encontró el establecimiento</div>
            </div>
        );
    }

    // Helper functions
    const handleOpenDialog = (product?: any) => {
        setEditingProduct(product || null);
        setIsDialogOpen(true);
    };

    const handleSaveProduct = async (productData: any) => {
        if (productData && convexEstablishment) {
            try {
                // Prepare ingredients for API
                const ingredients = productData.ingredientes_asociados?.map((ing: any) => ({
                    ingredientId: ing.id_ingrediente,
                    quantity: ing.cantidad_requerida,
                    unit: ing.unidad_medida
                })) || [];

                // Prepare variants for API
                const variants = productData.variantes?.map((variant: any) => ({
                    id: variant.id,
                    nombre: variant.nombre,
                    precio_extra: variant.precio_extra,
                    disponible: variant.disponible
                })) || [];

                // Prepare allergens for API
                const allergens = productData.alergenos || [];

                // Prepare availability hours for API
                const availabilityHours = productData.horario_disponible ? {
                    start: productData.horario_disponible.inicio,
                    end: productData.horario_disponible.fin
                } : null;

                // Prepare stock and printer for API
                const stockMinimo = productData.stock_minimo || 0;
                const impresoraDestino = productData.impresora_destino || 'caja'; // Default to caja if no printer specified

                if (productData.id) {
                    // Update existing product
                    if (!productData.id_categoria) {
                        // Try to find or create a "Sin categoría" category
                        const defaultCategory = categories.find(cat => cat.nombre_categoria === "Sin categoría");
                        if (!defaultCategory) {
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: "No se encontró una categoría 'Sin categoría'. Por favor, selecciona una categoría o crea una llamada 'Sin categoría'."
                            });
                            return;
                        }
                        productData.id_categoria = defaultCategory.id;
                    }
                    
                    await updateProductMutation({
                        productId: productData.id as Id<'products'>,
                        categoryId: productData.id_categoria as Id<'categories'>,
                        name: productData.nombre_producto,
                        description: productData.descripcion_producto,
                        price: Math.round(productData.precio_venta * 100), // Convert to cents
                        cost: productData.costo_escandallo_calculado ? Math.round(productData.costo_escandallo_calculado * 100) : undefined,
                        taxId: productData.id_impuesto,
                        available: productData.disponible,
                        imageUrl: productData.url_imagen_producto,
                        ingredients: ingredients,
                        variants: variants,
                        allergens: allergens,
                        availabilityHours: availabilityHours,
                        stockMinimo: stockMinimo,
                        impresoraDestino: impresoraDestino
                    });
                    toast({
                        title: "Producto Actualizado",
                        description: "El producto ha sido actualizado correctamente."
                    });
                } else {
                    // Create new product
                    if (!productData.id_categoria) {
                        // Try to find or create a "Sin categoría" category
                        const defaultCategory = categories.find(cat => cat.nombre_categoria === "Sin categoría");
                        if (!defaultCategory) {
                            toast({
                                variant: "destructive",
                                title: "Error",
                                description: "No se encontró una categoría 'Sin categoría'. Por favor, selecciona una categoría o crea una llamada 'Sin categoría'."
                            });
                            return;
                        }
                        productData.id_categoria = defaultCategory.id;
                    }
                    
                    await createProduct({
                        establishmentId: convexEstablishment._id,
                        categoryId: productData.id_categoria as Id<'categories'>,
                        name: productData.nombre_producto!,
                        description: productData.descripcion_producto,
                        price: Math.round(productData.precio_venta * 100), // Convert to cents
                        cost: productData.costo_escandallo_calculado ? Math.round(productData.costo_escandallo_calculado * 100) : undefined,
                        taxId: productData.id_impuesto!,
                        available: productData.disponible ?? true,
                        imageUrl: productData.url_imagen_producto,
                        ingredients: ingredients,
                        variants: variants,
                        allergens: allergens,
                        availabilityHours: availabilityHours,
                        stockMinimo: stockMinimo,
                        impresoraDestino: impresoraDestino
                    });
                    toast({
                        title: "Producto Creado",
                        description: "El nuevo producto se ha creado correctamente."
                    });
                }
                setIsDialogOpen(false);
                setEditingProduct(null);
            } catch (error) {
                console.error("Error saving product:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo guardar el producto."
                });
            }
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se puede guardar el producto sin un establecimiento válido."
            });
        }
    };

    const removeProduct = async (id: string, name: string) => {
        try {
            await deleteProductMutation({ productId: id as Id<'products'> });
            toast({
                variant: "destructive",
                title: "Producto Eliminado",
                description: `El producto "${name}" ha sido eliminado.`
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar el producto."
            });
        }
    };

    const toggleProductAvailability = async (id: string, available: boolean) => {
        try {
            await toggleProductAvailabilityMutation({ productId: id as Id<'products'>, available });
            toast({
                title: available ? "Producto Activado" : "Producto Desactivado",
                description: `Se ha actualizado el estado del producto.`
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo actualizar el estado del producto."
            });
        }
    };

    const getCategoryName = (id: string) => {
        const cat = categories.find(c => c._id === id);
        return cat ? cat.name : 'Sin categoría';
    };

    // Filtering & Pagination
    const filteredProducts = extendedProducts.filter(prod =>
        prod.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(prod.id_categoria).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

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
                            <TableHead>Margen Neto</TableHead>
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
                                <TableCell variant="medium" className="min-w-[140px]">
                                    <span className="line-clamp-2">{prod.nombre_producto}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {getCategoryName(prod.id_categoria)}
                                    </Badge>
                                </TableCell>
                                <TableCell variant="medium">€{prod.precio_venta.toFixed(2)}</TableCell>
                                <TableCell variant="medium">
                                    <span className={`font-medium ${prod.net_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        €{prod.net_margin.toFixed(2)}
                                    </span>
                                </TableCell>
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
                                            onClick={() => toggleProductAvailability(prod.id, !prod.disponible)}
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
                                                        onClick={() => removeProduct(prod.id, prod.nombre_producto)} 
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
                onSave={(productData) => handleSaveProduct(productData)} 
                categories={categories}
                defaultCategoryId={defaultCategoryId}
                taxes={taxes}
                establishmentId={convexEstablishment?._id}
            />
        </div>
    );
}
