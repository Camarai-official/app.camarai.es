'use client';

import * as React from 'react';
import { Beaker, Repeat, Trash } from 'lucide-react';
import { 
    Dialog, 
    DialogWindow,
    DialogContent, 
    DialogFooter, 
    DialogHeader 
} from '@/components/layout/dialog';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ActionTile } from '@/components/ui/action-tile';
import { 
    mockIngredientCategories, 
    mockTaxes, 
    type Ingredient 
} from '@/data/mock-data';

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

interface ExtendedIngredient extends Omit<Ingredient, 'id'> {
    id?: string;
    descripcion: string;
    proveedor_id: string;
    proveedor_nombre: string;
    stock_maximo: number;
    ubicacion_almacen: string;
    dias_caducidad: number;
    conversiones: UnitConversion[];
    historial_precios: PriceHistory[];
}

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
    historial_precios: []
};

interface IngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredientToEdit: Ingredient | null;
  onSave: (ingredientData: Omit<Ingredient, 'id'> | Ingredient) => void;
}

export function IngredientDialog({ open, onOpenChange, ingredientToEdit, onSave }: IngredientDialogProps) {
    const taxes = mockTaxes;
    const ingredientCategories = mockIngredientCategories;

    const [ingredient, setIngredient] = React.useState<ExtendedIngredient>(emptyExtendedIngredient);
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
                historial_precios: (ingredientToEdit as any).historial_precios || []
            });
        } else {
            setIngredient({ 
                ...emptyExtendedIngredient, 
                id_impuesto: taxes[0]?.id || '', 
                id_categoria_ingrediente: ingredientCategories[0]?.id || '' 
            });
        }
    }, [ingredientToEdit, open, taxes, ingredientCategories]);

    const handleSaveClick = () => {
        if (ingredientToEdit) onSave({ ...ingredient, id: ingredientToEdit.id } as Ingredient);
        else onSave(ingredient as Omit<Ingredient, 'id'>);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="lg">
                <DialogHeader
                    icon={Beaker}
                    title={ingredientToEdit ? 'Editar Parámetros' : 'Nuevo Ingrediente'}
                    description="Información técnica y niveles de stock."
                />

                <DialogContent spaced>
                    <Card>
                        <CardHeader title="Información General" description="Datos básicos del ingrediente y costes." />
                        <CardContent gap="md">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label variant="medium">Nombre *</Label>
                                    <Input value={ingredient.nombre_ingrediente} onChange={e => setIngredient(p => ({ ...p, nombre_ingrediente: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label variant="medium">Categoría *</Label>
                                    <Select value={ingredient.id_categoria_ingrediente} onValueChange={v => setIngredient(p => ({ ...p, id_categoria_ingrediente: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {mockIngredientCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label variant="medium">Costo Base (€)</Label>
                                    <Input type="number" value={ingredient.costo_unitario} onChange={e => setIngredient(p => ({ ...p, costo_unitario: parseFloat(e.target.value) || 0 }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label variant="medium">Unidad Principal</Label>
                                    <Select value={ingredient.unidad_medida} onValueChange={v => setIngredient(p => ({ ...p, unidad_medida: v as any }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unidades">Unidades</SelectItem>
                                            <SelectItem value="kg">Kilos (kg)</SelectItem>
                                            <SelectItem value="g">Gramos (g)</SelectItem>
                                            <SelectItem value="l">Litros (l)</SelectItem>
                                            <SelectItem value="ml">Mililitros (ml)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Control de Stock" description="Niveles de inventario y alertas." />
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label variant="medium">Stock Actual</Label>
                                    <Input type="number" value={ingredient.stock_actual} onChange={e => setIngredient(p => ({ ...p, stock_actual: parseFloat(e.target.value) || 0 }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label variant="medium">Mín. Alerta</Label>
                                    <Input type="number" value={ingredient.stock_minimo_alerta} onChange={e => setIngredient(p => ({ ...p, stock_minimo_alerta: parseFloat(e.target.value) || 0 }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label variant="medium">Máx. Meta</Label>
                                    <Input type="number" value={ingredient.stock_maximo} onChange={e => setIngredient(p => ({ ...p, stock_maximo: parseFloat(e.target.value) || 0 }))} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Unidades de Medida" description="Configura conversiones personalizadas." />
                        <CardContent gap="md">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1 space-y-2"><Label variant="medium">De</Label><Input value={newConversion.unidad_origen} onChange={e => setNewConversion(p => ({ ...p, unidad_origen: e.target.value }))} placeholder="Ej: Bolsa" /></div>
                                <div className="w-20 space-y-2"><Label variant="medium">Factor</Label><Input type="number" value={newConversion.factor} onChange={e => setNewConversion(p => ({ ...p, factor: parseFloat(e.target.value) || 1 }))} /></div>
                                <div className="flex-1 space-y-2"><Label variant="medium">A</Label><Input value={newConversion.unidad_destino} onChange={e => setNewConversion(p => ({ ...p, unidad_destino: e.target.value }))} placeholder="Ej: Kg" /></div>
                                <Button variant="secondary" size="md" onClick={() => setIngredient(p => ({ ...p, conversiones: [...p.conversiones, { id: `c-${Date.now()}`, ...newConversion }] }))}>Añadir</Button>
                            </div>
                            <div className="space-y-2 mt-2">
                                {ingredient.conversiones.map(c => (
                                    <ActionTile 
                                        key={c.id} 
                                        title={`1 ${c.unidad_origen} = ${c.factor} ${c.unidad_destino}`}
                                        icon={Repeat}
                                        padding="sm"
                                        rightContentType="button"
                                        buttonText=""
                                        buttonIcon={<Trash className="h-4 w-4" />}
                                        buttonVariant="ghost"
                                        onButtonClick={() => setIngredient(p => ({ ...p, conversiones: p.conversiones.filter(x => x.id !== c.id) }))}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </DialogContent>

                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                    onConfirm={handleSaveClick}
                    confirmText="Guardar Cambios"
                />
            </DialogWindow>
        </Dialog>
    );
}
