'use client';

import * as React from 'react';
import { Package, ArrowDown, X, Check, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
    Dialog, 
    DialogWindow,
    DialogContent, 
    DialogFooter, 
    DialogHeader 
} from '@/components/layout/dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select-field';
import { type Ingredient } from '@/data/mock-data';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';

type InventoryItem = Ingredient;
type AdjustmentType = 'add' | 'subtract-sale' | 'subtract-waste' | 'subtract-return' | 'set';

const adjustmentTypes = [
    { id: 'add', label: 'Entrada' },
    { id: 'subtract-sale', label: 'Venta Manual' },
    { id: 'subtract-waste', label: 'Merma' },
    { id: 'subtract-return', label: 'Devolución' },
    { id: 'set', label: 'Ajuste' }
];

const adjustmentConfig = {
    'add': { title: 'Entrada', description: 'Añadir unidades al stock actual.', icon: ArrowDown },
    'subtract-sale': { title: 'Venta Manual', description: 'Descontar unidades por venta directa sin receta.', icon: ArrowRight },
    'subtract-waste': { title: 'Merma', description: 'Descontar por merma o daño.', icon: X },
    'subtract-return': { title: 'Devolución', description: 'Devolver unidades al stock.', icon: ArrowDown },
    'set': { title: 'Ajuste', description: 'Establecer valor exacto de inventario.', icon: Check }
};

interface StockAdjustmentDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStock: (id: string, newStock: number) => void;
  staffId?: string;
  staffData?: any[]; // Agregar staffData como prop
}

export function StockAdjustmentDialog({ item, open, onOpenChange, onUpdateStock, staffId, staffData }: StockAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = React.useState<AdjustmentType>('add');
  const [amount, setAmount] = React.useState(0);
  const [reason, setReason] = React.useState('');
  // Botón siempre habilitado para pruebas
  const isDisabled = false;
  const { toast } = useToast();
  
  const adjustStock = useMutation(api.inventory.adjustStockManually);
  const setStock = useMutation(api.inventory.setStockExact);

  React.useEffect(() => {
    if (open) {
      setAdjustmentType('add');
      setAmount(0);
      setReason('');
    }
  }, [open]);

  const handleAdjust = async () => {
    if (!item || item.stock_actual === undefined) {
      return;
    }
    
    // Usar staffId real si existe, sino usar el primero disponible
    const effectiveStaffId = staffId || (staffData && staffData.length > 0 ? staffData[0].id : null);
    
    if (!effectiveStaffId) {
      toast({
        title: "Error",
        description: "No hay staff disponible para realizar el ajuste",
        variant: "destructive"
      });
      return;
    }
    
    if (amount <= 0 && adjustmentType !== 'set') {
      return;
    }
    
    try {
      let finalAmount = item.stock_actual;
      let movementType: "purchase" | "sale" | "waste" | "adjustment" | "return";
      let adjustmentQuantity = 0;

      switch (adjustmentType) {
        case 'add':
          finalAmount += amount;
          movementType = "purchase";
          adjustmentQuantity = amount;
          break;
        case 'subtract-sale':
          finalAmount -= amount;
          movementType = "sale";
          adjustmentQuantity = -amount;
          break;
        case 'subtract-waste':
          finalAmount -= amount;
          movementType = "waste";
          adjustmentQuantity = -amount;
          break;
        case 'subtract-return':
          finalAmount += amount;
          movementType = "return";
          adjustmentQuantity = amount;
          break;
        case 'set':
          finalAmount = amount;
          // Usar mutation específica para set
          console.log("🔧 Using setStock mutation");
          await setStock({
            ingredientId: item.id as any,
            newStock: amount,
            staffId: effectiveStaffId as any,
            notes: reason || `Ajuste de inventario a ${amount} ${item.unidad_medida}`
          });
          break;
      }

      // Para todos los casos excepto 'set', usar adjustStock
      if (adjustmentType !== 'set') {
        console.log("🔧 Using adjustStock mutation:", {
          ingredientId: item.id,
          adjustmentQuantity,
          type: movementType,
          staffId: effectiveStaffId,
          notes: reason || `${movementType}: ${amount} ${item.unidad_medida}`
        });
        
        await adjustStock({
          ingredientId: item.id as any,
          adjustmentQuantity,
          type: movementType,
          staffId: effectiveStaffId as any,
          notes: reason || `${movementType}: ${amount} ${item.unidad_medida}`
        });
      }

      onUpdateStock(item.id, finalAmount);
      toast({
        title: "Stock Actualizado",
        description: `${item.nombre_ingrediente}: ${finalAmount} ${item.unidad_medida}.`
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock",
        variant: "destructive"
      });
    }
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow size="md" className="max-h-[80vh]">
        <DialogHeader
          icon={Package}
          title={`Ajustar Stock: ${item.nombre_ingrediente}`}
          description={`Valor actual: ${item.stock_actual} ${item.unidad_medida}.`}
        />

        <DialogContent className="gap-6 overflow-y-auto">
          <SelectField 
              label="Tipo de Operación"
              options={adjustmentTypes}
              selectedValues={[adjustmentType]}
              onToggle={(id) => setAdjustmentType(id as AdjustmentType)}
              columns={2}
          />

          <Card padding="md">
            <CardHeader 
              title={adjustmentConfig[adjustmentType].title}
              description={adjustmentConfig[adjustmentType].description}
              icon={adjustmentConfig[adjustmentType].icon}
            />
            <CardContent padding="none" gap="md">
              <div>
                <Label variant="medium">Cantidad ({item.unidad_medida})</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} min="0" />
                  <Badge variant="secondary" size="md">
                      {item.unidad_medida}
                  </Badge>
                </div>
              </div>
              <div>
                <Label variant="medium">Motivo</Label>
                <Textarea placeholder="Opcional..." value={reason} onChange={e => setReason(e.target.value)} rows={2} className="mt-2" />
              </div>
            </CardContent>
          </Card>
        </DialogContent>

        <DialogFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={handleAdjust}
          confirmText="Confirmar Ajuste"
        />
      </DialogWindow>
    </Dialog>
  )
}
