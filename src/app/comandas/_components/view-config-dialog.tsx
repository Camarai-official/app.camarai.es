'use client';

import * as React from 'react';
import { Settings, Hash, User, LayoutGrid, Clock, Wallet, Activity, ListOrdered } from 'lucide-react';

import type { ViewConfig } from '@/app/comandas/_data/config';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingItem } from '@/components/ui/settings-modal';
import { ConfigItem } from '@/components/ui/config-item';

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
      <DialogContent className="sm:max-w-[550px] overflow-hidden border-none shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle icon={Settings}>
            Configurar Vista
          </DialogTitle>
          <DialogDescription>
            Personaliza las columnas visibles y opciones de visualización de las comandas.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] -mx-6">
          <div className="space-y-6 px-6 py-4">
            {/* Sección: Columnas */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <LayoutGrid className="h-3 w-3" /> Columnas Visibles
              </h4>
              <div className="grid gap-3">
                <SettingItem
                  id="showOrder"
                  icon={Hash}
                  label="Número de Orden"
                  description="ID único de identificación de la comanda."
                  checked={viewConfig.showOrder}
                  onCheckedChange={(value) => onConfigChange('showOrder', value)}
                />

                <SettingItem
                  id="showName"
                  icon={User}
                  label="Cliente"
                  description="Nombre o alias asignado al cliente."
                  checked={viewConfig.showName}
                  onCheckedChange={(value) => onConfigChange('showName', value)}
                  iconClassName="text-blue-500"
                  className="[&_.icon-container]:bg-blue-500/10 [&_.icon-container]:group-hover:bg-blue-500/20"
                />

                <SettingItem
                  id="showTable"
                  icon={LayoutGrid}
                  label="Mesa"
                  description="Ubicación física en el plano de mesas."
                  checked={viewConfig.showTable}
                  onCheckedChange={(value) => onConfigChange('showTable', value)}
                  iconClassName="text-green-500"
                  className="[&_.icon-container]:bg-green-500/10 [&_.icon-container]:group-hover:bg-green-500/20"
                />

                <SettingItem
                  id="showTime"
                  icon={Clock}
                  label="Hora"
                  description="Tiempo transcurrido desde la apertura."
                  checked={viewConfig.showTime}
                  onCheckedChange={(value) => onConfigChange('showTime', value)}
                  iconClassName="text-amber-500"
                  className="[&_.icon-container]:bg-amber-500/10 [&_.icon-container]:group-hover:bg-amber-500/20"
                />

                <SettingItem
                  id="showTotal"
                  icon={Wallet}
                  label="Total"
                  description="Importe acumulado de la comanda."
                  checked={viewConfig.showTotal}
                  onCheckedChange={(value) => onConfigChange('showTotal', value)}
                  iconClassName="text-purple-500"
                  className="[&_.icon-container]:bg-purple-500/10 [&_.icon-container]:group-hover:bg-purple-500/20"
                />

                <SettingItem
                  id="showStatus"
                  icon={Activity}
                  label="Estado"
                  description="Situación actual (abierta, cobrada, etc.)."
                  checked={viewConfig.showStatus}
                  onCheckedChange={(value) => onConfigChange('showStatus', value)}
                  iconClassName="text-red-500"
                  className="[&_.icon-container]:bg-red-500/10 [&_.icon-container]:group-hover:bg-red-500/20"
                />
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Sección: Paginación */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ListOrdered className="h-3 w-3" /> Paginación
              </h4>
              <ConfigItem
                icon={ListOrdered}
                label="Items por página"
                description="Cantidad de registros a mostrar por vista."
                iconClassName="text-cyan-500"
                iconContainerClassName="bg-cyan-500/10 group-hover:bg-cyan-500/20"
              >
                <Select value={viewConfig.itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-24 border-none bg-muted/50 group-hover:bg-muted transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 registros</SelectItem>
                    <SelectItem value="10">10 registros</SelectItem>
                    <SelectItem value="20">20 registros</SelectItem>
                    <SelectItem value="50">50 registros</SelectItem>
                  </SelectContent>
                </Select>
              </ConfigItem>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <p className="text-xs text-muted-foreground">Los cambios se aplicarán instantáneamente.</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cerrar</Button>
            <Button onClick={onSave} variant="brand">
              Guardar Cambios
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
