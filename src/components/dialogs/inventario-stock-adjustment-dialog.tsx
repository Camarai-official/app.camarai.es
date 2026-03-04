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

type InventoryItem = Ingredient;
type AdjustmentType = 'add' | 'subtract-sale' | 'subtract-waste' | 'set';

const adjustmentTypes = [
    { id: 'add', label: 'Entrada' },
    { id: 'subtract-sale', label: 'Venta' },
    { id: 'subtract-waste', label: 'Merma' },
    { id: 'set', label: 'Fijar' }
];

const adjustmentConfig = {
    'add': { title: 'Entrada', description: 'Añadir unidades al stock actual.', icon: ArrowDown },
    'subtract-sale': { title: 'Venta', description: 'Descontar unidades por venta.', icon: ArrowRight },
    'subtract-waste': { title: 'Merma', description: 'Descontar por merma o daño.', icon: X },
    'set': { title: 'Fijar', description: 'Establecer valor exacto.', icon: Check }
};

interface StockAdjustmentDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStock: (id: string, newStock: number) => void;
}

export function StockAdjustmentDialog({ item, open, onOpenChange, onUpdateStock }: StockAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = React.useState<AdjustmentType>('add');
  const [amount, setAmount] = React.useState(0);
  const [reason, setReason] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setAdjustmentType('add');
      setAmount(0);
      setReason('');
    }
  }, [open]);

  const handleAdjust = () => {
    if (!item || item.stock_actual === undefined) return;
    let finalAmount = item.stock_actual;

    switch (adjustmentType) {
      case 'add':
        finalAmount += amount;
        break;
      case 'subtract-sale':
      case 'subtract-waste':
        finalAmount -= amount;
        break;
      case 'set':
        finalAmount = amount;
        break;
    }

    onUpdateStock(item.id, finalAmount);
    toast({
      title: "Stock Actualizado",
      description: `${item.nombre_ingrediente}: ${finalAmount} ${item.unidad_medida}.`
    });
    onOpenChange(false);
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
