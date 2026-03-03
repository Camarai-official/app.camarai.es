'use client';
import { H3 } from '@/components/ui/typography';


import * as React from 'react';
import {
    MoreHorizontal,
    PlusCircle,
    FileDown,
    Edit,
    Copy,
    Trash,
    Package,
    Layers,
    Users,
    Clock,
    Send,
    TrendingUp,
    Eye,
    MousePointer,
    MessageSquare
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    CardDescription
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogClose } from '@/components/layout/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { mockCategories, mockProducts } from '@/data/mock-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { SearchInput } from '@/components/ui/search-input';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { cn } from '@/lib/utils';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { MetricCard } from '@/components/widgets/metric-card';
import { CampanaWhatsAppDialog, Campaign, CampaignStatus } from '@/components/dialogs/campana-whatsapp-dialog';
import { ActionTile } from '@/components/ui/action-tile';

const initialCampaigns: Campaign[] = [
    {
        id: 'camp-1',
        name: '20% Descuento Fin de Semana',
        type: 'Descuento %',
        status: 'Activa',
        launchDate: '2024-07-15',
        launchTime: '10:00',
        endDate: '2024-07-17',
        audience: 42 
    },
    {
        id: 'camp-2',
        name: '2x1 en Postres',
        type: '2x1',
        status: 'Finalizada',
        launchDate: '2024-07-01',
        launchTime: '12:00',
        endDate: '2024-07-07',
        audience: 153 
    },
    {
        id: 'camp-3',
        name: 'Menú del Día Especial',
        type: 'Oferta Especial',
        status: 'Borrador',
        launchDate: '2024-07-20',
        launchTime: '11:00',
        endDate: '2024-07-25',
        audience: 0 
    },
    {
        id: 'camp-4',
        name: 'Cena Gratis para Cumpleañeros',
        type: 'Regalo',
        status: 'Inactiva',
        launchDate: '2024-01-01',
        launchTime: '09:00',
        endDate: '2024-12-31',
        audience: 28 
    }
];

export default function PromocionesPage() {
    const [campaigns, setCampaigns] = React.useState(initialCampaigns);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingCampaign, setEditingCampaign] = React.useState<Campaign | null>(null);
    const [activeTab, setActiveTab] = React.useState('campaigns');
    const { toast } = useToast();

    // Stats calculations
    const stats = React.useMemo(() => {
        const activas = campaigns.filter(c => c.status === 'Activa').length;
        const totalAudience = campaigns.reduce((acc, c) => acc + c.audience, 0);
        const finalizadas = campaigns.filter(c => c.status === 'Finalizada').length;
        return {
            activas,
            totalAudience,
            tasaApertura: 78,
            conversion: 12.5,
            finalizadas 
        };
    }, [campaigns]);
    
    const handleSaveCampaign = (campaign: Campaign) => {
        const existing = campaigns.find(c => c.id === campaign.id);
        if (existing) {
            setCampaigns(prev => prev.map(c => c.id === campaign.id ? campaign : c));
        } else {
            setCampaigns(prev => [...prev, campaign]);
        }
    };

    const getStatusVariant = (status: CampaignStatus) => {
        switch (status) {
            case 'Activa': return 'completed';
            case 'Finalizada': return 'neutral';
            case 'Borrador': return 'in-progress';
            case 'Inactiva': return 'destructive';
            default: return 'outline';
        }
    };

    const handleStatusChange = (campaignId: string, newStatus: boolean) => {
        setCampaigns(prev => prev.map(c => {
            if (c.id === campaignId) {
                if (c.status === 'Finalizada') {
                    toast({
                        variant: 'destructive',
                        title: 'Campaña Finalizada',
                        description: 'No se puede reactivar una campaña que ya ha terminado.'
                    });
                    return c;
                }
                return { ...c, status: newStatus ? 'Activa' : 'Inactiva' };
            }
            return c;
        }));
    };

    const handleOpenDialog = (campaign?: Campaign) => {
        setEditingCampaign(campaign || null);
        setIsDialogOpen(true);
    };

    return (
        <PageContainer>
            <PageHeader 
                title="Gestión de Promociones y Campañas" 
                subtitle="Crea y gestiona tus campañas de marketing por WhatsApp."
            />
            
            <PageContent>
                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ActionTile 
                        icon={TrendingUp} 
                        iconColor="#22c55e"
                        title="Campañas Activas" 
                        description={`${stats.activas} activas ahora`}
                        rightContentType="badge"
                        badgeText="+15%"
                        badgeVariant="completed"
                        variant="outline"
                    />
                    <ActionTile 
                        icon={Users} 
                        iconColor="#3b82f6"
                        title="Audiencia Total" 
                        description={`${stats.totalAudience} clientes`}
                        rightContentType="badge"
                        badgeText="+8%"
                        badgeVariant="in-progress"
                        variant="outline"
                    />
                    <ActionTile 
                        icon={Eye} 
                        iconColor="#a855f7"
                        title="Tasa de Apertura" 
                        description={`${stats.tasaApertura}% de lectura`}
                        rightContentType="badge"
                        badgeText="+5%"
                        badgeVariant="completed"
                        variant="outline"
                    />
                    <ActionTile 
                        icon={MousePointer} 
                        iconColor="#f59e0b"
                        title="Conversión" 
                        description={`${stats.conversion}% de éxito`}
                        rightContentType="badge"
                        badgeText="-2%"
                        badgeVariant="destructive"
                        variant="outline"
                    />
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList marginBottom="xl">
                        <TabsTrigger icon={Package} value="campaigns">Campañas</TabsTrigger>
                        <TabsTrigger icon={TrendingUp} value="stats">Estadísticas</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="campaigns" spaced>
                        {/* Filters & Actions */}
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                <SearchInput placeholder="Buscar por nombre..." width="300" />
                                <Select>
                                    <SelectTrigger width="md">
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los tipos</SelectItem>
                                        <SelectItem value="discount">Descuento</SelectItem>
                                        <SelectItem value="2x1">2x1</SelectItem>
                                        <SelectItem value="gift">Regalo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 w-full lg:w-auto">
                                <Button variant="outline" responsiveWidth="auto-sm" startIcon={<FileDown />}>
                                    Exportar
                                </Button>
                                <Button variant="default" size="md" onClick={() => handleOpenDialog()} responsiveWidth="auto-sm" startIcon={<PlusCircle />}>
                                    Nueva Campaña
                                </Button>
                            </div>
                        </div>
                        <Card flex>
                            <CardHeader 
                                title="Listado de Campañas" 
                                description="Gestiona tus campañas de marketing enviadas por WhatsApp"
                            />
                            <CardContent padding="none">
                                {/* Mobile View - Cards */}
                                <div className="grid grid-cols-1 gap-0 md:hidden divide-y">
                                    {campaigns.length === 0 ? (
                                        <EmptyState 
                                            icon={PlusCircle}
                                            title="No hay campañas"
                                            description="Crea tu primera campaña para empezar a atraer clientes"
                                            action={<Button variant="default" size="md" onClick={() => handleOpenDialog()}>Crear primera campaña</Button>}
                                        />
                                    ) : (
                                        campaigns.map((campaign) => (
                                            <ActionTile
                                                key={campaign.id}
                                                icon={MessageSquare}
                                                title={campaign.name}
                                                description={`${campaign.type} • ${campaign.audience} clientes • ${campaign.launchDate}`}
                                                rightContentType="badge"
                                                badgeText={campaign.status}
                                                badgeVariant={getStatusVariant(campaign.status)}
                                                rightContentType="dropdown"
                                                dropdownItems={[
                                                    { label: 'Editar', onClick: () => handleOpenDialog(campaign), icon: <Edit /> },
                                                    { label: 'Duplicar', onClick: () => {}, icon: <Copy /> },
                                                    { label: 'Eliminar', onClick: () => {}, icon: <Trash /> }
                                                ]}
                                            />
                                        ))
                                    )}
                                </div>

                                {/* Desktop View - Table */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead width="80" align="center">Activa</TableHead>
                                                <TableHead>Nombre Campaña</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead align="center">Estado</TableHead>
                                                <TableHead>Audiencia</TableHead>
                                                <TableHead>Lanzamiento</TableHead>
                                                <TableHead width="120" align="right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {campaigns.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-64 text-center">
                                                        <EmptyState 
                                                            icon={PlusCircle}
                                                            title="No hay campañas"
                                                            description="Crea tu primera campaña para empezar a atraer clientes"
                                                            action={<Button variant="default" size="md" onClick={() => handleOpenDialog()}>Crear campaña</Button>}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                campaigns.map((campaign) => (
                                            <TableRow key={campaign.id}>
                                                <TableCell height="md" align="center" textSize="sm">
                                                    <Switch
                                                        checked={campaign.status === 'Activa'}
                                                        onCheckedChange={(checked) => handleStatusChange(campaign.id, checked)}
                                                        disabled={campaign.status === 'Finalizada' || campaign.status === 'Borrador'}
                                                    />
                                                </TableCell>
                                                <TableCell height="md" variant="medium" textSize="sm">{campaign.name}</TableCell>
                                                <TableCell height="md" textSize="sm">{campaign.type}</TableCell>
                                                <TableCell height="md" align="center" textSize="sm">
                                                    <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                                                </TableCell>
                                                <TableCell height="md" textSize="sm">{campaign.audience} clientes</TableCell>
                                                <TableCell height="md" textSize="sm">{campaign.launchDate} a las {campaign.launchTime}</TableCell>
                                                <TableCell height="md" align="right" textSize="sm">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                             <Button size="md" variant="ghost">
                                                                 <MoreHorizontal />
                                                             </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(campaign)}>
                                                                <Edit /> Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Copy /> Duplicar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem textVariant="destructive">
                                                                <Trash /> Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            {campaigns.length > 0 && (
                                <CardFooter padding="md">
                                    <p className="text-xs text-muted-foreground">
                                        Mostrando <strong>{campaigns.length}</strong> campañas registradas.
                                    </p>
                                </CardFooter>
                            )}
                        </Card>
                    </TabsContent>
                    
                    {/* Stats Tab */}
                    <TabsContent value="stats" spaced>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card flex>
                                <CardHeader 
                                    title="Rendimiento por Campaña" 
                                    description="Métricas de las últimas campañas enviadas" 
                                />
                                <CardContent padding="none">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Campaña</TableHead>
                                                <TableHead align="center">Enviados</TableHead>
                                                <TableHead align="center">Abiertos</TableHead>
                                                <TableHead align="center">Conversión</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {campaigns.slice(0, 5).map(campaign => (
                                                <TableRow key={campaign.id}>
                                                    <TableCell height="md" variant="medium" textSize="sm">{campaign.name}</TableCell>
                                                    <TableCell height="md" align="center">{campaign.audience}</TableCell>
                                                    <TableCell height="md" align="center">{Math.round(campaign.audience * 0.78)}</TableCell>
                                                    <TableCell height="md" align="center">{(Math.random() * 15 + 5).toFixed(1)}%</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                            
                            <Card flex>
                                <CardHeader 
                                    title="Métricas WhatsApp" 
                                    description="Estadísticas globales del canal de comunicación" 
                                />
                                <CardContent gap="md">
                                    <ActionTile
                                        variant="none"
                                        padding="md"
                                        icon={MessageSquare}
                                        iconColor="#22c55e"
                                        title="Mensajes enviados (mes)"
                                        rightContentType="badge"
                                        badgeText="1,247"
                                        badgeVariant="outline"
                                    />
                                    <ActionTile
                                        variant="none"
                                        padding="md"
                                        icon={Eye}
                                        iconColor="#3b82f6"
                                        title="Tasa de lectura promedio"
                                        rightContentType="badge"
                                        badgeText="92%"
                                        badgeVariant="outline"
                                    />
                                    <ActionTile
                                        variant="none"
                                        padding="md"
                                        icon={TrendingUp}
                                        iconColor="#f59e0b"
                                        title="Pedidos generados desde WA"
                                        rightContentType="badge"
                                        badgeText="89"
                                        badgeVariant="outline"
                                    />
                                    <ActionTile
                                        variant="none"
                                        padding="md"
                                        icon={Users}
                                        iconColor="#a855f7"
                                        title="Clientes reactivados"
                                        rightContentType="badge"
                                        badgeText="34"
                                        badgeVariant="outline"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
                
                <CampanaWhatsAppDialog 
                    open={isDialogOpen} 
                    onOpenChange={setIsDialogOpen} 
                    campaign={editingCampaign}
                    onSave={handleSaveCampaign}
                />
            </PageContent>
        </PageContainer>
    );
}


