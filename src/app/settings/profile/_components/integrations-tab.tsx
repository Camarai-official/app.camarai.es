import * as React from 'react';
import { MoreVertical, Pencil, Trash, CheckCircle2, XCircle, ExternalLink, RefreshCw, Zap, Settings } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { EvolutionAPIConfigForm, defaultEvolutionConfig, type EvolutionAPIConfig } from '@/components/features/evolution-api-config';
import { Separator } from '@/components/ui/separator';
import { ConfigItem } from '@/components/ui/config-item';

// Integration type
interface Integration {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
    connected: boolean;
    config: Record<string, any>;
    lastSync?: string;
}

// SVG Icons as components for cleaner code
const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-whatsapp" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19.6,4.4C17.7,2.4,15,1.2,12,1.2C5.9,1.2,1,6.1,1,12.2c0,2,0.5,3.8,1.5,5.5L1,23l5.6-1.5c1.7,0.9,3.6,1.4,5.4,1.4h0l0,0 c6.1,0,11-4.9,11-11c0-3-1.2-5.7-3.2-7.6z M12,21.1c-1.8,0-3.5-0.5-5-1.4l-0.4-0.2l-3.7,1l1-3.6l-0.2-0.4C3,15.2,2.5,13.7,2.5,12.2 c0-5.2,4.2-9.4,9.4-9.4c2.6,0,5,1,6.6,2.7c1.7,1.7,2.7,4,2.7,6.6C21.4,16.9,17.2,21.1,12,21.1z M17,13.4c-0.2-0.1-1.2-0.6-1.4-0.7 c-0.2-0.1-0.3-0.1-0.5,0.1c-0.1,0.2-0.5,0.7-0.7,0.8c-0.1,0.1-0.2,0.2-0.4,0.1c-0.2-0.1-0.8-0.3-1.5-0.9c-0.6-0.5-1-1.1-1.1-1.3 c-0.1-0.2,0-0.3,0.1-0.4c0.1-0.1,0.2-0.2,0.3-0.3c0.1-0.1,0.1-0.2,0.2-0.4c0.1-0.1,0-0.3-0.1-0.4c-0.1-0.1-0.5-1.1-0.6-1.5 c-0.2-0.4-0.3-0.3-0.5-0.3c-0.1,0-0.3,0-0.5,0C9.9,7.6,9.6,7.7,9.4,8c-0.2,0.3-0.8,0.7-0.8,1.8c0,1.1,0.8,2,0.9,2.2 c0.1,0.2,1.6,2.5,3.9,3.4c0.6,0.2,1,0.3,1.3,0.4c0.6,0.2,1.1,0.1,1.5-0.1c0.5-0.2,1.2-0.8,1.3-1.6c0.1-0.7,0.1-1.4-0.1-1.5 C17.3,13.5,17.2,13.5,17,13.4z" />
    </svg>
);

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 24 24">
        <path fill="currentColor" d="M21.35 11.1H12v2.8h5.3c-.5 1.9-2.1 3.2-4.1 3.2-2.4 0-4.4-2-4.4-4.4s2-4.4 4.4-4.4c1.1 0 2.1.4 2.9 1.2l2.2-2.2C17.2 4.8 15 4 12.2 4 7.7 4 4 7.7 4 12.2s3.7 8.2 8.2 8.2c4.4 0 7.9-3.6 7.9-8.2-.1-.5-1.1-1.1-1.1-1.1z" />
    </svg>
);

const initialIntegrations: Integration[] = [
    {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        description: 'Notificaciones de reservas y pedidos.',
        icon: <WhatsAppIcon />,
        enabled: true,
        connected: true,
        config: { phone: '+34612345678', notifyReservations: true, notifyOrders: true },
        lastSync: '2024-01-29 10:30',
    },
    {
        id: 'google',
        name: 'Reservas de Google',
        description: 'Sincroniza tus reservas con Google.',
        icon: <GoogleIcon />,
        enabled: false,
        connected: false,
        config: { calendarId: '', autoSync: false },
    },
];

export function IntegrationsTab() {
    const { toast } = useToast();
    const [integrations, setIntegrations] = React.useState<Integration[]>(initialIntegrations);
    const [configDialogOpen, setConfigDialogOpen] = React.useState(false);
    const [selectedIntegration, setSelectedIntegration] = React.useState<Integration | null>(null);
    const [configForm, setConfigForm] = React.useState<Record<string, any>>({});
    
    // Evolution API state
    const [evolutionConfig, setEvolutionConfig] = React.useState<EvolutionAPIConfig>(defaultEvolutionConfig);
    
    const handleEvolutionSave = () => {
        toast({
            title: 'Evolution API configurada',
            description: 'La configuración de WhatsApp se ha guardado correctamente.',
        });
    };
    
    const handleToggle = (id: string, enabled: boolean) => {
        if (!enabled) {
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, enabled: false } : i));
            toast({
                title: 'Integración desactivada',
                description: 'La integración ha sido desactivada.',
            });
        } else {
            const integration = integrations.find(i => i.id === id);
            if (integration && !integration.connected) {
                openConfigDialog(integration);
            } else {
                setIntegrations(prev => prev.map(i => i.id === id ? { ...i, enabled: true } : i));
                toast({
                    title: 'Integración activada',
                    description: 'La integración está ahora activa.',
                });
            }
        }
    };
    
    const openConfigDialog = (integration: Integration) => {
        setSelectedIntegration(integration);
        setConfigForm({ ...integration.config });
        setConfigDialogOpen(true);
    };
    
    const handleSaveConfig = () => {
        if (!selectedIntegration) return;
        
        setIntegrations(prev => prev.map(i => 
            i.id === selectedIntegration.id 
                ? { ...i, config: configForm, connected: true, enabled: true }
                : i
        ));
        
        toast({
            title: 'Configuración guardada',
            description: `${selectedIntegration.name} ha sido configurado correctamente.`,
        });
        setConfigDialogOpen(false);
    };
    
    const handleDisconnect = (id: string) => {
        setIntegrations(prev => prev.map(i => 
            i.id === id ? { ...i, connected: false, enabled: false } : i
        ));
        toast({
            variant: 'destructive',
            title: 'Integración desconectada',
            description: 'La integración ha sido eliminada.',
        });
    };
    
    const handleSync = (integration: Integration) => {
        toast({
            title: 'Sincronizando...',
            description: `Sincronizando ${integration.name}.`,
        });
        // Simulate sync
        setTimeout(() => {
            setIntegrations(prev => prev.map(i => 
                i.id === integration.id ? { ...i, lastSync: new Date().toLocaleString('es-ES') } : i
            ));
            toast({
                title: 'Sincronización completada',
                description: `${integration.name} actualizado.`,
            });
        }, 1500);
    };
    
    return (
        <TabsContent value="integrations">
            <Card>
                <CardHeader>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CardTitle className="font-bold text-muted-foreground">Integraciones</CardTitle>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Conecta con tus herramientas favoritas para potenciar tu restaurante.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardHeader>
                <CardContent className="space-y-4">
                    {integrations.map(integration => (
                        <ConfigItem
                            key={integration.id}
                            icon={integration.icon}
                            noIconContainer
                            label={
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{integration.name}</span>
                                    {integration.connected ? (
                                        <Badge variant="secondary" className="text-green-600 h-5 px-1.5 text-[10px]">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Conectado
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground h-5 px-1.5 text-[10px]">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            No conectado
                                        </Badge>
                                    )}
                                </div>
                            }
                            description={
                                <div className="space-y-0.5">
                                    <p>{integration.description}</p>
                                    {integration.lastSync && (
                                        <p className="text-[10px] text-muted-foreground">
                                            Última sincronización: {integration.lastSync}
                                        </p>
                                    )}
                                </div>
                            }
                        >
                            <div className="flex items-center gap-2">
                                <Switch 
                                    checked={integration.enabled}
                                    onCheckedChange={(checked) => handleToggle(integration.id, checked)}
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => openConfigDialog(integration)}>
                                            <Pencil className="mr-2 h-4 w-4" />Configurar
                                        </DropdownMenuItem>
                                        {integration.connected && (
                                            <DropdownMenuItem onSelect={() => handleSync(integration)}>
                                                <RefreshCw className="mr-2 h-4 w-4" />Sincronizar
                                            </DropdownMenuItem>
                                        )}
                                        {integration.connected && (
                                            <DropdownMenuItem 
                                                onSelect={() => handleDisconnect(integration.id)}
                                            >
                                                <Trash className="mr-2 h-4 w-4 text-muted-foreground" />Desconectar
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </ConfigItem>
                    ))}
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button variant="outline">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver más integraciones
                    </Button>
                </CardFooter>
            </Card>
            
            {/* Evolution API Section - Core Integration */}
            <Card className="mt-4 border-2 border-brand-whatsapp/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-brand-whatsapp" />
                            <CardTitle className="font-bold text-muted-foreground">Evolution API - Camarero AI</CardTitle>
                        </div>
                        <Badge variant="secondary" className="bg-brand-whatsapp/10 text-brand-whatsapp">
                            Integración Core
                        </Badge>
                    </div>
                    <CardDescription>
                        Configuración principal de WhatsApp para el sistema de pedidos por voz/texto y gestión de mesas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EvolutionAPIConfigForm
                        config={evolutionConfig}
                        onChange={setEvolutionConfig}
                        onSave={handleEvolutionSave}
                    />
                </CardContent>
            </Card>
            
            {/* Configuration Dialog */}
            <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle icon={Settings}>
                            Configurar {selectedIntegration?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Configura los ajustes de esta integración.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedIntegration?.id === 'whatsapp' && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="wa-phone">Número de teléfono</Label>
                                <Input 
                                    id="wa-phone"
                                    placeholder="+34 612 345 678"
                                    value={configForm.phone || ''}
                                    onChange={(e) => setConfigForm(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>Notificaciones</Label>
                                <div className="flex items-center gap-2">
                                    <Checkbox 
                                        id="wa-reservations"
                                        checked={configForm.notifyReservations}
                                        onCheckedChange={(c) => setConfigForm(prev => ({ ...prev, notifyReservations: c }))}
                                    />
                                    <Label htmlFor="wa-reservations" className="font-normal">Notificar reservas</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox 
                                        id="wa-orders"
                                        checked={configForm.notifyOrders}
                                        onCheckedChange={(c) => setConfigForm(prev => ({ ...prev, notifyOrders: c }))}
                                    />
                                    <Label htmlFor="wa-orders" className="font-normal">Notificar pedidos</Label>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {selectedIntegration?.id === 'google' && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="google-calendar">ID del Calendario</Label>
                                <Input 
                                    id="google-calendar"
                                    placeholder="ejemplo@group.calendar.google.com"
                                    value={configForm.calendarId || ''}
                                    onChange={(e) => setConfigForm(prev => ({ ...prev, calendarId: e.target.value }))}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox 
                                    id="google-autosync"
                                    checked={configForm.autoSync}
                                    onCheckedChange={(c) => setConfigForm(prev => ({ ...prev, autoSync: c }))}
                                />
                                <Label htmlFor="google-autosync" className="font-normal">Sincronización automática</Label>
                            </div>
                            <Button variant="outline" className="w-full">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Conectar con Google
                            </Button>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveConfig}>
                            Guardar configuración
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TabsContent>
    );
}
