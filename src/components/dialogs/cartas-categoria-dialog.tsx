'use client';

import * as React from 'react';
import { H3, TextXS, TextMD, TextSM } from '@/components/ui/typography';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogWindow } from '@/components/layout/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker, iconMap } from '@/components/ui/icon-picker';
import { ImageUploader } from '@/components/ui/image-uploader';
import { SearchInput } from '@/components/ui/search-input';
import { ActionTile } from '@/components/ui/action-tile';
import Image from 'next/image';
import { LayoutGrid, PlusCircle } from 'lucide-react';
import type { Category, Product } from '@/data/mock-data';

export interface ExtendedCategory extends Category {
    descripcion?: string;
    icono?: string;
    color?: string;
    orden?: number;
    activa?: boolean;
    product_count?: number;
    categoria_padre_id?: string;
    visible_en_carta?: boolean;
    impresora_destino?: string;
    imagen?: string;
}

interface CategoryDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    category: ExtendedCategory | null;
    onSave: (id: string | null, categoryData: Partial<ExtendedCategory>, assignedProductIds: string[]) => void;
    products: Product[];
    allCategories: ExtendedCategory[];
}

export function CategoryDialog({
    isOpen,
    onOpenChange,
    category,
    onSave,
    products,
    allCategories
}: CategoryDialogProps) {
    const [categoryData, setCategoryData] = React.useState<Partial<ExtendedCategory>>({
        nombre_categoria: '',
        descripcion: '',
        icono: 'Utensils',
        color: '#9B6EFD',
        imagen: '',
        orden: 0,
        categoria_padre_id: '',
        visible_en_carta: true,
        impresora_destino: ''
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
                impresora_destino: category.impresora_destino || ''
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
                impresora_destino: ''
            });
            setAssignedProducts([]);
        }
        setSearchTerm('');
        // Only reset tab when opening a new category, not when editing
        if (!category) {
            setActiveTab('general');
        }
    }, [category, isOpen, products, allCategories]);

    const handleSaveClick = () => {
        const categoryDataWithId = {
            ...categoryData,
            id: category?.id || null
        };
        onSave(category?.id || null, categoryDataWithId, assignedProducts.map(p => p.id));
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

    const parentCategoryOptions = React.useMemo(() => {
        if (!category) return allCategories;
        return allCategories.filter(c => c.id !== category.id && c.categoria_padre_id !== category.id);
    }, [allCategories, category]);

    const SelectedIcon = iconMap[categoryData.icono || 'Utensils'] || iconMap['Utensils'];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogWindow size="lg">
                <DialogHeader
                    icon={SelectedIcon}
                    title={`${category ? 'Editar' : 'Crear'} Categoría`}
                    description="Configura los detalles de la categoría y gestiona los productos asignados."
                />
                <DialogContent className="p-0 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 border-b bg-muted/10 shrink-0">
                            <TabsList className="h-14 bg-transparent justify-start gap-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
                                <TabsTrigger value="productos">Productos</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <TabsContent value="general" spaced className="p-6">
                                <div className="space-y-2 text-foreground">
                                    <Label htmlFor="nombre_categoria">Nombre de la Categoría *</Label>
                                    <Input
                                        id="nombre_categoria"
                                        value={categoryData.nombre_categoria}
                                        onChange={(e) => setCategoryData(prev => ({ ...prev, nombre_categoria: e.target.value }))}
                                        placeholder="Ej: Entrantes, Postres, Vinos..."
                                    />
                                </div>

                                <div className="space-y-2 text-foreground">
                                    <Label htmlFor="descripcion">Descripción</Label>
                                    <Textarea
                                        id="descripcion"
                                        value={categoryData.descripcion}
                                        onChange={(e) => setCategoryData(prev => ({ ...prev, descripcion: e.target.value }))}
                                        placeholder="Descripción opcional de la categoría..."
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-foreground">
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
                                        <TextXS className="text-muted-foreground">Para crear subcategorías.</TextXS>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="orden">Orden de Visualización</Label>
                                        <Input
                                            id="orden"
                                            type="number"
                                            value={categoryData.orden}
                                            onChange={(e) => setCategoryData(prev => ({ ...prev, orden: parseInt(e.target.value) || 0 }))}
                                        />
                                        <TextXS className="text-muted-foreground">Menor número = aparece antes.</TextXS>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-foreground">
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
                                        <TextXS className="text-muted-foreground">Impresora para productos de esta categoría.</TextXS>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                                        <div>
                                            <Label>Visible en Carta</Label>
                                            <TextXS className="text-muted-foreground">Mostrar esta categoría en las cartas</TextXS>
                                        </div>
                                        <Switch
                                            checked={categoryData.visible_en_carta}
                                            onCheckedChange={(checked) => setCategoryData(prev => ({ ...prev, visible_en_carta: checked }))}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="apariencia" spaced className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-[1fr,260px] gap-8">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <IconPicker
                                                value={categoryData.icono || 'Utensils'}
                                                onChange={(icon) => setCategoryData(prev => ({ ...prev, icono: icon }))}
                                                label="Icono"
                                            />
                                            <ColorPicker
                                                value={categoryData.color || '#9B6EFD'}
                                                onChange={(color) => setCategoryData(prev => ({ ...prev, color: color }))}
                                                label="Color"
                                            />
                                        </div>

                                        <Card>
                                            <CardHeader 
                                                title="Vista Previa en App" 
                                                description="Así aparecerá esta categoría en el menú digital de tus clientes."
                                            />
                                            <CardContent>
                                                <ActionTile
                                                    title={categoryData.nombre_categoria || 'Nombre de categoría'}
                                                    description={categoryData.descripcion || 'Descripción de la categoría'}
                                                    icon={SelectedIcon}
                                                    iconColor={categoryData.color || '#9B6EFD'}
                                                    variant="outline"
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Imagen de Banner (Opcional)</Label>
                                        <ImageUploader
                                            value={categoryData.imagen}
                                            onChange={(img) => setCategoryData(prev => ({ ...prev, imagen: img }))}
                                            placeholder="Subir banner"
                                            aspectRatio="16:9"
                                        />
                                        <TextXS className="text-muted-foreground text-center block">Se usará como fondo visual en la App.</TextXS>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="productos" spaced className="p-6">
                                <div className="space-y-6">
                                    <div className="bg-muted/30 border rounded-xl p-4 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <H3 className="text-lg font-bold">Productos Asignados</H3>
                                                <TextSM className="text-muted-foreground">Gestiona qué productos pertenecen a esta categoría.</TextSM>
                                            </div>

                                            <div className="w-full sm:w-[300px] relative">
    <Input
        placeholder="Añadir producto..."
        value={searchTerm}
        onChange={(e) => {
            console.log('Input value:', e.target.value); // Debug
            setSearchTerm(e.target.value);
        }}
        className="w-full"
    />
    
    {/* Show suggestions directly below the input */}
    {searchTerm.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {unassignedProducts.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                    No se encontraron productos.
                </div>
            ) : (
                <div className="py-1">
                    {unassignedProducts.map(p => (
                        <div
                            key={p.id}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-muted flex justify-between items-center"
                            onClick={() => handleSelectProduct(p)}
                        >
                            <span>{p.nombre_producto}</span>
                            <span className="text-muted-foreground">€{p.precio_venta}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )}
</div>
                                        </div>

                                        <Separator className="bg-muted-foreground/10" />

                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {assignedProducts.length > 0 ? assignedProducts.map(p => (
                                                <ActionTile
                                                    key={p.id}
                                                    title={p.nombre_producto}
                                                    description={`ID: ${p.id} • €${p.precio_venta}`}
                                                    icon={p.url_imagen_producto ? (
                                                        <div className="relative h-full w-full overflow-hidden rounded-md">
                                                            <Image src={p.url_imagen_producto} alt={p.nombre_producto} fill className="object-cover" />
                                                        </div>
                                                    ) : Package}
                                                    rightContentType="button"
                                                    buttonIcon={<X className="h-4 w-4" />}
                                                    buttonText=""
                                                    buttonVariant="ghost"
                                                    onButtonClick={() => handleRemoveProduct(p.id)}
                                                    className="bg-card hover:border-destructive/30"
                                                    padding="sm"
                                                />
                                            )) : (
                                                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card/50">
                                                    <LayoutGrid className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                                                    <TextSM className="text-muted-foreground font-medium">No hay productos en esta categoría</TextSM>
                                                    <TextXS className="text-muted-foreground/60">Usa el buscador para añadir productos</TextXS>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </DialogContent>
                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                    onConfirm={handleSaveClick}
                    confirmText="Guardar Categoría"
                />
            </DialogWindow>
        </Dialog>
    );
}
