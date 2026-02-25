'use client';

import * as React from 'react';
import { Settings, Hash, User, LayoutGrid, Clock, Wallet, Activity, ListOrdered } from 'lucide-react';

import type { ViewConfig } from '@/app/comandas/_data/config';

import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActionTile } from '@/components/ui/action-tile';

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
      <DialogWindow size="md">
        <DialogHeader
          icon={Settings}
          title="Configurar Vista"
          description="Personaliza las columnas visibles y opciones de visualización de las comandas."
        />

        <DialogContent>
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-1">
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

              <Separator className="opacity-50" />

              <ActionTile
                icon={ListOrdered}
                title="Items por página"
                description="Cantidad de registros a mostrar por vista"
                rightContentType="select"
                selectValue={viewConfig.itemsPerPage.toString()}
                onSelectChange={handleItemsPerPageChange}
                selectOptions={[
                  { value: "5", label: "5 registros" },
                  { value: "10", label: "10 registros" },
                  { value: "20", label: "20 registros" },
                  { value: "50", label: "50 registros" },
                ]}
                iconColor="cyan-500"
              />
            </div>
          </ScrollArea>
        </DialogContent>

        <DialogFooter
          onCancel={() => onOpenChange(false)}
          onConfirm={onSave}
        />
      </DialogWindow>
    </Dialog>
  );
}
