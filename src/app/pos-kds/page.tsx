'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Laptop, Settings, ExternalLink, MonitorPlay } from 'lucide-react';
import { POSConfigDialog, type POSConfig } from '@/components/dialogs/pos-config-dialog';
import { KDSConfigDialog, type KDSConfig } from '@/components/dialogs/kds-config-dialog';
import { useDevices } from '@/hooks/useDevices';
import { useEnvironments } from '@/hooks/useEnvironments';
import { mockCategories } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';

export default function PosKdsPage() {
  const [activeTab, setActiveTab] = React.useState('pos');
  const { toast } = useToast();

  // POS State
  const [isPOSConfigOpen, setIsPOSConfigOpen] = React.useState(false);
  const { devices } = useDevices();
  const [posConfig, setPosConfig] = React.useState<POSConfig>({
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

  // KDS State
  const [isKDSConfigOpen, setIsKDSConfigOpen] = React.useState(false);
  const { environments } = useEnvironments();
  const [kdsConfig, setKdsConfig] = React.useState<KDSConfig>({
    selectedEnvironment: 'all',
    selectedCategories: [],
    alertTime: 10,
    soundEnabled: true,
    layoutMode: 'grid'
  });

  const handleLaunchPOS = () => {
    toast({
      title: 'Iniciando POS',
      description: 'Redirigiendo al sistema de punto de venta...'
    });
  };

  const handleLaunchKDS = () => {
    toast({
      title: 'Iniciando KDS',
      description: 'Redirigiendo al sistema de visualización de cocina...'
    });
  };

  const handleSavePOSConfig = () => {
    toast({
      title: 'Configuración POS guardada',
      description: 'Los ajustes del POS se han guardado correctamente.'
    });
    setIsPOSConfigOpen(false);
  };

  const handleSaveKDSConfig = () => {
    toast({
      title: 'Configuración KDS guardada',
      description: 'Los ajustes del KDS se han guardado correctamente.'
    });
    setIsKDSConfigOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Terminales (POS y KDS)" 
        subtitle="Gestión del Punto de Venta y Sistema de Visualización de Cocina."
      />
      
      <PageContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-start gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="pos" icon={Monitor}>Punto de Venta (POS)</TabsTrigger>
              <TabsTrigger value="kds" icon={Laptop}>Cocina (KDS)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="pos" className="mt-0">
            <EmptyState
              icon={Monitor}
              title="Terminal de Venta (POS)"
              description="Accede al sistema de punto de venta para gestionar ventas, cobros y comandas en tiempo real desde este terminal."
              action={
                <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
                  <Button variant="default" fullWidth startIcon={<ExternalLink />} onClick={handleLaunchPOS}>
                    Iniciar sesión en POS
                  </Button>
                  <Button fullWidth variant="outline" startIcon={<Settings />} onClick={() => setIsPOSConfigOpen(true)}>
                    Configurar POS
                  </Button>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="kds" className="mt-0">
            <EmptyState
              icon={MonitorPlay}
              title="Kitchen Display System (KDS)"
              description="Sistema de visualización de comandas para la cocina. Gestiona de forma eficiente los tiempos de preparación."
              action={
                <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
                  <Button variant="default" fullWidth startIcon={<ExternalLink />} onClick={handleLaunchKDS}>
                    Iniciar KDS
                  </Button>
                  <Button fullWidth variant="outline" startIcon={<Settings />} onClick={() => setIsKDSConfigOpen(true)}>
                    Configurar Pantallas
                  </Button>
                </div>
              }
            />
          </TabsContent>
        </Tabs>
      </PageContent>

      <POSConfigDialog
        open={isPOSConfigOpen}
        onOpenChange={setIsPOSConfigOpen}
        config={posConfig}
        onConfigChange={setPosConfig}
        onSave={handleSavePOSConfig}
        terminals={terminals}
        printers={printers}
      />

      <KDSConfigDialog
        open={isKDSConfigOpen}
        onOpenChange={setIsKDSConfigOpen}
        config={kdsConfig}
        onConfigChange={setKdsConfig}
        onSave={handleSaveKDSConfig}
        environments={environments}
        categories={mockCategories.slice(0, 10)}
      />
    </PageContainer>
  );
}
