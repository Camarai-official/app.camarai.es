'use client';

import * as React from 'react';
import { 
    MessageSquare, 
    Layers, 
    Package, 
    Users, 
    Bell, 
    Clock, 
    X, 
    Send,
    PlusCircle
} from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader, DialogClose } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';
import { ActionTile } from '@/components/ui/action-tile';
import { useToast } from '@/hooks/use-toast';
import { mockCategories, mockProducts } from '@/data/mock-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { SearchInput } from '@/components/ui/search-input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export type CampaignStatus = 'Activa' | 'Inactiva' | 'Borrador' | 'Finalizada';

export type Campaign = {
    id: string;
    name: string;
    type: string;
    status: CampaignStatus;
    launchDate: string;
    launchTime: string;
    endDate: string;
    audience: number;
}

interface CampanaWhatsAppDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaign: Campaign | null;
    onSave: (campaign: Campaign) => void;
}

export function CampanaWhatsAppDialog({ open, onOpenChange, campaign, onSave }: CampanaWhatsAppDialogProps) {
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
        categoryId: '' 
    });
    
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
                categoryId: '' 
            });
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
                categoryId: '' 
            });
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
            audience: parseInt(formData.maxAudience) || 42 
        };
        onSave(newCampaign);
        toast({
            title: asDraft ? 'Borrador guardado' : 'Campaña programada',
            description: asDraft ? 'La campaña se guardó como borrador.' : 'La campaña ha sido programada exitosamente.' 
        });
        onOpenChange(false);
    };

    const searchSuggestions = React.useMemo(() => {
        if (productSearch.length < 2) return [];
        return products.filter(p => p.nombre_producto.toLowerCase().includes(productSearch.toLowerCase()));
    }, [productSearch, products]);

    const handleSelectProduct = (product: any) => {
        setSelectedProduct(product);
        setProductSearch(product.nombre_producto);
        setIsSearchPopoverOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="xl">
                <DialogHeader
                    icon={MessageSquare}
                    title={`${campaign ? 'Editar' : 'Crear Nueva'} Campaña de WhatsApp`}
                    description="Configura los detalles de tu nueva campaña. Se enviará únicamente a través de WhatsApp."
                />
                
                <DialogContent>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Form Column */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">¿Qué se promociona?</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ActionTile
                                        icon={Layers}
                                        title="Una Categoría"
                                        description="Toda una sección de tu carta"
                                        onClick={() => setOfferType('category')}
                                        variant={offerType === 'category' ? 'accent' : 'outline'}
                                        padding="md"
                                    />
                                    <ActionTile
                                        icon={Package}
                                        title="Un Producto"
                                        description="Un plato o bebida específica"
                                        onClick={() => setOfferType('product')}
                                        variant={offerType === 'product' ? 'accent' : 'outline'}
                                        padding="md"
                                    />
                                </div>

                                {offerType === 'category' ? (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label htmlFor="category-select">Categoría a promocionar</Label>
                                        <Select>
                                            <SelectTrigger id="category-select"><SelectValue placeholder="Selecciona una categoría..." /></SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre_categoria}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
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
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                <Command>
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

                            <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Segmentación de Audiencia</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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
                                        <Label htmlFor="max-audience">Límite de envíos (opcional)</Label>
                                        <Input id="max-audience" type="number" placeholder="Sin límite" />
                                    </div>
                                </div>
                                <ActionTile
                                    icon={Users}
                                    iconColor="#3b82f6"
                                    title="Audiencia estimada"
                                    description={<span>Se enviará a un estimado de <strong className="text-primary font-bold">42 clientes</strong> calificados.</span>}
                                    variant="none"
                                    padding="none"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contenido y Programación</Label>
                                <div className="space-y-3">
                                    <Label htmlFor="campaign-message">Mensaje personalizado</Label>
                                    <Textarea 
                                        id="campaign-message" 
                                        placeholder="¡Hola {nombre_cliente}! No te pierdas nuestro 20% de descuento..."
                                        value={formData.message}
                                        onChange={(e) => handleInputChange('message', e.target.value)}
                                        rows={4}
                                        className="resize-none"
                                    />
                                    <p className="text-[11px] text-muted-foreground px-1">
                                        Variables: <code className="text-primary">{'{nombre_cliente}'}</code>, <code className="text-primary">{'{nombre_producto_ofertado}'}</code>, <code className="text-primary">{'{fecha_fin_oferta}'}</code>
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-date">Lanzamiento</Label>
                                        <Input 
                                            id="start-date" 
                                            type="date" 
                                            value={formData.launchDate}
                                            onChange={(e) => handleInputChange('launchDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="start-time">Hora</Label>
                                        <Input 
                                            id="start-time" 
                                            type="time" 
                                            value={formData.launchTime}
                                            onChange={(e) => handleInputChange('launchTime', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end-date">Fin de Oferta</Label>
                                        <Input 
                                            id="end-date" 
                                            type="date" 
                                            value={formData.endDate}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Column */}
                        <div className="lg:col-span-4 flex flex-col h-full min-h-[500px]">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Vista Previa Real-time</Label>
                            <div className="rounded-2xl border bg-muted/30 p-6 flex-1 flex justify-center">
                                <div className="w-full max-w-[280px] h-full">
                                    <WhatsAppPreview
                                        messages={whatsAppPreviewMessages}
                                        businessName="Mi Restaurante"
                                        showHeader={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                
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
                        {campaign ? 'Guardar y Reprogramar' : 'Crear Campaña'}
                    </Button>
                </DialogFooter>
            </DialogWindow>
        </Dialog>
    );
}
