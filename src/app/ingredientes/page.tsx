
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Beaker, AlertTriangle, ChevronLeft, ChevronRight, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    mockIngredients,
    mockIngredientCategories,
    mockTaxes,
    type Ingredient
} from '@/data/mock-data';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Extended Ingredient type
interface ExtendedIngredient extends Omit<Ingredient, 'id'> {
    id?: string;
    descripcion: string;
    proveedor_id: string;
    proveedor_nombre: string;
    stock_maximo: number;
    ubicacion_almacen: string;
    dias_caducidad: number;
    // Unit conversions
    conversiones: UnitConversion[];
    // Price history
    historial_precios: PriceHistory[];
}

interface UnitConversion {
    id: string;
    unidad_origen: string;
    unidad_destino: string;
    factor: number;
}

interface PriceHistory {
    id: string;
    fecha: string;
    precio: number;
    proveedor: string;
}

// Mock providers
const mockProveedores = [
    { id: 'prov-1', nombre: 'Distribuidora García' },
    { id: 'prov-2', nombre: 'Frutas y Verduras López' },
    { id: 'prov-3', nombre: 'Carnes Selectas S.L.' },
    { id: 'prov-4', nombre: 'Mariscos del Norte' },
    { id: 'prov-5', nombre: 'Lácteos Frescos' },
];

const emptyExtendedIngredient: ExtendedIngredient = {
    nombre_ingrediente: '',
    descripcion: '',
    id_categoria_ingrediente: '',
    costo_unitario: 0,
    unidad_medida: 'unidades',
    id_impuesto: '',
    stock_actual: 0,
    stock_minimo_alerta: 0,
    stock_maximo: 0,
    proveedor_id: '',
    proveedor_nombre: '',
    ubicacion_almacen: '',
    dias_caducidad: 0,
    conversiones: [],
    historial_precios: [],
};

function IngredientDialog({ open, onOpenChange, ingredientToEdit, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, ingredientToEdit: Ingredient | null, onSave: (ingredientData: Omit<Ingredient, 'id'> | Ingredient) => void }) {
    const taxes = mockTaxes;
    const ingredientCategories = mockIngredientCategories;

    const [ingredient, setIngredient] = React.useState<ExtendedIngredient>(emptyExtendedIngredient);
    const [activeTab, setActiveTab] = React.useState('general');

    // New conversion form
    const [newConversion, setNewConversion] = React.useState({ unidad_origen: '', unidad_destino: '', factor: 1 });

    React.useEffect(() => {
        if (ingredientToEdit) {
            setIngredient({
                ...emptyExtendedIngredient,
                ...ingredientToEdit,
                descripcion: (ingredientToEdit as any).descripcion || '',
                proveedor_id: (ingredientToEdit as any).proveedor_id || '',
                proveedor_nombre: (ingredientToEdit as any).proveedor_nombre || '',
                stock_maximo: (ingredientToEdit as any).stock_maximo || 0,
                ubicacion_almacen: (ingredientToEdit as any).ubicacion_almacen || '',
                dias_caducidad: (ingredientToEdit as any).dias_caducidad || 0,
                conversiones: (ingredientToEdit as any).conversiones || [],
                historial_precios: (ingredientToEdit as any).historial_precios || generateMockPriceHistory(ingredientToEdit.costo_unitario),
            });
        } else {
            const defaultTaxId = taxes.length > 0 ? taxes[0].id : '';
            const defaultCategoryId = ingredientCategories.length > 0 ? ingredientCategories[0].id : '';
            setIngredient({ ...emptyExtendedIngredient, id_impuesto: defaultTaxId, id_categoria_ingrediente: defaultCategoryId });
        }
        setActiveTab('general');
    }, [ingredientToEdit, open, taxes, ingredientCategories]);

    // Generate mock price history
    function generateMockPriceHistory(currentPrice: number): PriceHistory[] {
        const history: PriceHistory[] = [];
        let price = currentPrice;
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const variation = (Math.random() - 0.5) * 0.2; // +-10% variation
            price = i === 0 ? currentPrice : Math.max(0.01, price * (1 + variation));
            history.push({
                id: `ph-${i}`,
                fecha: date.toISOString().split('T')[0],
                precio: parseFloat(price.toFixed(2)),
                proveedor: mockProveedores[Math.floor(Math.random() * mockProveedores.length)].nombre,
            });
        }
        return history;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setIngredient(prev => ({ ...prev, [id]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setIngredient(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
    };

    const handleProveedorChange = (proveedorId: string) => {
        const proveedor = mockProveedores.find(p => p.id === proveedorId);
        setIngredient(prev => ({
            ...prev,
            proveedor_id: proveedorId,
            proveedor_nombre: proveedor?.nombre || ''
        }));
    };

    const handleAddConversion = () => {
        if (!newConversion.unidad_origen || !newConversion.unidad_destino || newConversion.factor <= 0) return;
        const conversion: UnitConversion = {
            id: `conv-${Date.now()}`,
            ...newConversion
        };
        setIngredient(prev => ({
            ...prev,
            conversiones: [...prev.conversiones, conversion]
        }));
        setNewConversion({ unidad_origen: '', unidad_destino: '', factor: 1 });
    };

    const handleRemoveConversion = (conversionId: string) => {
        setIngredient(prev => ({
            ...prev,
            conversiones: prev.conversiones.filter(c => c.id !== conversionId)
        }));
    };

    const handleSaveClick = () => {
        const ingredientToSave = {
            ...ingredient,
        };
        if (ingredientToEdit) {
            onSave({ ...ingredientToSave, id: ingredientToEdit.id } as Ingredient);
        } else {
            onSave(ingredientToSave as Omit<Ingredient, 'id'>);
        }
        onOpenChange(false);
    }

    // Calculate price trend
    const priceTrend = React.useMemo(() => {
        if (ingredient.historial_precios.length < 2) return 'stable';
        const lastPrice = ingredient.historial_precios[ingredient.historial_precios.length - 1]?.precio || 0;
        const prevPrice = ingredient.historial_precios[ingredient.historial_precios.length - 2]?.precio || 0;
        if (lastPrice > prevPrice * 1.02) return 'up';
        if (lastPrice < prevPrice * 0.98) return 'down';
        return 'stable';
    }, [ingredient.historial_precios]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{ingredientToEdit ? 'Editar' : 'Crear'} Ingrediente</DialogTitle>
                    <DialogDescription>Configura todos los detalles del ingrediente para tu inventario.</DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="stock">Stock</TabsTrigger>
                        <TabsTrigger value="conversiones">Conversiones</TabsTrigger>
                        <TabsTrigger value="historial">Historial Precios</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[45vh] mt-4 pr-4">
                        {/* Tab General */}
                        <TabsContent value="general" className="space-y-6 mt-0">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre_ingrediente">Nombre del Ingrediente *</Label>
                                    <Input id="nombre_ingrediente" value={ingredient.nombre_ingrediente} onChange={handleInputChange} placeholder="Ej: Tomate cherry" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="id_categoria_ingrediente">Categoría *</Label>
                                    <Select value={ingredient.id_categoria_ingrediente} onValueChange={(value) => setIngredient(prev => ({ ...prev, id_categoria_ingrediente: value }))}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>
                                            {ingredientCategories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea id="descripcion" value={ingredient.descripcion} onChange={handleInputChange} placeholder="Descripción opcional del ingrediente..." rows={2} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="costo_unitario">Costo Unitario (€) *</Label>
                                    <Input id="costo_unitario" type="number" value={ingredient.costo_unitario} onChange={handleNumberChange} step="0.01" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unidad_medida">Unidad de Medida *</Label>
                                    <Select value={ingredient.unidad_medida} onValueChange={(value) => setIngredient(prev => ({ ...prev, unidad_medida: value as any }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unidades">Unidades (uds)</SelectItem>
                                            <SelectItem value="g">Gramos (g)</SelectItem>
                                            <SelectItem value="kg">Kilos (kg)</SelectItem>
                                            <SelectItem value="ml">Mililitros (ml)</SelectItem>
                                            <SelectItem value="l">Litros (l)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="id_impuesto">Impuesto Aplicable</Label>
                                    <Select value={ingredient.id_impuesto} onValueChange={(value) => setIngredient(prev => ({ ...prev, id_impuesto: value }))}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>
                                            {taxes.map(tax => (
                                                <SelectItem key={tax.id} value={tax.id}>{tax.nombre_impuesto}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="proveedor">Proveedor Principal</Label>
                                    <Select value={ingredient.proveedor_id} onValueChange={handleProveedorChange}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar proveedor..." /></SelectTrigger>
                                        <SelectContent>
                                            {mockProveedores.map(prov => (
                                                <SelectItem key={prov.id} value={prov.id}>{prov.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab Stock */}
                        <TabsContent value="stock" className="space-y-6 mt-0">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stock_actual">Stock Actual</Label>
                                    <Input id="stock_actual" type="number" value={ingredient.stock_actual} onChange={handleNumberChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock_minimo_alerta">Stock Mínimo (Alerta)</Label>
                                    <Input id="stock_minimo_alerta" type="number" value={ingredient.stock_minimo_alerta} onChange={handleNumberChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock_maximo">Stock Máximo</Label>
                                    <Input id="stock_maximo" type="number" value={ingredient.stock_maximo} onChange={handleNumberChange} />
                                </div>
                            </div>

                            <Card className="bg-muted/50">
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Estado del Stock</p>
                                            <p className="text-xs text-muted-foreground">
                                                {ingredient.stock_actual} de {ingredient.stock_maximo || '∞'} {ingredient.unidad_medida}
                                            </p>
                                        </div>
                                        <Badge variant={
                                            ingredient.stock_actual <= ingredient.stock_minimo_alerta ? 'destructive' :
                                            ingredient.stock_actual <= ingredient.stock_minimo_alerta * 1.5 ? 'secondary' : 'default'
                                        }>
                                            {ingredient.stock_actual <= ingredient.stock_minimo_alerta ? 'Stock Bajo' :
                                             ingredient.stock_actual <= ingredient.stock_minimo_alerta * 1.5 ? 'Stock Medio' : 'Stock OK'}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ubicacion_almacen">Ubicación en Almacén</Label>
                                    <Input id="ubicacion_almacen" value={ingredient.ubicacion_almacen} onChange={handleInputChange} placeholder="Ej: Estante A3, Cámara fría" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dias_caducidad">Días hasta Caducidad (típico)</Label>
                                    <Input id="dias_caducidad" type="number" value={ingredient.dias_caducidad} onChange={handleNumberChange} placeholder="0 = no caduca" />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab Conversiones */}
                        <TabsContent value="conversiones" className="space-y-6 mt-0">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Conversiones de Unidades</CardTitle>
                                    <CardDescription>Define equivalencias entre unidades de medida.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2 items-end">
                                        <div className="space-y-1 flex-1">
                                            <Label className="text-xs">Unidad origen</Label>
                                            <Select value={newConversion.unidad_origen} onValueChange={(v) => setNewConversion(prev => ({ ...prev, unidad_origen: v }))}>
                                                <SelectTrigger className="h-9"><SelectValue placeholder="Origen" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="kg">Kilos (kg)</SelectItem>
                                                    <SelectItem value="g">Gramos (g)</SelectItem>
                                                    <SelectItem value="l">Litros (l)</SelectItem>
                                                    <SelectItem value="ml">Mililitros (ml)</SelectItem>
                                                    <SelectItem value="unidades">Unidades</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <span className="pb-2">=</span>
                                        <div className="space-y-1 w-20">
                                            <Label className="text-xs">Factor</Label>
                                            <Input
                                                type="number"
                                                value={newConversion.factor}
                                                onChange={(e) => setNewConversion(prev => ({ ...prev, factor: parseFloat(e.target.value) || 1 }))}
                                                className="h-9"
                                                step="0.01"
                                            />
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <Label className="text-xs">Unidad destino</Label>
                                            <Select value={newConversion.unidad_destino} onValueChange={(v) => setNewConversion(prev => ({ ...prev, unidad_destino: v }))}>
                                                <SelectTrigger className="h-9"><SelectValue placeholder="Destino" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="kg">Kilos (kg)</SelectItem>
                                                    <SelectItem value="g">Gramos (g)</SelectItem>
                                                    <SelectItem value="l">Litros (l)</SelectItem>
                                                    <SelectItem value="ml">Mililitros (ml)</SelectItem>
                                                    <SelectItem value="unidades">Unidades</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button size="sm" onClick={handleAddConversion} className="h-9">Añadir</Button>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        {ingredient.conversiones.map(conv => (
                                            <div key={conv.id} className="flex items-center justify-between p-2 border rounded-md bg-background text-sm">
                                                <span>1 {conv.unidad_origen} = {conv.factor} {conv.unidad_destino}</span>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveConversion(conv.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {ingredient.conversiones.length === 0 && (
                                            <p className="text-sm text-center text-muted-foreground py-4">No hay conversiones configuradas.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab Historial Precios */}
                        <TabsContent value="historial" className="space-y-6 mt-0">
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-base">Historial de Precios</CardTitle>
                                            <CardDescription>Evolución del costo unitario en el tiempo.</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {priceTrend === 'up' && <TrendingUp className="h-5 w-5 text-destructive" />}
                                            {priceTrend === 'down' && <TrendingDown className="h-5 w-5 text-green-600" />}
                                            {priceTrend === 'stable' && <Minus className="h-5 w-5 text-muted-foreground" />}
                                            <span className="text-sm font-medium">
                                                €{ingredient.costo_unitario.toFixed(2)}/{ingredient.unidad_medida}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Precio</TableHead>
                                                <TableHead>Proveedor</TableHead>
                                                <TableHead className="text-right">Variación</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ingredient.historial_precios.slice().reverse().map((entry, index, arr) => {
                                                const prevEntry = arr[index + 1];
                                                const variation = prevEntry ? ((entry.precio - prevEntry.precio) / prevEntry.precio) * 100 : 0;
                                                return (
                                                    <TableRow key={entry.id}>
                                                        <TableCell>{format(new Date(entry.fecha), 'dd MMM yyyy', { locale: es })}</TableCell>
                                                        <TableCell className="font-medium">€{entry.precio.toFixed(2)}</TableCell>
                                                        <TableCell className="text-muted-foreground">{entry.proveedor}</TableCell>
                                                        <TableCell className="text-right">
                                                            {index < arr.length - 1 && (
                                                                <span className={variation > 0 ? 'text-destructive' : variation < 0 ? 'text-green-600' : ''}>
                                                                    {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                    {ingredient.historial_precios.length === 0 && (
                                        <p className="text-sm text-center text-muted-foreground py-4">No hay historial de precios.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

                <DialogFooter className="border-t pt-4">
                    <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
                    <Button onClick={handleSaveClick}>Guardar Ingrediente</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function IngredientesPage() {
    const [ingredients, setIngredients] = React.useState<Ingredient[]>(mockIngredients);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingIngredient, setEditingIngredient] = React.useState<Ingredient | null>(null);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(12);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [selectedRows, setSelectedRows] = React.useState<Record<string, boolean>>({});
    const { toast } = useToast();


    React.useEffect(() => {
        setCurrentPage(1);
        setSelectedRows({});
    }, [searchTerm]);

    // Local helpers replacing useAppData functions
    const addIngredient = (ingredientData: Omit<Ingredient, 'id'>) => {
        const newIngredient: Ingredient = {
            ...ingredientData,
            id: `ing-${Date.now()}`,
        };
        setIngredients(prev => [...prev, newIngredient]);
    };

    const updateIngredient = (id: string, ingredientData: Partial<Ingredient>) => {
        setIngredients(prev => prev.map(i => i.id === id ? { ...i, ...ingredientData } : i));
    };

    const removeIngredient = (id: string) => {
        setIngredients(prev => prev.filter(i => i.id !== id));
    };

    const getTaxName = (id: string) => {
        const tax = mockTaxes.find(t => t.id === id);
        return tax ? tax.nombre_impuesto : undefined;
    };


    const filteredIngredients = ingredients.filter(ing =>
        ing.nombre_ingrediente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentIngredients = filteredIngredients.slice(indexOfFirstItem, indexOfLastItem);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setIsAnimating(true);
        setSelectedRows({});
        setTimeout(() => {
            setCurrentPage(pageNumber);
            setIsAnimating(false);
        }, 300);
    };

    const handleOpenDialog = (ingredient?: Ingredient) => {
        setEditingIngredient(ingredient || null);
        setIsDialogOpen(true);
    };

    const handleSave = (ingredientData: Omit<Ingredient, 'id'> | Ingredient) => {
        const isEditing = 'id' in ingredientData;
        if (isEditing) {
            updateIngredient(ingredientData.id, ingredientData);
        } else {
            addIngredient(ingredientData as Omit<Ingredient, 'id'>);
        }
        toast({
            title: `Ingrediente ${isEditing ? 'Actualizado' : 'Creado'}`,
            description: `El ingrediente "${ingredientData.nombre_ingrediente}" se ha guardado.`,
        });
    };

    const handleRemove = (id: string, name: string) => {
        removeIngredient(id);
        toast({
            variant: "destructive",
            title: "Ingrediente Eliminado",
            description: `El ingrediente "${name}" ha sido eliminado.`,
        });
    }

    const getStockStatus = (current: number, min: number): 'ok' | 'warning' | 'low' => {
        if (min <= 0) return 'ok';
        if (current <= min) return 'low';
        if (current <= min * 1.5) return 'warning';
        return 'ok';
    }

    const handleRowSelect = (ingredientId: string) => {
        setSelectedRows(prev => ({ ...prev, [ingredientId]: !prev[ingredientId] }));
    };

    const handleSelectAll = (checked: boolean) => {
        const newSelectedRows: Record<string, boolean> = {};
        if (checked) {
            currentIngredients.forEach(ing => {
                newSelectedRows[ing.id] = true;
            });
        }
        setSelectedRows(newSelectedRows);
    };

    const numSelected = Object.values(selectedRows).filter(Boolean).length;
    const isAllOnPageSelected = numSelected === currentIngredients.length && currentIngredients.length > 0;
    const isSomeOnPageSelected = numSelected > 0 && !isAllOnPageSelected;

    return (
        <div className="flex flex-1 flex-col h-full">
            <PageHeader title="Librería de Ingredientes" />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-2 md:gap-6 md:p-6 md:pt-3">
                <Card className="min-h-[70vh]">
                    <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar ingrediente..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Ingrediente
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40px]">
                                        <Checkbox
                                            checked={isAllOnPageSelected}
                                            onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                                            aria-label="Seleccionar todas las filas de esta página"
                                            data-state={isSomeOnPageSelected ? 'indeterminate' : (isAllOnPageSelected ? 'checked' : 'unchecked')}
                                        />
                                    </TableHead>
                                    <TableHead>Ingrediente</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Costo Unitario</TableHead>
                                    <TableHead>Impuesto</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody
                                key={currentPage}
                                className={cn(
                                    'transition-opacity duration-300',
                                    isAnimating ? 'opacity-0' : 'opacity-100'
                                )}
                            >
                                {currentIngredients.length > 0 ? currentIngredients.map((ing) => {
                                    const stockStatus = getStockStatus(ing.stock_actual, ing.stock_minimo_alerta);
                                    return (
                                        <TableRow key={ing.id} data-state={selectedRows[ing.id] && 'selected'}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={!!selectedRows[ing.id]}
                                                    onCheckedChange={() => handleRowSelect(ing.id)}
                                                    aria-label={`Seleccionar fila ${ing.id}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{ing.nombre_ingrediente}</TableCell>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Badge variant={
                                                                stockStatus === 'low' ? 'destructive' :
                                                                    stockStatus === 'warning' ? 'destructive' : // Mapped warning to destructive for standard Shadcn badges or keep if custom
                                                                        'secondary'
                                                            }>
                                                                {(stockStatus === 'low' || stockStatus === 'warning') && <AlertTriangle className="mr-1 h-3 w-3" />}
                                                                {ing.stock_actual} {ing.unidad_medida}
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Alerta de stock mínimo: {ing.stock_minimo_alerta} {ing.unidad_medida}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>€{ing.costo_unitario.toFixed(2)}</TableCell>
                                            <TableCell>{getTaxName(ing.id_impuesto)}</TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(ing)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción no se puede deshacer. Se eliminará el ingrediente de tu librería.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleRemove(ing.id, ing.nombre_ingrediente)} className={buttonVariants({ variant: 'destructive' })}>Eliminar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            {searchTerm ? 'No se encontraron ingredientes.' : 'No has creado ningún ingrediente todavía.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                            Mostrando <strong>{Math.min(indexOfFirstItem + 1, filteredIngredients.length)}-{Math.min(indexOfLastItem, filteredIngredients.length)}</strong> de <strong>{filteredIngredients.length}</strong> ingredientes.
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
            <IngredientDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} ingredientToEdit={editingIngredient} onSave={handleSave} />
        </div>
    );
}


