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
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose } from '@/components/ui/dialog';
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
    AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { PageContent } from '@/components/layout/page-content';


// Extended Product type with new fields
interface ExtendedProduct extends Omit<Product, 'id'> {
    id?: string;
    // Variants
    variantes: ProductVariant[];
    // Availability
    horario_disponible: { inicio: string; fin: string } | null;
    alergenos: string[];
    stock_minimo: number;
    impresora_destino: string;
}

interface ProductVariant {
    id: string;
    nombre: string;
    precio_extra: number;
    disponible: boolean;
}

const emptyExtendedProduct: ExtendedProduct = {
    nombre_producto: '',
    descripcion_producto: '',
    precio_venta: 0,
    id_categoria: '',
    id_impuesto: '',
    disponible: true,
    url_imagen_producto: 'https://placehold.co/128x128.png',
    ingredientes_asociados: [],
    costo_escandallo_calculado: 0,
    margen_beneficio: 0,
    variantes: [],
    horario_disponible: null,
    alergenos: [],
    stock_minimo: 0,
    impresora_destino: '' };

const alergenosList = [
    'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 'Soja',
    'Lácteos', 'Frutos secos', 'Apio', 'Mostaza', 'Sésamo', 'Sulfitos', 'Moluscos', 'Altramuces'
];

function ProductDialog({ open, onOpenChange, productToEdit, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, productToEdit: Product | null, onSave: (productData: Omit<Product, 'id'> | Product) => void }) {
    // Using mock data directly
    const categories = mockCategories;
    const taxes = mockTaxes;
    const ingredients = mockIngredients;

    const [product, setProduct] = React.useState<ExtendedProduct>(emptyExtendedProduct);
    const [activeTab, setActiveTab] = React.useState('general');

    // State for ingredient search
    const [ingredientSearch, setIngredientSearch] = React.useState('');
    const [searchSuggestions, setSearchSuggestions] = React.useState<Ingredient[]>([]);
    const [isSearchPopoverOpen, setIsSearchPopoverOpen] = React.useState(false);

    // State for new variant
    const [newVariantName, setNewVariantName] = React.useState('');
    const [newVariantPrice, setNewVariantPrice] = React.useState(0);


    const costEscandallo = React.useMemo(() => {
        return product.ingredientes_asociados.reduce((acc, assocIng) => {
            const ingredientDetails = ingredients.find(i => i.id === assocIng.id_ingrediente);
            if (ingredientDetails) {
                return acc + (ingredientDetails.costo_unitario * assocIng.cantidad_requerida);
            }
            return acc;
        }, 0);
    }, [product.ingredientes_asociados, ingredients]);

    const marginBeneficio = product.precio_venta - costEscandallo;
    const marginPercent = product.precio_venta > 0 ? ((marginBeneficio / product.precio_venta) * 100) : 0;


    React.useEffect(() => {
        if (productToEdit) {
            setProduct({
                ...emptyExtendedProduct,
                ...productToEdit,
                variantes: (productToEdit as any).variantes || [],
                horario_disponible: (productToEdit as any).horario_disponible || null,
                alergenos: (productToEdit as any).alergenos || [],
                stock_minimo: (productToEdit as any).stock_minimo || 0,
                impresora_destino: (productToEdit as any).impresora_destino || '' });
        } else {
            // Set default category and tax if available
            const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
            const defaultTaxId = taxes.length > 0 ? taxes[0].id : '';
            setProduct({ ...emptyExtendedProduct, id_categoria: defaultCategoryId, id_impuesto: defaultTaxId });
        }
        setActiveTab('general');
    }, [productToEdit, open, categories, taxes]);

    React.useEffect(() => {
        if (ingredientSearch.length > 1) {
            const existingIds = new Set(product.ingredientes_asociados.map(i => i.id_ingrediente));
            const filtered = ingredients.filter(ing =>
                ing.nombre_ingrediente.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
                !existingIds.has(ing.id)
            );
            setSearchSuggestions(filtered);
            if (filtered.length > 0) {
                setIsSearchPopoverOpen(true);
            }
        } else {
            setSearchSuggestions([]);
            setIsSearchPopoverOpen(false);
        }
    }, [ingredientSearch, ingredients, product.ingredientes_asociados]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setProduct(prev => ({ ...prev, [id]: value }));
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProduct(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
    }

    const handleSwitchChange = (checked: boolean) => {
        setProduct(prev => ({ ...prev, disponible: checked }));
    }

    const handleImageChange = (imageUrl: string | undefined) => {
        setProduct(prev => ({ ...prev, url_imagen_producto: imageUrl || 'https://placehold.co/128x128.png' }));
    };

    const handleSaveClick = () => {
        const productToSave = {
            ...product,
            costo_escandallo_calculado: costEscandallo,
            margen_beneficio: marginBeneficio };
        if (productToEdit) {
            onSave({ ...productToSave, id: productToEdit.id } as Product);
        } else {
            onSave(productToSave as Omit<Product, 'id'>);
        }
        onOpenChange(false);
    }

    const handleAddIngredient = (ingredient: Ingredient) => {
        const newAssociatedIngredient: AssociatedIngredient = {
            id_ingrediente: ingredient.id,
            cantidad_requerida: 1, // Default quantity
            unidad_medida: ingredient.unidad_medida };

        setProduct(prev => ({
            ...prev,
            ingredientes_asociados: [...prev.ingredientes_asociados, newAssociatedIngredient]
        }));

        setIngredientSearch('');
        setSearchSuggestions([]);
        setIsSearchPopoverOpen(false);
    };

    const handleRemoveIngredient = (ingredientIdToRemove: string) => {
        setProduct(prev => ({
            ...prev,
            ingredientes_asociados: prev.ingredientes_asociados.filter(i => i.id_ingrediente !== ingredientIdToRemove)
        }));
    };

    const handleIngredientQuantityChange = (ingredientId: string, quantity: number) => {
        setProduct(prev => ({
            ...prev,
            ingredientes_asociados: prev.ingredientes_asociados.map(ing =>
                ing.id_ingrediente === ingredientId ? { ...ing, cantidad_requerida: quantity } : ing
            )
        }));
    };

    const handleAddVariant = () => {
        if (!newVariantName.trim()) return;
        const newVariant: ProductVariant = {
            id: `var-${Date.now()}`,
            nombre: newVariantName,
            precio_extra: newVariantPrice,
            disponible: true };
        setProduct(prev => ({
            ...prev,
            variantes: [...prev.variantes, newVariant]
        }));
        setNewVariantName('');
        setNewVariantPrice(0);
    };

    const handleRemoveVariant = (variantId: string) => {
        setProduct(prev => ({
            ...prev,
            variantes: prev.variantes.filter(v => v.id !== variantId)
        }));
    };

    const handleToggleVariant = (variantId: string) => {
        setProduct(prev => ({
            ...prev,
            variantes: prev.variantes.map(v =>
                v.id === variantId ? { ...v, disponible: !v.disponible } : v
            )
        }));
    };

    const handleToggleAlergeno = (alergeno: string) => {
        setProduct(prev => ({
            ...prev,
            alergenos: prev.alergenos.includes(alergeno)
                ? prev.alergenos.filter(a => a !== alergeno)
                : [...prev.alergenos, alergeno]
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle icon={PlusCircle}>{productToEdit ? 'Editar' : 'Crear'} Producto</DialogTitle>
                    <DialogDescription>Rellena los detalles. Los productos se añadirán a tu librería global para usarlos en las cartas.</DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                        <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-5 p-1">
                            <TabsTrigger value="general" className="px-4 sm:px-0">General</TabsTrigger>
                            <TabsTrigger value="precios" className="px-4 sm:px-0">Precios</TabsTrigger>
                            <TabsTrigger value="receta" className="px-4 sm:px-0">Receta</TabsTrigger>
                            <TabsTrigger value="variantes" className="px-4 sm:px-0">Variantes</TabsTrigger>
                            <TabsTrigger value="disponibilidad" className="px-4 sm:px-0">Disponibilidad</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="h-[50vh] mt-4 pr-4">
                        {/* Tab General */}
                        <TabsContent value="general" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <ImageUploader
                                        value={product.url_imagen_producto}
                                        onChange={handleImageChange}
                                        placeholder="Subir imagen del producto"
                                        aspectRatio="square"
                                        className="max-w-[200px] mx-auto"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre_producto">Nombre del Producto *</Label>
                                        <Input id="nombre_producto" value={product.nombre_producto} onChange={handleInputChange} placeholder="Ej: Hamburguesa Clásica" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="id_categoria">Categoría *</Label>
                                        <Select value={product.id_categoria} onValueChange={(value) => setProduct(prev => ({ ...prev, id_categoria: value }))}>
                                            <SelectTrigger><SelectValue placeholder="Selecciona una categoría..." /></SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre_categoria}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="descripcion_producto">Descripción</Label>
                                <Textarea id="descripcion_producto" value={product.descripcion_producto} onChange={handleInputChange} placeholder="Describe el producto, ingredientes principales, preparación..." rows={3} />
                            </div>
                        </TabsContent>

                        {/* Tab Precios */}
                        <TabsContent value="precios" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="precio_venta">Precio de Venta (€) *</Label>
                                    <Input id="precio_venta" type="number" value={product.precio_venta} onChange={handleNumberChange} step="0.01" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="id_impuesto">Impuesto Aplicable</Label>
                                    <Select value={product.id_impuesto} onValueChange={(value) => setProduct(prev => ({ ...prev, id_impuesto: value }))}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona un impuesto..." /></SelectTrigger>
                                        <SelectContent>
                                            {taxes.map(tax => (
                                                <SelectItem key={tax.id} value={tax.id}>{tax.nombre_impuesto}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Card>
                                <CardHeader className="pb-2">
                                    <H3 className="text-base">Rentabilidad (Calculada)</H3>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Precio de Venta:</span>
                                        <span className="font-medium">€{product.precio_venta.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Coste de Escandallo:</span>
                                        <span className="font-medium text-destructive">-€{costEscandallo.toFixed(2)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-base font-bold">
                                        <span>Margen Bruto:</span>
                                        <span className={marginBeneficio >= 0 ? 'text-green-600' : 'text-destructive'}>
                                            €{marginBeneficio.toFixed(2)} ({marginPercent.toFixed(1)}%)
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab Receta */}
                        <TabsContent value="receta" className="space-y-6 mt-0">
                            <Card className="bg-muted/50">
                                <CardHeader className="pb-2">
                                    <H3 className="text-base">Receta / Escandallo</H3>
                                    <CardDescription>Añade los ingredientes necesarios para preparar este producto.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <SearchInput
                                                placeholder="Buscar ingrediente para añadir..."
                                                value={ingredientSearch}
                                                onChange={(e) => setIngredientSearch(e.target.value)}
                                            />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandList>
                                                    {searchSuggestions.length === 0 && ingredientSearch.length > 1 ? (
                                                        <CommandEmpty>No se encontraron ingredientes.</CommandEmpty>
                                                    ) : (
                                                        <CommandGroup>
                                                            {searchSuggestions.map(ing => (
                                                                <CommandItem
                                                                    key={ing.id}
                                                                    value={ing.nombre_ingrediente}
                                                                    onSelect={() => handleAddIngredient(ing)}
                                                                >
                                                                    <span>{ing.nombre_ingrediente}</span>
                                                                    <span className="ml-auto text-xs text-muted-foreground">€{ing.costo_unitario.toFixed(2)}/{ing.unidad_medida}</span>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    )}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    <div className="space-y-2">
                                        {product.ingredientes_asociados.map(assocIng => {
                                            const ingredientInfo = ingredients.find(i => i.id === assocIng.id_ingrediente);
                                            const subtotal = ingredientInfo ? ingredientInfo.costo_unitario * assocIng.cantidad_requerida : 0;
                                            return (
                                                <div key={assocIng.id_ingrediente} className="flex items-center justify-between p-2 border rounded-md bg-background text-sm gap-2">
                                                    <p className="font-medium flex-1 truncate">{ingredientInfo?.nombre_ingrediente || 'Ingrediente no encontrado'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            className="h-8 w-20 text-right"
                                                            value={assocIng.cantidad_requerida}
                                                            onChange={(e) => handleIngredientQuantityChange(assocIng.id_ingrediente, parseFloat(e.target.value) || 0)}
                                                            step="0.01"
                                                        />
                                                        <span className="text-xs text-muted-foreground w-10">{assocIng.unidad_medida}</span>
                                                        <span className="text-xs font-medium w-16 text-right">€{subtotal.toFixed(2)}</span>
                                                    </div>
                                                    <Button variant="ghost" size="md" className="h-7 w-7" onClick={() => handleRemoveIngredient(assocIng.id_ingrediente)}>
                                                        <Trash className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                        {product.ingredientes_asociados.length === 0 && (
                                            <p className="text-sm text-center text-muted-foreground py-4">Aún no has añadido ingredientes a la receta.</p>
                                        )}
                                    </div>
                                    {product.ingredientes_asociados.length > 0 && (
                                        <div className="flex justify-between pt-2 border-t font-medium">
                                            <span>Coste Total:</span>
                                            <span>€{costEscandallo.toFixed(2)}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab Variantes */}
                        <TabsContent value="variantes" className="space-y-6 mt-0">
                            <Card>
                                <CardHeader className="pb-2">
                                    <H3 className="text-base">Variantes del Producto</H3>
                                    <CardDescription>Añade opciones como tamaños, extras o modificadores.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Nombre de la variante (ej: Grande, Sin hielo)"
                                            value={newVariantName}
                                            onChange={(e) => setNewVariantName(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="€ Extra"
                                            value={newVariantPrice}
                                            onChange={(e) => setNewVariantPrice(parseFloat(e.target.value) || 0)}
                                            className="w-24"
                                            step="0.01"
                                        />
                                        <Button onClick={handleAddVariant} disabled={!newVariantName.trim()}>
                                            <PlusCircle className="h-4 w-4 mr-1" />
                                            Añadir
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {product.variantes.map(variant => (
                                            <div key={variant.id} className="flex items-center justify-between p-2 border rounded-md bg-background text-sm">
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={variant.disponible}
                                                        onCheckedChange={() => handleToggleVariant(variant.id)}
                                                    />
                                                    <span className={!variant.disponible ? 'text-muted-foreground line-through' : ''}>{variant.nombre}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={variant.precio_extra > 0 ? 'default' : 'secondary'}>
                                                        {variant.precio_extra > 0 ? `+€${variant.precio_extra.toFixed(2)}` : 'Sin cargo'}
                                                    </Badge>
                                                    <Button variant="ghost" size="md" className="h-7 w-7" onClick={() => handleRemoveVariant(variant.id)}>
                                                        <Trash className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {product.variantes.length === 0 && (
                                            <p className="text-sm text-center text-muted-foreground py-4">No hay variantes configuradas.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab Disponibilidad */}
                        <TabsContent value="disponibilidad" className="space-y-6 mt-0">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label className="text-base">Disponible para la venta</Label>
                                    <p className="text-sm text-muted-foreground">El producto aparecerá en las cartas activas</p>
                                </div>
                                <Switch checked={product.disponible} onCheckedChange={handleSwitchChange} />
                            </div>

                            <Card>
                                <CardHeader className="pb-2">
                                    <H3 className="text-base">Horario de Disponibilidad</H3>
                                    <CardDescription>Opcional: limitar el producto a ciertas horas.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] items-end gap-4">
                                        <div className="space-y-2">
                                            <Label>Hora Inicio</Label>
                                            <Input
                                                type="time"
                                                value={product.horario_disponible?.inicio || ''}
                                                onChange={(e) => setProduct(prev => ({
                                                    ...prev,
                                                    horario_disponible: {
                                                        inicio: e.target.value,
                                                        fin: prev.horario_disponible?.fin || ''
                                                    }
                                                }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Hora Fin</Label>
                                            <Input
                                                type="time"
                                                value={product.horario_disponible?.fin || ''}
                                                onChange={(e) => setProduct(prev => ({
                                                    ...prev,
                                                    horario_disponible: {
                                                        inicio: prev.horario_disponible?.inicio || '',
                                                        fin: e.target.value
                                                    }
                                                }))}
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setProduct(prev => ({ ...prev, horario_disponible: null }))}
                                            className="w-full sm:w-auto"
                                        >
                                            Limpiar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <H3 className="text-base">Alérgenos</H3>
                                    <CardDescription>Selecciona los alérgenos presentes en este producto.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                        {alergenosList.map(alergeno => (
                                            <div key={alergeno} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`alergeno-${alergeno}`}
                                                    checked={product.alergenos.includes(alergeno)}
                                                    onCheckedChange={() => handleToggleAlergeno(alergeno)}
                                                />
                                                <Label htmlFor={`alergeno-${alergeno}`} className="text-sm font-normal cursor-pointer">
                                                    {alergeno}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stock_minimo">Stock Mínimo de Alerta</Label>
                                    <Input
                                        id="stock_minimo"
                                        type="number"
                                        value={product.stock_minimo}
                                        onChange={handleNumberChange}
                                        placeholder="0 = sin alerta"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="impresora_destino">Impresora de Destino</Label>
                                    <Select value={product.impresora_destino || "none"} onValueChange={(value) => setProduct(prev => ({ ...prev, impresora_destino: value === "none" ? "" : value }))}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar impresora..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sin impresora específica</SelectItem>
                                            <SelectItem value="cocina">Cocina</SelectItem>
                                            <SelectItem value="barra">Barra</SelectItem>
                                            <SelectItem value="caja">Caja</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
                    <Button variant="brand" onClick={handleSaveClick}>Guardar Producto</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function ProductosPage() {
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
        <div className="flex flex-1 flex-col h-full">
            <PageHeader title="Librería de Productos" />
            <PageContent>
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
            </PageContent>
            <ProductDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} productToEdit={editingProduct} onSave={handleSave} />
        </div>
    );
}


