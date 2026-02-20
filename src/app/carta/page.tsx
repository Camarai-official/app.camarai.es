'use client';
import { H3 } from '@/components/ui/typography';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash, Utensils, Wine, Coffee, IceCream, Pizza, Beer, ArrowUp, ArrowDown, MessageSquare, Mic, Clock, BookOpen, CheckCircle, Save, X, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockCartas, mockMenuCombos, mockCategories, mockProducts, type Carta, type MenuCombo, type ElementoCarta, type ElementoMenuCombo } from '@/data/mock-data';
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogFooter, DialogClose } from '@/components/layout/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { WhatsAppPreview, createWhatsAppMessage } from '@/components/features/whatsapp-preview';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout/page-container';
import { ConfigItem, ConfigToggle } from '@/components/ui/config-item';
import { IconPicker, iconMap as allIcons } from '@/components/ui/icon-picker';
import { ColorPicker } from '@/components/ui/color-picker';


// WhatsApp config type for Carta
interface CartaWhatsAppConfig {
  disponibleWhatsApp: boolean;
  permitirVoz: boolean;
  mensajeBienvenida: string;
  horarioInicio: string;
  horarioFin: string;
}

// Basic icons for fallback
const icons = {
    BookOpen, Utensils, Wine, Coffee, IceCream, Pizza, Beer
};

const availableColors = ['blue-400', 'violet-500', 'rose-500', 'amber-500', 'green-500', 'blue-500'];


export default function CartaPage() {
    const { toast } = useToast();
    const [cartas, setCartas] = React.useState<Carta[]>(mockCartas);
    const [menuCombos, setMenuCombos] = React.useState<MenuCombo[]>(mockMenuCombos);
    const [editingCarta, setEditingCarta] = React.useState<Partial<Carta> | null>(null);
    const [editingMenu, setEditingMenu] = React.useState<Partial<MenuCombo> | null>(null);
    const [isCartaDialogOpen, setIsCartaDialogOpen] = React.useState(false);
    const [isMenuDialogOpen, setIsMenuDialogOpen] = React.useState(false);
    const [isElementDialogOpen, setIsElementDialogOpen] = React.useState(false);
    const [selectedCartaId, setSelectedCartaId] = React.useState<string | null>(null);
    const [newElementData, setNewElementData] = React.useState<{ tipo: 'categoria' | 'menu', id_elemento: string }>({ tipo: 'categoria', id_elemento: '' });
    const [dialogTab, setDialogTab] = React.useState('general');
    
    // WhatsApp config state
    const [whatsAppConfig, setWhatsAppConfig] = React.useState<CartaWhatsAppConfig>({
        disponibleWhatsApp: true,
        permitirVoz: true,
        mensajeBienvenida: '¡Hola! Bienvenido a nuestro restaurante. ¿Qué te gustaría pedir hoy?',
        horarioInicio: '12:00',
        horarioFin: '23:00' });
    
    // Generate WhatsApp preview messages
    const getWhatsAppPreviewMessages = () => {
        const carta = editingCarta;
        if (!carta) return [];
        
        const categoriesInCarta = carta.elementos_carta?.filter(e => e.tipo === 'categoria') || [];
        const categoryNames = categoriesInCarta.map(e => {
            const cat = mockCategories.find(c => c.id === e.id_elemento);
            return cat?.nombre_categoria || 'Categoría';
        });
        
        return [
            createWhatsAppMessage.incoming('Hola, quiero ver la carta'),
            createWhatsAppMessage.text(whatsAppConfig.mensajeBienvenida),
            createWhatsAppMessage.buttons(
                `📋 *${carta.nombre_carta || 'Carta'}*\n\nElige una categoría:`,
                categoryNames.slice(0, 3).map((name, i) => ({ id: `cat-${i}`, label: name }))
            ),
        ];
    };

    // --- Helpers Local State ---

    const addCarta = () => {
        const newCarta: Carta = {
            id: `carta-${Date.now()}`,
            nombre_carta: 'Nueva Carta',
            descripcion_carta: '',
            activa: false,
            elementos_carta: [],
            icon: 'BookOpen',
            color: 'blue-400'
        };
        setCartas(prev => [...prev, newCarta]);
        setEditingCarta(newCarta);
        setIsCartaDialogOpen(true);
    };

    const updateCarta = (id: string, updates: Partial<Carta>) => {
        setCartas(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const removeCarta = (id: string) => {
        setCartas(prev => prev.filter(c => c.id !== id));
    };

    const addMenuCombo = () => {
        const newMenu: MenuCombo = {
            id: `menu-${Date.now()}`,
            nombre_carta: 'Nuevo Menú',
            descripcion: '',
            precio_carta: 0,
            id_impuesto: 'tax-1',
            disponible: true,
            url_imagen: '',
            elementos_menu: [],
            active: false,
            icon: 'Utensils',
            color: 'rose-500'
        };
        setMenuCombos(prev => [...prev, newMenu]);
        setEditingMenu(newMenu);
        setIsMenuDialogOpen(true);
    };

    const updateMenuCombo = (id: string, updates: Partial<MenuCombo>) => {
        setMenuCombos(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const removeMenuCombo = (id: string) => {
        setMenuCombos(prev => prev.filter(m => m.id !== id));
    };

    const addElementToCarta = () => {
        if (selectedCartaId && newElementData.id_elemento) {
            const carta = cartas.find(c => c.id === selectedCartaId);
            if (carta) {
                const newElement: ElementoCarta = {
                    id: `el-${Date.now()}`,
                    tipo: newElementData.tipo,
                    id_elemento: newElementData.id_elemento
                };
                updateCarta(selectedCartaId, { elementos_carta: [...carta.elementos_carta, newElement] });
                setIsElementDialogOpen(false);
                setNewElementData({ tipo: 'categoria', id_elemento: '' });
            }
        }
    };

    const removeElementFromCarta = (cartaId: string, elementId: string) => {
        const carta = cartas.find(c => c.id === cartaId);
        if (carta) {
            updateCarta(cartaId, { elementos_carta: carta.elementos_carta.filter(el => el.id !== elementId) });
        }
    };

    // --- End Helpers ---

    const handleSaveCarta = () => {
        if (editingCarta && editingCarta.id) {
            updateCarta(editingCarta.id, editingCarta);
            setIsCartaDialogOpen(false);
            setEditingCarta(null);
        }
    };

    const handleSaveMenu = () => {
        if (editingMenu && editingMenu.id) {
            updateMenuCombo(editingMenu.id, editingMenu);
            setIsMenuDialogOpen(false);
            setEditingMenu(null);
        }
    };


    return (
        <PageContainer>
            <PageHeader
                title="Gestión de Cartas y Menús"
                subtitle="Diseña y organiza las cartas digitales y menús combinados."
            />

            <PageContent className="space-y-6">
                <Tabs defaultValue="cartas" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-full sm:max-w-[400px] mb-4">
                        <TabsTrigger value="cartas">Cartas Digitales</TabsTrigger>
                        <TabsTrigger value="menus">Menús y Combos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cartas" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cartas.map(carta => {
                                const Icon = (allIcons[carta.icon] || icons[carta.icon as keyof typeof icons] || BookOpen) as LucideIcon;
                                return (
                                    <Card key={carta.id} className="relative overflow-hidden group">
                                        <div 
                                            className={cn(
                                                "absolute top-0 left-0 w-1 h-full",
                                                carta.color && !carta.color.startsWith('#') && `bg-${carta.color}`
                                            )} 
                                            style={carta.color && carta.color.startsWith('#') ? { backgroundColor: carta.color } : undefined} 
                                        />
                                        <ConfigItem
                                            icon={<Icon className="h-5 w-5" />}
                                            color={carta.color}
                                            label={
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-bold text-foreground leading-tight">{carta.nombre_carta}</span>
                                                    <Badge variant={carta.activa ? 'success' : 'neutral'}>
                                                        {carta.activa ? 'Activa' : 'Borrador'}
                                                    </Badge>
                                                </div>
                                            }
                                            description={
                                                <span className="text-[11px] leading-relaxed line-clamp-1">
                                                    {carta.descripcion_carta || 'Sin descripción'}
                                                </span>
                                            }
                                            className="bg-muted/10 border-none border-b rounded-b-none hover:bg-muted/20 p-5 transition-all group/header"
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 group-hover/header:opacity-100 transition-all transform">
                                                <div className="flex items-center gap-1 rounded-lg">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="md" 
                                                        className="h-7 w-7 text-foreground bg-background transition-all rounded-md"
                                                        onClick={(e) => { e.stopPropagation(); setEditingCarta(carta); setIsCartaDialogOpen(true); }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="md" 
                                                        className="h-7 w-7 text-foreground bg-background transition-all rounded-md"
                                                        onClick={(e) => { e.stopPropagation(); removeCarta(carta.id); }}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </ConfigItem>
                                        <CardContent className="pl-6 pt-0">
                                            <div className="mt-4 border-t pt-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-muted-foreground">Contenido ({carta.elementos_carta.length})</span>
                                                    <Button variant="outline" size="sm" onClick={() => { setSelectedCartaId(carta.id); setIsElementDialogOpen(true); }}>
                                                        <PlusCircle className="h-3 w-3 mr-1" /> Añadir
                                                    </Button>
                                                </div>
                                                <ScrollArea className="h-[120px] pr-4">
                                                    <div className="space-y-1">
                                                        {carta.elementos_carta.map((el, index) => {
                                                            let name = 'Desconocido';
                                                            if (el.tipo === 'categoria') {
                                                                name = mockCategories.find(c => c.id === el.id_elemento)?.nombre_categoria || 'Categoría borrada';
                                                            } else {
                                                                name = menuCombos.find(m => m.id === el.id_elemento)?.nombre_carta || 'Menú borrado';
                                                            }

                                                            return (
                                                                <div key={el.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/40 group/item">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-muted-foreground w-4">{index + 1}.</span>
                                                                        <Badge variant="outline" className="text-[10px] h-5 px-1">{el.tipo === 'categoria' ? 'CAT' : 'MEN'}</Badge>
                                                                        <span className="truncate max-w-[120px]">{name}</span>
                                                                    </div>
                                                                    <Button variant="ghost" size="md" className="h-6 w-6 opacity-0 group-hover/item:opacity-100 hover:bg-destructive/10" onClick={() => removeElementFromCarta(carta.id, el.id)}>
                                                                        <Trash className="h-3 w-3 text-muted-foreground" />
                                                                    </Button>
                                                                </div>
                                                            )
                                                        })}
                                                        {carta.elementos_carta.length === 0 && (
                                                            <p className="text-xs text-muted-foreground text-center py-4">Carta vacía</p>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                            <CreateActionCard label="Crear Nueva Carta" onClick={addCarta} />
                        </div>
                    </TabsContent>

                    <TabsContent value="menus" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {menuCombos.map(menu => (
                                <Card key={menu.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setEditingMenu(menu); setIsMenuDialogOpen(true); }}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <H3>{menu.nombre_carta}</H3>
                                                <CardDescription className="line-clamp-1">{menu.descripcion}</CardDescription>
                                            </div>
                                            <Badge variant={menu.active ? 'default' : 'secondary'}>{menu.precio_carta.toFixed(2)}€</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1">
                                            {menu.elementos_menu.slice(0, 3).map((el, i) => (
                                                <Badge key={i} variant="outline" className="text-xs bg-muted">
                                                    {el.tipo === 'categoria' ? 'Selección' : 'Fijo'}
                                                </Badge>
                                            ))}
                                            {menu.elementos_menu.length > 3 && <Badge variant="outline" className="text-xs">+{menu.elementos_menu.length - 3}</Badge>}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <CreateActionCard label="Crear Nuevo Menú" onClick={addMenuCombo} />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Dialog para Editar Carta */}
                <Dialog open={isCartaDialogOpen} onOpenChange={(open) => { setIsCartaDialogOpen(open); if (!open) setDialogTab('general'); }}>
                    <DialogContent className="sm:max-w-4xl overflow-hidden border-none shadow-2xl p-6">
                        <DialogHeader
                            icon={BookOpen}
                            title="Editar Carta Digital"
                            description="Configura los detalles principales y la integración WhatsApp."
                        />
                        
                        <ScrollArea className="max-h-[70vh] -mx-6 px-6">
                            <Tabs value={dialogTab} onValueChange={setDialogTab} className="w-full mt-2">
                                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
                                    <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        General
                                    </TabsTrigger>
                                    <TabsTrigger value="whatsapp" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        WhatsApp
                                    </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="general" className="space-y-5 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="ml-1">Nombre de la Carta</Label>
                                        <Input 
                                            id="name" 
                                            value={editingCarta?.nombre_carta || ''} 
                                            onChange={(e) => setEditingCarta(prev => ({ ...prev, nombre_carta: e.target.value }))}
                                            className="h-10 bg-muted/50 border-input/60 hover:bg-muted/80 hover:border-input transition-colors rounded-lg shadow-sm text-center w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="desc" className="ml-1">Descripción</Label>
                                        <Textarea 
                                            id="desc" 
                                            value={editingCarta?.descripcion_carta || ''} 
                                            onChange={(e) => setEditingCarta(prev => ({ ...prev, descripcion_carta: e.target.value }))}
                                            className="min-h-[100px] bg-muted/50 border-input/60 hover:bg-muted/80 hover:border-input transition-colors rounded-lg shadow-sm resize-none text-center"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <IconPicker
                                            value={editingCarta?.icon || 'BookOpen'}
                                            onChange={(icon) => setEditingCarta(prev => ({ ...prev, icon: icon }))}
                                            label="Icono Representativo"
                                        />
                                        <ColorPicker
                                            label="Color de Identidad"
                                            value={editingCarta?.color}
                                            onChange={(val) => setEditingCarta(prev => ({ ...prev, color: val }))}
                                        />
                                    </div>
                                    <ConfigToggle
                                        id="carta-activa"
                                        icon={BookOpen}
                                        label="Carta Activa"
                                        description="Esta carta será visible para los clientes."
                                        checked={editingCarta?.activa || false}
                                        onCheckedChange={(checked) => setEditingCarta(prev => ({ ...prev, activa: checked }))}
                                    />
                                </TabsContent>
                                
                                <TabsContent value="whatsapp" className="mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Config Column */}
                                        <div className="space-y-5">
                                            <ConfigToggle
                                                id="ws-pedidos"
                                                icon={MessageSquare}
                                                label="Pedidos por WhatsApp"
                                                description="Habilitar flujo de pedidos"
                                                checked={whatsAppConfig.disponibleWhatsApp}
                                                onCheckedChange={(v) => setWhatsAppConfig(p => ({ ...p, disponibleWhatsApp: v }))}
                                                color="#16a34a"
                                            />
                                            
                                            <ConfigToggle
                                                id="ws-voz"
                                                icon={Mic}
                                                label="Pedidos por Voz (IA)"
                                                description="Procesar audios automáticamente"
                                                checked={whatsAppConfig.permitirVoz}
                                                onCheckedChange={(v) => setWhatsAppConfig(p => ({ ...p, permitirVoz: v }))}
                                                color="#3b82f6"
                                            />
                                            
                                            <div className="space-y-2">
                                                <Label className="ml-1">Mensaje de Bienvenida</Label>
                                                <Textarea
                                                    value={whatsAppConfig.mensajeBienvenida}
                                                    onChange={(e) => setWhatsAppConfig(p => ({ ...p, mensajeBienvenida: e.target.value }))}
                                                    placeholder="¡Hola! Bienvenido a nuestro restaurante..."
                                                    rows={3}
                                                    className="bg-muted/50 border-input/60 hover:bg-muted/80 transition-colors rounded-lg shadow-sm resize-none text-center pt-4"
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label icon={Clock} className="ml-1">Disponibilidad</Label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="mb-1 block">Desde</Label>
                                                        <Input
                                                            type="time"
                                                            value={whatsAppConfig.horarioInicio}
                                                            onChange={(e) => setWhatsAppConfig(p => ({ ...p, horarioInicio: e.target.value }))}
                                                            className="h-9 bg-muted/50 border-input/60 rounded-lg shadow-sm text-center"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="mb-1 block">Hasta</Label>
                                                        <Input
                                                            type="time"
                                                            value={whatsAppConfig.horarioFin}
                                                            onChange={(e) => setWhatsAppConfig(p => ({ ...p, horarioFin: e.target.value }))}
                                                            className="h-9 bg-muted/50 border-input/60 rounded-lg shadow-sm text-center"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Preview Column */}
                                        <div className="bg-muted/30 rounded-2xl border p-4">
                                            <Label className="mb-3 block text-center">Vista Previa</Label>
                                            <div className="pointer-events-none scale-95 origin-top">
                                                <WhatsAppPreview
                                                    messages={getWhatsAppPreviewMessages()}
                                                    businessName={editingCarta?.nombre_carta || 'Mi Restaurante'}
                                                    showHeader={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </ScrollArea>
                        
                        <DialogFooter>
                            <p className="text-xs text-muted-foreground">Los cambios se guardarán en la configuración de esta carta.</p>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setIsCartaDialogOpen(false)} className="rounded-xl" startIcon={<X className="h-4 w-4" />}>Cancelar</Button>
                                <Button variant="default" onClick={handleSaveCarta} className="rounded-xl px-6" startIcon={<Save className="h-4 w-4" />}>Guardar Carta</Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para Añadir Elemento a Carta */}
                <Dialog open={isElementDialogOpen} onOpenChange={setIsElementDialogOpen}>
                    <DialogContent className="sm:max-w-xl overflow-hidden border-none shadow-2xl p-6">
                        <DialogHeader
                            icon={PlusCircle}
                            title="Añadir Contenido"
                            description="Selecciona una categoría de productos o un menú existente."
                        />
                        
                        <div className="py-4 space-y-4">
                            <Tabs value={newElementData.tipo} onValueChange={(val) => setNewElementData({ tipo: val as any, id_elemento: '' })} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl mb-4">
                                    <TabsTrigger value="categoria" className="rounded-lg">Categoría</TabsTrigger>
                                    <TabsTrigger value="menu" className="rounded-lg">Menú / Combo</TabsTrigger>
                                </TabsList>
                                <TabsContent value="categoria" className="space-y-4 pt-2">
                                    <ConfigItem
                                        icon={BookOpen}
                                        label="Seleccionar Categoría"
                                        description="Elige la sección de productos a mostrar"
                                    >
                                        <Select value={newElementData.id_elemento} onValueChange={(val) => setNewElementData(prev => ({ ...prev, id_elemento: val }))}>
                                            <SelectTrigger className="w-full h-9 bg-muted/50 border-none hover:bg-muted/80 transition-colors rounded-lg shadow-sm text-center mx-1">
                                                <SelectValue placeholder="Elige una categoría..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mockCategories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre_categoria}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </ConfigItem>
                                </TabsContent>
                                <TabsContent value="menu" className="space-y-4 pt-2">
                                    <ConfigItem
                                        icon={Utensils}
                                        label="Seleccionar Menú"
                                        description="Elige un menú combinado existente"
                                    >
                                        <Select value={newElementData.id_elemento} onValueChange={(val) => setNewElementData(prev => ({ ...prev, id_elemento: val }))}>
                                            <SelectTrigger className="w-full h-9 bg-muted/50 border-none hover:bg-muted/80 transition-colors rounded-lg shadow-sm text-center mx-1">
                                                <SelectValue placeholder="Elige un menú..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {menuCombos.map(menu => (
                                                    <SelectItem key={menu.id} value={menu.id}>{menu.nombre_carta}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </ConfigItem>
                                </TabsContent>
                            </Tabs>
                        </div>
                        
                        <DialogFooter>
                            <p className="text-xs text-muted-foreground">Añadirás este elemento al final de la carta actual.</p>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setIsElementDialogOpen(false)} className="rounded-xl" startIcon={<X className="h-4 w-4" />}>Cancelar</Button>
                                <Button variant="default" onClick={addElementToCarta} disabled={!newElementData.id_elemento} className="rounded-xl px-6" startIcon={<PlusCircle className="h-4 w-4" />}>
                                    Añadir Contenido
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialogo Básico para Editar Menú (Simulado) */}
                <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
                    <DialogContent className="sm:max-w-xl overflow-hidden border-none shadow-2xl p-6">
                        <DialogHeader
                            icon={Utensils}
                            title="Editar Menú"
                            description="Configura los detalles del menú o combo."
                        />
                         <div className="space-y-4 py-4">
                            <ConfigItem
                                icon={Edit}
                                label="Nombre del Menú"
                                description="Título que verán los clientes en la carta"
                            >
                                <Input 
                                    value={editingMenu?.nombre_carta || ''} 
                                    onChange={(e) => setEditingMenu(prev => ({ ...prev, nombre_carta: e.target.value }))}
                                    className="h-9 bg-muted/50 border-none hover:bg-muted/80 transition-colors rounded-lg shadow-sm w-full text-center mx-1"
                                />
                            </ConfigItem>

                            <ConfigItem
                                icon={Utensils}
                                label="Precio de Venta"
                                description="Precio unitario con impuestos incluidos"
                                iconClassName="text-amber-500"
                                iconContainerClassName="bg-amber-500/10"
                            >
                                <div className="relative w-full mx-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">€</span>
                                    <Input 
                                        type="number" 
                                        step="0.5" 
                                        value={editingMenu?.precio_carta || 0} 
                                        onChange={(e) => setEditingMenu(prev => ({ ...prev, precio_carta: parseFloat(e.target.value) || 0 }))}
                                        className="pl-7 h-9 bg-muted/50 border-none hover:bg-muted/80 transition-colors rounded-lg shadow-sm font-mono text-sm text-center no-spinner" 
                                    />
                                </div>
                            </ConfigItem>

                            <ConfigToggle
                                id="menu-disponible"
                                icon={CheckCircle}
                                label="Disponible para venta"
                                description="El menú aparecerá en opciones de compra."
                                checked={editingMenu?.active || false}
                                onCheckedChange={(checked) => setEditingMenu(prev => ({ ...prev, active: checked }))}
                                color="#16a34a"
                            />
                        </div>
                        <DialogFooter>
                            <p className="text-xs text-muted-foreground">Configura los elementos de este menú desde la edición detallada.</p>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setIsMenuDialogOpen(false)} className="rounded-xl" startIcon={<X className="h-4 w-4" />}>Cancelar</Button>
                                <Button variant="default" onClick={handleSaveMenu} className="rounded-xl px-6" startIcon={<Save className="h-4 w-4" />}>Guardar Menú</Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </PageContent>
        </PageContainer>
    );
}

