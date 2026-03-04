'use client';

import * as React from 'react';
import { 
    Bell, 
    Check, 
    Trash, 
    Settings, 
    AlertTriangle, 
    Info, 
    MessageSquare, 
    Circle,
    CheckCircle2,
    Calendar,
    Search,
    Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// UI Components
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { H3, H5, TextSM, TextXS } from '@/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Layout Components
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';

// Feature Components
import { ActionTile } from '@/components/ui/action-tile';

const mockNotifications = [
    { id: '1', title: 'Nueva reserva confirmada', description: 'Juan Pérez ha reservado una mesa para 4 personas hoy a las 21:00.', type: 'info', time: 'Hace 5 min', read: false },
    { id: '2', title: 'Stock bajo: Cerveza Mahou', description: 'Quedan menos de 10 unidades en el almacén principal.', type: 'warning', time: 'Hace 1 hora', read: false },
    { id: '3', title: 'Actualización de sistema completada', description: 'La versión 2.4.0 se ha instalado correctamente con nuevas funciones de cobro.', type: 'info', time: 'Hace 3 horas', read: true },
    { id: '4', title: 'Error de conexión KDS', description: 'Se ha perdido la conexión con la pantalla de cocina de la planta alta.', type: 'error', time: 'Hace 5 horas', read: true },
    { id: '5', title: 'Campaña de Marketing finalizada', description: 'La campaña "Menú del Día" ha alcanzado a 1,200 clientes con un CTR del 15%.', type: 'info', time: 'Ayer', read: true },
];

export default function NotificationsPage() {
    const { toast } = useToast();
    const [notifications, setNotifications] = React.useState(mockNotifications);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast({ title: "Todo leído", description: "Has marcado todas las notificaciones como leídas." });
    };

    const deleteNotification = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <PageContainer>
            <PageHeader 
                title="Notificaciones" 
                subtitle="Mantente al día con lo que sucede en tu establecimiento en tiempo real."
                actions={
                    <div className="flex gap-2">
                        <Button variant="ghost" className="h-9 px-3" onClick={markAllRead}>
                            <Check className="h-4 w-4 mr-2" /> Marcar todo como leído
                        </Button>
                        <Button variant="outline" className="h-9 w-9 p-0">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                }
            />
            
            <PageContent>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* FILTERS SIDEBAR */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <CardHeader title="Categorías" />
                            <CardContent className="space-y-1">
                                <Button variant="ghost" fullWidth className="justify-start font-bold">
                                    <Bell className="mr-2 h-4 w-4" /> Todas
                                    <Badge variant="completed" className="ml-auto text-[10px] tabular-nums">
                                        {notifications.filter(n => !n.read).length}
                                    </Badge>
                                </Button>
                                <Button variant="ghost" fullWidth className="justify-start">
                                    <AlertTriangle className="mr-2 h-4 w-4" /> Alertas
                                </Button>
                                <Button variant="ghost" fullWidth className="justify-start">
                                    <Calendar className="mr-2 h-4 w-4" /> Reservas
                                </Button>
                                <Button variant="ghost" fullWidth className="justify-start">
                                    <MessageSquare className="mr-2 h-4 w-4" /> Mensajes
                                </Button>
                                <Button variant="ghost" fullWidth className="justify-start">
                                    <Info className="mr-2 h-4 w-4" /> Sistema
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader title="Preferencia IA" />
                            <CardContent className="space-y-4">
                                <TextXS className="text-muted-foreground leading-relaxed">
                                    Nuestro algoritmo prioriza las notificaciones urgentes basadas en tu actividad diaria.
                                </TextXS>
                                <Button fullWidth size="sm" variant="outline">Configurar Prioridades</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* NOTIFICATION LIST */}
                    <div className="lg:col-span-3 space-y-4">
                        <Card>
                            <CardHeader 
                                title="Bandeja de entrada"
                                children={
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="cursor-pointer">Hoy</Badge>
                                        <Badge variant="secondary" className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity">Ayer</Badge>
                                        <Badge variant="secondary" className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity">Esta semana</Badge>
                                    </div>
                                }
                            />
                            <CardContent className="p-0">
                                <ScrollArea className="h-[calc(100vh-320px)]">
                                    <div className="divide-y">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div 
                                                    key={notif.id} 
                                                    className={cn(
                                                        "flex items-start gap-4 p-4 transition-colors hover:bg-muted/30 cursor-pointer relative group",
                                                        !notif.read && "bg-primary/5"
                                                    )}
                                                    onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                                                >
                                                    {!notif.read && (
                                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                                    )}
                                                    
                                                    <div className={cn(
                                                        "h-10 w-10 flex items-center justify-center rounded-xl shrink-0",
                                                        notif.type === 'info' ? "bg-info/10 text-info" : 
                                                        notif.type === 'warning' ? "bg-warning/10 text-warning" : 
                                                        "bg-danger/10 text-danger"
                                                    )}>
                                                        {notif.type === 'info' ? <Info className="h-5 w-5" /> : 
                                                         notif.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> : 
                                                         <CheckCircle2 className="h-5 w-5" />}
                                                    </div>

                                                    <div className="flex-1 space-y-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className={cn("text-sm truncate", !notif.read ? "font-bold" : "font-medium")}>
                                                                {notif.title}
                                                            </p>
                                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                                {notif.time}
                                                            </span>
                                                        </div>
                                                        <TextXS className="text-muted-foreground">
                                                            {notif.description}
                                                        </TextXS>
                                                    </div>

                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => deleteNotification(notif.id, e)}>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                                <Bell className="h-12 w-12 mb-4" />
                                                <H5>Bandeja de entrada vacía</H5>
                                                <TextXS>¡Todo está al día por aquí!</TextXS>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageContent>
        </PageContainer>
    );
}
