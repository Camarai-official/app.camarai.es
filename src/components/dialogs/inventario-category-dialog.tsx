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
import Image from 'next/image';
import type { Category, Product } from '@/data/mock-data';

export interface ExtendedCategory extends Category {
    descripcion?: string;
    icono?: string;
    color?: string;
    imagen?: string;
    orden?: number;
    categoria_padre_id?: string;
    visible_en_carta?: boolean;
    impresora_destino?: string;
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
                                <div className="grid grid-cols-2 gap-6 text-foreground">
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

                                <Card>
                                    <CardHeader title="Vista Previa" />
                                    <CardContent>
                                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                                            <div
                                                className="h-10 w-10 rounded-md flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: categoryData.color || '#9B6EFD' }}
                                            >
                                                <SelectedIcon className="h-5 w-5 text-foreground" />
                                            </div>
                                            <div>
                                                <TextMD className="text-foreground">{categoryData.nombre_categoria || 'Nombre de categoría'}</TextMD>
                                                <TextXS className="text-muted-foreground">{categoryData.descripcion || 'Descripción de la categoría'}</TextXS>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="productos" spaced className="p-6">
                                <div className="space-y-4">
                                    <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <SearchInput
                                                placeholder="Buscar productos para añadir..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    if (e.target.value.length > 0) setIsSearchPopoverOpen(true);
                                                    else setIsSearchPopoverOpen(false);
                                                }}
                                            />
                                        </PopoverTrigger>
                                        <PopoverContent>
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
                                        <CardHeader title={`Productos Asignados (${assignedProducts.length})`} description="Productos que pertenecen a esta categoría." />
                                        <CardContent padding="none">
                                            <ScrollArea>
                                                <div className="space-y-2 p-4">
                                                    {assignedProducts.length > 0 ? assignedProducts.map(p => (
                                                        <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                                                                    {p.url_imagen_producto ? (
                                                                        <Image 
                                                                            src={p.url_imagen_producto} 
                                                                            alt={p.nombre_producto} 
                                                                            fill 
                                                                            className="object-cover" 
                                                                        />
                                                                    ) : (
                                                                        <Package className="h-5 w-5 text-muted-foreground opacity-40" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <TextSM className="text-foreground">{p.nombre_producto}</TextSM>
                                                                    <TextMD className="text-muted-foreground">ID: {p.id}</TextMD>
                                                                </div>
                                                            </div>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="md" 
                                                                onClick={() => handleRemoveProduct(p.id)}
                                                            >
                                                                <X className="h-4 w-4 text-muted-foreground" />
                                                            </Button>
                                                        </div>
                                                    )) : (
                                                        <div className="text-center text-sm text-muted-foreground py-10">
                                                            <TextMD>Aún no hay productos en esta categoría.</TextMD>
                                                            <TextXS>Busca productos arriba para añadirlos.</TextXS>
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
