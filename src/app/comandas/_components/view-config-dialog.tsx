'use client';

import * as React from 'react';
import { Settings, Hash, User, LayoutGrid, Clock, Wallet, Activity, ListOrdered } from 'lucide-react';

import type { ViewConfig } from '@/app/comandas/_data/config';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActionTile } from '@/components/ui/action-tile';
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
        <DialogHeader
          icon={Settings}
          title="Configurar Vista"
          description="Personaliza las columnas visibles y opciones de visualización de las comandas."
        />

        <ScrollArea className="max-h-[60vh] -mx-6">
          <div className="space-y-6 px-6 py-4">
            {/* Sección: Columnas */}
            <div className="space-y-4">
              <Label icon={LayoutGrid}>Columnas Visibles</Label>
              <div className="grid gap-3">
                <ActionTile
                  switchId="showOrder"
                  icon={Hash}
                  title="Número de Orden"
                  description="ID único de identificación de la comanda."
                  rightContentType="switch"
                  switchChecked={viewConfig.showOrder}
                  onSwitchChange={(value) => onConfigChange('showOrder', value)}
                />

                <ActionTile
                  switchId="showName"
                  icon={User}
                  title="Cliente"
                  description="Nombre o alias asignado al cliente."
                  rightContentType="switch"
                  switchChecked={viewConfig.showName}
                  onSwitchChange={(value) => onConfigChange('showName', value)}
                  iconColor="blue-500"
                />

                <ActionTile
                  switchId="showTable"
                  icon={LayoutGrid}
                  title="Mesa"
                  description="Ubicación física en el plano de mesas."
                  rightContentType="switch"
                  switchChecked={viewConfig.showTable}
                  onSwitchChange={(value) => onConfigChange('showTable', value)}
                  iconColor="green-500"
                />

                <ActionTile
                  switchId="showTime"
                  icon={Clock}
                  title="Hora"
                  description="Tiempo transcurrido desde la apertura."
                  rightContentType="switch"
                  switchChecked={viewConfig.showTime}
                  onSwitchChange={(value) => onConfigChange('showTime', value)}
                  iconColor="amber-500"
                />

                <ActionTile
                  switchId="showTotal"
                  icon={Wallet}
                  title="Total"
                  description="Importe acumulado de la comanda."
                  rightContentType="switch"
                  switchChecked={viewConfig.showTotal}
                  onSwitchChange={(value) => onConfigChange('showTotal', value)}
                  iconColor="purple-500"
                />

                <ActionTile
                  switchId="showStatus"
                  icon={Activity}
                  title="Estado"
                  description="Situación actual (abierta, cobrada, etc.)."
                  rightContentType="switch"
                  switchChecked={viewConfig.showStatus}
                  onSwitchChange={(value) => onConfigChange('showStatus', value)}
                  iconColor="red-500"
                />
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Sección: Paginación */}
            <div className="space-y-4">
              <Label icon={ListOrdered}>Paginación</Label>
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
            <Button onClick={onSave} variant="default">
              Guardar Cambios
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
