'use client';

import * as React from 'react';
import { TextXS, TextMD, H4 } from "@/components/ui/typography";
import { Printer, Pencil, Download, Receipt } from 'lucide-react';

import type { OrderDetails } from '@/types/orders';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/layout/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type OrderDetailsDialogProps = {
  order: OrderDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (order: OrderDetails) => void;
  onPrint?: (order: OrderDetails) => void;
};

export function OrderDetailsDialog({ order, open, onOpenChange, onEdit, onPrint }: OrderDetailsDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow size="sm" className="bg-zinc-100 dark:bg-zinc-900 border-none">
        <DialogHeader className="sr-only" title="Detalles del Pedido" description="Visualización detallada del ticket del pedido" />

        <DialogContent>
          <div className="bg-foreground text-black p-6 font-mono text-sm shadow-sm relative m-4 mb-10 rounded-sm">
            {/* Ticket Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-2">
                {/* <div className="h-10 w-10 bg-black text-foreground rounded-full flex items-center justify-center">
                    <Receipt className="h-6 w-6" />
                 </div> */}
                <img
                  src="https://res.cloudinary.com/dxh2i2rjo/image/upload/v1770056408/image_zymnhe.png"
                  alt="Logo"
                  className="h-16 w-auto object-contain grayscale"
                />
              </div>
              <h2 className="font-bold text-lg  tracking-wider">Camarai Rest.</h2>
              <TextXS className="text-gray-500">Calle Principal 123, Madrid</TextXS>
              <TextXS className="text-gray-500">Tel: +34 912 345 678</TextXS>

              <div className="mt-4 border-b-2 border-dashed border-gray-300 pb-4">
                <h3 className="text-xl font-bold">Ticket #{order.orderNumber}</h3>
                <TextXS className="text-gray-400">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()} - {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </TextXS>
              </div>
            </div>

            {/* Customer Info */}
            <div className="flex justify-between mb-4 text-xs font-bold ">
              <TextMD>MESA: {order.tableLabel ? `${order.tableLabel}${order.environmentName ? ` (${order.environmentName})` : ''}` : '-'}</TextMD>
              <TextMD> Camarer@: {order.staffName}</TextMD>
              {order.customerName && <TextMD>CLIENTE: {order.customerName.split(' ')[0]}</TextMD>}
            </div>

            {/* Items */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs border-b border-black pb-1 mb-2 font-bold">
                <TextMD>Cant</TextMD>
                <TextMD>Producto</TextMD>
                <TextMD>Total</TextMD>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <H4>{item.quantity}</H4>
                  <TextMD>{item.productName}</TextMD>
                  <TextMD>€{(item.unitPrice * item.quantity).toFixed(2)}</TextMD>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-1">
              <div className="flex justify-between text-gray-600">
                <TextMD>Subtotal</TextMD>
                <TextMD>€{order.subtotal.toFixed(2)}</TextMD>
              </div>
              <div className="flex justify-between text-gray-600">
                <TextMD>Impuestos</TextMD>
                <TextMD>€{order.taxAmount.toFixed(2)}</TextMD>
              </div>
              <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t border-black">
                <TextMD>TOTAL</TextMD>
                <TextMD>€{order.totalAmount.toFixed(2)}</TextMD>
              </div>
            </div>

            {/* Footer message */}
            <div className="mt-8 text-center text-xs text-gray-400">
              <TextMD>¡Gracias por su visita!</TextMD>
              <TextMD>www.camarai.es</TextMD>
            </div>

            {/* Zigzag bottom effect using css or svg */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-foreground" style={{
              maskImage: 'linear-gradient(45deg, transparent 75%, black 75%), linear-gradient(-45deg, transparent 75%, black 75%)',
              maskSize: '10px 10px',
              maskPosition: '0 0, 0 10px',
              height: '10px',
              bottom: '-10px'
            }} />
          </div>
        </DialogContent>

        <DialogFooter className="p-6 bg-zinc-100 dark:bg-zinc-900 border-t flex gap-3">
          <Button
            variant="default"
            className="flex-1 rounded-xl h-11 shadow-lg shadow-primary/10"
            startIcon={<Printer className="h-4 w-4" />}
            onClick={() => onPrint?.(order)}
          >
            Imprimir
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-11 bg-white dark:bg-zinc-950 shadow-sm"
            startIcon={<Pencil className="h-4 w-4" />}
            onClick={() => onEdit?.(order)}
          >
            Editar
          </Button>
        </DialogFooter>
      </DialogWindow>
    </Dialog>
  );
}
