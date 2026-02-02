
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Bell, Calendar, ClipboardList, Archive, AlertCircle, Mail, Smartphone, MessageSquare, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';

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
  system: { email: true, push: true, whatsapp: false },
};

const categoryInfo = {
    reservations: {
        icon: Calendar,
        title: "Reservas",
        description: "Alertas sobre nuevas reservas, cancelaciones o modificaciones.",
    },
    orders: {
        icon: ClipboardList,
        title: "Pedidos",
        description: "Notificaciones de nuevos pedidos, solicitudes de cuenta o ayuda.",
    },
    inventory: {
        icon: Archive,
        title: "Inventario",
        description: "Avisos de stock bajo y confirmaciones de recepción de pedidos.",
    },
    system: {
        icon: AlertCircle,
        title: "Sistema",
        description: "Actualizaciones importantes, noticias y alertas de mantenimiento.",
    }
}

const channelInfo = {
    email: { icon: Mail, label: 'Email' },
    push: { icon: Smartphone, label: 'Push' },
    whatsapp: { icon: MessageSquare, label: 'WhatsApp' },
}

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
            [channel]: checked,
        }
    };
    setSettings(newSettings);
    
    toast({
        title: "Ajustes Guardados",
        description: `Notificaciones de ${categoryInfo[category].title} por ${channelInfo[channel].label} ${checked ? 'activadas' : 'desactivadas'}.`,
    });
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <header className="p-4 md:p-6">
        <PageHeader title="Gestión de Notificaciones" />
      </header>
      <main className="flex-grow p-4 pt-0 md:p-6 md:pt-0 pb-24">
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Alertas</CardTitle>
                <CardDescription>
                    Elige cómo y dónde quieres recibir notificaciones. Los cambios se guardan automáticamente.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {Object.entries(categoryInfo).map(([key, info], index) => {
                    const categoryKey = key as NotificationCategory;
                    const Icon = info.icon;
                    return (
                        <React.Fragment key={categoryKey}>
                            {index > 0 && <Separator />}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                <div className="md:col-span-1 space-y-1">
                                    <h3 className="font-semibold flex items-center gap-2"><Icon className="h-5 w-5 text-primary"/>{info.title}</h3>
                                    <p className="text-sm text-muted-foreground">{info.description}</p>
                                </div>
                                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg border p-4 bg-background/50">
                                    {Object.entries(channelInfo).map(([channelKey, channel]) => {
                                        const channelId = `${categoryKey}-${channelKey}`;
                                        const ChannelIcon = channel.icon;
                                        return (
                                             <div key={channelKey} className="flex items-center justify-between space-x-2">
                                                <Label htmlFor={channelId} className="flex items-center gap-2 cursor-pointer">
                                                    <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                                                    {channel.label}
                                                </Label>
                                                <Switch
                                                    id={channelId}
                                                    checked={settings[categoryKey][channelKey as NotificationChannel]}
                                                    onCheckedChange={(checked) => handleSettingChange(categoryKey, channelKey as NotificationChannel, checked)}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </React.Fragment>
                    )
                })}
            </CardContent>
        </Card>
      </main>
      <footer className="p-4 md:p-6 pt-0 sticky bottom-0">
          <Card className="p-4 border-t bg-background/80 backdrop-blur-sm">
            <div className="flex justify-start items-center">
                <Button variant="outline" onClick={() => router.push('/settings')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Configuración
                </Button>
            </div>
        </Card>
      </footer>
    </div>
  );
}
