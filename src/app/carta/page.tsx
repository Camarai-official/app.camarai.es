'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, BookOpen, Utensils, Wine, Coffee, IceCream, Pizza, Beer, ArrowUp, ArrowDown, MessageSquare, Mic, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockCartas, mockMenuCombos, mockCategories, mockProducts, type Carta, type MenuCombo, type ElementoCarta, type ElementoMenuCombo } from '@/data/mock-data';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
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

// WhatsApp config type for Carta
interface CartaWhatsAppConfig {
  disponibleWhatsApp: boolean;
  permitirVoz: boolean;
  mensajeBienvenida: string;
  horarioInicio: string;
  horarioFin: string;
}

const icons = {
    BookOpen, Utensils, Wine, Coffee, IceCream, Pizza, Beer
};

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
        horarioFin: '23:00',
    });
    
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
            color: '#78A3ED'
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
            color: '#F0768C'
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
        <div className="flex flex-1 flex-col h-full bg-muted/10">
            <header className="p-4 md:p-6 pb-0">
                <PageHeader
                    title="Gestión de Cartas y Menús"
                    subtitle="Diseña y organiza las cartas digitales y menús combinados."
                />
            </header>

            <main className="flex-grow p-4 md:p-6 pt-0 space-y-6">
                <Tabs defaultValue="cartas" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
                        <TabsTrigger value="cartas">Cartas Digitales</TabsTrigger>
                        <TabsTrigger value="menus">Menús y Combos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cartas" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cartas.map(carta => {
                                const Icon = icons[carta.icon as keyof typeof icons] || BookOpen;
                                return (
                                    <Card key={carta.id} className="relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: carta.color }} />
                                        <CardHeader className="pl-6 pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-md bg-muted">
                                                        <Icon className="h-5 w-5" style={{ color: carta.color }} />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-xl">{carta.nombre_carta}</CardTitle>
                                                        <Badge variant={carta.activa ? 'default' : 'secondary'} className="mt-1">
                                                            {carta.activa ? 'Activa' : 'Borrador'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => { setEditingCarta(carta); setIsCartaDialogOpen(true); }}>
                                                        <Edit className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeCarta(carta.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardDescription className="line-clamp-2 mt-2">{carta.descripcion_carta || 'Sin descripción'}</CardDescription>
                                        </CardHeader>
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
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive" onClick={() => removeElementFromCarta(carta.id, el.id)}>
                                                                        <Trash2 className="h-3 w-3" />
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
                                                <CardTitle>{menu.nombre_carta}</CardTitle>
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
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Editar Carta Digital</DialogTitle>
                            <DialogDescription>Configura los detalles principales y la integración WhatsApp.</DialogDescription>
                        </DialogHeader>
                        
                        <Tabs value={dialogTab} onValueChange={setDialogTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="general">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    General
                                </TabsTrigger>
                                <TabsTrigger value="whatsapp">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    WhatsApp
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="general" className="space-y-4 mt-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre de la Carta</Label>
                                    <Input id="name" value={editingCarta?.nombre_carta || ''} onChange={(e) => setEditingCarta(prev => ({ ...prev, nombre_carta: e.target.value }))} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Descripción</Label>
                                    <Textarea id="desc" value={editingCarta?.descripcion_carta || ''} onChange={(e) => setEditingCarta(prev => ({ ...prev, descripcion_carta: e.target.value }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Icono</Label>
                                        <Select value={editingCarta?.icon} onValueChange={(val) => setEditingCarta(prev => ({ ...prev, icon: val }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(icons).map(key => (
                                                    <SelectItem key={key} value={key}>{key}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Color de Identidad</Label>
                                        <div className="flex items-center gap-2">
                                            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" value={editingCarta?.color || '#000000'} onChange={(e) => setEditingCarta(prev => ({ ...prev, color: e.target.value }))} />
                                            <span className="text-sm text-muted-foreground">{editingCarta?.color}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between border p-4 rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Carta Activa</Label>
                                        <p className="text-sm text-muted-foreground">Visible para los clientes</p>
                                    </div>
                                    <Switch checked={editingCarta?.activa} onCheckedChange={(checked) => setEditingCarta(prev => ({ ...prev, activa: checked }))} />
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="whatsapp" className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Config Column */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-brand-whatsapp" />
                                                <div>
                                                    <Label>Disponible vía WhatsApp</Label>
                                                    <p className="text-xs text-muted-foreground">Clientes pueden pedir por WhatsApp</p>
                                                </div>
                                            </div>
                                            <Switch 
                                                checked={whatsAppConfig.disponibleWhatsApp}
                                                onCheckedChange={(v) => setWhatsAppConfig(p => ({ ...p, disponibleWhatsApp: v }))}
                                            />
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Mic className="h-4 w-4 text-blue-500" />
                                                <div>
                                                    <Label>Permitir pedidos por voz</Label>
                                                    <p className="text-xs text-muted-foreground">Procesar audios con IA</p>
                                                </div>
                                            </div>
                                            <Switch 
                                                checked={whatsAppConfig.permitirVoz}
                                                onCheckedChange={(v) => setWhatsAppConfig(p => ({ ...p, permitirVoz: v }))}
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label>Mensaje de bienvenida</Label>
                                            <Textarea
                                                value={whatsAppConfig.mensajeBienvenida}
                                                onChange={(e) => setWhatsAppConfig(p => ({ ...p, mensajeBienvenida: e.target.value }))}
                                                placeholder="¡Hola! Bienvenido a nuestro restaurante..."
                                                rows={3}
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Horario disponibilidad WhatsApp
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Desde</Label>
                                                    <Input
                                                        type="time"
                                                        value={whatsAppConfig.horarioInicio}
                                                        onChange={(e) => setWhatsAppConfig(p => ({ ...p, horarioInicio: e.target.value }))}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-muted-foreground">Hasta</Label>
                                                    <Input
                                                        type="time"
                                                        value={whatsAppConfig.horarioFin}
                                                        onChange={(e) => setWhatsAppConfig(p => ({ ...p, horarioFin: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Preview Column */}
                                    <div>
                                        <Label className="mb-2 block">Vista previa del menú</Label>
                                        <WhatsAppPreview
                                            messages={getWhatsAppPreviewMessages()}
                                            businessName={editingCarta?.nombre_carta || 'Mi Restaurante'}
                                            showHeader={true}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                        
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setIsCartaDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSaveCarta}>Guardar Carta</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog para Añadir Elemento a Carta */}
                <Dialog open={isElementDialogOpen} onOpenChange={setIsElementDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Añadir contenido a la carta</DialogTitle>
                            <DialogDescription>Selecciona una categoría o un menú para añadir.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Tabs value={newElementData.tipo} onValueChange={(val) => setNewElementData({ tipo: val as any, id_elemento: '' })}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="categoria">Categoría de Productos</TabsTrigger>
                                    <TabsTrigger value="menu">Menú / Combo</TabsTrigger>
                                </TabsList>
                                <TabsContent value="categoria" className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Seleccionar Categoría</Label>
                                        <Select value={newElementData.id_elemento} onValueChange={(val) => setNewElementData(prev => ({ ...prev, id_elemento: val }))}>
                                            <SelectTrigger><SelectValue placeholder="Elige una categoría..." /></SelectTrigger>
                                            <SelectContent>
                                                {mockCategories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre_categoria}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TabsContent>
                                <TabsContent value="menu" className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Seleccionar Menú</Label>
                                        <Select value={newElementData.id_elemento} onValueChange={(val) => setNewElementData(prev => ({ ...prev, id_elemento: val }))}>
                                            <SelectTrigger><SelectValue placeholder="Elige un menú..." /></SelectTrigger>
                                            <SelectContent>
                                                {menuCombos.map(menu => (
                                                    <SelectItem key={menu.id} value={menu.id}>{menu.nombre_carta}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsElementDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={addElementToCarta} disabled={!newElementData.id_elemento}>Añadir</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialogo Básico para Editar Menú (Simulado) */}
                <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Menú: {editingMenu?.nombre_carta}</DialogTitle>
                            <DialogDescription>Detalles básicos del menú.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Nombre</Label>
                                <Input value={editingMenu?.nombre_carta || ''} onChange={(e) => setEditingMenu(prev => ({ ...prev, nombre_carta: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Precio</Label>
                                <Input type="number" step="0.5" value={editingMenu?.precio_carta || 0} onChange={(e) => setEditingMenu(prev => ({ ...prev, precio_carta: parseFloat(e.target.value) || 0 }))} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch checked={editingMenu?.active} onCheckedChange={(checked) => setEditingMenu(prev => ({ ...prev, active: checked }))} />
                                <Label>Disponible para venta</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveMenu}>Guardar Menú</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </main>
        </div>
    );
}
