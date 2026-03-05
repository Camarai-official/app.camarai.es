'use client';

import * as React from 'react';
import { Filter, User, Package, CreditCard, Calendar, AlertTriangle, Clock, Coffee } from 'lucide-react';

import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActionTile } from '@/components/ui/action-tile';

export type NotificationsFilterConfig = {
  showStaff: boolean;
  showInventory: boolean;
  showPayments: boolean;
  showBookings: boolean;
  showEnv: boolean;
  showCritical: boolean;
};

type NotificationsFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterConfig: NotificationsFilterConfig;
  onConfigChange: (key: keyof NotificationsFilterConfig, value: boolean) => void;
};

export function NotificationsFilterDialog({
  open,
  onOpenChange,
  filterConfig,
  onConfigChange,
}: NotificationsFilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow size="md">
        <DialogHeader
          icon={Filter}
          title="Filtrar Sucesos"
          description="Selecciona los tipos de eventos que deseas visualizar en el registro."
        />

        <DialogContent>
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-1">
              <div className="grid gap-3">
                <ActionTile
                  switchId="showStaff"
                  icon={User}
                  title="Personal"
                  description="Check-ins, descansos, salidas e incidencias."
                  rightContentType="switch"
                  switchChecked={filterConfig.showStaff}
                  onSwitchChange={(value) => onConfigChange('showStaff', value)}
                  iconColor="blue-500"
                />

                <ActionTile
                  switchId="showInventory"
                  icon={Package}
                  title="Stock / Almacén"
                  description="Alertas de existencias y confirmación de pedidos."
                  rightContentType="switch"
                  switchChecked={filterConfig.showInventory}
                  onSwitchChange={(value) => onConfigChange('showInventory', value)}
                  iconColor="amber-500"
                />

                <ActionTile
                  switchId="showPayments"
                  icon={CreditCard}
                  title="Cobros y Ventas"
                  description="Tickets pagados y transacciones recibidas."
                  rightContentType="switch"
                  switchChecked={filterConfig.showPayments}
                  onSwitchChange={(value) => onConfigChange('showPayments', value)}
                  iconColor="green-500"
                />

                <ActionTile
                  switchId="showBookings"
                  icon={Calendar}
                  title="Reservas"
                  description="Nuevas reservas y cambios de estado."
                  rightContentType="switch"
                  switchChecked={filterConfig.showBookings}
                  onSwitchChange={(value) => onConfigChange('showBookings', value)}
                  iconColor="purple-500"
                />

                <ActionTile
                  switchId="showEnv"
                  icon={AlertTriangle}
                  title="Ambientes"
                  description="Alertas de ocupación y sensores de sala."
                  rightContentType="switch"
                  switchChecked={filterConfig.showEnv}
                  onSwitchChange={(value) => onConfigChange('showEnv', value)}
                  iconColor="orange-500"
                />

                <Separator className="my-2 opacity-50" />

                <ActionTile
                  switchId="showCritical"
                  icon={Clock}
                  title="Solo Urgentes"
                  description="Mostrar solo incidencias críticas y advertencias."
                  rightContentType="switch"
                  switchChecked={filterConfig.showCritical}
                  onSwitchChange={(value) => onConfigChange('showCritical', value)}
                  iconColor="red-500"
                />
              </div>
            </div>
          </ScrollArea>
        </DialogContent>

        <DialogFooter
          onCancel={() => onOpenChange(false)}
        />
      </DialogWindow>
    </Dialog>
  );
}
