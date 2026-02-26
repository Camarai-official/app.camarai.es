'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Monitor, Settings, ExternalLink } from 'lucide-react';
import { POSConfigDialog, type POSConfig } from '@/components/dialogs/pos-config-dialog';
import { useDevices } from '@/hooks/useDevices';
import { useToast } from '@/hooks/use-toast';

export default function PosPage() {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = React.useState(false);
  const { devices } = useDevices();
  const { toast } = useToast();
  
  // Configuration state
  const [config, setConfig] = React.useState<POSConfig>({
    terminalId: '',
    printerId: '',
    operationMode: 'mesa',
    paymentMethods: {
      cash: true,
      card: true,
      mixed: true
    }
  });

  const terminals = devices.filter(d => d.type === 'pos' || d.type === 'cash_register');
  const printers = devices.filter(d => d.type === 'printer');

  const handleLaunchPOS = () => {
    toast({
      title: 'Iniciando POS',
      description: 'Redirigiendo al sistema de punto de venta...' });
  };

  const handleSaveConfig = () => {
    toast({
      title: 'Configuración guardada',
      description: 'Los ajustes del POS se han guardado correctamente.' });
    setIsConfigDialogOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader title="Punto de Venta (POS)" />
      <PageContent>
        <EmptyState
          icon={Monitor}
          title="Punto de Venta"
          description="Accede al sistema de punto de venta para gestionar ventas, cobros y comandas en tiempo real."
          action={
            <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
              <Button fullWidth startIcon={<ExternalLink />} onClick={handleLaunchPOS}>
                Iniciar sesión en POS
              </Button>
              <Button fullWidth variant="outline" startIcon={<Settings />} onClick={() => setIsConfigDialogOpen(true)}>
                Configurar POS
              </Button>
            </div>
          }
        />
      </PageContent>

      <POSConfigDialog
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        config={config}
        onConfigChange={setConfig}
        onSave={handleSaveConfig}
        terminals={terminals}
        printers={printers}
      />
    </PageContainer>
  );
}
