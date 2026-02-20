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

// Stats Card Component - siguiendo design system (sin iconos)
function StatsCard({ title, value, trend, trendLabel }: { title: string; value: string | number; trend?: number; trendLabel?: string }) {
    return (
        <Card className="border-none shadow-none rounded-lg p-4">
            <CardContent className="p-0">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold text-primary mt-1">{value}</p>
                {trend !== undefined && (
                    <Badge variant={trend >= 0 ? 'completed' : 'destructive'} className="border-transparent font-normal text-xs mt-1">
                        {trend >= 0 ? '+' : ''}{trend}% {trendLabel}
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}


type CampaignStatus = 'Activa' | 'Inactiva' | 'Borrador' | 'Finalizada';
type Campaign = {
    id: string;
    name: string;
    type: string;
    status: CampaignStatus;
    launchDate: string;
    launchTime: string;
    endDate: string;
    audience: number;
}

const initialCampaigns: Campaign[] = [
    {
        id: 'camp-1',
        name: '20% Descuento Fin de Semana',
        type: 'Descuento %',
        status: 'Activa',
        launchDate: '2024-07-15',
        launchTime: '10:00',
        endDate: '2024-07-17',
        audience: 42 },
    {
        id: 'camp-2',
        name: '2x1 en Postres',
        type: '2x1',
        status: 'Finalizada',
        launchDate: '2024-07-01',
        launchTime: '12:00',
        endDate: '2024-07-07',
        audience: 153 },
    {
        id: 'camp-3',
        name: 'Menú del Día Especial',
        type: 'Oferta Especial',
        status: 'Borrador',
        launchDate: '2024-07-20',
        launchTime: '11:00',
        endDate: '2024-07-25',
        audience: 0 },
    {
        id: 'camp-4',
        name: 'Cena Gratis para Cumpleañeros',
        type: 'Regalo',
        status: 'Inactiva',
        launchDate: '2024-01-01',
        launchTime: '09:00',
        endDate: '2024-12-31',
        audience: 28 }
]

function CreateCampaignDialog({ open, onOpenChange, campaign, onSave }: { open: boolean; onOpenChange: (open: boolean) => void; campaign: Campaign | null; onSave: (campaign: Campaign) => void }) {
    const { toast } = useToast();
    const categories = mockCategories;
    const products = mockProducts;

    // Controlled form state
    const [formData, setFormData] = React.useState({
        name: '',
        type: 'Descuento %',
        message: '¡Hola {nombre_cliente}! No te pierdas nuestro 20% de descuento en {nombre_producto_ofertado} hasta el {fecha_fin_oferta}.',
        launchDate: '',
        launchTime: '10:00',
        endDate: '',
        audienceBehavior: 'recent-90',
        maxAudience: '',
        categoryId: '' });
    
    const [offerType, setOfferType] = React.useState<'category' | 'product'>('category');
    const [productSearch, setProductSearch] = React.useState('');
    const [selectedProduct, setSelectedProduct] = React.useState<any | null>(null);
    const [isSearchPopoverOpen, setIsSearchPopoverOpen] = React.useState(false);

    // Initialize form when editing
    React.useEffect(() => {
        if (campaign) {
            setFormData({
                name: campaign.name,
                type: campaign.type,
                message: '¡Hola {nombre_cliente}! No te pierdas nuestra oferta especial.',
                launchDate: campaign.launchDate,
                launchTime: campaign.launchTime,
                endDate: campaign.endDate,
                audienceBehavior: 'recent-90',
                maxAudience: '',
                categoryId: '' });
        } else {
            setFormData({
                name: '',
                type: 'Descuento %',
                message: '¡Hola {nombre_cliente}! No te pierdas nuestro 20% de descuento en {nombre_producto_ofertado} hasta el {fecha_fin_oferta}.',
                launchDate: '',
                launchTime: '10:00',
                endDate: '',
                audienceBehavior: 'recent-90',
                maxAudience: '',
                categoryId: '' });
        }
    }, [campaign, open]);
    
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    // Generate preview message
    const getPreviewMessage = () => {
        let msg = formData.message;
        msg = msg.replace('{nombre_cliente}', 'Carlos');
        msg = msg.replace('{nombre_producto_ofertado}', selectedProduct?.nombre_producto || 'nuestros productos');
        msg = msg.replace('{fecha_fin_oferta}', formData.endDate || '31 de enero');
        return msg;
    };
    
    const whatsAppPreviewMessages = [
        createWhatsAppMessage.text(getPreviewMessage()),
        createWhatsAppMessage.buttons('¿Te interesa esta oferta?', [
            { id: 'yes', label: 'Sí, quiero aprovecharla' },
            { id: 'more', label: 'Ver más detalles' },
        ]),
    ];
    
    const handleSave = (asDraft: boolean = false) => {
        const newCampaign: Campaign = {
            id: campaign?.id || `camp-${Date.now()}`,
            name: formData.name || 'Nueva Campaña',
            type: formData.type,
            status: asDraft ? 'Borrador' : 'Activa',
            launchDate: formData.launchDate,
            launchTime: formData.launchTime,
            endDate: formData.endDate,
            audience: parseInt(formData.maxAudience) || 42 };
        onSave(newCampaign);
        toast({
            title: asDraft ? 'Borrador guardado' : 'Campaña programada',
            description: asDraft ? 'La campaña se guardó como borrador.' : 'La campaña ha sido programada exitosamente.' });
        onOpenChange(false);
    };

    const searchSuggestions = React.useMemo(() => {
        if (productSearch.length < 2) return [];
        return products.filter(p => p.nombre_producto.toLowerCase().includes(productSearch.toLowerCase()));
    }, [productSearch, products]);

    React.useEffect(() => {
        setIsSearchPopoverOpen(productSearch.length >= 2 && searchSuggestions.length > 0);
    }, [productSearch, searchSuggestions]);

    const handleSelectProduct = (product: any) => {
        setSelectedProduct(product);
        setProductSearch(product.nombre_producto);
        setIsSearchPopoverOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader
                    icon={MessageSquare}
                    title={`${campaign ? 'Editar' : 'Crear Nueva'} Campaña de WhatsApp`}
                    description="Configura los detalles de tu nueva campaña. Se enviará únicamente a través de WhatsApp."
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow overflow-hidden">
                    {/* Form Column */}
                    <div className="lg:col-span-2 overflow-y-auto pr-2 space-y-6 py-2">
                        {/* Campaign Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="campaign-name">Nombre de la Campaña</Label>
                                <Input 
                                    id="campaign-name" 
                                    placeholder="Ej: Descuento Verano" 
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="campaign-type">Tipo de Promoción</Label>
                                <Select value={formData.type} onValueChange={(v) => handleInputChange('type', v)}>
                                    <SelectTrigger id="campaign-type">
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Descuento %">Descuento %</SelectItem>
                                        <SelectItem value="Descuento Fijo (€)">Descuento Fijo (€)</SelectItem>
                                        <SelectItem value="2x1">2x1</SelectItem>
                                        <SelectItem value="Regalo">Regalo</SelectItem>
                                        <SelectItem value="Oferta Especial">Oferta Especial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    <Separator />

                    {/* Offer Targeting */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-muted-foreground">¿Qué se promociona?</h3>
                        <RadioGroup value={offerType} onValueChange={(val: any) => setOfferType(val)} className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="category" id="category" className="peer sr-only" />
                                <Label htmlFor="category" className="flex items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    <Layers className="h-5 w-5" /> Una Categoría
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="product" id="product" className="peer sr-only" />
                                <Label htmlFor="product" className="flex items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                    <Package className="h-5 w-5" /> Un Producto
                                </Label>
                            </div>
                        </RadioGroup>
                        {offerType === 'category' ? (
                            <div className="space-y-2">
                                <Label htmlFor="category-select">Categoría a promocionar</Label>
                                <Select>
                                    <SelectTrigger id="category-select"><SelectValue placeholder="Selecciona una categoría..." /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre_categoria}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="product-search">Producto a promocionar</Label>
                                <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <SearchInput
                                            id="product-search"
                                            placeholder="Buscar producto..."
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                        />
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Escribe para buscar..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                                <CommandGroup>
                                                    {searchSuggestions.map(p => (
                                                        <CommandItem key={p.id} value={p.nombre_producto} onSelect={() => handleSelectProduct(p)}>
                                                            {p.nombre_producto}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Audience Segmentation */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-muted-foreground">¿A quién se envía?</h3>
                        <Card className="bg-background/50">
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Comportamiento del Cliente</Label>
                                    <Select defaultValue="recent-90">
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="recent-30">Clientes de los últimos 30 días</SelectItem>
                                            <SelectItem value="recent-90">Clientes de los últimos 90 días</SelectItem>
                                            <SelectItem value="not-seen-60">Clientes no vistos en 60 días</SelectItem>
                                            <SelectItem value="top-20">Top 20% clientes más leales</SelectItem>
                                            <SelectItem value="all">Todos los clientes con teléfono</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-audience">Impactar a un máximo de</Label>
                                    <Input id="max-audience" type="number" placeholder="Sin límite" />
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-3">
                                <Users className="h-5 w-5" />
                                <p>Se enviará a un estimado de <strong>42 clientes</strong>.</p>
                            </CardFooter>
                        </Card>
                    </div>

                    <Separator />

                        {/* Message and Dates */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="campaign-message">Mensaje de la Campaña</Label>
                                <Textarea 
                                    id="campaign-message" 
                                    placeholder="¡Hola {nombre_cliente}! No te pierdas nuestro 20% de descuento..."
                                    value={formData.message}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                    rows={3}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Variables: {"{nombre_cliente}"}, {"{nombre_producto_ofertado}"}, {"{fecha_fin_oferta}"}
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="start-date">Fecha Lanzamiento</Label>
                                    <Input 
                                        id="start-date" 
                                        type="date" 
                                        value={formData.launchDate}
                                        onChange={(e) => handleInputChange('launchDate', e.target.value)}
                                        className="dark:[color-scheme:dark]" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="start-time">Hora</Label>
                                    <Input 
                                        id="start-time" 
                                        type="time" 
                                        value={formData.launchTime}
                                        onChange={(e) => handleInputChange('launchTime', e.target.value)}
                                        className="dark:[color-scheme:dark]" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end-date">Fecha Fin</Label>
                                    <Input 
                                        id="end-date" 
                                        type="date" 
                                        value={formData.endDate}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        className="dark:[color-scheme:dark]" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Preview Column */}
                    <div className="lg:col-span-1 border-l pl-4 hidden lg:block">
                        <Label className="mb-2 block text-sm font-medium">Vista previa WhatsApp</Label>
                        <WhatsAppPreview
                            messages={whatsAppPreviewMessages}
                            businessName="Mi Restaurante"
                            showHeader={true}
                            className="max-w-full"
                        />
                    </div>
                </div>
                
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button type="button" variant="outline" onClick={() => handleSave(true)}>
                        Guardar Borrador
                    </Button>
                    <Button variant="default" type="button" onClick={() => handleSave(false)}>
                        <Send className="mr-2 h-4 w-4" />
                        {campaign ? 'Guardar y Reprogramar' : 'Guardar y Programar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

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
            tasaApertura: 78, // Mock
            conversion: 12.5, // Mock
            finalizadas };
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
            case 'Activa':
                return 'completed';
            case 'Finalizada':
                return 'secondary';
            case 'Borrador':
                return 'in-progress';
            case 'Inactiva':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const handleStatusChange = (campaignId: string, newStatus: boolean) => {
        setCampaigns(prev => prev.map(c => {
            if (c.id === campaignId) {
                // Can't activate a finished campaign
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
            <PageHeader title="Gestión de Promociones y Campañas" />
            <PageContent>
                {/* Stats KPIs - design system: sin iconos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard 
                        title="Campañas Activas" 
                        value={stats.activas} 
                        trend={15}
                        trendLabel="vs mes anterior"
                    />
                    <StatsCard 
                        title="Audiencia Total" 
                        value={stats.totalAudience} 
                        trend={8}
                        trendLabel="clientes"
                    />
                    <StatsCard 
                        title="Tasa de Apertura" 
                        value={`${stats.tasaApertura}%`} 
                        trend={5}
                        trendLabel="vs promedio"
                    />
                    <StatsCard 
                        title="Conversión" 
                        value={`${stats.conversion}%`} 
                        trend={-2}
                        trendLabel="vs mes anterior"
                    />
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="campaigns">Campañas</TabsTrigger>
                        <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="campaigns" className="space-y-4">
                        {/* Filters */}
                        <Card>
                            <CardHeader className="py-3">
                                <H3 className="text-base font-bold text-muted-foreground">Filtros</H3>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <SearchInput placeholder="Buscar por nombre..." />
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filtrar por tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los tipos</SelectItem>
                                            <SelectItem value="discount">Descuento</SelectItem>
                                            <SelectItem value="2x1">2x1</SelectItem>
                                            <SelectItem value="gift">Regalo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filtrar por estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los estados</SelectItem>
                                            <SelectItem value="active">Activa</SelectItem>
                                            <SelectItem value="draft">Borrador</SelectItem>
                                            <SelectItem value="finished">Finalizada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <H3 className="text-base font-bold text-muted-foreground">Campañas</H3>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Aquí puedes ver y gestionar todas tus campañas de WhatsApp.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto">
                                <FileDown className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                            <Button className="w-full sm:w-auto" onClick={() => handleOpenDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Crear Campaña
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile View - Cards */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                                {campaigns.length === 0 ? (
                                    <EmptyState 
                                        icon={PlusCircle}
                                        title="No hay campañas"
                                        description="Crea tu primera campaña para empezar a atraer clientes"
                                        action={<CreateActionCard label="Crear primera campaña" onClick={() => handleOpenDialog()} />}
                                        className="py-16 col-span-full border-none bg-transparent"
                                    />
                                ) : null}
                            {campaigns.map((campaign) => (
                                <Card key={campaign.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-grow pr-2">
                                            <h3 className="font-semibold">{campaign.name}</h3>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="md" variant="ghost" className="h-8 w-8 -mt-2 -mr-2 flex-shrink-0">
                                                    <MoreHorizontal />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenDialog(campaign)}><Edit />Editar</DropdownMenuItem>
                                                <DropdownMenuItem><Copy />Duplicar</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem><Trash />Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="mb-4">
                                        <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Tipo:</span>
                                            <span className="font-medium text-foreground">{campaign.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Audiencia:</span>
                                            <span className="font-medium text-foreground">{campaign.audience} clientes</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Lanzamiento:</span>
                                            <span className="font-medium text-foreground">{campaign.launchDate} a las {campaign.launchTime}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <Label htmlFor={`status-switch-mobile-${campaign.id}`} className="text-sm">Activar</Label>
                                        <Switch
                                            id={`status-switch-mobile-${campaign.id}`}
                                            checked={campaign.status === 'Activa'}
                                            onCheckedChange={(checked) => handleStatusChange(campaign.id, checked)}
                                            disabled={campaign.status === 'Finalizada' || campaign.status === 'Borrador'}
                                        />
                                    </div>
                                </Card>
                            ))}
                            <CreateActionCard label="Crear Campaña" onClick={() => handleOpenDialog()} />
                        </div>

                        {/* Desktop View - Table */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-[60px] text-center'>Estado</TableHead>
                                        <TableHead>Nombre Campaña</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead className="text-center">Estado</TableHead>
                                        <TableHead>Audiencia</TableHead>
                                        <TableHead>Lanzamiento</TableHead>
                                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {campaigns.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                <div className="flex flex-col items-center gap-4 py-4">
                                                    <p className="text-muted-foreground">No hay campañas creadas.</p>
                                                    <Button onClick={() => handleOpenDialog()}>
                                                        <PlusCircle className="mr-2 h-4 w-4" />
                                                        Crear Campaña
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : campaigns.map((campaign) => (
                                        <TableRow key={campaign.id}>
                                            <TableCell className="text-center">
                                                <Switch
                                                    id={`status-switch-${campaign.id}`}
                                                    checked={campaign.status === 'Activa'}
                                                    onCheckedChange={(checked) => handleStatusChange(campaign.id, checked)}
                                                    disabled={campaign.status === 'Finalizada' || campaign.status === 'Borrador'}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{campaign.name}</TableCell>
                                            <TableCell>{campaign.type}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                                            </TableCell>
                                            <TableCell>{campaign.audience} clientes</TableCell>
                                            <TableCell>{campaign.launchDate} a las {campaign.launchTime}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="md" variant="ghost">
                                                            <MoreHorizontal />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleOpenDialog(campaign)}><Edit />Editar</DropdownMenuItem>
                                                        <DropdownMenuItem><Copy />Duplicar</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem><Trash />Eliminar</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Mostrando <strong>1-{campaigns.length}</strong> de <strong>{campaigns.length}</strong> campañas
                        </div>
                    </CardFooter>
                </Card>
                    </TabsContent>
                    
                    {/* Stats Tab */}
                    <TabsContent value="stats" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <H3 className="text-base">Rendimiento por Campaña</H3>
                                    <CardDescription>Métricas de las últimas campañas</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Campaña</TableHead>
                                                <TableHead className="text-center">Enviados</TableHead>
                                                <TableHead className="text-center">Abiertos</TableHead>
                                                <TableHead className="text-center">Conversión</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {campaigns.slice(0, 5).map(campaign => (
                                                <TableRow key={campaign.id}>
                                                    <TableCell className="font-medium">{campaign.name}</TableCell>
                                                    <TableCell className="text-center">{campaign.audience}</TableCell>
                                                    <TableCell className="text-center">{Math.round(campaign.audience * 0.78)}</TableCell>
                                                    <TableCell className="text-center">{(Math.random() * 15 + 5).toFixed(1)}%</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <H3 className="text-base">Métricas WhatsApp</H3>
                                    <CardDescription>Estadísticas del canal</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-brand-whatsapp" />
                                            <span>Mensajes enviados (mes)</span>
                                        </div>
                                        <span className="font-bold">1,247</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-blue-500" />
                                            <span>Tasa de lectura</span>
                                        </div>
                                        <span className="font-bold">92%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-green-500" />
                                            <span>Pedidos generados</span>
                                        </div>
                                        <span className="font-bold">89</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-purple-500" />
                                            <span>Clientes nuevos</span>
                                        </div>
                                        <span className="font-bold">34</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
                
                <CreateCampaignDialog 
                    open={isDialogOpen} 
                    onOpenChange={setIsDialogOpen} 
                    campaign={editingCampaign}
                    onSave={handleSaveCampaign}
                />
            </PageContent>
        </PageContainer>
    );
}


