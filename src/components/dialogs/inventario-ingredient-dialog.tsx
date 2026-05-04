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
    unidad_medida: 'unidades' as any, // Valor por defecto, se convertirá a 'units' al guardar
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
  categories?: any[]; // Convex ingredient categories
}

export function IngredientDialog({ open, onOpenChange, ingredientToEdit, onSave, categories = [] }: IngredientDialogProps) {
    const taxes = mockTaxes;
    const ingredientCategories = categories; // Use Convex categories instead of mock data

    const [ingredient, setIngredient] = React.useState<ExtendedIngredient>(emptyExtendedIngredient);
    const [newConversion, setNewConversion] = React.useState({ unidad_origen: '', unidad_destino: '', factor: 1 });

    React.useEffect(() => {
        if (ingredientToEdit) {
            // Mapear datos de Convex al formato del diálogo
            const mappedIngredient = {
                ...emptyExtendedIngredient,
                // ID del ingrediente
                id: (ingredientToEdit as any).id || (ingredientToEdit as any)._id,
                
                // Campos básicos
                nombre_ingrediente: (ingredientToEdit as any).nombre_ingrediente || (ingredientToEdit as any).name || '',
                descripcion: (ingredientToEdit as any).descripcion || (ingredientToEdit as any).description || '',
                costo_unitario: (ingredientToEdit as any).costo_unitario || (ingredientToEdit as any).cost_base || 0,
                unidad_medida: (ingredientToEdit as any).unidad_medida || (ingredientToEdit as any).unit || 'unidades',
                
                // Categoría - usar el campo correcto que viene del frontend
                id_categoria_ingrediente: (ingredientToEdit as any).id_categoria_ingrediente || 
                                       (ingredientToEdit as any).id_categoria || 
                                       (ingredientToEdit as any).category_id || '',
                
                // Stock - usar los campos correctos que vienen del frontend
                stock_actual: (ingredientToEdit as any).stock_actual || (ingredientToEdit as any).stock || 0,
                stock_minimo_alerta: (ingredientToEdit as any).stock_minimo_alerta || 
                                     (ingredientToEdit as any).stock_minimo || 
                                     (ingredientToEdit as any).alert_min || 0,
                stock_maximo: (ingredientToEdit as any).stock_maximo || (ingredientToEdit as any).stock_max || 0,
                
                // Proveedor
                proveedor_id: (ingredientToEdit as any).proveedor_id || '',
                proveedor_nombre: (ingredientToEdit as any).proveedor_nombre || (ingredientToEdit as any).supplier || (ingredientToEdit as any).proveedor || '',
                
                // Otros campos
                ubicacion_almacen: (ingredientToEdit as any).ubicacion_almacen || '',
                dias_caducidad: (ingredientToEdit as any).dias_caducidad || 0,
                conversiones: (ingredientToEdit as any).conversiones || [],
                historial_precios: (ingredientToEdit as any).historial_precios || [],
                id_impuesto: (ingredientToEdit as any).id_impuesto || ''
            };
            
            setIngredient(mappedIngredient);
        } else {
            setIngredient({ 
                ...emptyExtendedIngredient, 
                id_impuesto: taxes[0]?.id || '', 
                id_categoria_ingrediente: ingredientCategories[0]?._id || '' // Usar _id de Convex
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
                                            {ingredientCategories.map(cat => (
                                                <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label variant="medium">Costo Base (€)</Label>
                                    <Input type="number" value={ingredient.costo_unitario || ''} onChange={e => setIngredient(p => ({ ...p, costo_unitario: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label variant="medium">Unidad Principal</Label>
                                    <Select value={ingredient.unidad_medida} onValueChange={v => setIngredient(p => ({ ...p, unidad_medida: v as any }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kg">Kilos (kg)</SelectItem>
                                            <SelectItem value="grams">Gramos (g)</SelectItem>
                                            <SelectItem value="liters">Litros (l)</SelectItem>
                                            <SelectItem value="mililiter">Mililitros (ml)</SelectItem>
                                            <SelectItem value="units">Unidades</SelectItem>
                                            <SelectItem value="bolsa">Bolsa</SelectItem>
                                            <SelectItem value="caja">Caja</SelectItem>
                                            <SelectItem value="paquete">Paquete</SelectItem>
                                            <SelectItem value="botella">Botella</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Control de Stock" description="Niveles de inventario y alertas." />
                        <CardContent gap="md">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label variant="medium">Stock Actual</Label>
                                    <Input type="number" value={ingredient.stock_actual || ''} onChange={e => setIngredient(p => ({ ...p, stock_actual: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label variant="medium">Mín. Alerta</Label>
                                    <Input type="number" value={ingredient.stock_minimo_alerta || ''} onChange={e => setIngredient(p => ({ ...p, stock_minimo_alerta: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label variant="medium">Máx. Meta</Label>
                                    <Input type="number" value={ingredient.stock_maximo || ''} onChange={e => setIngredient(p => ({ ...p, stock_maximo: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 }))} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Unidades de Medida" description="Configura conversiones personalizadas." />
                        <CardContent gap="md">
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr,80px,1fr] gap-3 items-end">
                                    <div className="space-y-2">
                                        <Label variant="medium">De</Label>
                                        <Select value={newConversion.unidad_origen} onValueChange={v => setNewConversion(p => ({ ...p, unidad_origen: v }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar unidad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kg">Kilos (kg)</SelectItem>
                                                <SelectItem value="grams">Gramos (g)</SelectItem>
                                                <SelectItem value="liters">Litros (l)</SelectItem>
                                                <SelectItem value="mililiter">Mililitros (ml)</SelectItem>
                                                <SelectItem value="units">Unidades</SelectItem>
                                                <SelectItem value="bolsa">Bolsa</SelectItem>
                                                <SelectItem value="caja">Caja</SelectItem>
                                                <SelectItem value="paquete">Paquete</SelectItem>
                                                <SelectItem value="botella">Botella</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label variant="medium">Factor</Label>
                                        <Input type="number" value={newConversion.factor} onChange={e => setNewConversion(p => ({ ...p, factor: parseFloat(e.target.value) || 1 }))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label variant="medium">A</Label>
                                        <Select value={newConversion.unidad_destino} onValueChange={v => setNewConversion(p => ({ ...p, unidad_destino: v }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar unidad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kg">Kilos (kg)</SelectItem>
                                                <SelectItem value="grams">Gramos (g)</SelectItem>
                                                <SelectItem value="liters">Litros (l)</SelectItem>
                                                <SelectItem value="mililiter">Mililitros (ml)</SelectItem>
                                                <SelectItem value="units">Unidades</SelectItem>
                                                <SelectItem value="bolsa">Bolsa</SelectItem>
                                                <SelectItem value="caja">Caja</SelectItem>
                                                <SelectItem value="paquete">Paquete</SelectItem>
                                                <SelectItem value="botella">Botella</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button 
                                    variant="secondary" 
                                    className="w-full sm:w-auto"
                                    onClick={() => setIngredient(p => ({ ...p, conversiones: [...p.conversiones, { id: `c-${Date.now()}`, ...newConversion }] }))}
                                >
                                    Añadir
                                </Button>
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
