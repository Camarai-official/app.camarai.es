
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowRight, User, CreditCard, Bell, Printer, Percent, Clock } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="p-4 md:p-6">
        <PageHeader title="Configuración" />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/settings/profile">
            <Card className="hover:border-primary transition-colors h-full flex flex-col group border-l-4 border-l-primary">
              <CardHeader className="flex-grow">
                <CardTitle className="font-bold text-muted-foreground flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Perfil y Empresa</span>
                </CardTitle>
                <CardDescription>Gestiona tu perfil, datos del local, empresa e impuestos.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-end">
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/settings/profile?tab=devices">
            <Card className="hover:border-primary transition-colors h-full flex flex-col group border-l-4 border-l-primary">
                <CardHeader className="flex-grow">
                    <CardTitle className="font-bold text-muted-foreground flex items-center gap-2">
                        <Printer className="h-5 w-5" />
                        <span>Dispositivos e Impresoras</span>
                    </CardTitle>
                    <CardDescription>Conecta y configura tus impresoras de tickets, KDS y otros periféricos.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-end justify-end">
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
            </Card>
          </Link>
          <Link href="/settings/taxes">
            <Card className="hover:border-primary transition-colors h-full flex flex-col group border-l-4 border-l-primary">
              <CardHeader className="flex-grow">
                <CardTitle className="font-bold text-muted-foreground flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  <span>Impuestos</span>
                </CardTitle>
                <CardDescription>Gestiona los tipos de IVA y otros impuestos aplicables.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-end">
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/reportes">
             <Card className="hover:border-primary transition-colors h-full flex flex-col group border-l-4 border-l-primary">
              <CardHeader className="flex-grow">
                <CardTitle className="font-bold text-muted-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Informe de Horas</span>
                </CardTitle>
                <CardDescription>Consulta y exporta las horas trabajadas por tus empleados.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-end">
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Card className="hover:border-primary transition-colors h-full flex flex-col group cursor-not-allowed opacity-50 border-l-4 border-l-primary">
            <CardHeader className="flex-grow">
              <CardTitle className="font-bold text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>Facturación y Suscripción</span>
              </CardTitle>
              <CardDescription>Consulta tu plan, historial de facturas y gestiona tus métodos de pago.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-end justify-end">
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
          <Link href="/settings/notifications">
            <Card className="hover:border-primary transition-colors h-full flex flex-col group border-l-4 border-l-primary">
              <CardHeader className="flex-grow">
                <CardTitle className="font-bold text-muted-foreground flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <span>Notificaciones</span>
                </CardTitle>
                <CardDescription>Configura cómo y cuándo recibes notificaciones sobre pedidos y reservas.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-end">
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
