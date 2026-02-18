'use client';
import { H3 } from '@/components/ui/typography';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { PageContent } from '@/components/layout/page-content';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Settings, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader } from '@/components/layout/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDevices } from '@/hooks/useDevices';
import { useToast } from '@/hooks/use-toast';

export default function PosPage() {
  const [configOpen, setConfigOpen] = React.useState(false);
  const { devices } = useDevices();
  const { toast } = useToast();
  
  // Configuration state
  const [selectedTerminal, setSelectedTerminal] = React.useState<string>('');
  const [selectedPrinter, setSelectedPrinter] = React.useState<string>('');
  const [operationMode, setOperationMode] = React.useState<string>('mesa');
  const [paymentMethods, setPaymentMethods] = React.useState({
    cash: true,
    card: true,
    mixed: true });

  const terminals = devices.filter(d => d.type === 'pos' || d.type === 'cash_register');
  const printers = devices.filter(d => d.type === 'printer');

  const handleLaunchPOS = () => {
    // In a real app, this would redirect to the POS application
    toast({
      title: 'Iniciando POS',
      description: 'Redirigiendo al sistema de punto de venta...' });
    // window.open('/pos-app', '_blank');
  };

  const handleSaveConfig = () => {
    toast({
      title: 'Configuración guardada',
      description: 'Los ajustes del POS se han guardado correctamente.' });
    setConfigOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <PageHeader title="Punto de Venta (POS)" />
      <PageContent className="items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Monitor className="h-10 w-10 text-primary" />
            </div>
            <H3 className="text-2xl">Punto de Venta</H3>
            <CardDescription className="text-base">
              Accede al sistema de punto de venta para gestionar ventas, cobros y comandas en tiempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full" onClick={handleLaunchPOS}>
                <ExternalLink className="mr-2 h-5 w-5" />
                Iniciar sesión en POS
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => setConfigOpen(true)}>
                <Settings className="mr-2 h-5 w-5" />
                Configurar POS
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center pt-0">
            <p className="text-xs text-muted-foreground">
              Asegúrate de configurar el terminal e impresora antes de iniciar.
            </p>
          </CardFooter>
        </Card>
      </PageContent>

      {/* Modal de Configuración POS */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader
            icon={Settings}
            title="Configuración del POS"
            description="Configura el terminal, impresora y opciones de operación para el punto de venta."
          />
          <div className="grid gap-6 py-4">
            {/* Terminal Selection */}
            <div className="grid gap-2">
              <Label htmlFor="terminal">Dispositivo / Terminal</Label>
              <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
                <SelectTrigger id="terminal">
                  <SelectValue placeholder="Seleccionar terminal" />
                </SelectTrigger>
                <SelectContent>
                  {terminals.length > 0 ? (
                    terminals.map((terminal) => (
                      <SelectItem key={terminal.id} value={terminal.id}>
                        {terminal.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="default" disabled>
                      No hay terminales configurados
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Selecciona el dispositivo desde el que operarás.
              </p>
            </div>

            {/* Printer Selection */}
            <div className="grid gap-2">
              <Label htmlFor="printer">Impresora de Tickets</Label>
              <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                <SelectTrigger id="printer">
                  <SelectValue placeholder="Seleccionar impresora" />
                </SelectTrigger>
                <SelectContent>
                  {printers.length > 0 ? (
                    printers.map((printer) => (
                      <SelectItem key={printer.id} value={printer.id}>
                        {printer.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="default" disabled>
                      No hay impresoras configuradas
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Impresora para tickets y comandas.
              </p>
            </div>

            {/* Operation Mode */}
            <div className="grid gap-2">
              <Label htmlFor="mode">Modo de Operación</Label>
              <Select value={operationMode} onValueChange={setOperationMode}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="Seleccionar modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mesa">Servicio en Mesa</SelectItem>
                  <SelectItem value="barra">Servicio en Barra</SelectItem>
                  <SelectItem value="llevar">Para Llevar</SelectItem>
                  <SelectItem value="mixto">Modo Mixto</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define el flujo de trabajo principal.
              </p>
            </div>

            {/* Payment Methods */}
            <div className="grid gap-3">
              <Label>Métodos de Pago Habilitados</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cash" className="font-normal">Efectivo</Label>
                  <Switch
                    id="cash"
                    checked={paymentMethods.cash}
                    onCheckedChange={(checked) => setPaymentMethods(prev => ({ ...prev, cash: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="card" className="font-normal">Tarjeta</Label>
                  <Switch
                    id="card"
                    checked={paymentMethods.card}
                    onCheckedChange={(checked) => setPaymentMethods(prev => ({ ...prev, card: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mixed" className="font-normal">Pago Mixto</Label>
                  <Switch
                    id="mixed"
                    checked={paymentMethods.mixed}
                    onCheckedChange={(checked) => setPaymentMethods(prev => ({ ...prev, mixed: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfigOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveConfig}>
              Guardar Configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

