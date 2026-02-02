'use client';

import * as React from 'react';
import { Settings } from 'lucide-react';

import type { ViewConfig } from '@/app/comandas/_data/config';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

type ViewConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewConfig: ViewConfig;
  onConfigChange: (key: keyof ViewConfig, value: ViewConfig[keyof ViewConfig]) => void;
  onSave: () => void;
};

export function ViewConfigDialog({
  open,
  onOpenChange,
  viewConfig,
  onConfigChange,
  onSave,
}: ViewConfigDialogProps) {
  const handleItemsPerPageChange = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    onConfigChange('itemsPerPage', Number.isNaN(parsed) ? viewConfig.itemsPerPage : parsed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurar Vista
          </DialogTitle>
          <DialogDescription>
            Personaliza las columnas visibles y opciones de la tabla.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Columnas visibles</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showOrder" className="font-normal">Número de Orden</Label>
                <Switch id="showOrder" checked={viewConfig.showOrder} onCheckedChange={(value) => onConfigChange('showOrder', value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showName" className="font-normal">Cliente</Label>
                <Switch id="showName" checked={viewConfig.showName} onCheckedChange={(value) => onConfigChange('showName', value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showTable" className="font-normal">Mesa</Label>
                <Switch id="showTable" checked={viewConfig.showTable} onCheckedChange={(value) => onConfigChange('showTable', value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showTime" className="font-normal">Hora</Label>
                <Switch id="showTime" checked={viewConfig.showTime} onCheckedChange={(value) => onConfigChange('showTime', value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showTotal" className="font-normal">Total</Label>
                <Switch id="showTotal" checked={viewConfig.showTotal} onCheckedChange={(value) => onConfigChange('showTotal', value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showStatus" className="font-normal">Estado</Label>
                <Switch id="showStatus" checked={viewConfig.showStatus} onCheckedChange={(value) => onConfigChange('showStatus', value)} />
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Items por página</Label>
            <Select value={viewConfig.itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
