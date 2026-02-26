'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { MonitorPlay, Settings, ExternalLink } from 'lucide-react';
import { KDSConfigDialog, type KDSConfig } from '@/components/dialogs/kds-config-dialog';
import { useEnvironments } from '@/hooks/useEnvironments';
import { mockCategories } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';

export default function KdsPage() {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = React.useState(false);
  const { environments } = useEnvironments();
  const { toast } = useToast();
  
  // Configuration state
  const [config, setConfig] = React.useState<KDSConfig>({
    selectedEnvironment: 'all',
    selectedCategories: [],
    alertTime: 10,
    soundEnabled: true,
    layoutMode: 'grid'
  });

  const handleLaunchKDS = () => {
    toast({
      title: 'Iniciando KDS',
      description: 'Redirigiendo al sistema de visualización de cocina...' });
  };

  const handleSaveConfig = () => {
    toast({
      title: 'Configuración guardada',
      description: 'Los ajustes del KDS se han guardado correctamente.' });
    setIsConfigDialogOpen(false);
  };

  return (
    <PageContainer>
      <PageHeader title="Kitchen Display System (KDS)" />
      <PageContent>
        <EmptyState
          icon={MonitorPlay}
          title="Kitchen Display System"
          description="Sistema de visualización de comandas para la cocina. Gestiona pedidos y tiempos de preparación en tiempo real."
          action={
            <>
              <Button fullWidth startIcon={<ExternalLink />} onClick={handleLaunchKDS}>
                Iniciar KDS
              </Button>
              <Button fullWidth variant="outline" startIcon={<Settings />} onClick={() => setIsConfigDialogOpen(true)}>
                Configurar Pantallas
              </Button>
            </>
          }
        />
      </PageContent>

      <KDSConfigDialog
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        config={config}
        onConfigChange={setConfig}
        onSave={handleSaveConfig}
        environments={environments}
        categories={mockCategories.slice(0, 10)}
      />
    </PageContainer>
  );
}
