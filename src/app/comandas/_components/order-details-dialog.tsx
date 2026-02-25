'use client';

import * as React from 'react';
import { Printer, Pencil, Download, Receipt } from 'lucide-react';

import type { OrderDetails } from '@/types/orders';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-none shadow-2xl">
        <DialogTitle className="sr-only">Detalles del Pedido</DialogTitle>
        <DialogDescription className="sr-only">Visualización detallada del ticket del pedido</DialogDescription>
        <div className="bg-white text-black p-6 font-mono text-sm shadow-sm relative m-4 mb-20 rounded-sm">
          {/* Ticket Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              {/* <div className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center">
                    <Receipt className="h-6 w-6" />
                 </div> */}
              <img
                src="https://res.cloudinary.com/dxh2i2rjo/image/upload/v1770056408/image_zymnhe.png"
                alt="Logo"
                className="h-16 w-auto object-contain grayscale"
              />
            </div>
            <h2 className="font-bold text-lg uppercase tracking-wider">Camarai Rest.</h2>
            <p className="text-xs text-gray-500">Calle Principal 123, Madrid</p>
            <p className="text-xs text-gray-500">Tel: +34 912 345 678</p>

            <div className="mt-4 border-b-2 border-dashed border-gray-300 pb-4">
              <h3 className="text-xl font-bold">Ticket #{order.order}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {order.date ? order.date : new Date().toLocaleDateString()} - {order.time}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex justify-between mb-4 text-xs font-bold uppercase">
            <span>MESA: {order.table}</span>
            <span>CLIENTE: {order.name.split(' ')[0]}</span>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs border-b border-black pb-1 mb-2 font-bold">
              <span className="w-8">Cant</span>
              <span className="flex-1">Producto</span>
              <span>Total</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <span className="w-8 font-bold">{item.quantity}</span>
                <span className="flex-1 leading-tight pr-2">{item.name}</span>
                <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>€{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Impuestos (21%)</span>
              <span>€{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t border-black">
              <span>TOTAL</span>
              <span>{order.total}</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="mt-8 text-center text-xs text-gray-400">
            <p>¡Gracias por su visita!</p>
            <p>www.camarai.es</p>
          </div>

          {/* Zigzag bottom effect using css or svg */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-white" style={{
            maskImage: 'linear-gradient(45deg, transparent 75%, black 75%), linear-gradient(-45deg, transparent 75%, black 75%)',
            maskSize: '10px 10px',
            maskPosition: '0 0, 0 10px',
            height: '10px',
            bottom: '-10px'
          }} />
        </div>

        {/* Action Buttons (outside the ticket) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/50 backdrop-blur-sm border-t flex gap-2 justify-center">
          <Button variant="default" size="sm" className="flex-1" onClick={() => onPrint?.(order)}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit?.(order)}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
