import { H3, TextSM, TextXS } from '@/components/ui/typography';
import * as React from 'react';
import { MoreVertical, Pencil, Trash, CheckCircle2, XCircle, ExternalLink, RefreshCw, Zap, Settings } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { EvolutionAPIConfigForm, defaultEvolutionConfig, type EvolutionAPIConfig } from '@/components/features/evolution-api-config';
import { Separator } from '@/components/ui/separator';
import { ActionTile } from '@/components/ui/action-tile';
import { FaWhatsapp } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

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

// Icons integrated from react-icons in the initialIntegrations array below

const initialIntegrations: Integration[] = [
    {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        description: 'Notificaciones de reservas y pedidos.',
        icon: <FaWhatsapp />,
        enabled: true,
        connected: true,
        config: { phone: '+34612345678', notifyReservations: true, notifyOrders: true },
        lastSync: '2024-01-29 10:30' },
    {
        id: 'google',
        name: 'Reservas de Google',
        description: 'Sincroniza tus reservas con Google.',
        icon: <FcGoogle />,
        enabled: false,
        connected: false,
        config: { calendarId: '', autoSync: false } },
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
            description: 'La configuración de WhatsApp se ha guardado correctamente.' });
    };
    
    const handleToggle = (id: string, enabled: boolean) => {
        if (!enabled) {
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, enabled: false } : i));
            toast({
                title: 'Integración desactivada',
                description: 'La integración ha sido desactivada.' });
        } else {
            const integration = integrations.find(i => i.id === id);
            if (integration && !integration.connected) {
                openConfigDialog(integration);
            } else {
                setIntegrations(prev => prev.map(i => i.id === id ? { ...i, enabled: true } : i));
                toast({
                    title: 'Integración activada',
                    description: 'La integración está ahora activa.' });
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
            description: `${selectedIntegration.name} ha sido configurado correctamente.` });
        setConfigDialogOpen(false);
    };
    
    const handleDisconnect = (id: string) => {
        setIntegrations(prev => prev.map(i => 
            i.id === id ? { ...i, connected: false, enabled: false } : i
        ));
        toast({
            variant: 'destructive',
            title: 'Integración desconectada',
            description: 'La integración ha sido eliminada.' });
    };
    
    const handleSync = (integration: Integration) => {
        toast({
            title: 'Sincronizando...',
            description: `Sincronizando ${integration.name}.` });
        // Simulate sync
        setTimeout(() => {
            setIntegrations(prev => prev.map(i => 
                i.id === integration.id ? { ...i, lastSync: new Date().toLocaleString('es-ES') } : i
            ));
            toast({
                title: 'Sincronización completada',
                description: `${integration.name} actualizado.` });
        }, 1500);
    };
    
    return (
        <TabsContent value="integrations">
            <Card>
                <CardHeader>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <H3 className="font-bold text-muted-foreground">Integraciones</H3>
                            </TooltipTrigger>
                            <TooltipContent>
                                <TextSM>Conecta con tus herramientas favoritas para potenciar tu restaurante.</TextSM>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {integrations.map(integration => (
                            <ActionTile
                                key={integration.id}
                                icon={integration.icon}
                                iconColor={integration.id === 'whatsapp' ? '#25D366' : undefined}
                                layout="row"
                                title={
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 min-w-0">
                                        <span className="font-semibold truncate">{integration.name}</span>
                                        <div className="flex">
                                            {integration.connected ? (
                                                <Badge variant="secondary" className="text-green-600 h-5 px-1.5 text-[10px] shrink-0" startIcon={<CheckCircle2 />}>
                                                    Conectado
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground h-5 px-1.5 text-[10px] shrink-0" startIcon={<XCircle />}>
                                                    No conectado
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                }
                                description={
                                    <div className="flex flex-col mt-1 gap-0.5 min-w-0">
                                        <span className="text-[11px] sm:text-xs text-muted-foreground truncate">{integration.description}</span>
                                        {integration.lastSync && <span className="text-[10px] text-muted-foreground/80 truncate">Sincronizado: {integration.lastSync}</span>}
                                    </div>
                                }
                                variant="outline"
                                padding="md"
                                rightContentType="custom"
                                customContent={
                                    <div className="flex items-center gap-2">
                                        <Switch 
                                            checked={integration.enabled}
                                            onCheckedChange={(checked) => handleToggle(integration.id, checked)}
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="md" className="h-10 w-10">
                                                    <MoreVertical className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => openConfigDialog(integration)}>
                                                    <Pencil />Configurar
                                                </DropdownMenuItem>
                                                {integration.connected && (
                                                    <DropdownMenuItem onSelect={() => handleSync(integration)}>
                                                        <RefreshCw />Sincronizar
                                                    </DropdownMenuItem>
                                                )}
                                                {integration.connected && (
                                                    <DropdownMenuItem 
                                                        onSelect={() => handleDisconnect(integration.id)}
                                                    >
                                                        <Trash />Desconectar
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-4 sm:pt-6">
                    <Button variant="outline" startIcon={<ExternalLink />}>
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
                            <H3 className="font-bold text-muted-foreground">Evolution API - Camarero AI</H3>
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
                <DialogWindow size="md">
                    <DialogHeader
                        icon={Settings}
                        title={`Configurar ${selectedIntegration?.name}`}
                        description="Configura los ajustes de esta integración."
                    />
                    
                    <DialogContent className="p-6">
                        <div className="space-y-4">
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
                                    <div className="space-y-2">
                                        <Label>Notificaciones</Label>
                                        <div className="grid gap-2">
                                            <ActionTile
                                                title="Notificar reservas"
                                                description="Recibir avisos de nuevas reservas por WhatsApp"
                                                rightContentType="checkbox"
                                                checkboxId="wa-reservations"
                                                checkboxChecked={configForm.notifyReservations}
                                                onCheckboxChange={(c) => setConfigForm(prev => ({ ...prev, notifyReservations: c }))}
                                                variant="outline"
                                                padding="md"
                                            />
                                            <ActionTile
                                                title="Notificar pedidos"
                                                description="Recibir avisos de nuevos pedidos por WhatsApp"
                                                rightContentType="checkbox"
                                                checkboxId="wa-orders"
                                                checkboxChecked={configForm.notifyOrders}
                                                onCheckboxChange={(c) => setConfigForm(prev => ({ ...prev, notifyOrders: c }))}
                                                variant="outline"
                                                padding="md"
                                            />
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
                                    <ActionTile
                                        title="Sincronización automática"
                                        description="Mantener Google Calendar siempre actualizado"
                                        rightContentType="checkbox"
                                        checkboxId="google-autosync"
                                        checkboxChecked={configForm.autoSync}
                                        onCheckboxChange={(c) => setConfigForm(prev => ({ ...prev, autoSync: c }))}
                                        variant="outline"
                                        padding="md"
                                    />
                                    <Button variant="outline" className="w-full" startIcon={<ExternalLink />}>
                                        Conectar con Google
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                    
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setConfigDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveConfig}>
                            Guardar configuración
                        </Button>
                    </DialogFooter>
                </DialogWindow>
            </Dialog>
        </TabsContent>
    );
}

