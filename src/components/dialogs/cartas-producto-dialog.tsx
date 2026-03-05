'use client';

import * as React from 'react';
import { PlusCircle, Trash, Package } from 'lucide-react';
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
    mockIngredients,
    type Product,
    type Ingredient,
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
    impresora_destino: ''
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
}

export function ProductDialog({ open, onOpenChange, productToEdit, onSave }: ProductDialogProps) {
    const categories = mockCategories;
    const taxes = mockTaxes;
    const ingredients = mockIngredients;

    const [product, setProduct] = React.useState<ExtendedProduct>(emptyExtendedProduct);
    const [activeTab, setActiveTab] = React.useState('general');

    const [ingredientSearch, setIngredientSearch] = React.useState('');
    const [searchSuggestions, setSearchSuggestions] = React.useState<Ingredient[]>([]);
    const [isSearchPopoverOpen, setIsSearchPopoverOpen] = React.useState(false);

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
                impresora_destino: (productToEdit as any).impresora_destino || ''
            });
        } else {
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
            margen_beneficio: marginBeneficio
        };
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
            cantidad_requerida: 1,
            unidad_medida: ingredient.unidad_medida
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
                        <div className="px-6 border-b bg-muted/10 shrink-0">
                            <TabsList className="h-14 bg-transparent justify-start gap-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="precios">Precios</TabsTrigger>
                                <TabsTrigger value="receta">Receta</TabsTrigger>
                                <TabsTrigger value="variantes">Variantes</TabsTrigger>
                                <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <TabsContent value="general" spaced className="p-6">
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
                                            <Select value={product.id_categoria || "ninguna"} onValueChange={(value) => setProduct(prev => ({ ...prev, id_categoria: value === "ninguna" ? "" : value }))}>
                                                <SelectTrigger><SelectValue placeholder="Selecciona una categoría..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ninguna">Ninguna</SelectItem>
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

                            <TabsContent value="precios" spaced className="p-6">
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
                                    <CardHeader title="Rentabilidad (Calculada)" />
                                    <CardContent gap="sm">
                                        <div className="flex justify-between">
                                            <TextMD className="text-muted-foreground">Precio de Venta:</TextMD>
                                            <TextMD className="text-foreground">€{product.precio_venta.toFixed(2)}</TextMD>
                                        </div>
                                        <div className="flex justify-between">
                                            <TextMD className="text-muted-foreground">Coste de Escandallo:</TextMD>
                                            <TextMD className="text-destructive">-€{costEscandallo.toFixed(2)}</TextMD>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-base font-bold text-foreground">
                                            <TextMD>Margen Bruto:</TextMD>
                                            <TextMD className={marginBeneficio >= 0 ? 'text-green-600' : 'text-destructive'}>
                                                €{marginBeneficio.toFixed(2)} ({marginPercent.toFixed(1)}%)
                                            </TextMD>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="receta" spaced className="p-6">
                                <Card padding="md">
                                    <CardHeader title="Receta / Escandallo" description="Añade los ingredientes necesarios para preparar este producto." />
                                    <CardContent gap="md" padding="none">
                                        <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <SearchInput
                                                    placeholder="Buscar ingrediente para añadir..."
                                                    value={ingredientSearch}
                                                    onChange={(e) => setIngredientSearch(e.target.value)}
                                                />
                                            </PopoverTrigger>
                                            <PopoverContent>
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
                                                                        <TextMD>{ing.nombre_ingrediente}</TextMD>
                                                                        <TextXS className="text-muted-foreground">€{ing.costo_unitario.toFixed(2)}/{ing.unidad_medida}</TextXS>
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
                                                        <TextMD className="text-foreground">{ingredientInfo?.nombre_ingrediente || 'Ingrediente no encontrado'}</TextMD>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                className="h-8 w-20 text-right"
                                                                value={assocIng.cantidad_requerida}
                                                                onChange={(e) => handleIngredientQuantityChange(assocIng.id_ingrediente, parseFloat(e.target.value) || 0)}
                                                                step="0.01"
                                                            />
                                                            <TextXS className="text-muted-foreground">{assocIng.unidad_medida}</TextXS>
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

                            <TabsContent value="variantes" className="p-6 space-y-6">
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
                                        <Input
                                            type="number"
                                            placeholder="€ Extra"
                                            value={newVariantPrice}
                                            onChange={(e) => setNewVariantPrice(parseFloat(e.target.value) || 0)}
                                            className="w-24"
                                            step="0.01"
                                        />
                                        <Button onClick={handleAddVariant} disabled={!newVariantName.trim()} className="gap-2">
                                            <PlusCircle className="h-4 w-4" />
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
                                                <TextMD className={cn('font-medium text-foreground', !variant.disponible && 'text-muted-foreground line-through')}>{variant.nombre}</TextMD>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant={variant.precio_extra > 0 ? 'default' : 'secondary'} className="h-6">
                                                    {variant.precio_extra > 0 ? `+€${variant.precio_extra.toFixed(2)}` : 'Sin cargo'}
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

                            <TabsContent value="disponibilidad" className="p-6 space-y-6">
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
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hora Fin</Label>
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
                                                className="bg-background"
                                            />
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="md"
                                            onClick={() => setProduct(prev => ({ ...prev, horario_disponible: null }))}
                                            className="w-full sm:w-auto"
                                        >
                                            Borrar Horario
                                        </Button>
                                    </div>
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
                                        <Label htmlFor="stock_minimo" className="text-foreground">Stock Mínimo de Alerta</Label>
                                        <Input
                                            id="stock_minimo"
                                            type="number"
                                            value={product.stock_minimo}
                                            onChange={handleNumberChange}
                                            placeholder="0 = sin alerta"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="impresora_destino" className="text-foreground">Impresora de Destino</Label>
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


