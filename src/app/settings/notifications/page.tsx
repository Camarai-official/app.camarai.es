'use client';
import { H3, H5, TextXS } from '@/components/ui/typography';




import * as React from 'react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar, ClipboardList, Archive, AlertCircle, Mail, Smartphone, MessageSquare, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { ConfigItem, ConfigToggle } from '@/components/ui/config-item';

type NotificationChannel = 'email' | 'push' | 'whatsapp';
type NotificationCategory = 'reservations' | 'orders' | 'inventory' | 'system';

type NotificationSettings = {
  [K in NotificationCategory]: {
    [C in NotificationChannel]: boolean;
  };
};

const initialSettings: NotificationSettings = {
  reservations: { email: true, push: true, whatsapp: false },
  orders: { email: false, push: true, whatsapp: true },
  inventory: { email: true, push: false, whatsapp: false },
  system: { email: true, push: true, whatsapp: false } };

const categoryInfo = {
    reservations: {
        icon: Calendar,
        title: "Reservas",
        description: "Nuevas reservas, cancelaciones o modificaciones.",
        color: "#6366f1", // Indigo
    },
    orders: {
        icon: ClipboardList,
        title: "Pedidos",
        description: "Nuevos pedidos, solicitudes de cuenta o ayuda.",
        color: "#10b981", // Emerald
    },
    inventory: {
        icon: Archive,
        title: "Inventario",
        description: "Avisos de stock bajo y confirmaciones.",
        color: "#f59e0b", // Amber
    },
    system: {
        icon: AlertCircle,
        title: "Sistema",
        description: "Actualizaciones importantes y mantenimiento.",
        color: "#ef4444", // Red
    }
}

const channelInfo = {
    email: { icon: Mail, label: 'Email' },
    push: { icon: Smartphone, label: 'Push' },
    whatsapp: { icon: MessageSquare, label: 'WhatsApp' } }

export default function NotificationsPage() {
  const [settings, setSettings] = React.useState(initialSettings);
  const { toast } = useToast();
  const router = useRouter();

  const handleSettingChange = (
    category: NotificationCategory,
    channel: NotificationChannel,
    checked: boolean
  ) => {
    const newSettings = {
        ...settings,
        [category]: {
            ...settings[category],
            [channel]: checked }
    };
    setSettings(newSettings);
    
    toast({
        title: "Ajustes Guardados",
        description: `Notificaciones de ${categoryInfo[category].title} por ${channelInfo[channel].label} ${checked ? 'activadas' : 'desactivadas'}.` });
  };

  return (
    <PageContainer>

      <PageHeader title="Gestión de Notificaciones" />
      <PageContent className="pb-24">
        <Card>
            <CardHeader>
                <H3>Configuración de Alertas</H3>
                <CardDescription>
                    Elige cómo y dónde quieres recibir notificaciones. Los cambios se guardan automáticamente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                    {Object.entries(categoryInfo).map(([key, info]) => {
                        const categoryKey = key as NotificationCategory;
                        const Icon = info.icon;
                        return (
                            <div key={categoryKey} className="space-y-4">
                                <div className="flex items-center gap-3 px-1 mb-2">
                                    <div 
                                        className="p-2 rounded-xl bg-primary/10"
                                        style={{ backgroundColor: `${info.color}15`, color: info.color }}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <H5>{info.title}</H5>
                                        <TextXS className="text-muted-foreground">{info.description}</TextXS>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(channelInfo).map(([channelKey, channel]) => {
                                        const channelId = `${categoryKey}-${channelKey}`;
                                        const cKey = channelKey as NotificationChannel;
                                        return (
                                            <ConfigToggle
                                                key={channelId}
                                                id={channelId}
                                                icon={channel.icon}
                                                label={channel.label}
                                                description={`Recibir alertas por ${channel.label.toLowerCase()}`}
                                                checked={settings[categoryKey][cKey]}
                                                onCheckedChange={(checked) => handleSettingChange(categoryKey, cKey, checked)}
                                                className="bg-muted/30 border-none hover:bg-muted/50"
                                                iconContainerClassName="bg-primary/10 shadow-sm border border-border/50"
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
      </PageContent>
      <footer className="p-4 md:p-6 pt-0 sticky bottom-0 z-10 sm:relative sm:sticky-0">
          <Card className="p-4 border shadow-lg sm:shadow-none bg-background/90 backdrop-blur-sm sm:bg-transparent sm:border-none">
            <div className="flex justify-center sm:justify-start items-center">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/settings')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Configuración
                </Button>
            </div>
        </Card>
      </footer>
    </PageContainer>
  );
}
