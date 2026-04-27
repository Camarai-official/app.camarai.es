'use client';

import * as React from 'react';
import { Plus, PlusCircle, Minus, Trash, Package, Clock as Timer } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
    Dialog,
    DialogWindow,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogClose
} from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { H3, TextMD, TextXS, TextSM } from '@/components/ui/typography';
import { SearchInput } from '@/components/ui/search-input';
import {
    mockCategories,
    mockTaxes,
    type Product,
    type AssociatedIngredient
} from '@/data/mock-data';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Extended Product type with new fields
export interface ExtendedProduct extends Omit<Product, 'id'> {
    id?: string;
    // Variants
    variantes: ProductVariant[];
    // Availability
    horario_disponible: { inicio: string; fin: string } | null;
    alergenos: string[];
    stock_minimo: number;
    impresora_destino: string;
}

export interface ProductVariant {
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
    impresora_destino: 'caja' // Default printer
};

const alergenosList = [
    'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 'Soja',
    'Lácteos', 'Frutos secos', 'Apio', 'Mostaza', 'Sésamo', 'Sulfitos', 'Moluscos', 'Altramuces'
];

interface ProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productToEdit: Product | null;
    onSave: (productData: Omit<Product, 'id'> | Product) => void;
    categories?: any[]; // Convex categories
    taxes?: any[]; // Convex taxes
    establishmentId?: string; // Convex establishment ID
    defaultCategoryId?: string | null; // Default category ID
}

export function ProductDialog({ open, onOpenChange, productToEdit, onSave, categories = [], taxes = [], establishmentId, defaultCategoryId }: ProductDialogProps) {
    // Get real ingredients from Convex
    const ingredients = useQuery(api.ingredients.getIngredients, 
        establishmentId ? { establishmentId: establishmentId as any } : "skip"
    ) || [];

    // Get product details with ingredients when editing
    const productDetails = useQuery(api.products.getProductById, 
        productToEdit && open ? { productId: productToEdit.id as any } : "skip"
    );

    const [product, setProduct] = React.useState<ExtendedProduct>(emptyExtendedProduct);
    const [activeTab, setActiveTab] = React.useState('general');
    const [isLoading, setIsLoading] = React.useState(false);

    const [ingredientSearch, setIngredientSearch] = React.useState('');
    const [searchSuggestions, setSearchSuggestions] = React.useState<any[]>([]);
    const [isSearchPopoverOpen, setIsSearchPopoverOpen] = React.useState(false);

    const [newVariantName, setNewVariantName] = React.useState('');
    const [newVariantPrice, setNewVariantPrice] = React.useState(0);

    const calculateSubtotal = (ingredientInfo: any, quantity: number, selectedUnit: string) => {
        if (!ingredientInfo) return 0;
        
        const baseUnit = ingredientInfo.unit;
        const baseCost = ingredientInfo.cost_base;
        
        // If selected unit matches base unit, use direct calculation
        if (selectedUnit === baseUnit) {
            return baseCost * quantity;
        }
        
        // Convert to base unit first, then calculate
        let convertedQuantity = quantity;
        
        switch (baseUnit) {
            case 'kg':
                if (selectedUnit === 'g') {
                    convertedQuantity = quantity / 1000; // Convert grams to kg
                }
                break;
            case 'l':
                if (selectedUnit === 'ml') {
                    convertedQuantity = quantity / 1000; // Convert ml to liters
                }
                break;
            case 'unidades':
                // No conversion needed for units
                break;
        }
        
        return baseCost * convertedQuantity;
    };

    const costEscandallo = React.useMemo(() => {
        return product.ingredientes_asociados.reduce((acc, assocIng) => {
            const ingredientDetails = ingredients.find(i => i._id === assocIng.id_ingrediente);
            if (ingredientDetails) {
                return acc + calculateSubtotal(ingredientDetails, assocIng.cantidad_requerida, assocIng.unidad_medida);
            }
            return acc;
        }, 0);
    }, [product.ingredientes_asociados, ingredients]);

    // Obtener el porcentaje del impuesto seleccionado
    const selectedTax = React.useMemo(() => {
        return taxes.find(tax => tax._id === product.id_impuesto);
    }, [taxes, product.id_impuesto]);

    const taxPercent = selectedTax?.percentage || 0;

    // Calcular el precio base (sin impuesto) y el margen real
    const precioBase = product.precio_venta / (1 + taxPercent / 100);
    const marginBeneficio = precioBase - costEscandallo;
    const marginPercent = precioBase > 0 ? ((marginBeneficio / precioBase) * 100) : 0;

    React.useEffect(() => {
        if (productToEdit) {
            setIsLoading(true);
            // Don't load ingredients from productToEdit, wait for productDetails instead
            const mappedProduct = {
                ...emptyExtendedProduct,
                ...productToEdit,
                variantes: (productToEdit as any).variantes || [],
                horario_disponible: (productToEdit as any).horario_disponible || null,
                alergenos: (productToEdit as any).alergenos || [],
                stock_minimo: (productToEdit as any).stock_minimo || 0,
                impresora_destino: (productToEdit as any).impresora_destino || '',
                ingredientes_asociados: [] // Start empty, will be loaded from productDetails
            };
            setProduct(mappedProduct);
            setIsLoading(false);
        } else {
            const defaultCatId = defaultCategoryId || (categories.length > 0 ? categories[0]._id : '');
            const defaultTaxId = taxes.length > 0 ? taxes[0]._id : '';
            setProduct({ 
                ...emptyExtendedProduct, 
                id_categoria: defaultCatId,
                id_impuesto: defaultTaxId 
            });
        }
        setActiveTab('general');
    }, [productToEdit, open, categories, taxes]);

    // Update product when productDetails is loaded (for editing)
    React.useEffect(() => {
        if (productDetails && productToEdit) {
            // Always load ingredients from productDetails
            setProduct(prev => ({
                ...prev,
                ingredientes_asociados: (productDetails as any).ingredientes_asociados || []
            }));
        }
    }, [productDetails, productToEdit]);

    React.useEffect(() => {
        // Always filter ingredients based on search term
        const existingIds = new Set(product.ingredientes_asociados.map(i => i.id_ingrediente));
        
        if (ingredientSearch.length === 0) {
            // Show all available ingredients when search is empty
            const availableIngredients = ingredients.filter(ing => !existingIds.has(ing._id));
            setSearchSuggestions(availableIngredients);
        } else {
            // Filter ingredients based on search term
            const filtered = ingredients.filter(ing =>
                (ing.name || '').toLowerCase().includes(ingredientSearch.toLowerCase()) &&
                !existingIds.has(ing._id)
            );
            setSearchSuggestions(filtered);
        }
        
        // Don't change popover state here - let the user control it
    }, [ingredientSearch, ingredients, product.ingredientes_asociados]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setProduct(prev => ({ ...prev, [id]: value }));
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        // Allow empty string or valid number
        if (value === '') {
            setProduct(prev => ({ ...prev, [id]: 0 }));
        } else {
            const numValue = parseFloat(value);
            setProduct(prev => ({ ...prev, [id]: isNaN(numValue) ? 0 : numValue }));
        }
    };

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
            margen_beneficio: marginBeneficio
        };
        if (productToEdit) {
            onSave({ ...productToSave, id: productToEdit.id } as Product);
        } else {
            onSave(productToSave as Omit<Product, 'id'>);
        }
        onOpenChange(false);
    }

    const handleAddIngredient = (ingredient: any) => {
        // Get the appropriate default unit based on the ingredient's base unit
        const getDefaultUnit = (baseUnit: string) => {
            switch (baseUnit) {
                case 'kg':
                    return 'g'; // Default to grams for kg ingredients
                case 'l':
                    return 'ml'; // Default to ml for liter ingredients
                default:
                    return baseUnit; // Use base unit for others
            }
        };

        const newAssociatedIngredient: AssociatedIngredient = {
            id_ingrediente: ingredient._id,
            cantidad_requerida: 1,
            unidad_medida: getDefaultUnit(ingredient.unit)
        };

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

    const getAvailableUnits = (baseUnit: string) => {
        switch (baseUnit) {
            case 'kg':
                return ['kg', 'g'];
            case 'l':
                return ['l', 'ml'];
            case 'unidades':
                return ['unidades'];
            default:
                return [baseUnit];
        }
    };

    const handleIngredientUnitChange = (ingredientId: string, unit: string) => {
        setProduct(prev => ({
            ...prev,
            ingredientes_asociados: prev.ingredientes_asociados.map(ing =>
                ing.id_ingrediente === ingredientId ? { ...ing, unidad_medida: unit } : ing
            )
        }));
    };

    const handleAddVariant = () => {
        if (!newVariantName.trim()) return;
        const newVariant: ProductVariant = {
            id: `var-${Date.now()}`,
            nombre: newVariantName,
            precio_extra: newVariantPrice,
            disponible: true
        };
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
            <DialogWindow size="lg">
                <DialogHeader
                    icon={PlusCircle}
                    title={`${productToEdit ? 'Editar' : 'Crear'} Producto`}
                    description="Rellena los detalles. Los productos se añadirán a tu librería global para usarlos en las cartas."
                />

                <DialogContent className="p-0 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0">
                            <TabsList className="w-full">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="precios">Precios</TabsTrigger>
                                <TabsTrigger value="receta">Receta</TabsTrigger>
                                <TabsTrigger value="variantes">Variantes</TabsTrigger>
                                <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <TabsContent value="general" spaced className="py-4 px-2 sm:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-[160px,1fr] gap-6 items-start">
                                    <div className="w-[160px]">
                                        <ImageUploader
                                            value={product.url_imagen_producto}
                                            onChange={handleImageChange}
                                            placeholder="Imagen"
                                            aspectRatio="square"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre_producto">Nombre del Producto *</Label>
                                            <Input id="nombre_producto" value={product.nombre_producto} onChange={handleInputChange} placeholder="Ej: Hamburguesa Clásica" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="id_categoria">Categoría *</Label>
                                            <Select value={product.id_categoria || ""} onValueChange={(value) => setProduct(prev => ({ ...prev, id_categoria: value === "ninguna" ? "" : value }))}>
                                                <SelectTrigger><SelectValue placeholder="Selecciona una categoría..." /></SelectTrigger>
                                                <SelectContent>
                                                    {defaultCategoryId && (
                                                        <SelectItem value={defaultCategoryId}>Sin Categoría</SelectItem>
                                                    )}
                                                    {categories.filter(cat => cat._id !== defaultCategoryId).map(cat => (
                                                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
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

                            <TabsContent value="precios" spaced className="py-4 px-2 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="precio_venta">Precio de Venta (€) *</Label>
                                        <Input id="precio_venta" type="text" value={product.precio_venta === 0 ? '' : product.precio_venta.toString()} onChange={handleNumberChange} step="0.01" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="id_impuesto">Impuesto Aplicable</Label>
                                        <Select value={product.id_impuesto || ""} onValueChange={(value) => setProduct(prev => ({ ...prev, id_impuesto: value }))}>
                                            <SelectTrigger><SelectValue placeholder="Selecciona un impuesto..." /></SelectTrigger>
                                            <SelectContent>
                                                {taxes.map(tax => (
                                                    <SelectItem key={tax._id} value={tax._id}>{tax.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Card>
                                    <CardHeader title="Rentabilidad (Calculada)" />
                                    <CardContent gap="sm">
                                        <div className="flex justify-between">
                                            <TextMD className="text-muted-foreground">Precio Final (con IVA):</TextMD>
                                            <TextMD className="text-foreground">€{product.precio_venta.toFixed(2)}</TextMD>
                                        </div>
                                        <div className="flex justify-between">
                                            <TextMD className="text-muted-foreground">Precio Base (sin IVA):</TextMD>
                                            <TextMD className="text-muted-foreground">€{precioBase.toFixed(2)}</TextMD>
                                        </div>
                                        <div className="flex justify-between">
                                            <TextMD className="text-muted-foreground">IVA ({taxPercent}%):</TextMD>
                                            <TextMD className="text-muted-foreground">€{(product.precio_venta - precioBase).toFixed(2)}</TextMD>
                                        </div>
                                        <div className="flex justify-between">
                                            <TextMD className="text-muted-foreground">Coste de Escandallo:</TextMD>
                                            <TextMD className="text-destructive">-€{costEscandallo.toFixed(2)}</TextMD>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-base font-bold text-foreground">
                                            <TextMD>Margen Neto:</TextMD>
                                            <TextMD className={marginBeneficio >= 0 ? 'text-green-600' : 'text-destructive'}>
                                                €{marginBeneficio.toFixed(2)} ({marginPercent.toFixed(1)}%)
                                            </TextMD>
                                        </div>
                                        <TextXS className="text-muted-foreground mt-2">
                                            El margen se calcula sobre el precio base (sin impuestos)
                                        </TextXS>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="receta" spaced className="py-4 px-2 sm:p-6">
                                <Card padding="md">
                                    <CardHeader title="Receta / Escandallo" description="Añade los ingredientes necesarios para preparar este producto." />
                                    <CardContent gap="md" padding="none">
                                        {/* Simple search input without popover */}
                                        <div className="relative">
                                            <Input
                                                placeholder="Buscar ingrediente para añadir..."
                                                value={ingredientSearch}
                                                onChange={(e) => setIngredientSearch(e.target.value)}
                                                onFocus={() => {
                                                    // Show all available ingredients when focusing
                                                    const existingIds = new Set(product.ingredientes_asociados.map(i => i.id_ingrediente));
                                                    const availableIngredients = ingredients.filter(ing => !existingIds.has(ing._id));
                                                    setSearchSuggestions(availableIngredients);
                                                    setIsSearchPopoverOpen(true);
                                                }}
                                                onBlur={() => {
                                                    // Close suggestions after a short delay to allow clicking
                                                    setTimeout(() => setIsSearchPopoverOpen(false), 200);
                                                }}
                                                className="w-full"
                                            />
                                            {/* Show suggestions below the input */}
                                            {ingredientSearch.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                    {searchSuggestions.length === 0 ? (
                                                        <div className="p-3 text-sm text-muted-foreground">
                                                            No se encontraron ingredientes.
                                                        </div>
                                                    ) : (
                                                        <div className="py-1">
                                                            {searchSuggestions.map(ing => (
                                                                <div
                                                                    key={ing._id}
                                                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-muted flex justify-between items-center"
                                                                    onClick={() => handleAddIngredient(ing)}
                                                                >
                                                                    <span>{ing.name}</span>
                                                                    <span className="text-muted-foreground">€{ing.cost_base.toFixed(2)}/{ing.unit}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {/* Show all ingredients when no search and focused */}
                                            {ingredientSearch.length === 0 && isSearchPopoverOpen && (
                                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                    {searchSuggestions.length === 0 ? (
                                                        <div className="p-3 text-sm text-muted-foreground">
                                                            No hay ingredientes disponibles.
                                                        </div>
                                                    ) : (
                                                        <div className="py-1">
                                                            {searchSuggestions.map(ing => (
                                                                <div
                                                                    key={ing._id}
                                                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-muted flex justify-between items-center"
                                                                    onClick={() => handleAddIngredient(ing)}
                                                                >
                                                                    <span>{ing.name}</span>
                                                                    <span className="text-muted-foreground">€{ing.cost_base.toFixed(2)}/{ing.unit}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            {product.ingredientes_asociados.map(assocIng => {
                                                const ingredientInfo = ingredients.find(i => i._id === assocIng.id_ingrediente);
                                                const subtotal = calculateSubtotal(ingredientInfo, assocIng.cantidad_requerida, assocIng.unidad_medida);
                                                return (
                                                    <div key={assocIng.id_ingrediente} className="flex items-center justify-between p-2 border rounded-md bg-background text-sm gap-2">
                                                        <TextMD className="text-foreground">{ingredientInfo?.name || 'Ingrediente no encontrado'}</TextMD>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                className="h-8 w-20 text-right"
                                                                value={assocIng.cantidad_requerida === 0 ? '' : assocIng.cantidad_requerida}
                                                                onChange={(e) => handleIngredientQuantityChange(assocIng.id_ingrediente, e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                                                                step="any"
                                                                min="0"
                                                            />
                                                            <Select value={assocIng.unidad_medida} onValueChange={(value) => handleIngredientUnitChange(assocIng.id_ingrediente, value)}>
                                                                <SelectTrigger className="h-8 w-16">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {getAvailableUnits(ingredientInfo?.unit || 'unidades').map(unit => (
                                                                        <SelectItem key={unit} value={unit}>
                                                                            {unit}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <TextXS className="text-foreground">€{subtotal.toFixed(2)}</TextXS>
                                                        </div>
                                                        <Button variant="ghost" size="md" onClick={() => handleRemoveIngredient(assocIng.id_ingrediente)}>
                                                            <Trash className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                )
                                            })}
                                            {product.ingredientes_asociados.length === 0 && (
                                                <TextSM className="text-muted-foreground">Aún no has añadido ingredientes a la receta.</TextSM>
                                            )}
                                        </div>
                                        {product.ingredientes_asociados.length > 0 && (
                                            <div className="flex justify-between pt-2 border-t font-medium text-foreground">
                                                <TextMD>Coste Total:</TextMD>
                                                <TextMD>€{costEscandallo.toFixed(2)}</TextMD>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="variantes" className="py-4 px-2 sm:p-6 space-y-6">
                                <div className="space-y-1">
                                    <H3 className="text-lg font-bold">Variantes del Producto</H3>
                                    <TextSM className="text-muted-foreground">Añade opciones como tamaños, extras o modificadores.</TextSM>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 bg-muted/30 p-3 rounded-lg border">
                                    <Input
                                        placeholder="Nombre (ej: Grande)"
                                        value={newVariantName}
                                        onChange={(e) => setNewVariantName(e.target.value)}
                                        className="flex-1"
                                    />
                                    <div className="flex gap-2 shrink-0">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">€</span>
                                            <Input
                                                type="text"
                                                placeholder="0.00"
                                                value={newVariantPrice === 0 ? '' : newVariantPrice.toString()}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    setNewVariantPrice(value);
                                                }}
                                                className="w-24 pl-7 h-10"
                                                step="0.01"
                                            />
                                        </div>
                                        <Button onClick={handleAddVariant} disabled={!newVariantName.trim()} className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Añadir
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {product.variantes.map(variant => (
                                        <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg bg-card text-sm hover:border-primary/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <Switch
                                                    checked={variant.disponible}
                                                    onCheckedChange={() => handleToggleVariant(variant.id)}
                                                />
                                                <div className="flex items-center gap-2">
                                                    {variant.precio_extra < 0 && (
                                                        <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                                                            <Minus className="h-3 w-3" />
                                                        </Badge>
                                                    )}
                                                    <TextMD className={cn('font-medium text-foreground', !variant.disponible && 'text-muted-foreground line-through')}>
                                                        {variant.nombre}
                                                    </TextMD>
                                                    {variant.precio_extra > 0 && (
                                                        <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                                                            <PlusCircle className="h-3 w-3" />
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge 
                                                    variant={
                                                        variant.precio_extra > 0 ? 'default' : 
                                                        variant.precio_extra < 0 ? 'destructive' : 
                                                        'secondary'
                                                    } 
                                                    className="h-6"
                                                >
                                                    {variant.precio_extra > 0 ? (
                                                        <>
                                                            <PlusCircle className="h-3 w-3 mr-1" />
                                                            +€{variant.precio_extra.toFixed(2)}
                                                        </>
                                                    ) : variant.precio_extra < 0 ? (
                                                        <>
                                                            <Minus className="h-3 w-3 mr-1" />
                                                            €{Math.abs(variant.precio_extra).toFixed(2)} menos
                                                        </>
                                                    ) : (
                                                        'Mismo precio'
                                                    )}
                                                </Badge>
                                                <Button variant="ghost" size="md" onClick={() => handleRemoveVariant(variant.id)} className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {product.variantes.length === 0 && (
                                        <div className="py-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
                                            <TextSM className="text-muted-foreground">No hay variantes configuradas.</TextSM>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="disponibilidad" className="py-4 px-2 sm:p-6 space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-card shadow-sm">
                                    <div className="space-y-1">
                                        <Label className="text-base font-bold text-foreground">Visible para la venta</Label>
                                        <TextSM className="text-muted-foreground">El producto aparecerá en las cartas digitales activas</TextSM>
                                    </div>
                                    <Switch checked={product.disponible} onCheckedChange={handleSwitchChange} />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1 px-1">
                                        <H3 className="text-lg font-bold">Horario de Disponibilidad</H3>
                                        <TextSM className="text-muted-foreground">Limita la venta del producto a un horario específico.</TextSM>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] items-end gap-3 bg-muted/30 p-4 rounded-xl border">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hora Inicio</Label>
                                            <div className="relative">
                                                <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                                    className="bg-background pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hora Fin</Label>
                                            <div className="relative">
                                                <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                                    className="bg-background pl-10"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="md"
                                            onClick={() => setProduct(prev => ({ ...prev, horario_disponible: null }))}
                                            className="w-full sm:w-auto"
                                        >
                                            <Trash className="h-4 w-4 mr-2" />
                                            Borrar Horario
                                        </Button>
                                    </div>
                                    {product.horario_disponible?.inicio && product.horario_disponible?.fin && (
                                        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                            <Timer className="h-4 w-4 text-primary" />
                                            <TextSM className="text-primary font-medium">
                                                Disponible de {product.horario_disponible.inicio} a {product.horario_disponible.fin}
                                            </TextSM>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1 px-1">
                                        <H3 className="text-lg font-bold">Alérgenos</H3>
                                        <TextSM className="text-muted-foreground">Ingredientes que pueden causar reacciones alérgicas.</TextSM>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 bg-muted/10 p-4 rounded-xl border">
                                        {alergenosList.map(alergeno => (
                                            <div key={alergeno} className="flex items-center space-x-3 p-2 rounded-md hover:bg-background/50 transition-colors cursor-pointer" onClick={() => handleToggleAlergeno(alergeno)}>
                                                <Checkbox
                                                    id={`alergeno-${alergeno}`}
                                                    checked={product.alergenos.includes(alergeno)}
                                                    onCheckedChange={() => handleToggleAlergeno(alergeno)}
                                                />
                                                <Label htmlFor={`alergeno-${alergeno}`} className="text-sm font-medium cursor-pointer flex-1 py-1">
                                                    {alergeno}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="stock_minimo" className="text-foreground font-medium">Stock Mínimo de Alerta</Label>
                                            <div className="w-2 h-2 rounded-full bg-orange-500" title="Alerta de stock bajo"></div>
                                        </div>
                                        <div className="relative">
                                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="stock_minimo"
                                                type="number"
                                                value={product.stock_minimo}
                                                onChange={handleNumberChange}
                                                placeholder="0 = sin alerta"
                                                className="pl-10"
                                            />
                                        </div>
                                        {product.stock_minimo > 0 && (
                                            <TextSM className="text-muted-foreground">
                                                Alerta cuando el stock sea ≤ {product.stock_minimo} unidades
                                            </TextSM>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor="impresora_destino" className="text-foreground font-medium">Impresora de Destino</Label>
                                            <div className="w-2 h-2 rounded-full bg-blue-500" title="Configuración de impresión"></div>
                                        </div>
                                        <div className="relative">
                                            <Select value={product.impresora_destino || "caja"} onValueChange={(value) => setProduct(prev => ({ ...prev, impresora_destino: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar impresora..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="caja">💰 Caja (por defecto)</SelectItem>
                                                    <SelectItem value="cocina">🍳 Cocina</SelectItem>
                                                    <SelectItem value="barra">🍺 Barra</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {product.impresora_destino && (
                                            <TextSM className="text-muted-foreground">
                                                Los pedidos se enviarán a {product.impresora_destino === 'cocina' ? 'la cocina' : product.impresora_destino === 'barra' ? 'la barra' : 'la caja'}
                                            </TextSM>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </DialogContent>

                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                    onConfirm={handleSaveClick}
                    confirmText="Guardar Producto"
                />
            </DialogWindow>
        </Dialog>
    )
}


