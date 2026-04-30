'use client';

import * as React from 'react';
import Link from 'next/link';
import { User, CreditCard, Bell, Printer, Percent, Clock, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { ActionTile } from '@/components/ui/action-tile';

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Configuración" 
        subtitle="Personaliza el funcionamiento de tu restaurante y gestiona tus preferencias."
      />
      <PageContent className="flex flex-col gap-6">
              <Link href="/settings/profile">
                <ActionTile
                  icon={User}
                  iconColor="#3b82f6"
                  title="Perfil y Empresa"
                  description="Gestiona tu perfil, datos del local y empresa."
                  variant="outline"
                  padding="md"
                  rightContent={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
                />
              </Link>
              <Link href="/settings/notifications">
                <ActionTile
                  icon={Bell}
                  iconColor="#f43f5e"
                  title="Notificaciones"
                  description="Configura alertas de pedidos y reservas."
                  variant="outline"
                  padding="md"
                  rightContent={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
                />
              </Link>
              <Link href="/settings/profile?tab=devices">
                <ActionTile
                  icon={Printer}
                  iconColor="#6b7280"
                  title="Dispositivos e Impresoras"
                  description="Configura impresoras, KDS y periféricos."
                  variant="outline"
                  padding="md"
                  rightContent={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
                />
              </Link>
              <Link href="/settings/taxes">
                <ActionTile
                  icon={Percent}
                  iconColor="#22c55e"
                  title="Impuestos"
                  description="Gestiona tipos de IVA y cargos aplicables."
                  variant="outline"
                  padding="md"
                  rightContent={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
                />
              </Link>
              <Link href="/reportes">
                <ActionTile
                  icon={Clock}
                  iconColor="#f59e0b"
                  title="Informe de Horas"
                  description="Consulta y exporta horas de empleados."
                  variant="outline"
                  padding="md"
                  rightContent={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
                />
              </Link>
              <ActionTile
                icon={CreditCard}
                iconColor="#a855f7"
                title="Facturación y Suscripción"
                description="Historial de facturas y gestión del plan."
                variant="outline"
                padding="md"
                disabled
                rightContent={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
              />
      </PageContent>
    </PageContainer>
  );
}
