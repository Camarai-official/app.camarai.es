'use client';

import * as React from 'react';
import { Banknote } from 'lucide-react';
import { 
    Dialog, 
    DialogContent, 
    DialogFooter, 
    DialogHeader,
    DialogWindow,
    DialogClose
} from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tax } from '@/data/mock-data';

interface TaxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTax: Tax | null;
  onSave: (taxData: { nombre_impuesto: string; porcentaje_impuesto: number }) => void;
}

export function TaxDialog({ open, onOpenChange, editingTax, onSave }: TaxDialogProps) {
  const [taxName, setTaxName] = React.useState('');
  const [taxRate, setTaxRate] = React.useState(0);

  React.useEffect(() => {
    if (editingTax) {
      setTaxName(editingTax.nombre_impuesto);
      setTaxRate(editingTax.porcentaje_impuesto);
    } else {
      setTaxName('');
      setTaxRate(0);
    }
  }, [editingTax, open]);

  const handleSave = () => {
    onSave({ nombre_impuesto: taxName, porcentaje_impuesto: taxRate });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow size="md">
        <DialogHeader
          icon={Banknote}
          title={`${editingTax ? 'Editar' : 'Crear'} Impuesto`}
          description="Define un nuevo tipo impositivo para tus productos."
        />
        <DialogContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tax-name">Nombre del Impuesto</Label>
              <Input 
                id="tax-name" 
                value={taxName} 
                onChange={(e) => setTaxName(e.target.value)} 
                placeholder="Ej: IVA General, Tasa Turística..." 
              />
            </div>
            <div>
              <Label htmlFor="tax-rate">Porcentaje (%)</Label>
              <Input 
                id="tax-rate" 
                type="number" 
                value={taxRate} 
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} 
                placeholder="Ej: 21" 
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
          <Button variant="default" onClick={handleSave}>Guardar Impuesto</Button>
        </DialogFooter>
      </DialogWindow>
    </Dialog>
  );
}
